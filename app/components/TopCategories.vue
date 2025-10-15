<template>
  <div v-if="categories.length > 0" class="bg-white rounded-xl shadow p-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Top Spending Categories</h3>
    <div class="space-y-3">
      <div v-for="([category, amount], index) in categories" :key="category"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-sm font-semibold text-blue-600">{{ index + 1 }}</span>
          </div>
          <span class="font-medium text-gray-800">{{ category }}</span>
        </div>
        <span class="font-semibold text-red-600">{{ formatCurrency(amount, currency) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '~/utils/formatter'
const props = defineProps<{
  categories: [string, number][],
  currency: string
}>()
</script>
