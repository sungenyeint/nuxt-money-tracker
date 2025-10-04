<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { db } from "~/composables/useFirebase"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { useAuth } from "~/composables/useAuth"
import Transactions from '~/components/Transactions.vue'

const { user } = useAuth()
const loadingUser = ref(true)
const transactions = ref<any[]>([])

onMounted(() => {
  const stopWatch = watch(
    () => user.value,
    (val) => {
      loadingUser.value = false
      if (!val) return
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", val.uid),
        orderBy("createdAt", "desc")
      )

      onSnapshot(q, (snapshot) => {
        transactions.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      })
      stopWatch()
    },
    { immediate: true }
  )
})

// 🔹 Balance calculation
const income = computed(() =>
  transactions.value.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0)
)

const expense = computed(() =>
  transactions.value.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0)
)

const balance = computed(() => income.value - expense.value)

const tabs = [
  'Overview',
  'Transactions',
  'Analytics',
  'Reports',
  'Categories',
  'Settings'
]
const activeTab = ref('Overview')

const search = ref('')

const filteredTransactions = computed(() => {
  return transactions.value.filter(t =>
    t.category?.toLowerCase().includes(search.value.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.value.toLowerCase())
  )
})

const showAddModal = ref(false)
const newTransaction = ref({
  category: '',
  description: '',
  amount: 0,
  type: 'income'
})

const addTransaction = () => {
  // Implement transaction add logic here
  showAddModal.value = false
}

</script>

<template>
  <div class="max-w-5xl mx-auto p-6">
    <ClientOnly>
      <template v-if="loadingUser">
        <div class="flex items-center justify-center h-40">
          <span class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
          <span class="ml-3 text-blue-500 font-semibold">Loading user...</span>
        </div>
      </template>
      <template v-else>
        <SummaryCard :balance="balance" :income="income" :expense="expense" />
      </template>
    </ClientOnly>
    <!-- Tabs Navigation -->
    <div class="mb-6">
      <div class="flex border-b overflow-x-auto no-scrollbar">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'py-2 px-4 min-w-max -mb-px font-medium focus:outline-none',
            activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-blue-600'
          ]"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div>
      <div v-if="activeTab === 'Overview'">
        <!-- Overview content here -->
        <Transactions :transactions="transactions" />
      </div>
      <div v-else-if="activeTab === 'Transactions'">
        <div class="flex items-center justify-between mb-4">
          <input v-model="search" type="text" placeholder="Search transactions..."
            class="border rounded-lg px-3 py-2 w-2/3 focus:ring-2 focus:ring-blue-300" />
          <button class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            @click="showAddModal = true">
            + Add Transaction
          </button>
        </div>
        <!-- Transactions list here -->
        <Transactions :transactions="filteredTransactions" />
      </div>
      <div v-else-if="activeTab === 'Analytics'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryPieChart :transactions="transactions" />
          <IncomeExpenseChart :transactions="transactions" />
        </div>
      </div>
      <div v-else-if="activeTab === 'Reports'">
        <Reports :transactions="transactions" />
      </div>
      <div v-else-if="activeTab === 'Categories'">
        <!-- Categories content here -->
        <p class="text-gray-600">Categories tab content...</p>
      </div>
      <div v-else-if="activeTab === 'Settings'">
        <!-- Settings content here -->
        <p class="text-gray-600">Settings tab content...</p>
      </div>
    </div>

    <!-- Add Transaction Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button @click="showAddModal = false"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 class="text-xl font-bold mb-6 text-center">Add Transaction</h2>
        <!-- Add transaction form -->
        <form @submit.prevent="addTransaction" class="space-y-4">
          <div>
            <label class="block mb-1 font-medium">Type</label>
            <div class="flex gap-2">
              <button type="button" @click="newTransaction.type = 'income'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                newTransaction.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Income</button>
              <button type="button" @click="newTransaction.type = 'expense'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                newTransaction.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Expense</button>
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium">Category</label>
            <input v-model="newTransaction.category" placeholder="Category"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block mb-1 font-medium">Description</label>
            <input v-model="newTransaction.description" placeholder="Description"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block mb-1 font-medium">Amount</label>
            <input v-model.number="newTransaction.amount" type="number" placeholder="Amount"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold mt-2">Add
            Transaction</button>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
