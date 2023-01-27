
export default {
  updateSelectedClientTypes ({ commit }, selectedClientTypes) {
    commit('SET_SELECTED_CLIENT_TYPES', selectedClientTypes)
  },
  updateSelectedClientId ({ commit }, id) {
    commit('SET_SELECTED_CLIENT_ID', id)
  }
}
