import { breakUpArrayIntoChunks } from '~/utils'
import airQuery from '@/utils/airtable-query-builder'
import base from '@/airtable'

export default {
  setSortBy({ commit }, value) {
    commit('SET_SORT_BY', value)
  },
  setSearchTerm({ commit }, value) {
    commit('SET_SEARCH_TERM', value)
  },
  async fetchClientOrders({ commit }, clientIds) {
    let records = []

    const chunks = breakUpArrayIntoChunks(clientIds, 300)
    console.log('total chunks: ', chunks.length)

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index]
      console.log('chunk length: ', chunk.length)
      const query = {
        filterByFormula: airQuery()
          .whereInArrayColumn('Client Rec ID', chunk)
          .get(),
        fields: ['Date', 'Client Rec ID']
      }

      const newRecs = await base('Order').select(query).all()

      records = [...records, ...newRecs]
    }

    commit('SET_ORDERS', records)
  },
  async fetchOrderOrderItems({ commit }, orderIds) {
    let records = []

    const chunks = breakUpArrayIntoChunks(orderIds, 300)

    console.log('total chunks: ', chunks.length)

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index]

      console.log('chunk length: ', chunk.length)

      const query = {
        filterByFormula: airQuery()
          .whereInArrayColumn('Order Rec ID', chunk)
          .get(),
          fields: ['Orders', 'Product', 'Client Rec ID']
      }

      const newRecs = await base('Order Item').select(query).all()

      records = [...records, ...newRecs]
    }

    commit('SET_ORDER_ITEMA', records)
  }
}
