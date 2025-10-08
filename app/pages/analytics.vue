<script lang="ts" setup>
import { ref, computed } from "vue";
import { useTransactions } from "~/composables/useTransactions";
import CategoryPieChart from "~/components/CategoryPieChart.vue";
import IncomeExpenseChart from "~/components/IncomeExpenseChart.vue";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-vue-next";

const { transactions } = useTransactions();

// Time period filter
const timePeriod = ref<"week" | "month" | "year" | "all">("month");

// Filter transactions by time period
const filteredTransactions = computed(() => {
  const now = new Date();
  const filtered = transactions.value.filter((t) => {
    const transactionDate = new Date(t.date);

    switch (timePeriod.value) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case "month":
        return (
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      case "year":
        return transactionDate.getFullYear() === now.getFullYear();
      case "all":
      default:
        return true;
    }
  });
  return filtered;
});

// Calculate filtered totals
const filteredIncome = computed(() =>
  filteredTransactions.value
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
);

const filteredExpense = computed(() =>
  filteredTransactions.value
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
);

const filteredBalance = computed(
  () => filteredIncome.value - filteredExpense.value
);

// Top spending categories
const topCategories = computed(() => {
  const categoryTotals: Record<string, number> = {};
  filteredTransactions.value.forEach((t) => {
    if (t.type === "expense") {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });
  return Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
});

// Average transaction amount
const avgTransaction = computed(() => {
  if (filteredTransactions.value.length === 0) return 0;
  const total = filteredTransactions.value.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  return total / filteredTransactions.value.length;
});

// Largest transaction
const largestTransaction = computed(() => {
  if (filteredTransactions.value.length === 0) return null;
  return filteredTransactions.value.reduce((max, t) =>
    t.amount > max.amount ? t : max
  );
});

// Transaction count by type
const transactionCounts = computed(() => {
  const incomeCount = filteredTransactions.value.filter(
    (t) => t.type === "income"
  ).length;
  const expenseCount = filteredTransactions.value.filter(
    (t) => t.type === "expense"
  ).length;
  return { incomeCount, expenseCount };
});

// Savings rate
const savingsRate = computed(() => {
  if (filteredIncome.value === 0) return 0;
  return (
    ((filteredIncome.value - filteredExpense.value) / filteredIncome.value) *
    100
  );
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Time Period Filter -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
        <p class="text-gray-600 text-sm mt-1">
          Insights and trends for your financial data
        </p>
      </div>

      <!-- Time Period Selector -->
      <div class="flex gap-2">
        <button
          v-for="period in ['week', 'month', 'year', 'all']"
          :key="period"
          @click="timePeriod = period as any"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
            timePeriod === period
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          {{ period.charAt(0).toUpperCase() + period.slice(1) }}
        </button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Average Transaction -->
      <div class="bg-white rounded-xl shadow p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Avg Transaction</p>
            <p class="text-2xl font-bold text-gray-800">
              ${{ avgTransaction.toFixed(2) }}
            </p>
          </div>
          <DollarSign class="w-10 h-10 text-blue-500 opacity-20" />
        </div>
      </div>

      <!-- Total Transactions -->
      <div class="bg-white rounded-xl shadow p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Transactions</p>
            <p class="text-2xl font-bold text-gray-800">
              {{ filteredTransactions.length }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              {{ transactionCounts.incomeCount }} income,
              {{ transactionCounts.expenseCount }} expense
            </p>
          </div>
          <Calendar class="w-10 h-10 text-purple-500 opacity-20" />
        </div>
      </div>

      <!-- Savings Rate -->
      <div class="bg-white rounded-xl shadow p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Savings Rate</p>
            <p
              :class="[
                'text-2xl font-bold',
                savingsRate >= 0 ? 'text-green-600' : 'text-red-600',
              ]"
            >
              {{ savingsRate.toFixed(1) }}%
            </p>
          </div>
          <TrendingUp
            v-if="savingsRate >= 0"
            class="w-10 h-10 text-green-500 opacity-20"
          />
          <TrendingDown v-else class="w-10 h-10 text-red-500 opacity-20" />
        </div>
      </div>

      <!-- Largest Transaction -->
      <div class="bg-white rounded-xl shadow p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Largest Transaction</p>
            <p
              v-if="largestTransaction"
              :class="[
                'text-2xl font-bold',
                largestTransaction.type === 'income'
                  ? 'text-green-600'
                  : 'text-red-600',
              ]"
            >
              ${{ largestTransaction.amount.toFixed(2) }}
            </p>
            <p v-else class="text-2xl font-bold text-gray-400">N/A</p>
            <p
              v-if="largestTransaction"
              class="text-xs text-gray-500 mt-1 truncate"
            >
              {{ largestTransaction.description }}
            </p>
          </div>
          <DollarSign class="w-10 h-10 text-orange-500 opacity-20" />
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CategoryPieChart :transactions="filteredTransactions" />
      <IncomeExpenseChart :transactions="filteredTransactions" />
    </div>

    <!-- Top Spending Categories -->
    <TopSpendingCategories :topCategories="topCategories" :filteredExpense="filteredExpense" />

    <!-- Empty State -->
    <div
      v-if="filteredTransactions.length === 0"
      class="bg-white rounded-xl shadow p-12 text-center"
    >
      <Calendar class="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        No data for this period
      </h3>
      <p class="text-gray-500">
        Try selecting a different time period or add some transactions
      </p>
    </div>
  </div>
</template>
