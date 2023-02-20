<template>
  <div class="ml-8 flex-1 pr-8 flex">
    <input
      v-model="query"
      @input="onInput"
      type="text"
      class="input"
      placeholder="Search by company name, contact nameor email"
    />
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
    onInput() {
      this.setSearchTerm(this.query)
    }
  }
}
</script>
