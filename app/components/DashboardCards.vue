<script setup lang="ts">
import { WalletCardsIcon, TrendingUp, TrendingDown } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/formatter'
defineProps<{
  balance: number,
  income: number,
  expense: number,
  currency: string
}>()
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm">Total Balance</p>
          <p class="text-2xl font-bold">{{ formatCurrency(balance, currency) }}</p>
        </div>
        <WalletCardsIcon class="w-8 h-8 text-blue-200" />
      </div>
    </div>
    <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-sm">Total Income</p>
          <p class="text-2xl font-bold">{{ formatCurrency(income, currency) }}</p>
        </div>
        <TrendingUp class="w-8 h-8 text-green-200" />
      </div>
    </div>
    <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-red-100 text-sm">Total Expenses</p>
          <p class="text-2xl font-bold">{{ formatCurrency(expense, currency) }}</p>
        </div>
        <TrendingDown class="w-8 h-8 text-red-200" />
      </div>
    </div>
  </div>
</template>


