<template>
  <div class="order">
    <div @click="expanded = !expanded" class="main-content lg:cursor-pointer">
      <div class="flex flex-wrap">
        <div class="cell time">
          <div class="title">Ready time</div>
          <div class="value">{{ order.readyTime ? order.readyTime : '---' }}</div>
        </div>
        <div class="cell time">
          <div class="title">Delivery time</div>
          <div class="value">
            {{ order.deliveryTime ? order.deliveryTime : '---' }}
          </div>
        </div>
        <div class="cell qty">
          <div class="title">#</div>
          <div class="value">
            <span title="Kolaches">{{ order.totalKolacheItems }}</span>
            <span v-if="order.totalNonKolacheItems" title="Other">, {{ order.totalNonKolacheItems }}</span>
          </div>
        </div>
        <div class="cell delivery">
          <div class="title">Delivery</div>
          <div class="value">
            <div v-if="order.deliveryType">
              <div v-if="order.deliveryType.toLowerCase() === 'delivery'" >
                <img src="~/assets/icons/truck.svg" />
                <div v-if="order.deliveryDriver" class="text-xs">{{ order.deliveryDriver }}</div>
              </div>
              <img
                v-if="order.deliveryType.toLowerCase() === 'pickup'"
                src="~/assets/icons/user-check.svg"
              />
            </div>
            <div v-else>---</div>
          </div>
        </div>
        <div class="cell client">
          <div class="title">Client</div>
          <div class="value">
            <div class="flex justify-between items-center">
              <div>
                <a :href="`/clients/${order.clientId}`" target="_blank">{{ order.clientName }}</a>
                <p v-if="order.clientDetails" class="text-sm font-normal">
                  {{ order.clientDetails }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="order.notes" class="special-notes"><strong>Special Notes: </strong>{{ order.notes }}</div>
    </div>
    <div :class="{expanded: expanded}" class="expandable-content">
      <div class="details order-2 md:order-1">
        <div class="detail">
          <span class="title">Address</span>
          <span class="value">{{ order.address ? order.address : '---' }}</span>
        </div>
        <div class="detail">
          <span class="title">Contact name</span>
          <span class="value">{{ order.contactName  ? order.contactName : '---'}}</span>
        </div>
        <div class="detail">
          <span class="title">Contact phone number</span>
          <span class="value">{{ order.phoneNumber ? order.phoneNumber : '---' }}</span>
        </div>
        <div class="detail">
          <span class="title">Contact email</span>
          <span class="value">{{ order.clientEmail ? order.clientEmail : '---' }}</span>
        </div>
        <div class="detail">
          <span class="title">Delivery note</span>
          <span class="value">{{ order.deliveryNotes ? order.deliveryNotes : '---' }}</span>
        </div>
      </div>
      <OrderProducts :order="order" class="order-1 md:order-2" />
    </div>
    <div class="actions">
      <a :href="`/orders/${order.id}`" target="_blank">
        <font-awesome-icon :icon="['fas', 'pencil']" class="text-xs"/>
      </a>
      <font-awesome-icon
        @click="expanded = !expanded"
        :icon="['fas', `chevron-${expanded ? 'up' : 'down'}`]"
        class="text-s ml-4 cursor-pointer"
      />
    </div>
  </div>
</template>

<script>
import OrderProducts from '@/components/upcoming-orders/OrderProducts'
export default {
  components: {
    OrderProducts
  },
  props: {
    order: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      expanded: false
    }
  }
}
</script>
