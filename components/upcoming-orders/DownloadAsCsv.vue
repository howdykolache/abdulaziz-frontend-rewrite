<template>
  <button @click="onDownload" title="Export as CSV" class="btn btn-primary">
    <img src="~/assets/icons/download.svg" class="w-4 h-4" />
  </button>
</template>

<script>
import { arrayToCsv, downloadCsv } from '../../utils'

export default {
  props: {
    data: {
      required: true,
      type: Array
    }
  },
  data() {
    return {
      array: this.data
    }
  },
  methods: {
    onDownload(e){
      if(!this.array || !this.array.length) return

      const csv = arrayToCsv(this.array)

      downloadCsv(csv, `Upcoming Orders`)
    }
  },
}
</script>
