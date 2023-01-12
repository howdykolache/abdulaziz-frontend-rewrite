<template>
  <div>
    <portal to="page-title">Delivery Summary</portal>
    <DeliverySummaryDateSelector
      @change="onDateSelected"
      :initial-date="initialDate.format('YYYY/MM/DD')"
      class="mt-16"
    />
    <ClientTypeFilter
      v-show="availableClientTypeList.length"
      v-model="selectedClientTypes"
      :options="availableClientTypeList"
    />
    <main v-if="!loading && !error">
      <div class="mt-16 orders-container">
        <ClientTypeOrders
        v-for="(clientTypeOrders, index) in groupedClientTypeOrders"
        :key="index"
        :type="clientTypeOrders.type"
        :orders='clientTypeOrders.data' />
        <p v-if="!groupedClientTypeOrders.length" class="text-center">No orders</p>
      </div>
      <div v-if="groupedClientTypeOrders.length" class="print-all-orders">
        <button @click="printOrders" class="btn">
          <img class="w-4 h-4" src="~/assets/icons/print.svg" >
          <span class="ml-3">Print all orders</span>
        </button>
      </div>
    </main>
    <div v-else class="text-center mt-40">
      <p v-if="loading">Loading...</p>
      <p v-else class="text-red-500">Ops! Something went wrong, tlease try again</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ClientTypeOrders from '@/components/delivery/summary/ClientTypeOrders'
import DeliverySummaryDateSelector from '@/components/delivery/summary/DeliverySummaryDateSelector '
import ClientTypeFilter from '@/components/filters/ClientTypeFilter'
import authGuardMixin from '@/mixins/auth-guard'
import { AIRTABLE_ENTITITY_FIELDS, TEST_CLIENT_IDS } from '@/utils'
import airQuery from '@/utils/airtable-query-builder'
import { generateOrderPdf } from '@/utils/pdfs'

export default {
  layout: 'dashboard',
  components: {
    ClientTypeOrders,
    ClientTypeFilter,
    DeliverySummaryDateSelector
  },
  mixins: [authGuardMixin],
  data () {
    return {
      selectedClientTypes: [],
      loading: false,
      error: false,
      initialDate: this.$moment() // today
    }
  },
  mounted () {
    this.load(this.initialDate.format('YYYY-MM-DD')) // Initially load day’s orders
  },
  computed: {
    ...mapGetters({
      ordersPerClient: 'delivery-summary/ordersPerClient',
      clients: 'entities/clients/clients',
      orders: 'entities/orders/orders',
      products: 'entities/products/products'
    }),
    clientOrders () {
      const orders = this.ordersPerClient

      // In order to align product names in the <thead> with their corresponding quantity inside the <tbody>,
      // We need to sort orders[CLIENT_X].products array in the same specific order
      const orderedOrders = []

      for (const key in orders) {
        const clientOrder = orders[key]
        const products = clientOrder.products

        const keys = Object.keys(products)

        keys.sort((a, b) => {
          return products[a].displayOrder - products[b].displayOrder
        })

        const orderedProducts = keys.reduce((obj, k) => {
          obj[k] = products[k]
          return obj
        }, {})

        orderedOrders.push({
          ...clientOrder,
          products: orderedProducts
        })
      }

      return orderedOrders
    },
    // Returns an object (clientOrders) keyed by client types
    groupedClientTypeOrders () {
      const groups = []

      for (let index = 0; index < this.clientOrders.length; index++) {
        const clientOrder = this.clientOrders[index]
        const clientType = clientOrder.client.type
        const displayOrder = parseInt(clientType.match(/[0-9]*/)[0])

        if (this.selectedClientTypes.length && !this.selectedClientTypes.includes(clientType)) {
          continue
        }

        let group = groups.find(g => g.type === clientType)

        if (!group) {
          group = {
            type: clientType,
            data: [],
            displayOrder
          }

          groups.push(group)
        }

        group.data.push(clientOrder)

        const groupIndex = groups.findIndex(g => g.type === clientType)
        groups.splice(groupIndex, 1, group)
      }

      return groups.sort((a, b) => a.displayOrder - b.displayOrder)
    },
    availableClientTypeList () {
      const list = []

      this.clients.forEach((client) => {
        const type = client.fields['Client Type']

        if (!list.includes(type)) {
          list.push(type)
        }
      })

      return list
    }
  },
  methods: {
    ...mapActions({
      getClients: 'entities/clients/get',
      getProducts: 'entities/products/get',
      getOrders: 'entities/orders/get',
      getOrderItems: 'entities/order-items/get',
      clearOrderItems: 'entities/order-items/clear'
    }),
    onDateSelected (date) {
      this.load(date)
    },
    async load (orderDate) {
      this.loading = true
      this.error = false

      try {
        if (!this.clients.length) {
          await this.getClients({
            fields: ['Name', 'Primary Contact', 'Address', 'Phone', 'Client Type', 'Rec ID', 'Email']
          })
        }

        if (!this.products.length) {
          await this.getProducts({
            filterByFormula: airQuery().where('Available', 1).get(),
            fields: AIRTABLE_ENTITITY_FIELDS.PRODUCTS
          })
        }

        // Reset order items whenever we are loading fresh data for a given day.
        // We don’t need to also reset orders, because getOrders will overwrite them anyway 
        this.clearOrderItems()

        await this.getOrders({
          filterByFormula: airQuery()
          .notIn('Client Rec ID', TEST_CLIENT_IDS)
          .whereDate('Date', orderDate)
          .get(),
          fields: AIRTABLE_ENTITITY_FIELDS.ORDER
        })

        if (this.orders.length) {
          await this.getOrderItems({
            filterByFormula: airQuery().whereIn('Order Rec ID', this.orders.map(o => o.id)).get()
          })
        }
      } catch (error) {
        console.error(error)
        this.error = true
      }

      this.loading = false
    },
    printOrders () {
      let orders = []
      this.groupedClientTypeOrders.forEach((clientOrder) => {
        orders = [...orders, ...clientOrder.data]
      })
      console.log(orders)
      generateOrderPdf(orders)
    }
  }
}
</script>

<style scoped>
main {
  @apply flex flex-col;
}

.orders-container {
  @apply order-2 lg:order-1;
}

.print-all-orders{
  @apply flex justify-center mt-16 lg:mt-6 order-1 lg:order-2 lg:mt-10;
}

.btn {
  @apply flex items-center;
}
</style>
