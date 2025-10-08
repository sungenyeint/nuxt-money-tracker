<script setup lang="ts">
const tabs = ['Overview', 'Transactions', 'Analytics', 'Reports', 'Settings']
const props = defineProps<{
  activeTab: string
}>()
const emit = defineEmits(['update:activeTab'])
</script>

<template>
  <div class="mb-6">
    <div class="flex border-b overflow-x-auto no-scrollbar">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="$emit('update:activeTab', tab)"
        :class="[
          'py-2 px-4 min-w-max -mb-px font-medium focus:outline-none',
          activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-600'
        ]"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>


