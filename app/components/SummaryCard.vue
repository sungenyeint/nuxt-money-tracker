<script setup lang="ts">
import { ShoppingCart, WalletCards } from 'lucide-vue-next';
import { formatCurrency } from '~/utils/utils';

defineProps<{
  balance: number
  income: number
  expense: number
}>();

</script>

<template>
  <div class="rounded-xl p-5 shadow text-center mb-8">
    <p class="font-bold text-2xl text-gray-600">Current Balance</p>
    <p class="text-2xl font-bold" :class="balance >= 0 ? 'text-gray-800' : 'text-red-600'">
      {{ formatCurrency(balance) }}
    <div v-if="balance >= 0" class="text-green-600 text-sm font-normal">Positive Balance</div>
    <div v-else class="text-red-600 text-sm font-normal">Negative Balance</div>
    </p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-center">
    <div class="rounded-xl p-5 shadow flex flex-col bg-green-100">
      <WalletCards class="mx-auto mb-2 text-green-600" />
      <p class="text-green-600 text-sm">Total Income</p>
      <p class="text-2xl font-bold text-green-600">+ {{ formatCurrency(income) }}</p>
    </div>
    <div class="rounded-xl p-5 shadow flex flex-col bg-red-100">
      <ShoppingCart class="mx-auto mb-2 text-red-600" />
      <p class="text-red-600 text-sm">Total Expenses</p>
      <p class="text-2xl font-bold text-red-600">- {{ formatCurrency(expense) }}</p>
    </div>
  </div>
</template>
