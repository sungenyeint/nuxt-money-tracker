<script setup lang="ts">
import { formatPercentage } from '~/utils/utils'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'
const props = defineProps<{
    trend: number,
    currency: string
}>()
</script>

<template>
    <div class="bg-white rounded-xl shadow p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Monthly Spending Trend</h3>
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
                <TrendingUp v-if="props.trend >= 0" class="w-5 h-5 text-red-500" />
                <TrendingDown v-else class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">Compared to last month</span>
            </div>
            <span :class="props.trend >= 0 ? 'text-red-600' : 'text-green-600'" class="font-semibold">
                {{ formatPercentage(props.trend) }}
            </span>
        </div>
        <p class="text-sm text-gray-500 mt-2">
            {{ monthlyTrend >= 0 ? 'You spent more this month' : 'You spent less this month' }} compared
            to
            last
            month
        </p>
    </div>
</template>