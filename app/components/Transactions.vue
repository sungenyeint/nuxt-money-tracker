<template>
  <div class="space-y-4">
    <div
      v-for="t in transactions"
      :key="t.id"
      class="flex items-center gap-4 bg-white rounded-xl shadow p-4 border"
    >
      <div v-if="t.type === 'income'" class="text-green-500">
        <WalletCardsIcon class="w-6 h-6" />
      </div>
      <div v-else class="text-red-500">
        <ShoppingCart class="w-6 h-6" />
      </div>
      <div class="flex-1">
        <div class="text-black text-md">{{ t.description }}</div>
        <div class="text-gray-700">
          <span
            class="rounded px-4 py-1 font-semibold text-xs"
            :class="t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ t.category }}
          </span>
          <span class="text-gray-400 mx-3">{{ new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
      </div>
      <div :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'" class="font-bold">
        {{ t.type === 'income' ? '+' : '-' }}
        ${{ t.amount }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { WalletCardsIcon, ShoppingCart } from 'lucide-vue-next'
// Props: transactions (array)
defineProps<{ transactions: any[] }>()
</script>
