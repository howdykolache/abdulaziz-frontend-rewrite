<template>
  <div class="ml-8 flex-1 pr-8 flex">
    <input
      v-model="query"
      type="text"
      class="input"
      placeholder="Search by company name, contact nameor email"
    />
    <button 
      @click="search"
      :disabled="disableBtn"
      :class="{'opacity-40': disableBtn}"
      class="btn btn-primary"
    >
    <img class="w-6 h-6" src="~/assets/icons/search.svg" >
    </button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      query: ''
    }
  },
  computed: {
    ...mapGetters({
      currentSearchTerm: 'client-list-page/searchTerm'
    }),
    disableBtn (){
      return this.query === this.currentSearchTerm
    }
  },
  methods: {
    ...mapActions({
      setSearchTerm: 'client-list-page/setSearchTerm'
    }),
    search() {
      this.setSearchTerm(this.query)
    }
  }
}
</script>
