<template>
  <section class="client-type">
    <div class="header">
      <h2>{{ formattedClientType }}</h2>
      <button @click="generatePdf" class="btn">
        <img class="w-4 h-4" src="~/assets/icons/print.svg" >
        <span class="ml-3">Print {{ formattedClientType }} Section</span>
      </button>
    </div>
    <div class="table-container">
      <table class="table table--edgeless">
        <thead>
          <th>Client/Address</th>
          <th v-for="(productName, index) in productNames" :key="index">
            <span>{{ productName }}</span>
          </th>
          <th class="total">Totals</th>
        </thead>
        <tbody>
          <tr v-for="(clientOrder, index) in orders" :key="index">
            <td>
              <strong>{{ clientOrder.client.name }}</strong>
              <span>{{ clientOrder.client.address }}</span>
            </td>
            <td v-for="product in clientOrder.products" :key="product.id" :class="{'gray-out': !product.qty}">
              {{ product.qty }}
            </td>
            <td class="total">{{ clientOrder.totalOrders }}</td>
          </tr>
          <tr>
            <td class="total">Total</td>
            <td v-for="(product, index) in totalOrdersPerProduct" :key="index" class="total">
              {{ product.qty }}
            </td>
            <td class="total !bg-yellow">{{ totalOrders }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { generateOrderPdf } from '@/utils/pdfs'

export default {
  props: {
    orders: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  methods: {
    generatePdf () {
      const data = this.pdfData.filter(o => o.client.type === this.type)

      generateOrderPdf(data)
    }
  },
  computed: {
    ...mapGetters({
      products: 'entities/products/products',
      orderItems: 'entities/order-items/orderItems',
      clients: 'entities/clients/clients',
      pdfData: 'delivery-summary/pdfData',
    }),
    // Used to populate table head
    productNames () {
      // Product names must be ordered by the value of "Display Order", in order to stay in sync with below cells
      const products = [...this.products].sort((a, b) => {
        return a.fields['Display Order'] - b.fields['Display Order']
      })

      return products.map(p => p.fields.Name)
    },
    formattedClientType () {
      // Client types start with a number and a dot
      return this.type.replace(/^[0-9]\./, '')
    },
    // Returns accumulated ordered quality of each products
    totalOrdersPerProduct () {
      const data = []

      for (let index = 0; index < this.products.length; index++) {
        const product = this.products[index]

        const qty = this.orderItems.reduce((total, order) => {
          const client = this.clients.find(cl => cl.id === order.fields['Client Rec ID'][0])

          if (order.fields.Product[0] === product.id && client.fields['Client Type'] === this.type) {
            total += order.fields.Orders
          }

          return total
        }, 0)

        data.push({
          id: product.id,
          name: product.fields.Name,
          qty,
          displayOrder: product.fields['Display Order']
        })
      }

      // Must be in a specific order
      data.sort((a, b) => {
        return a.displayOrder - b.displayOrder
      })

      return data
    },
    totalOrders () {
      return this.orderItems.reduce((accumulator, order) => {
        const client = this.clients.find(cl => cl.id === order.fields['Client Rec ID'][0])

        // Me only care about orders for current client type
        if (client.fields['Client Type'] === this.type) {
          accumulator += order.fields.Orders
        }

        return accumulator
      }, 0)
    }
  }
}
</script>

<style scoped>
.client-type {
  @apply mb-16;
}

.client-type .header {
  @apply flex items-center justify-between mb-6;
}

.client-type .header h2 {
  @apply text-2xl font-medium;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.table {
  @apply w-full;
}

.table th {
  @apply uppercase rotate-180 !text-start;
  writing-mode: tb-rl;
}

.table th:first-child {
  @apply rotate-0 !text-start;
  writing-mode: initial;
}

.table th,
.table td {
  padding: 10px;
  border: 1px solid #d1d1d1 !important;
  text-align: center;
  @apply text-sm;
}

.table th:first-child,
.table td:first-child {
  border-left: none !important;
}

.table td:first-child {
  @apply text-start text-sm;
}

.table .total {
  @apply text-center font-medium;
  background: #f2f2ed;
}

.table th.total {
  @apply text-start;
}

.table td:first-child {
  @apply flex flex-col;
}

.table td.gray-out{
  background: #FBFBFB;
  opacity: 25%;
}

.btn {
  @apply flex items-center;
}

.btn span{
  @apply hidden;
}

@media (min-width: 1024px) {
  .btn span{
    @apply block;
  }
}
</style>
