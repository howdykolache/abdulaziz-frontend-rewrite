<template>
  <div>
    <div class="lg:w-8/12 mx-auto">
      <div v-if="!createdOrderId">
        <section>
          <h4 class="section-title">Who Is This Order For?</h4>
          <ClientSelector class="mt-6" />
        </section>
        <section>
          <h4 class="section-title">When Should It Be Ready?</h4>
          <div class="mt-6">
            <DeliveryDateTimes />
          </div>
        </section>
        <section>
          <h4 class="section-title">How Will the Client Get It?</h4>
          <div class="mt-6">
            <Delivery :in-edit-mode="Boolean(orderId)"/>
          </div>
        </section>
        <section>
          <SpecialNotes />
        </section>
        <section>
          <h4 class="section-title">What Flavors Are In This Order?</h4>
          <Products class="mt-6" />
        </section>
        <section class="actions-wrapper">
          <h4 class="total-items">
            <strong>{{ selectedKolacheItemsCount }}</strong> KOLACHES
            <span v-if="selectedNonKolacheItemsCount">
              & <strong>{{ selectedNonKolacheItemsCount }}</strong> OTHER
            </span> SELECTED
          </h4>
          <div class="flex md:flex-col items-center md:mt-6">
            <div class="flex items-center order-1 md:order-2 md:mt-4">
              <button v-if="orderId" @click="openDeletionModal" class="btn btn__secondary !text-red-500 mr-4 md:mr-2">
                <span class="hidden md:inline">Delete</span>
                <font-awesome-icon :icon="['fas', 'trash']" class="text-base block md:hidden" />
              </button>
              <button v-if="orderId" @click="openCopyOrderModal" class="btn btn__secondary mr-4 md:mr-2">
                <span class="hidden md:inline">Copy</span>
                <font-awesome-icon :icon="['fas', 'copy']" class="text-base block md:hidden text-gray-500" />
              </button>
            </div>
            <button
            @click="submit"
            :class="{'btn__disabled': submitting}"
            :disabled="submitting"
            class="btn order-2 md:order-1">
              <span v-if="orderId">{{ submitting ? 'Updating...' : 'Update' }}</span>
              <span v-else>{{ submitting ? 'Submitting...' : 'Create' }}</span>
            </button>
          </div>
        </section>
      </div>
      <div v-else class="mt-8">
        <p class="flex justify-center items-center">
          <span>Order successfully created</span>
          <nuxt-link :to="`/orders/${createdOrderId}`" class="ml-2 cursor-pointer">
            <font-awesome-icon :icon="['fas', 'eye']" class="text-xs"/>
            <span>View</span>
          </nuxt-link>
        </p>
        <div class="text-center mt-8">
          <nuxt-link :to="`/orders/upcoming`" class="btn">
            View all upcoming orders
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ClientSelector from '@/components/order-form/fields/ClientSelector'
import DeliveryDateTimes from '@/components/order-form/fields/DeliveryDateTimes'
import Delivery from '@/components/order-form/fields/Delivery'
import SpecialNotes from '@/components/order-form/fields/SpecialNotes'
import Products from '@/components/order-form/fields/products/Products'
import CopyOrderModal from '@/components/order-form/modas/CopyOrderModal'
import DeleteOrderModal from '@/components/order-form/modas/DeleteOrderModal'
import { sendEmail } from '@/utils'

