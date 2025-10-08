<script setup lang="ts">
import { formatCurrency } from '~/utils/utils'
import { WalletCardsIcon, TrendingDown } from 'lucide-vue-next'
const props = defineProps<{
  recentTransactions: any[];
}>();
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Recent Transactions</h3>
      <NuxtLink to="/transactions" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
        View All
      </NuxtLink>
    </div>
    <div v-if="props.recentTransactions.length > 0" class="space-y-3">
      <div
        v-for="t in props.recentTransactions"
        :key="t.id"
        class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div :class="t.type === 'income' ? 'text-green-500' : 'text-red-500'">
            <WalletCardsIcon v-if="t.type === 'income'" class="w-5 h-5" />
            <TrendingDown v-else class="w-5 h-5" />
          </div>
          <div>
            <p class="font-medium text-gray-800">{{ t.description }}</p>
            <p class="text-sm text-gray-500">
              {{ t.category }} • {{ new Date(t.date).toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div
          :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'"
          class="font-semibold"
        >
          {{ t.type === "income" ? "+" : "-" }}{{ formatCurrency(t.amount) }}
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      <Calendar class="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>No transactions yet</p>
      <p class="text-sm">Add your first transaction to get started</p>
    </div>
  </div>
</template>
