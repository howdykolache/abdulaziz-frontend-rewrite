import moment from 'moment'

export default {
  orders(state){
    return state.orders
  },
  orderItems(state){
    return state.orderItems
  },
  sortBy(state){
    return state.sortBy
  },
  searchTerm(state){
    return state.searchTerm
  },
  clientList(state, getters, rootState, rootGetters) {
    const orders = getters['orders']
    const orderItems = getters['orderItems']
    const products = rootGetters['entities/products/products']
    const clients = rootGetters['entities/clients/clients']

    // Initialize entries 
    let entries = clients.map(client => {
        const clientOrders = orders.filter(o => o.fields['Client Rec ID'][0] === client.id)
        
        // Sort by date desc
        clientOrders.sort((orderA, orderB) => {
          if (!orderA) return -1
  
          if (!orderB) return -1
  
          const dateA = moment(orderA.fields.Date, 'YYYY-MM-DD')
          const dateB = moment(orderB.fields.Date, 'YYYY-MM-DD')
  
          return dateB.unix() - dateA.unix()
        })

        let firstOrderDate = null
        let lastOrderDate = null

        if(clientOrders.length) {
          lastOrderDate = clientOrders[0].fields.Date
          firstOrderDate = clientOrders[clientOrders.length - 1].fields.Date
        }

        return {
            id: client.id,
            name: client.fields.Name,
            email: client.fields.Email,
            primaryContactName: client.fields['Primary Contact'],
            orderCount: clientOrders.length,
            orders: clientOrders,
            totalKolaches: 0,
            firstOrderDate,
            lastOrderDate,
        }
    })

    // total ordered Kolaches
    for (let index = 0; index < orderItems.length; index++) {
        const orderItem = orderItems[index]
  
        const client = clients.find(cl => cl.id === orderItem.fields['Client Rec ID'][0])
        const product = products.find(prod => prod.id === orderItem.fields.Product[0])

        const itemType = product.fields['Product Type'].toLowerCase().trim()

        if(!itemType.toLowerCase().includes('kolache')) continue

        const entry = entries.find(e => e.id === client.id)

        entry.totalKolaches += orderItem.fields.Orders

        // Update current entry
        const entryIndex = entries.indexOf(entry)
        entries.splice(entryIndex, 1, entry)
    }

    return entries
  },
  filteredClientList(state, getters){
    let clientList = [...getters.clientList]
    const sortBy = getters['sortBy']
    const searchTerm = getters['searchTerm']

    if (sortBy === 'most-orders') clientList.sort((a, b) => b.orders.length - a.orders.length )
    
    if (sortBy === 'most-recent-order') {
      clientList.sort((clientA, clientB) => {
        if (!clientA || !clientA.orders.length) return 1
        if (!clientB || !clientB.orders.length) return -1

        // Assuming we already sorted orders by date (DESC)
        const clientALastOrder = clientA.orders[0] 
        const clientBLastOrder = clientB.orders[0]

        const clientALastOrderTime = moment(clientALastOrder.fields.Date, 'YYYY-MM-DD')
        const clientBLastOrderTime = moment(clientBLastOrder.fields.Date, 'YYYY-MM-DD')

        return clientBLastOrderTime.unix() - clientALastOrderTime.unix()
      })
    }

    if (searchTerm.trim().length) {
      clientList = clientList.filter(entry => {
        return entry.name.toLowerCase().includes(searchTerm) ||
        (entry.primaryContactName && entry.primaryContactName.toLowerCase().includes(searchTerm)) ||
        (entry.email && entry.email.toLowerCase().includes(searchTerm))
      })
    }

    return clientList
  }
}
