<template>
  <div class="mb-8">
    <portal to="page-title">Create Order</portal>
    <div v-if="!loading && !error" class="mt-16">
        <OrderForm />
    </div>
    <div v-else class="mt-16 flex justify-center">
      <span v-if="loading">Loading...</span>
      <span v-else class="text-red-500">An error occured, please try refreshing</span>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import airQuery from '@/utils/airtable-query-builder'
import OrderForm from '@/components/order-form/OrderForm'
import authGuardMixin from '@/mixins/auth-guard'
import { AIRTABLE_ENTITITY_FIELDS } from '@/utils'

export default {
  components: {
    OrderForm
  },
  layout: 'dashboard',
  mixins: [authGuardMixin],
  data () {
    return {
      loading: true,
      error: false
    }
  },
  async mounted () {
    this.loading = true
    this.error = false

    try {
      await this.getClients({
        filterByFormula: airQuery().where('Active', 1).get(),
        fields: ['Name', 'Primary Contact', 'Address', 'Rec ID', 'Phone']
      })
      await this.getProducts({
        filterByFormula: airQuery()
          .where('Available', 1)
          .notEmpty('Name')
          .notEmpty('Available Days')
          .get(),
        fields: AIRTABLE_ENTITITY_FIELDS.PRODUCTS
      })
    } catch (error) {
      console.error(error)
      this.error = true
    }

    this.loading = false
  },
  methods: {
    ...mapActions({
      getClients: 'entities/clients/get',
      getProducts: 'entities/products/get'
    })
  }
}
</script>
