<template>
  <div class="order-page">
    <portal v-if="currentClient" to="page-title">
      <ClientName :client="currentClient" />
    </portal>
    <div>
      <div v-if="!loading && !error" >
        <WeekSelector />
        <OrderFormMobile v-if="isMobile" class="mt-10" />
        <OrderFormDesktop v-else class="mt-16" />
        <div class="actions">
          <button
          @click="save"
          :class="{'btn__disabled': !areTherePendingChanges || savingChanges}"
          :disabled="!areTherePendingChanges || savingChanges"
          class="btn">
          {{ savingChanges ? 'Saving...' : 'Save Order' }}
          </button>
        </div>
      </div>
      <div v-else class="mt-16 flex justify-center">
        <span v-if="loading">Loading...</span>
        <span v-else class="text-red-500">An error occured, please try refreshing</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import OrderFormDesktop from '@/components/client-weekly-orders/desktop/OrderFormDesktop'
import OrderFormMobile from '@/components/client-weekly-orders/mobile/OrderFormMobile'
import WeekSelector from '@/components/client-weekly-orders/WeekSelector'
import ClientName from '@/components/clients/ClientName'
import airQuery from '@/utils/airtable-query-builder'

export default {
  layout: 'dashboard',
  components: {
    OrderFormDesktop,
    OrderFormMobile,
    WeekSelector,
    ClientName
  },
  data () {
    return {
      loading: true,
      error: false,
      savingChanges: false
    }
  },
  async mounted () {
    const fromDate = this.$moment().endOf('isoWeek').subtract(4, 'weeks').format('MM/DD/YYYY')
    const toDate = this.$moment().startOf('isoWeek').add(4, 'weeks').format('MM/DD/YYYY')

    this.setSelectedClientId(this.$route.params.id)

    this.loading = true
    this.error = false

    try {
      await this.getClients({ filterByFormula: airQuery().whereId(this.$route.params.id).get() })
      // Redirect to 404 page if the client does not exist
      if (!this.currentClient) {
        this.$nuxt.error({ statusCode: 404, message: 'Not found' })
        return
      }

      await this.getProducts({
        filterByFormula: airQuery()
          .whereInId(this.currentClient.fields['Chosen Products']) // Only fetch products chosen by this client
          .where('Available', 1)
          .notEmpty('Name')
          .notEmpty('Available Days')
          .get()
      })

      await this.getOrders({
        filterByFormula: airQuery()
          .after('Week Start', fromDate)
          .before('Week Start', toDate)
          .where('Client Rec ID', this.currentClient.id)
          .not('Data Source', 'Admin Order Creation Page')
          .get()
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
  methods: {
    ...mapActions({
      getClients: 'entities/clients/get',
      getProducts: 'entities/products/get',
      getOrders: 'entities/orders/get',
      getOrderItems: 'entities/order-items/get',
      setSelectedClientId: 'weekly-client-orders/setSelectedClientId',
      commitChanges: 'weekly-client-orders/commitChanges'
    }),
    async save () {
      this.savingChanges = true
      const success = await this.commitChanges()
      this.savingChanges = false

      if (success) {
        this.$notify({
          text: 'Your changes have been successfully saved!',
          type: 'success'
        })
      } else {
        this.$notify({
          text: 'Could not save changes, please try again ',
          type: 'error'
        })
      }
    }
  },
  computed: {
    ...mapGetters({
      orders: 'entities/orders/orders',
      currentClient: 'weekly-client-orders/currentClient',
      areTherePendingChanges: 'weekly-client-orders/areTherePendingChanges'
    }),
    isMobile () {
      if (process.client) {
        return screen.width < 1024
      }

      return undefined
    }
  }
}
</script>
