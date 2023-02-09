<template>
  <div class="flex items-center">
    <label>Client</label>
    <select
      v-model="selectedClient"
      @change="onChange"
      class="border border-gray-300 px-3 py-1 ml-3 w-full lg:w-56"
    >
      <option :value="null">All</option>
      <option
        v-for="client in sortedClients"
        :key="client.id"
        :value="client.id"
      >
        {{ client.fields.Name }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      selectedClient: null
    }
  },
  computed: {
    ...mapGetters({
      clients: 'entities/clients/clients',
      selectedClientId: 'upcoming-orders/selectedClientId'
    }),
    sortedClients() {
      return [...this.clients].sort((a, b) =>
        a.fields.Name.localeCompare(b.fields.Name)
      )
    }
  },
  methods: {
    ...mapActions({
      updateSelectedClientId: 'upcoming-orders/updateSelectedClientId'
    }),
    onChange() {
      this.updateSelectedClientId(this.selectedClient)
    }
  },
  mounted (){
    this.selectedClient = this.selectedClientId
  }
}
</script>
