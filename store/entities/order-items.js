import base from '@/airtable'
import { breakUpArrayIntoChunks } from '@/utils'

export const state = () => ({
  orderItems: []
})

export const mutations = {
  SET (state, orderItems) {
    state.orderItems = orderItems
  },
  PUSH (state, orderItem) {
    state.orderItems.push(orderItem)
  },
  UPDATE (state, newInstance) {
    const oldInstance = state.orderItems.find(order => order.id === newInstance.id)
    const oldInstanceIndex = state.orderItems.indexOf(oldInstance)

    state.orderItems.splice(oldInstanceIndex, 1, newInstance)
  },
  DELETE (state, ids) {
    state.orderItems = state.orderItems.filter(o => !ids.includes(o.id))
  }
}

export const actions = {
  async get ({ commit }, query = {}) {
    const records = await base('Order Item')
      .select(query)
      .all()

    commit('SET', records)
  },
  async create ({ commit }, fields) {
    try {
      const record = await base('Order Item').create(fields)
      commit('PUSH', record)
    } catch (error) {
      throw new Error(`Could not create order item: ${error}`)
    }
  },
  async update ({ commit }, payload) {
    try {
      const records = await base('Order Item').update(payload)
      records.forEach(orderItem => commit('UPDATE', orderItem))
    } catch (error) {
      throw new Error(`Could not update order item: ${error}`)
    }
  },
  async delete ({ commit }, ids) {
    if (!Array.isArray(ids)) {
      throw new TypeError('An array of order item ids is required')
    }

    try {
      // Airtable only allows a max of 10 records to delete in a single request
      const chunks = breakUpArrayIntoChunks(ids, 10)
      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index]
        await base('Order Item').destroy(chunk)
      }

      commit('DELETE', ids)
    } catch (error) {
      throw new Error(`Could not delete given order items: ${error}`)
    }
  },
  clear({ commit }){
    commit('SET', [])
  }
}

export const getters = {
  orderItems (state) {
    return state.orderItems
  }
}
