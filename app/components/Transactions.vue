<script lang="ts" setup>
import { formatDate } from "~/utils/formatter";
import { Trash2, EditIcon, TrendingUp, TrendingDown } from 'lucide-vue-next'

// Props: transactions (array)
const props = defineProps<{
    transactions: any[];
    currency: string;
    format: string;
}>()

// Emits for parent component
const emit = defineEmits<{
    edit: [transaction: any]
    delete: [transactionId: string]
}>()

const handleEdit = (transaction: any) => {
    emit('edit', transaction)
}

const handleDelete = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
        emit('delete', transactionId)
    }
}

const total = computed(() => {
    return props.transactions.reduce((acc: number, t: any) => {
        if (t.type === 'income') {
            return acc + t.amount;
        } else {
            return acc - t.amount;
        }
    }, 0)
})
</script>

<template>
    <div class="space-y-4">
        <div class="text-right text-xl font-bold divr-8 text-white rounded-xl p-4" :class="total > 0 ? 'bg-green-500' : 'bg-red-500'">Total :
            <span class="pr-8">{{ formatCurrency(total, currency) }}</span>
        </div>
        <div v-for="t in transactions" :key="t.id"
            class="flex items-center gap-4 bg-white dark:bg-gray-600 rounded-xl shadow p-4 border">
            <div v-if="t.type === 'income'" class="text-green-500">
                <TrendingUp class="w-6 h-6" />
            </div>
            <div v-else class="text-red-500">
                <TrendingDown class="w-6 h-6" />
            </div>
            <div class="flex-1">
                <div class="text-black dark:text-white text-md">{{ t.description }}</div>
                <div class="text-gray-700">
                    <span class="rounded px-4 py-1 font-semibold text-xs"
                        :class="t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                        {{ t.category }}
                    </span>
                    <span class="text-gray-400 mx-3">{{ formatDate(t.date, format) }}</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <div :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'" class="font-bold">
                    {{ t.type === 'income' ? '+' : '-' }}
                    {{ formatCurrency(t.amount, currency) }}
                </div>
                <div class="flex gap-2">
                    <button @click="handleEdit(t)" class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Edit transaction">
                        <EditIcon class="w-4 h-4" />
                    </button>
                    <button @click="handleDelete(t.id)"
                        class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete transaction">
                        <Trash2 class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
