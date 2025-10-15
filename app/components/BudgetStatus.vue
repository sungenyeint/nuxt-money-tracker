<script setup lang="ts">
import { DollarSign, Target } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/formatter'
defineProps<{
  spent: number,
  monthlyBudget: number,
  percentage: number,
  currency: string
}>()
</script>

<template>
  <div v-if="monthlyBudget > 0" class="bg-white dark:bg-gray-600 rounded-xl shadow p-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Monthly Budget Status</h3>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <DollarSign class="w-5 h-5 text-gray-600 dark:text-white" />
          <span class="text-gray-700 dark:text-white">Spent this month</span>
        </div>
        <span class="font-semibold">{{ formatCurrency(spent, currency) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Target class="w-5 h-5 text-gray-600 dark:text-white" />
          <span class="text-gray-700 dark:text-white">Monthly budget</span>
        </div>
        <span class="font-semibold">{{ formatCurrency(monthlyBudget, currency) }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div class="h-3 rounded-full transition-all duration-300"
          :class="percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'"
          :style="{ width: Math.min(percentage, 100) + '%' }">
        </div>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600 dark:text-white">
          {{ percentage.toFixed(1) }}% of budget used
        </span>
        <span :class="percentage > 100 ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'">
          {{ percentage > 100 ? 'Over budget!' : percentage > 80 ? 'Almost there' : 'On track' }}
        </span>
      </div>
    </div>
  </div>
</template>
