<template>
  <div class="flex justify-end md:justify-start items-center md:items-start m-0 mt-6">
    <button @click="$emit('clear')" class="clear-btn text-red-500">
      clear all
    </button>
    <div class="dropdown ml-4 md:ml-0">
      <button @click="toggleDropdown" class="toggle-dropdown-btn underline">
        Quick entry
      </button>
      <div :class="{'open': openDropDown}"  class="options">
        <button @click="addOneBreakfast" class="btn btn__secondary">
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs"/>
          <span>1 breakfast sample box</span>
        </button>
        <button @click="addOneAllDaySample" class="btn btn__secondary">
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs"/>
          <span>1 all day sample box</span>
        </button>
        <button @click="addHowdyMix" class="btn btn__secondary">
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs"/>
          <span>1 howdy Mix (12)</span>
        </button>
        <button @click="addVegMix" class="btn btn__secondary">
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs"/>
          <span>1 veg Mix (12)</span>
        </button>
        <button @click="addSweetAndSavory" class="btn btn__secondary">
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs"/>
          <span>1 sweet and savory</span>
        </button>
        <button @click="addOneDozenAllDay" class="btn btn__secondary">
          <font-awesome-icon :icon="['fas', 'plus']" class="text-xs"/>
          <span>1 all day dozen</span>
        </button>
        <button @click="toggleDropdown" class="btn btn__secondary md:!hidden !text-red-500 !mt-0">
          <span>Close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const PRODUCT_IDS = {
  coloradough: 'recOY2bEa5r9Uc5eS',
  elGreco: 'recXXlj4tAZCp416B',
  hammySammy: 'rec5BhFPhXUEsISmi',
  theSchmear:'rec4f7tMSqSFtUsgH',
  potHocket:'rec8NreCbCUwVnQgb',
  theHomesickTexan:'recDa06nJ5hIgfdDI',
  ronSwanson:'recZJBEonwaJ2UM3A',
  desayuno:'recJJKZq6OOBgdge1',
  kream:'recvpRS22hhPag0IF',
  wapPer:'recN8XcZMdE0aQjsc',
  weMissDoug:'rec8jnxepOczjpAsO',
  assortedSweet:'recIYpAFu1BxQADci',
}

export default {
  data () {
    return {
      orderEventName: 'add-default-order',
      openDropDown: false
    }
  },
  methods: {
    toggleDropdown () {
      this.openDropDown = !this.openDropDown
    },
    addOneBreakfast () {
      this.$emit(this.orderEventName, {
        [PRODUCT_IDS.coloradough]: 1,
        [PRODUCT_IDS.ronSwanson]: 1,
        [PRODUCT_IDS.elGreco]: 1,
        [PRODUCT_IDS.theSchmear]: 1
      })
    },
    addOneAllDaySample () {
      this.$emit(this.orderEventName, {
        [PRODUCT_IDS.wapPer]: 1,
        [PRODUCT_IDS.potHocket]: 1,
        [PRODUCT_IDS.weMissDoug]: 1,
        [PRODUCT_IDS.hammySammy]: 1
      })
    },
    addHowdyMix () {
      this.$emit(this.orderEventName, {
        [PRODUCT_IDS.coloradough]: 3,
        [PRODUCT_IDS.elGreco]: 3,
        [PRODUCT_IDS.theSchmear]: 2,
        [PRODUCT_IDS.kream]: 2,
        [PRODUCT_IDS.ronSwanson]: 1,
        [PRODUCT_IDS.desayuno]: 1
      })
    },
    addVegMix  () {
      this.$emit(this.orderEventName, {
        [PRODUCT_IDS.elGreco]: 6,
        [PRODUCT_IDS.theSchmear]: 3,
        [PRODUCT_IDS.kream]: 3
      })
    },
    addOneDozenAllDay  () {
      this.$emit(this.orderEventName, {
        [PRODUCT_IDS.wapPer]: 3,
        [PRODUCT_IDS.weMissDoug]: 3,
        [PRODUCT_IDS.hammySammy]: 3,
        [PRODUCT_IDS.kream]: 3
      })
    },
    addSweetAndSavory  () {
      this.$emit(this.orderEventName, {
        [PRODUCT_IDS.coloradough]: 2,
        [PRODUCT_IDS.elGreco]: 2,
        [PRODUCT_IDS.theSchmear]: 2,
        [PRODUCT_IDS.assortedSweet]: 6,
      })
    }
  }
}
</script>

<style scoped>
.options button {
  @apply text-xs p-2 flex items-center mt-2 border-0;
}

.dropdown {
  position: relative;
}

.options{
  @apply flex flex-col absolute p-2 bg-white z-10 hidden;
  top: 27px;
  left: -117px;
  min-width: 200px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
}

.options.open{
  @apply flex;
}

.toggle-dropdown-btn {
  display: block;
}

@media (min-width: 768px) {
  .options{
    @apply flex flex-row flex-wrap static p-0 m-0 shadow-none order-1;
  }

  .options button {
    @apply border border-gray-400 text-sm mr-2 mt-0 mb-2 p-1;
  }

  .toggle-dropdown-btn {
    display: none;
  }

  .clear-btn {
    min-width: 63px;
    order: 2;
  }
}

</style>
