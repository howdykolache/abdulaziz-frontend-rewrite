export default {
  fields (state) {
    return state.fields
  },
  orderCreationPayload ({ fields }) {
    const payload = {
      'Data Source': 'Admin Order Creation Page',
      Client: [fields.client.id],
      Date: fields.deliveryDate.date,
      'Delivery Type': fields.delivery.deliveryMethod
    }

    if (fields.delivery.deliveryMethod.toLowerCase() === 'delivery') {
      payload['Delivery Address'] = fields.delivery.address.shipAddress
      payload['Delivery Address JSON'] = fields.delivery.json
    }

    if (fields.delivery.deliveryNotes) payload['Delivery Notes'] = fields.delivery.deliveryNotes

    if (fields.delivery.deliveryDriver) payload['Delivery Driver'] = fields.delivery.deliveryDriver

    if (fields.deliveryDate.readyTime) payload['Ready Time'] = fields.deliveryDate.readyTime

    if (fields.deliveryDate.deliveryTime) payload['Delivery Time'] = fields.deliveryDate.deliveryTime

    if (fields.client.details) payload['Client Details'] = fields.client.details

    if (fields.specialNotes) payload.Notes = fields.specialNotes

    if (fields.client.phoneNumber) payload['Order Phone'] = fields.client.phoneNumber

    if (fields.client.contactName) payload['Order Contact'] = fields.client.contactName

    return payload
  },
  orderEditionPayload ({ fields }) {
    const payload = {
      Client: [fields.client.id],
      Date: fields.deliveryDate.date,
      'Delivery Type': fields.delivery.deliveryMethod
    }

    payload['Delivery Address'] = fields.delivery.address.shipAddress || ''
    payload['Delivery Address JSON'] = fields.delivery.json || '[]'

    payload['Delivery Notes'] = fields.delivery.deliveryNotes

    payload['Delivery Driver'] = fields.delivery.deliveryDriver

    payload['Ready Time'] = fields.deliveryDate.readyTime

    payload['Delivery Time'] = fields.deliveryDate.deliveryTime

    payload['Client Details'] = fields.client.details

    payload.Notes = fields.specialNotes

    payload['Order Phone'] = fields.client.phoneNumber

    payload['Order Contact'] = fields.client.contactName

    return payload
  },
  totalSelectedProducts (state) {
    let total = 0
    for (const prodId in state.fields.quantities) {
      total += state.fields.quantities[prodId]
    }

    return total
  },
  selectedKolacheItemsCount (state, getters, rootState, rootGetters) {
    const products = rootGetters['entities/products/products']

    let total = 0
    for (const prodId in state.fields.quantities) {
      const product = products.find(prod => prod.id === prodId)
      const productType = product.fields['Product Type'].trim()
      
      if(!productType.toLowerCase().includes('kolache')) continue

      total += state.fields.quantities[prodId]
    }

    return total
  },
  selectedNonKolacheItemsCount (state, getters, rootState, rootGetters) {
    const products = rootGetters['entities/products/products']

    let total = 0
    for (const prodId in state.fields.quantities) {
      const product = products.find(prod => prod.id === prodId)
      const productType = product.fields['Product Type'].trim()
      
      if(productType.toLowerCase().includes('kolache')) continue

      total += state.fields.quantities[prodId]
    }

    return total
  }
}
