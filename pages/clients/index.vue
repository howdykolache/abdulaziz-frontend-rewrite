<template>
  <div class="mb-10 mt-10 mx-auto w-11/12">
    <portal to="page-title">Clients</portal>
    <div class="flex justify-between items-center">
      <ClientListSort />
      <ClientListSearch />
    </div>
    <div v-if="!loadingInitialData">
      <ClientListTable />
    </div>
    <div v-else class=" mt-48 flex justify-center items-center">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { AIRTABLE_ENTITITY_FIELDS } from '@/utils'
import airQuery from '@/utils/airtable-query-builder'
import ClientListTable from '@/components/clients/list/ClientListTable.vue'
import ClientListSort from '@/components/clients/list/ClientListSort.vue'
import ClientListSearch from '@/components/clients/list/ClientListSearch.vue'

export default {
  components: {
    ClientListTable,
    ClientListSort,
    ClientListSearch
  },
  layout: 'dashboard',
  data() {
    return {
      loadingInitialData: true
    }
  },
  computed: {
    ...mapGetters({
      orders: 'client-list-page/orders',
      clients: 'entities/clients/clients'
    })
  },
  methods: {
    ...mapActions({
      getClients: 'entities/clients/get',
      getProducts: 'entities/products/get',
      // getOrders: 'entities/orders/get',
      fetchClientOrders: 'client-list-page/fetchClientOrders',
      fetchOrderOrderItems: 'client-list-page/fetchOrderOrderItems'
    })
  },
  async mounted() {
    this.loadingInitialData = true

    await this.getProducts({
      filterByFormula: airQuery().get(),
      fields: AIRTABLE_ENTITITY_FIELDS.PRODUCTS
    })

    await this.getClients({
      filterByFormula: airQuery().where('Active', 1).get(),
      fields: ['Name', 'Primary Contact', 'Email'],
    })

    await this.fetchClientOrders(this.clients.map((c) => c.id))

    if (this.orders.length) await this.fetchOrderOrderItems(this.orders.map((o) => o.id))

    this.loadingInitialData = false
  }
}
</script>
