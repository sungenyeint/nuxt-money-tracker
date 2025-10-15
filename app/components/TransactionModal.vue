<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white dark:bg-gray-600 rounded-xl shadow-lg p-6 w-full max-w-md relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
      <h2 class="text-xl font-bold mb-6 text-center">Add Transaction</h2>
      <form @submit.prevent="onAdd" class="space-y-4">
        <div>
          <div class="flex gap-2">
            <button type="button" @click="transaction.type = 'income'" :class="[
              'flex-1 py-2 rounded-lg border font-semibold',
              transaction.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
            ]">Income</button>
            <button type="button" @click="transaction.type = 'expense'" :class="[
              'flex-1 py-2 rounded-lg border font-semibold',
              transaction.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-500'
            ]">Expense</button>
          </div>
        </div>
        <div>
          <label class="block mb-1 font-medium">Category</label>
          <select v-model="transaction.category" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 dark:bg-gray-400">
            <option value="">Select a category</option>
            <option v-for="category in categories.filter(c => c.type === transaction.type)" :key="category.id"
              :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block mb-1 font-medium">Amount</label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-gray-500">$</span>
            <input v-model.number="transaction.amount" type="number" placeholder="0.00" min="0" step="0.01"
              class="w-full pl-8 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-300 dark:bg-gray-400" />
          </div>
        </div>
        <div>
          <label class="block mb-1 font-medium">Description</label>
          <textarea v-model="transaction.description" placeholder="Enter transaction description..." rows="3"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 resize-none dark:bg-gray-400"></textarea>
        </div>
        <div>
          <label class="block mb-1 font-medium">Date</label>
          <input v-model="transaction.date" type="date"
            class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 dark:bg-gray-400" />
        </div>
        <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold mt-2">Add
          Transaction</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
const props = defineProps<{
  show: boolean,
  categories: any[],
  transaction: any
}>()
const emit = defineEmits(['close', 'add'])
const transaction = ref({ ...props.transaction })
watch(() => props.transaction, (val) => {
  transaction.value = { ...val }
})
const onAdd = () => {
  emit('add', transaction.value)
}
</script>
