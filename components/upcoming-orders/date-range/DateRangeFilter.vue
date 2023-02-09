<template>
  <div class="date-range-wrapper">
    <div class="flex items-center">
      <label>Date Range</label>
      <date-range-picker
        ref="picker"
        class="ml-2"
        v-model="dateRange"
        :auto-apply="false"
        :close-on-esc="true"
        :ranges="false"
        opens="center"
        @update="onChange"
      >
        <template v-slot:input="picker" style="min-width: 350px;">
          {{ $moment(picker.startDate).format('MM/DD/YYYY') }} - {{ $moment(picker.endDate).format('MM/DD/YYYY') }}
        </template>
      </date-range-picker>
    </div>
    <DateRangePickerConvenienceButtons 
      @select="onDateRangeConvenienceButtonClick"
      :start-date="dateRange.startDate"
      :end-date="dateRange.endDate"
    />
  </div>
</template>

<script>
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import DateRangePickerConvenienceButtons from './DateRangePickerConvenienceButtons.vue'

export default {
  components: { 
    DateRangePicker,
    DateRangePickerConvenienceButtons
  },
  props: ['value'],
  data () {
    return {
      dateRange: {
        startDate: this.value.startDate,
        endDate: this.value.endDate
      }
    }
  },
  methods: {
    onChange (e) {
      this.$emit('input', this.dateRange)
      this.$emit('change')
    },
    onDateRangeConvenienceButtonClick(range) {
      this.dateRange.startDate = range.start
      this.dateRange.endDate = range.end

      this.onChange()
    }
  }
}
</script>

<style scoped>
.date-range-wrapper {
  position: relative;
  min-width: 317px;
  @apply md:flex justify-between lg:block;
}

.date-range-wrapper >>> .daterangepicker td.active,
.date-range-wrapper >>> .daterangepicker td.active:hover,
.date-range-wrapper >>> .daterangepicker .btn-primary,
.date-range-wrapper >>> .daterangepicker .btn-success {
    @apply !bg-yellow !text-black;
}

.date-range-wrapper >>> .daterangepicker .btn-secondary {
    @apply !bg-white;
    color: #000;
}
</style>