export default {
  components: {
    ClientSelector,
    DeliveryDateTimes,
    Delivery,
    SpecialNotes,
    Products
  },
  props: {
    orderId: {
      default: null
    }
  },
  data () {
    return {
      submitting: false,
      createdOrderId: null,
      currentCommittedChanges: null
    }
  },
  computed: {
    ...mapGetters({
      fields: 'order-form/fields',
      orderCreationPayload: 'order-form/orderCreationPayload',
      totalSelectedProducts: 'order-form/totalSelectedProducts',
      selectedKolacheItemsCount: 'order-form/selectedKolacheItemsCount',
      selectedNonKolacheItemsCount: 'order-form/selectedNonKolacheItemsCount',
      clients: 'entities/clients/clients'
    }),
    client () {
      return this.clients.find(client => client.id === this.fields.client.id)
    },
    emailSubjectTemplate () {
      const date = this.$moment(this.fields.deliveryDate.date, 'YYYY-MM-DD').format('ddd MM/DD')
      const time = this.$moment(this.fields.deliveryDate.deliveryTime, 'hh:mm a').format('h:mm a')
      
      let includedItems = `${this.selectedKolacheItemsCount} kolaches`

      if(this.selectedNonKolacheItemsCount) {
        includedItems += `/${this.selectedNonKolacheItemsCount} other`
      }

      return `[{PLACEHOLDER}] ${date} @ ${time}, ${includedItems}, ${this.client.fields.Name}`
    },
    emailBodyTemplate () {
      const date = this.$moment(this.fields.deliveryDate.date, 'YYYY-MM-DD').format('ddd MM/DD')
      const time = this.$moment(this.fields.deliveryDate.deliveryTime, 'hh:mm a').format('h:mm a')
      const link = `${window.location.origin}/login?next=/orders/${this.createdOrderId || this.orderId}`

      return `
        {PLACEHOLDER} for ${this.client.fields.Name}:
        <br>
        - ${date} @ ${time}<br>
        - Total kolaches: ${this.selectedKolacheItemsCount}<br>
        - Total other: ${this.selectedNonKolacheItemsCount}
        <br>
        <br>
        <a href="${link}">Click for full order details.</a>
      `
    },
    // We only need to send order update email notification if the date, time or quantity changes 
    shouldSendOrderUpdateEmail(){
      if(
        this.fields.deliveryDate.date !== this.currentCommittedChanges.deliveryDate.date ||
        this.fields.deliveryDate.deliveryTime !== this.currentCommittedChanges.deliveryDate.deliveryTime
      ) return true

      for (const key in this.fields.quantities) {
        let newValue = this.fields.quantities[key]
        let currentValue = this.currentCommittedChanges.quantities[key]

        if(newValue === undefined) newValue = 0
        if(currentValue === undefined) currentValue = 0

        if(newValue !== currentValue) return true
      }

      return false
    }
  },
  methods: {
    ...mapActions({
      createOrder: 'order-form/create',
      updateOrder: 'order-form/update'
    }),
    async submit () {
      if (!this.validate()) return

      this.submitting = true

      if (this.orderId) {
        await this.update()
      } else {
        await this.create()
      }

      this.submitting = false
    },
    async create () {
      this.createdOrderId = await this.createOrder(this.orderCreationPayload)

      if (this.createdOrderId) {
        this.$notify({
          text: 'Order created',
          type: 'success'
        })

        const subject = this.emailSubjectTemplate.replace('{PLACEHOLDER}', 'NEW Order')
        const body = this.emailBodyTemplate.replace('{PLACEHOLDER}', 'New order created')
        sendEmail(subject, body)
      } else {
        this.$notify({
          text: 'Could not create order, please try again later',
          type: 'error'
        })
      }
    },
    async update () {
      const success = await this.updateOrder(this.orderId)

      if (success) {
        this.$notify({
          text: 'Order updated',
          type: 'success'
        })

        if (this.shouldSendOrderUpdateEmail) {
          const subject = this.emailSubjectTemplate.replace('{PLACEHOLDER}', 'Order MODIFIED')
          const body = this.emailBodyTemplate.replace('{PLACEHOLDER}', 'Order UPDATED')
          sendEmail(subject, body)
        }
      } else {
        this.$notify({
          text: 'Could not save changes',
          type: 'error'
        })
      }

      this.currentCommittedChanges = this.fields
    },
    validate () {
      if (!this.fields.client || !this.fields.client.id) {
        this.$notify({
          text: 'Please select a client',
          type: 'error'
        })
        return false
      }

      if (!this.fields.deliveryDate || !this.fields.deliveryDate.date) {
        this.$notify({
          text: 'Please pick a date',
          type: 'error'
        })
        return false
      }

      if (this.fields.delivery.deliveryMethod.toLowerCase() === 'delivery') {
        const { shipAddress } = this.fields.delivery.address
        if (!shipAddress || shipAddress.trim() === '') {
          this.$notify({
            text: 'Please enter an address',
            type: 'error'
          })
          return false
        }
      }

      if (!this.totalSelectedProducts && !this.orderId) {
        this.$notify({
          text: 'No flavors selected',
          type: 'error'
        })
        return false
      }

      return true
    },
    openCopyOrderModal () {
      this.$modal.show(CopyOrderModal, {}, {
        maxWidth: 400,
        adaptive: true,
        name: 'copy-order'
      })
    },
    openDeletionModal () {
      const props = {
        orderId: this.orderId
      }

      this.$modal.show(DeleteOrderModal, props, {
        maxWidth: 400,
        adaptive: true,
        name: 'delete-order'
      })
    },
  },
  created(){
    this.currentCommittedChanges = this.fields
  }
}
</script>

<style scoped>
section {
  @apply mt-10;
}

.actions-wrapper {
  position: fixed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  left: 0;
  right: 0;
  bottom: 0;
  @apply px-3 py-3;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px, rgba(17, 17, 26, 0.1) 0px 24px 80px;
  z-index: 5;
  background: #fff;
}

.actions-wrapper .total-items {
  @apply text-sm;
}

.btn__secondary {
  border: none;
  padding: 0;
}

@media (min-width: 768px) {
  .actions-wrapper {
    flex-direction: column;
    position: relative;
    box-shadow: none;
    padding: 0;
  }

  .total-items {
    @apply text-base;
  }

  .btn__secondary {
    @apply border border-gray-300 px-3 py-2;
  }
}
</style>
