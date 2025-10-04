<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { db } from "~/composables/useFirebase"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { useAuth } from "~/composables/useAuth"
import Transactions from '~/components/Transactions.vue'
import { Edit3, Trash2, WalletCardsIcon, TrendingUp, TrendingDown, Plus, BarChart3, FileText, DollarSign, Calendar, Target } from 'lucide-vue-next'

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

      // Load categories and settings when user is authenticated
      loadCategories()
      loadUserSettings()

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

// Dashboard insights
const recentTransactions = computed(() => transactions.value.slice(0, 5))

const topCategories = computed(() => {
  const categoryTotals: Record<string, number> = {}
  transactions.value.forEach(t => {
    if (t.type === 'expense') {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    }
  })
  return Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
})

const monthlyTrend = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthExpenses = transactions.value
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' &&
             date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const lastMonthExpenses = transactions.value
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' &&
             date.getMonth() === lastMonth &&
             date.getFullYear() === lastMonthYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  if (lastMonthExpenses === 0) return 0
  return ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
})

const budgetStatus = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const currentMonthExpenses = transactions.value
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' &&
             date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    spent: currentMonthExpenses,
    budget: userSettings.value.monthlyBudget,
    percentage: userSettings.value.monthlyBudget > 0 ?
      (currentMonthExpenses / userSettings.value.monthlyBudget) * 100 : 0
  }
})

// Settings Management Functions
const userSettings = ref({
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  notifications: true,
  autoBackup: true,
  defaultTransactionType: 'expense',
  monthlyBudget: 0,
  weeklyBudget: 0
})

const loadUserSettings = async () => {
  if (!user.value) return

  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    const settingsDoc = await getDoc(doc(db, "userSettings", user.value.uid))
    if (settingsDoc.exists()) {
      userSettings.value = { ...userSettings.value, ...settingsDoc.data() }
    }
  } catch (error) {
    console.error('Error loading user settings:', error)
  }
}

const saveUserSettings = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    await setDoc(doc(db, "userSettings", user.value.uid), {
      ...userSettings.value,
      updatedAt: new Date().toISOString()
    })

    alert('Settings saved successfully! ✅')
  } catch (error) {
    console.error('Error saving settings:', error)
    alert('Failed to save settings. Please try again.')
  }
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    userSettings.value = {
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light',
      notifications: true,
      autoBackup: true,
      defaultTransactionType: 'expense',
      monthlyBudget: 0,
      weeklyBudget: 0
    }
    alert('Settings reset to default values! ✅')
  }
}

