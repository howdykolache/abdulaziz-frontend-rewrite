export default {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  SET_ORDER_ITEMA(state, orderItems) {
    state.orderItems = orderItems
  },
  SET_SORT_BY(state, value) {
    state.sortBy = value
  },
  SET_SEARCH_TERM(state, value) {
    state.searchTerm = value
  }
}
