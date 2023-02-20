<template>
 <div>
    <table v-if="clientList.length" class="mt-8 table table--edgeless w-full">
    <thead>
      <tr>
        <th class="w-4/12">Client</th>
        <th>Last Ordered</th>
        <th>First Ordered</th>
        <th>Total Orders</th>
        <th>Total Kolaches Ordered</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="client in clientList" :key="client.id">
        <td>
          {{ client.name }}
        </td>
        <td class="text-center">{{ formatDate(client.lastOrderDate) }}</td>
        <td class="text-center">{{ formatDate(client.firstOrderDate) }}</td>
        <td class="text-center">{{ client.orderCount }}</td>
        <td class="text-center">{{ client.totalKolaches }}</td>
      </tr>
    </tbody>
    </table>
    <div v-else class=" mt-48 flex justify-center items-center">
        <p>No matching results</p>
    </div>
 </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      clientList: 'client-list-page/filteredClientList'
    })
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return 'n\\a'

      return this.$moment(dateStr, 'YYYY-MM-DD').format('MMM D, YYYY')
    }
  }
}
</script>
