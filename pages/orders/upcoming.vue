<template>
  <div class="upcoming-orders">
    <portal to="page-title">Upcoming Orders</portal>
    <div v-if="!loading && !error" class="mt-16">
      <div>
        <ClientTypeFilter :options="clientTypes" @change="onClientTypesFilterChange" />
        <div class="flex flex-col gap-5 mt-20 lg:items-center lg:flex-row">
          <DateRangeFilter v-model="dateRange" @change="load" />
          <ClientFilter/>
          <div class="flex justify-between items-center lg:flex-row">            
            <div class="flex-1 text-sm text-left md:text-right">
              {{ `${aggregatedOrdersCount} Orders (${aggregatedKolachesItemsCount} kolaches, ${aggregatedNonKolachesItemsCount} other)` }}
            </div>
            <DownloadAsCsv :data="csvData" class="ml-2"/>
          </div>
        </div>
      </div>
      <div class="mt-16">
        <div v-if="Object.keys(upcomingOrderDates).length">
          <div v-for="(orders, date) in upcomingOrderDates" :key="date" class="days">
            <div class="day">
              <h1 class="date">
                <mark>{{ formatDate(date) }}</mark>
              </h1>
              <h2 class="qty">
                {{ orders.length }} orders 
                ({{ calculateDayTotalKolacheItems(orders) }} kolaches,
                  {{ calculateDayTotalNonKolacheItems(orders) }} other)
              </h2>
            </div>
            <div class="day-orders-container">
              <UpcomingOrder v-for="order in orders" :key="order.id" :order="order" />
            </div>
          </div>
        </div>
        <div v-else class="mt-16 flex justify-center">
          <span>There are no orders for selected date range</span>
        </div>
      </div>
      </div>
    <div v-else class="mt-16 flex justify-center">
      <span v-if="loading">Loading...</span>
      <span v-else class="text-red-500">An error occured, please try refreshing</span>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'
import { mapActions, mapGetters } from 'vuex'
import airQuery from '@/utils/airtable-query-builder'
// import { TEST_CLIENT_IDS } from '@/utils'
import ClientTypeFilter from '@/components/filters/ClientTypeFilter'
import UpcomingOrder from '@/components/upcoming-orders/UpcomingOrder'
import DateRangeFilter from '@/components/upcoming-orders/date-range/DateRangeFilter.vue'
import ClientFilter from '@/components/upcoming-orders/ClientFilter'
import DownloadAsCsv from '@/components/upcoming-orders/DownloadAsCsv'
import authGuardMixin from '@/mixins/auth-guard'
import { AIRTABLE_ENTITITY_FIELDS } from '@/utils'

export default {
  components: {
    ClientTypeFilter,
    UpcomingOrder,
    DateRangeFilter,
    ClientFilter,
    DownloadAsCsv
  },
  layout: 'dashboard',
  mixins: [authGuardMixin],
  data () {
    return {
      clientTypes: [
        'Demo Box',
        'Storefront',
        'Coffee Shops',
        'Bar',
        'Wholesale',
        'Catering',
        'Direct To Consumer'
      ],
      dateRange: {
        startDate: this.$moment().toDate(),
        endDate: this.$moment().add('days', 30).toDate()
      },
      loading: true,
      error: false
    }
  },
  computed: {
    ...mapGetters({
      upcomingOrderDates: 'upcoming-orders/upcomingOrderDates',
      aggregatedOrdersCount: 'upcoming-orders/aggregatedOrdersCount',
      aggregatedKolachesItemsCount: 'upcoming-orders/aggregatedKolachesItemsCount',
      aggregatedNonKolachesItemsCount: 'upcoming-orders/aggregatedNonKolachesItemsCount',
      csvData: 'upcoming-orders/csvData',
      orders: 'entities/orders/orders'
    })
  },
  mounted () {
    this.load()
  },
  methods: {
    ...mapActions({
      getClients: 'entities/clients/get',
      getOrders: 'entities/orders/get',
      getOrderItems: 'entities/order-items/get',
      getProducts: 'entities/products/get',
      updateSelectedClientTypes: 'upcoming-orders/updateSelectedClientTypes'
    }),
    async load () {
      this.loading = true
      this.error = false

      try {
        await this.getOrders({
          filterByFormula: airQuery()
            // .notIn('Client Rec ID', TEST_CLIENT_IDS)
            .after('Date', this.$moment(this.dateRange.startDate).subtract('days', 1).format('MM/DD/YYYY')) // inclusive
            .before('Date', this.$moment(this.dateRange.endDate).format('MM/DD/YYYY'))
            .get(),
          sort: [{ field: 'Date', direction: 'asc' }],
          fields: AIRTABLE_ENTITITY_FIELDS.ORDER
        })

        if (this.orders.length) {
          await this.getOrderItems({
            filterByFormula: airQuery().whereIn('Order Rec ID', this.orders.map(o => o.id)).get()
          })
        }

        await this.getClients({
          filterByFormula: airQuery().whereInId(this.orders.map(order => order.fields.order)).get(),
          fields: ['Name', 'Primary Contact', 'Address', 'Phone', 'Client Type', 'Rec ID', 'Email']
        })

        await this.getProducts({
          filterByFormula: airQuery().get(),
          fields: AIRTABLE_ENTITITY_FIELDS.PRODUCTS
        })
      } catch (error) {
        console.error(error)
        this.error = true
      }

      this.loading = false
    },
    onClientTypesFilterChange (v) {
      this.updateSelectedClientTypes(v)
    },
    o (v) {
      console.log(this.dateRange)
    },
    formatDate (date) {
      return moment(date).format('ddd, M/DD')
    },
    calculateDayTotalKolacheItems (orders) {
      return orders.reduce((total, o) => total + o.totalKolacheItems, 0)
    },
    calculateDayTotalNonKolacheItems (orders) {
      return orders.reduce((total, o) => total + o.totalNonKolacheItems, 0)
    },
  }
}
</script>
