<template>
  <div class="convenience-buttons">
    <span
      @click="onSelect(range)"
      v-for="(range, index) in dateRanges"
      :key="index"
      :class="{ selected: isSelected(range) }"
      class="button"
    >
      {{ getDateRangeDisplayLabel(range) }}
    </span>
  </div>
</template>

<script>
const datePropValidator = value => value instanceof Date

export default {
  props: {
    startDate: {
      required: true,
      validator: datePropValidator
    },
    endDate: {
      required: true,
      validator: datePropValidator
    }
  },
  data () {
    return {
      dateRanges: [
        {
          start: this.$moment().subtract('days', 30).toDate(),
          end: this.$moment().toDate()
        },
        {
          start: this.$moment().subtract('days', 7).toDate(),
          end: this.$moment().toDate()
        },
        {
          start: this.$moment().toDate(),
          end: this.$moment().add('days', 7).toDate()
        },
        {
          start: this.$moment().toDate(),
          end: this.$moment().add('days', 30).toDate()
        }
      ]
    }
  },
  methods: {
    onSelect (range) {
      this.$emit('select', range)
    },
    getDateRangeDisplayLabel (range) {
      const today = this.$moment()
      const start = this.$moment(range.start)
      const end = this.$moment(range.end)
      const diffInDays = end.diff(start, 'days')

      return `${end.isSameOrBefore(today) ? 'Last' : 'Next'} ${diffInDays} days`
    },
    isSelected (range) {
      return (
        this.$moment(range.start).isSame(this.startDate, 'day') &&
        this.$moment(range.end).isSame(this.endDate, 'day')
      )
    }
  }
}
</script>

<style scoped>
.convenience-buttons {
  @apply mt-2 flex flex-wrap gap-1 md:m-0 lg:absolute;
  top: 44px;
}

.convenience-buttons .button {
  @apply p-1 px-2 rounded-md text-xs cursor-pointer flex justify-center items-center;
  font-size: 11px;
}

.convenience-buttons .button.selected {
  @apply bg-yellow;
}
</style>
