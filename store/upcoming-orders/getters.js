import moment from 'moment-timezone'

export default {
  selectedClientTypes (state) {
    return state.selectedClientTypes
  },
  selectedClientId (state) {
    return state.selectedClientId
  },
  upcomingOrderDates (state, getters, rootState, rootGetters) {
    const orders = rootGetters['entities/orders/orders']
    const orderItems = rootGetters['entities/order-items/orderItems']
    const products = rootGetters['entities/products/products']
    const clients = rootGetters['entities/clients/clients']

    const dates = {}

    for (let index = 0; index < orders.length; index++) {
      const order = orders[index]
      const date = order.fields.Date
      let client

      // Some orders may not have a client assigned 
      if (order.fields.Client) {
        client = clients.find(cl => cl.id === order.fields.Client[0])
        const clientType = client.fields['Client Type'].replace(/[^a-zA-z\s]/g, '').trim()
  
        if (getters.selectedClientTypes.length && !getters.selectedClientTypes.includes(clientType)) {
          continue
        }
      }

      if(getters.selectedClientId && !client || getters.selectedClientId && getters.selectedClientId !== client.id) {
        continue
      }

      if (!order.fields['Summed Orders']) {
        continue
      }

      if (!dates[date]) {
        dates[date] = []
      }

      let readyTime = order.fields['Ready Time']
      let deliveryTime = order.fields['Delivery Time']

      if (readyTime) readyTime = moment(readyTime, 'hh:mm').format('h:mm a')
      if (deliveryTime) deliveryTime = moment(deliveryTime, 'hh:mm').format('h:mm a')
      
      // Compute the number of kolaches included in this order
      const totalKolacheItems = orderItems.reduce((total, orderItem) => {
        const product = products.find(item => item.id === orderItem.fields.Product[0])
        const kolacheTypes = ['kolache', 'kolache - seasonal or special']
        const itemType = product.fields['Product Type'].toLowerCase().trim()

        if (orderItem.fields.Order[0] === order.id && kolacheTypes.includes(itemType)) {
          return total + orderItem.fields.Orders
        }

        return total
      }, 0)      
      // The the number of non kolache items
      const totalNonKolacheItems = orderItems.reduce((total, orderItem) => {
        const product = products.find(item => item.id === orderItem.fields.Product[0])
        const itemType = product.fields['Product Type'].toLowerCase().trim()

        if (orderItem.fields.Order[0] === order.id && !itemType.toLowerCase().includes('kolache')) {
          return total + orderItem.fields.Orders
        }

        return total
      }, 0)

      const obj = {
        id: order.id,
        readyTime,
        deliveryTime,
        qty: order.fields['Summed Orders'],
        totalKolacheItems,
        totalNonKolacheItems,
        packaging: order.fields.Packaging,
        temperature: order.fields.Temperature,
        notes: order.fields.Notes,
        deliveryNotes: order.fields['Delivery Notes'],
        deliveryDriver: order.fields['Delivery Driver'],
        deliveryType: order.fields['Delivery Type'],
        clientDetails: order.fields['Client Details'],
        address: order.fields['Delivery Address'],
        phoneNumber: order.fields['Order Phone'],
        clientName: 'n/a',
        contactName: order.fields['Order Contact']
      }

      if (client) {
        obj.clientName = client.fields.Name
        obj.clientId = client.id
        obj.clientEmail = client.fields.Email

        if (!obj.address) obj.address = client.fields.Address
        if (!obj.phoneNumber) obj.phoneNumber = client.fields.Phone
        if (!obj.contactName) obj.contactName = client.fields['Primary Contact']
      }

      dates[date].push(obj)
    }

    // Order day orders by the ready time
    for (const key in dates) {
      const orders = dates[key]

      dates[key] = orders.sort((a, b) => {
        // Sort orders so that orders with undefined ready time come first
        if (!a.readyTime && !b.readyTime) {
          return 0
        }

        if (!a.readyTime) {
          return -1
        }

        if (!b.readyTime) {
          return 1
        }

        const aReadyTime = moment(a.readyTime, 'h:mm a')
        const bReadyTime = moment(b.readyTime, 'h:mm a')

        return aReadyTime.unix() - bReadyTime.unix()
      })
    }

    return dates
  },
  csvData(state, getters){
    const upcomingOrderDates = getters.upcomingOrderDates

    let csvData = []

    for (const date in upcomingOrderDates) {
      const dayOrders = upcomingOrderDates[date];
      
      const rows = dayOrders.map(order => {
        return {
          'Date': moment(date, 'YYYY-MM-DD').format('MM/DD'),
          'Kolaches': order.totalKolacheItems.toString(),
          'Other': order.totalNonKolacheItems.toString(),
          'Client': order.clientName,
          'Client Details': order.clientDetails || '',
          'Ready Time': order.readyTime || '',
          'Delivery Time': order.deliveryTime || '',
          'Delivery Type': order.deliveryType || '',
          'Delivery By': order.deliveryDriver || '',
          'Delivery Notes': order.deliveryNotes || '',
          'Address': order.address || '',
          'Special Notes': order.notes || '',
        }
      })

      csvData = [...csvData, ...rows]
    }

    return csvData
  },
  aggregatedOrdersCount (state, getters) {
    const upcomingOrderDates = getters.upcomingOrderDates

    let total = 0
    for (const date in upcomingOrderDates) {
      const dayOrders = upcomingOrderDates[date];
      total += dayOrders.length
    }

    return total
  },
  aggregatedKolachesItemsCount (state, getters) {
    const upcomingOrderDates = getters.upcomingOrderDates

    let total = 0
    for (const date in upcomingOrderDates) {
      const dayOrders = upcomingOrderDates[date];
      total += dayOrders.reduce((total, o) => total + o.totalKolacheItems, 0)
    }

    return total
  },
  aggregatedNonKolachesItemsCount (state, getters) {
    const upcomingOrderDates = getters.upcomingOrderDates

    let total = 0
    for (const date in upcomingOrderDates) {
      const dayOrders = upcomingOrderDates[date];
      total += dayOrders.reduce((total, o) => total + o.totalNonKolacheItems, 0)
    }

    return total
  }
}
