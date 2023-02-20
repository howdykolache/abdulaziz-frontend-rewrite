<template>
  <div class="w-6/12 flex items-center">
    <span>Sort by</span>
    <div class="ml-6 flex justify-between items-center">
      <span
        @click="setSortBy('most-recent-order')"
        :class="{ selected: sortBy === 'most-recent-order' }"
        class="chip text-sm"
      >
        Recent orders
      </span>
      <span
        @click="setSortBy('most-orders')"
        :class="{ selected: sortBy === 'most-orders' }"
        class="chip text-sm ml-2"
      >
        Most orders
      </span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      sortBy: 'client-list-page/sortBy'
    })
  },
  methods: {
    ...mapActions({
      setSortBy: 'client-list-page/setSortBy'
    })
  }
}
</script>
