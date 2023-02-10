export default {
  ordersPerClient (state, getters, rootState, rootGetters) {
    const orders = rootGetters['entities/orders/orders']
    const orderItems = rootGetters['entities/order-items/orderItems']
    const products = rootGetters['entities/products/products']
    const clients = rootGetters['entities/clients/clients']

    const ordersPerClient = {}

    for (let index = 0; index < orderItems.length; index++) {
      const orderItem = orderItems[index]

      const order = orders.find(o => o.id === orderItem.fields.Order[0])
      const product = products.find(item => item.id === orderItem.fields.Product[0])
      const client = clients.find(cl => cl.id === orderItem.fields['Client Rec ID'][0])

      const readyTime = order.fields['Ready Time']
      const deliveryTime = order.fields['Delivery Time']

      // If this client has not yet been added
      if (!ordersPerClient[client.id]) {
        const newClientOrder = {
          id: order.id,
          products: {},
          client: {
            id: client.id,
            name: client.fields.Name,
            address: order.fields['Delivery Address'] || client.fields.Address,
            type: client.fields['Client Type']
          },
          date: order.fields.Date,
          deliveryMethod: order.fields['Delivery Type'],
          contactName: order.fields['Order Contact'] || client.fields['Primary Contact'],
          phoneNumber: order.fields['Order Phone'] || client.fields.Phone,
          deliveryDriver: order.fields['Delivery Driver'],
          readyTime,
          deliveryTime,
          totalOrders: 0
        }

        // Populate and initialize this client’s products property.
        // We’ll first assume they did not order any quantity of the available products
        products.forEach((p) => {
          newClientOrder.products[p.id] = {
            id: p.id,
            name: p.fields.Name,
            qty: 0,
            displayOrder: p.fields['Display Order']
          }
        })

        ordersPerClient[client.id] = newClientOrder
      }
      // Increment current product orders
      ordersPerClient[client.id].products[product.id].qty += orderItem.fields.Orders
      // Adjust this client’s total orders
      ordersPerClient[client.id].totalOrders += orderItem.fields.Orders
    }

    return ordersPerClient
  },
  // Data that will be fed into the PDF generation function
  pdfData(state, getters, rootState, rootGetters){
    const orders = rootGetters['entities/orders/orders']
    const orderItems = rootGetters['entities/order-items/orderItems']
    const products = rootGetters['entities/products/products']
    const clients = rootGetters['entities/clients/clients']

    const data = []

    for (let index = 0; index < orderItems.length; index++) {
      const orderItem = orderItems[index]

      const order = orders.find(order => order.id === orderItem.fields.Order[0])
      const product = products.find(prod => prod.id === orderItem.fields.Product[0])
      const client = clients.find(cl => cl.id === orderItem.fields['Client Rec ID'][0])

      // Try to see if we have an entry for this order
      const entry = data.find(orderData => orderData.id === order.id)
      // If no entry found, initialize an entry for this order. 
      if (!entry){
        // This is the first time we run into this order since we started going through the order items
        entry = {
          id: order.id,
          products: [],
          client: {
            name: client.fields.Name,
            email: client.fields.Email,
            address: order.fields['Delivery Address'] || client.fields.Address,
            type: client.fields['Client Type']
          },
          date: order.fields.Date,
          deliveryMethod: order.fields['Delivery Type'],
          contactName: order.fields['Order Contact'] || client.fields['Primary Contact'],
          phoneNumber: order.fields['Order Phone'] || client.fields.Phone,
          deliveryDriver: order.fields['Delivery Driver'],
          readyTime: order.fields['Ready Time'],
          deliveryTime: order.fields['Delivery Time'],
          notes: order.fields.Notes,
          deliveryNotes: order.fields['Delivery Notes'],
          clientDetails: order.fields['Client Details'],
        }

        data.push(entry)
      }

      const productIndex = entry.products.findIndex(p => p.id === product.id)

      if (productIndex != -1) {
        // we have already added this product, just update its qty 
        entry.products[productIndex].qty += orderItem.fields.Orders
      } else {
        // This is the 1st time we add this product
        entry.products.push({
          id: product.id,
          name: product.fields.Name,
          qty: orderItem.fields.Orders,
          displayOrder: product.fields['Display Order'],
        })
      }

      // Update the entry
      const entryIndex = data.findIndex(orderData => orderData.id === order.id)
      data.splice(entryIndex, 1, entry)
    }

    // Order products by their “Display Order”
    data.forEach(order => order.products.sort((a, b) => a.displayOrder - b.displayOrder));

    return data
  }
}