const exportData = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  try {
    const exportData = {
      transactions: transactions.value,
      categories: categories.value,
      settings: userSettings.value,
      exportDate: new Date().toISOString()
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `money-tracker-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert('Data exported successfully! ✅')
  } catch (error) {
    console.error('Error exporting data:', error)
    alert('Failed to export data. Please try again.')
  }
}

// Dashboard helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: userSettings.value.currency
  }).format(amount)
}

const formatPercentage = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

const quickAddTransaction = () => {
  showAddModal.value = true
}

const quickViewReports = () => {
  activeTab.value = 'Reports'
}

const quickViewAnalytics = () => {
  activeTab.value = 'Analytics'
}

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
const showEditModal = ref(false)
const showCategoryModal = ref(false)
const showEditCategoryModal = ref(false)
const editingTransaction = ref<any>(null)
const editingCategory = ref<any>(null)
const categories = ref<any[]>([])
const newCategory = ref({
  name: '',
  type: 'expense',
  color: '#3B82F6'
})
const newTransaction = ref({
  type: 'income',
  category: '',
  amount: 0,
  description: '',
  date: new Date().toISOString()
})

const predefinedColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

const addTransaction = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  if (!newTransaction.value.category || !newTransaction.value.description || !newTransaction.value.amount) {
    alert('Please fill all fields')
    return
  }

  if (newTransaction.value.amount <= 0) {
    alert('Amount must be greater than 0')
    return
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    await addDoc(collection(db, "transactions"), {
      category: newTransaction.value.category,
      description: newTransaction.value.description,
      amount: newTransaction.value.amount,
      type: newTransaction.value.type,
      userId: user.value.uid,
      date: newTransaction.value.date,
      createdAt: serverTimestamp()
    })

    // Reset form
    newTransaction.value = {
      type: 'income',
      category: '',
  amount: 0,
      description: '',
      date: new Date().toISOString()
    }

    showAddModal.value = false
    alert('Transaction added successfully! ✅')
  } catch (error) {
    alert('Failed to add transaction. Please try again.')
  }
}

const editTransaction = (transaction: any) => {
  editingTransaction.value = { ...transaction }
  showEditModal.value = true
}

const updateTransaction = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  if (!editingTransaction.value.category || !editingTransaction.value.description || !editingTransaction.value.amount) {
    alert('Please fill all fields')
    return
  }

  if (editingTransaction.value.amount <= 0) {
    alert('Amount must be greater than 0')
    return
  }

  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    await updateDoc(doc(db, "transactions", editingTransaction.value.id), {
      category: editingTransaction.value.category,
      description: editingTransaction.value.description,
      amount: editingTransaction.value.amount,
      type: editingTransaction.value.type,
      date: editingTransaction.value.date
    })

    showEditModal.value = false
    editingTransaction.value = null
    alert('Transaction updated successfully! ✅')
  } catch (error) {
    alert('Failed to update transaction. Please try again.')
  }
}

const deleteTransaction = async (transactionId: string) => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  try {
    const { doc, deleteDoc } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    await deleteDoc(doc(db, "transactions", transactionId))
    alert('Transaction deleted successfully! ✅')
  } catch (error) {
    alert('Failed to delete transaction. Please try again.')
  }
}

// Category Management Functions
const loadCategories = async () => {
  if (!user.value) return

  try {
    const { collection, query, where, onSnapshot } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    const q = query(
      collection(db, "categories"),
      where("userId", "==", user.value.uid)
    )

    onSnapshot(q, (snapshot) => {
      categories.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    })
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const addCategory = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  if (!newCategory.value.name.trim()) {
    alert('Please enter a category name')
    return
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    await addDoc(collection(db, "categories"), {
      name: newCategory.value.name.trim(),
      type: newCategory.value.type,
      color: newCategory.value.color,
      userId: user.value.uid,
      createdAt: serverTimestamp()
    })

    // Reset form
    newCategory.value = {
      name: '',
      type: 'expense',
      color: '#3B82F6'
    }

    showCategoryModal.value = false
    alert('Category added successfully! ✅')
  } catch (error) {
    console.error('Error adding category:', error)
    alert('Failed to add category. Please try again.')
  }
}

const editCategory = (category: any) => {
  editingCategory.value = { ...category }
  showEditCategoryModal.value = true
}

const updateCategory = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  if (!editingCategory.value.name.trim()) {
    alert('Please enter a category name')
    return
  }

  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('~/composables/useFirebase')

    await updateDoc(doc(db, "categories", editingCategory.value.id), {
      name: editingCategory.value.name.trim(),
      type: editingCategory.value.type,
      color: editingCategory.value.color
    })

    showEditCategoryModal.value = false
    editingCategory.value = null
    alert('Category updated successfully! ✅')
  } catch (error) {
    console.error('Error updating category:', error)
    alert('Failed to update category. Please try again.')
  }
}

const deleteCategory = async (categoryId: string) => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('~/composables/useFirebase')

      await deleteDoc(doc(db, "categories", categoryId))
      alert('Category deleted successfully! ✅')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category. Please try again.')
    }
  }
}
</script>
<template>
  <div class="max-w-5xl mx-auto p-6">
      <template v-if="loadingUser">
        <div class="flex items-center justify-center h-40">
          <span class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
          <span class="ml-3 text-blue-500 font-semibold">Loading user...</span>
        </div>
      </template>
      <template v-else>
        <SummaryCard :balance="balance" :income="income" :expense="expense" />
      </template>
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
        <!-- Dashboard Overview -->
        <div class="space-y-6">

          <!-- Financial Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-100 text-sm">Total Balance</p>
                  <p class="text-2xl font-bold">{{ formatCurrency(balance) }}</p>
                </div>
                <WalletCardsIcon class="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-100 text-sm">Total Income</p>
                  <p class="text-2xl font-bold">{{ formatCurrency(income) }}</p>
                </div>
                <TrendingUp class="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-red-100 text-sm">Total Expenses</p>
                  <p class="text-2xl font-bold">{{ formatCurrency(expense) }}</p>
                </div>
                <TrendingDown class="w-8 h-8 text-red-200" />
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button @click="quickAddTransaction"
                class="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Plus class="w-6 h-6 text-blue-600 mb-2" />
                <span class="text-sm font-medium text-blue-700">Add Transaction</span>
              </button>
              <button @click="quickViewAnalytics"
                class="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <BarChart3 class="w-6 h-6 text-green-600 mb-2" />
                <span class="text-sm font-medium text-green-700">View Analytics</span>
              </button>
              <button @click="quickViewReports"
                class="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <FileText class="w-6 h-6 text-purple-600 mb-2" />
                <span class="text-sm font-medium text-purple-700">Generate Report</span>
              </button>
              <button @click="activeTab = 'Categories'"
                class="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Target class="w-6 h-6 text-orange-600 mb-2" />
                <span class="text-sm font-medium text-orange-700">Manage Categories</span>
              </button>
            </div>
          </div>

          <!-- Budget Status -->
          <div v-if="userSettings.monthlyBudget > 0" class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Monthly Budget Status</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <DollarSign class="w-5 h-5 text-gray-600" />
                  <span class="text-gray-700">Spent this month</span>
                </div>
                <span class="font-semibold">{{ formatCurrency(budgetStatus.spent) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <Target class="w-5 h-5 text-gray-600" />
                  <span class="text-gray-700">Monthly budget</span>
                </div>
                <span class="font-semibold">{{ formatCurrency(budgetStatus.budget) }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="h-3 rounded-full transition-all duration-300"
                  :class="budgetStatus.percentage > 100 ? 'bg-red-500' : budgetStatus.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'"
                  :style="{ width: Math.min(budgetStatus.percentage, 100) + '%' }">
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">
                  {{ budgetStatus.percentage.toFixed(1) }}% of budget used
                </span>
                <span :class="budgetStatus.percentage > 100 ? 'text-red-600' : budgetStatus.percentage > 80 ? 'text-yellow-600' : 'text-green-600'">
                  {{ budgetStatus.percentage > 100 ? 'Over budget!' : budgetStatus.percentage > 80 ? 'Almost there' : 'On track' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Monthly Trend -->
          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Monthly Spending Trend</h3>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <TrendingUp v-if="monthlyTrend >= 0" class="w-5 h-5 text-red-500" />
                <TrendingDown v-else class="w-5 h-5 text-green-500" />
                <span class="text-gray-700">Compared to last month</span>
              </div>
              <span :class="monthlyTrend >= 0 ? 'text-red-600' : 'text-green-600'" class="font-semibold">
                {{ formatPercentage(monthlyTrend) }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              {{ monthlyTrend >= 0 ? 'You spent more this month' : 'You spent less this month' }} compared to last month
            </p>
          </div>

          <!-- Top Spending Categories -->
          <div v-if="topCategories.length > 0" class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Top Spending Categories</h3>
            <div class="space-y-3">
              <div v-for="([category, amount], index) in topCategories" :key="category"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-sm font-semibold text-blue-600">{{ index + 1 }}</span>
                  </div>
                  <span class="font-medium text-gray-800">{{ category }}</span>
                </div>
                <span class="font-semibold text-red-600">{{ formatCurrency(amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="bg-white rounded-xl shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              <button @click="activeTab = 'Transactions'"
                class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div v-if="recentTransactions.length > 0" class="space-y-3">
              <div v-for="t in recentTransactions" :key="t.id"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-3">
                  <div :class="t.type === 'income' ? 'text-green-500' : 'text-red-500'">
                    <WalletCardsIcon v-if="t.type === 'income'" class="w-5 h-5" />
                    <TrendingDown v-else class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="font-medium text-gray-800">{{ t.description }}</p>
                    <p class="text-sm text-gray-500">{{ t.category }} • {{ new Date(t.date).toLocaleDateString() }}</p>
                  </div>
                </div>
                <div :class="t.type === 'income' ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                  {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <Calendar class="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions yet</p>
              <p class="text-sm">Add your first transaction to get started</p>
            </div>
          </div>

        </div>
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
        <Transactions :transactions="filteredTransactions" @edit="editTransaction" @delete="deleteTransaction" />
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
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Manage Categories</h2>
          <button @click="showCategoryModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            + Add Category
          </button>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="category in categories" :key="category.id"
            class="bg-white rounded-xl shadow p-4 border hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }"></div>
                <h3 class="font-semibold text-gray-800">{{ category.name }}</h3>
              </div>
              <div class="flex gap-1">
                <button @click="editCategory(category)"
                  class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Edit category">
                  <Edit3 class="w-4 h-4" />
                </button>
                <button @click="deleteCategory(category.id)"
                  class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete category">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                category.type === 'income' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              ]">
                {{ category.type === 'income' ? 'Income' : 'Expense' }}
              </span>
              <span class="text-xs text-gray-400">
                {{ transactions.filter(t => t.category === category.name).length }} transactions
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="categories.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <WalletCardsIcon class="w-16 h-16 mx-auto" />
          </div>
          <h3 class="text-lg font-semibold text-gray-600 mb-2">No categories yet</h3>
          <p class="text-gray-500 mb-4">Create your first category to organize your transactions</p>
          <button @click="showCategoryModal = true"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            + Add Category
          </button>
        </div>
      </div>
      <div v-else-if="activeTab === 'Settings'">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-800 mb-8">Settings</h2>

          <!-- General Settings -->
          <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">General Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-medium text-gray-700">Currency</label>
                <select v-model="userSettings.currency"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
              <div>
                <label class="block mb-2 font-medium text-gray-700">Date Format</label>
                <select v-model="userSettings.dateFormat"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label class="block mb-2 font-medium text-gray-700">Default Transaction Type</label>
                <select v-model="userSettings.defaultTransactionType"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label class="block mb-2 font-medium text-gray-700">Theme</label>
                <select v-model="userSettings.theme"
                  class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Budget Settings -->
          <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Budget Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-medium text-gray-700">Monthly Budget</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input v-model.number="userSettings.monthlyBudget" type="number"
                    placeholder="0.00" min="0" step="0.01"
                    class="w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label class="block mb-2 font-medium text-gray-700">Weekly Budget</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input v-model.number="userSettings.weeklyBudget" type="number"
                    placeholder="0.00" min="0" step="0.01"
                    class="w-full pl-8 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Notifications</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <label class="font-medium text-gray-700">Enable Notifications</label>
                  <p class="text-sm text-gray-500">Receive notifications for important events</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="userSettings.notifications" type="checkbox"
                    class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <label class="font-medium text-gray-700">Auto Backup</label>
                  <p class="text-sm text-gray-500">Automatically backup your data</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="userSettings.autoBackup" type="checkbox"
                    class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Data Management -->
          <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Data Management</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button @click="exportData"
                class="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export Data
              </button>
              <button @click="resetSettings"
                class="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Reset Settings
              </button>
            </div>
          </div>

          <!-- Account Information -->
          <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Account Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-medium text-gray-700">Email</label>
                <input :value="user?.email || 'Not available'"
                  disabled
                  class="w-full p-3 border rounded-lg bg-gray-100 text-gray-600" />
              </div>
              <div>
                <label class="block mb-2 font-medium text-gray-700">User ID</label>
                <input :value="user?.uid || 'Not available'"
                  disabled
                  class="w-full p-3 border rounded-lg bg-gray-100 text-gray-600" />
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end">
            <button @click="saveUserSettings"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Save Settings
            </button>
          </div>
        </div>
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
            <select v-model="newTransaction.category"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300">
              <option value="">Select a category</option>
              <option v-for="category in categories.filter(c => c.type === newTransaction.type)" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-1 font-medium">Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input v-model.number="newTransaction.amount" type="number" placeholder="0.00"
                min="0" step="0.01"
                class="w-full pl-8 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium">Description</label>
            <textarea v-model="newTransaction.description" placeholder="Enter transaction description..."
              rows="3"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 resize-none"></textarea>
          </div>
          <div>
            <label class="block mb-1 font-medium">Date</label>
            <input v-model="newTransaction.date" type="date"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold mt-2">Add
            Transaction</button>
        </form>
      </div>
    </div>

    <!-- Edit Transaction Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button @click="showEditModal = false"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 class="text-xl font-bold mb-6 text-center">Edit Transaction</h2>
        <!-- Edit transaction form -->
        <form @submit.prevent="updateTransaction" class="space-y-4">
          <div>
            <div class="flex gap-2">
              <button type="button" @click="editingTransaction.type = 'income'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                editingTransaction.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Income</button>
              <button type="button" @click="editingTransaction.type = 'expense'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                editingTransaction.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Expense</button>
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium">Category</label>
            <select v-model="editingTransaction.category"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300">
              <option value="">Select a category</option>
              <option v-for="category in categories.filter(c => c.type === editingTransaction.type)" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block mb-1 font-medium">Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input v-model.number="editingTransaction.amount" type="number" placeholder="0.00"
                min="0" step="0.01"
                class="w-full pl-8 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium">Description</label>
            <textarea v-model="editingTransaction.description" placeholder="Enter transaction description..."
              rows="3"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 resize-none"></textarea>
          </div>
          <div>
            <label class="block mb-1 font-medium">Date</label>
            <input v-model="editingTransaction.date" type="date"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <button type="submit" class="w-full py-2 bg-green-600 text-white rounded-lg font-semibold mt-2">Update
            Transaction</button>
        </form>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button @click="showCategoryModal = false"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 class="text-xl font-bold mb-6 text-center">Add Category</h2>
        <!-- Add category form -->
        <form @submit.prevent="addCategory" class="space-y-4">
          <div>
            <label class="block mb-1 font-medium">Category Name</label>
            <input v-model="newCategory.name" placeholder="Enter category name"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block mb-1 font-medium">Type</label>
            <div class="flex gap-2">
              <button type="button" @click="newCategory.type = 'income'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                newCategory.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Income</button>
              <button type="button" @click="newCategory.type = 'expense'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                newCategory.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Expense</button>
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium">Color</label>
            <div class="flex gap-2 flex-wrap">
              <button type="button" v-for="color in predefinedColors" :key="color"
                @click="newCategory.color = color"
                class="w-8 h-8 rounded-full border-2 transition-all"
                :class="newCategory.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
                :style="{ backgroundColor: color }"
                :title="color">
              </button>
            </div>
            <input v-model="newCategory.color" type="color" class="mt-2 w-full h-10 border rounded" />
          </div>
          <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold mt-2">Add
            Category</button>
        </form>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="showEditCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button @click="showEditCategoryModal = false"
          class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 class="text-xl font-bold mb-6 text-center">Edit Category</h2>
        <!-- Edit category form -->
        <form @submit.prevent="updateCategory" class="space-y-4">
          <div>
            <label class="block mb-1 font-medium">Category Name</label>
            <input v-model="editingCategory.name" placeholder="Enter category name"
              class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label class="block mb-1 font-medium">Type</label>
            <div class="flex gap-2">
              <button type="button" @click="editingCategory.type = 'income'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                editingCategory.type === 'income' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Income</button>
              <button type="button" @click="editingCategory.type = 'expense'" :class="[
                'flex-1 py-2 rounded-lg border font-semibold',
                editingCategory.type === 'expense' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-500'
              ]">Expense</button>
            </div>
          </div>
          <div>
            <label class="block mb-1 font-medium">Color</label>
            <div class="flex gap-2 flex-wrap">
              <button type="button" v-for="color in predefinedColors" :key="color"
                @click="editingCategory.color = color"
                class="w-8 h-8 rounded-full border-2 transition-all"
                :class="editingCategory.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
                :style="{ backgroundColor: color }"
                :title="color">
              </button>
            </div>
            <input v-model="editingCategory.color" type="color" class="mt-2 w-full h-10 border rounded" />
          </div>
          <button type="submit" class="w-full py-2 bg-green-600 text-white rounded-lg font-semibold mt-2">Update
            Category</button>
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
