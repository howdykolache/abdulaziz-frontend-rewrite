<template>
  <div class="p-3">
    <h3 class="font-bold">Delete</h3>
    <div>
        <p class="mt-6">Do you really want to delete this order?</p>
        <div class="flex justify-end mt-3">
          <button :disabled="deleting" @click="confirm" :class="{'btn__disabled': deleting}" class="btn !bg-red-500 !text-white">
            {{ deleting ? 'deleting' : 'Delete' }}
          </button>
        </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { sendEmail } from '@/utils'

export default {
  name: 'DeleteOrderModal',
  props: {
    orderId: {
      required: true
    }
  },
  data () {
    return {
      deleting: false
    }
  },
  computed: {
    ...mapGetters({
      fields: 'order-form/fields',
      selectedKolacheItemsCount: 'order-form/selectedKolacheItemsCount',
      selectedNonKolacheItemsCount: 'order-form/selectedNonKolacheItemsCount',
      clients: 'entities/clients/clients'
    }),
    client () {
      return this.clients.find(client => client.id === this.fields.client.id)
    }
  },
  methods: {
    ...mapActions({
      deleteOrder: 'order-form/delete'
    }),
    async confirm () {
      // Prepare notification email
      const { subject, body } = this.buildEmailPayload()

      this.deleting = true

      const deleted = await this.deleteOrder(this.orderId)

      this.deleting = false

      sendEmail(subject, body)

      if (deleted) {
        this.$notify({
          text: 'Order deleted successfully',
          type: 'success'
        })

        this.$router.push('/orders/upcoming')
      } else {
        this.$notify({
          text: 'Could not delete order, please try again later',
          type: 'error'
        })
      }

      this.$modal.hide('delete-order')
    },
    buildEmailPayload () {
      const date = this.$moment(this.fields.deliveryDate.date, 'YYYY-MM-DD').format('ddd MM/DD')
      const time = this.$moment(this.fields.deliveryDate.deliveryTime, 'hh:mm a').format('h:mm a')

      let includedItems = `${this.selectedKolacheItemsCount} kolaches`

      if(this.selectedNonKolacheItemsCount) {
        includedItems += `/${this.selectedNonKolacheItemsCount} other`
      }

      const subject = `[Order Deleted] ${date} @ ${time}, ${includedItems}, ${this.client.fields.Name}`

      const body =  `
        An order for ${this.client.fields.Name} has been deleted:
        <br>
        - ${date} @ ${time}<br>
        - Total kolaches: ${this.selectedKolacheItemsCount}<br>
        - Total other: ${this.selectedNonKolacheItemsCount}
      `

      return {
        subject,
        body
      }
    },
  }
}
</script>
