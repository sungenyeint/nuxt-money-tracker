<script lang="ts" setup>
import { ref, computed } from "vue";
import { useTransactions } from "~/composables/useTransactions";
import { useCategories } from "~/composables/useCategories";
import { useSettings } from "~/composables/useSettings";
import TransactionFilters from "~/components/TransactionFilters.vue";
import { Download, FileText, Calendar } from "lucide-vue-next";
import { formatCurrency } from "~/utils/formatter";

const { transactions } = useTransactions();
const { userSettings } = useSettings();
const { categories } = useCategories();
// Filter state
const showFilters = ref(false);
const filters = ref({
  search: "",
  typeFilter: "all" as "all" | "income" | "expense",
  categoryFilter: "all",
  dateFrom: "",
  dateTo: "",
});

// Apply filters
const filteredTransactions = computed(() => {
  let filtered = transactions.value;

  if (filters.value.typeFilter !== "all") {
    filtered = filtered.filter((t) => t.type === filters.value.typeFilter);
  }

  if (filters.value.categoryFilter !== "all") {
    filtered = filtered.filter(
      (t) => t.category === filters.value.categoryFilter
    );
  }

  if (filters.value.dateFrom) {
    filtered = filtered.filter((t) => {
      const transactionDate = new Date(t.date);
      const fromDate = new Date(filters.value.dateFrom);
      return transactionDate >= fromDate;
    });
  }

  if (filters.value.dateTo) {
    filtered = filtered.filter((t) => {
      const transactionDate = new Date(t.date);
      const toDate = new Date(filters.value.dateTo);
      return transactionDate <= toDate;
    });
  }

  return filtered;
});

// Get ISO week number
const getISOWeek = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${d.getFullYear()}-W${weekNo}`;
};

// Monthly breakdown (income + expense)
const monthlyData = computed(() => {
  const result: Record<string, { income: number; expense: number }> = {};
  filteredTransactions.value.forEach((t) => {
    const date = new Date(t.date);
    const month = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!result[month]) {
      result[month] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      result[month].income += t.amount;
    } else {
      result[month].expense += t.amount;
    }
  });
  return result;
});

// Weekly breakdown
const weeklyData = computed(() => {
  const result: Record<string, { income: number; expense: number }> = {};
  filteredTransactions.value.forEach((t) => {
    const date = new Date(t.date);
    const week = getISOWeek(date);
    if (!result[week]) {
      result[week] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      result[week].income += t.amount;
    } else {
      result[week].expense += t.amount;
    }
  });
  return result;
});

// Category breakdown
const categoryData = computed(() => {
  const result: Record<string, { income: number; expense: number }> = {};
  filteredTransactions.value.forEach((t) => {
    if (!result[t.category]) {
      result[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === "income") {
      result[t.category].income += t.amount;
    } else {
      result[t.category].expense += t.amount;
    }
  });
  return result;
});

// Totals
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

// Clear filters
const clearFilters = () => {
  filters.value = {
    search: "",
    typeFilter: "all",
    categoryFilter: "all",
    dateFrom: "",
    dateTo: "",
  };
};

// Export CSV
const exportCSV = () => {
  let csv = "Report Type,Period,Income,Expense,Net\n";

  // Monthly data
  Object.entries(monthlyData.value).forEach(([month, data]) => {
    csv += `Monthly,${month},${data.income},${data.expense},${
      data.income - data.expense
    }\n`;
  });

  csv += "\n";

  // Category data
  Object.entries(categoryData.value).forEach(([category, data]) => {
    csv += `Category,${category},${data.income},${data.expense},${
      data.income - data.expense
    }\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `financial-report-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export PDF
const exportPDF = async () => {
  try {
    const [{ default: jsPDF }, autoTable] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Financial Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    // Summary
    doc.setFontSize(14);
    doc.text("Summary", 14, 38);
    autoTable.default(doc, {
      startY: 42,
      head: [["Type", "Amount"]],
      body: [
        ["Total Income", `$${filteredIncome.value.toFixed(2)}`],
        ["Total Expense", `$${filteredExpense.value.toFixed(2)}`],
        ["Net Balance", `$${filteredBalance.value.toFixed(2)}`],
      ],
    });

    // Monthly Report
    doc.text("Monthly Breakdown", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable.default(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["Month", "Income", "Expense", "Net"]],
      body: Object.entries(monthlyData.value).map(([month, data]) => [
        month,
        `$${data.income.toFixed(2)}`,
        `$${data.expense.toFixed(2)}`,
        `$${(data.income - data.expense).toFixed(2)}`,
      ]),
    });

    // Category Report
    doc.text("Category Breakdown", 14, (doc as any).lastAutoTable.finalY + 10);
    autoTable.default(doc, {
      startY: (doc as any).lastAutoTable.finalY + 14,
      head: [["Category", "Income", "Expense", "Net"]],
      body: Object.entries(categoryData.value).map(([category, data]) => [
        category,
        `$${data.income.toFixed(2)}`,
        `$${data.expense.toFixed(2)}`,
        `$${(data.income - data.expense).toFixed(2)}`,
      ]),
    });

    doc.save(`financial-report-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Financial Reports</h2>
        <p class="text-gray-600 dark:text-gray-200 text-sm mt-1">
          Comprehensive breakdown of your finances
        </p>
      </div>

    </div>

    <div class="flex gap-3">
      <button
        @click="exportCSV"
        class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        <Download class="w-4 h-4" />
        Export CSV
      </button>
      <button
        @click="exportPDF"
        class="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        <FileText class="w-4 h-4" />
        Export PDF
      </button>
    </div>
    <!-- Filters -->
    <TransactionFilters
      v-model:filters="filters"
      v-model:showFilters="showFilters"
      :categories="categories"
      @clearFilters="clearFilters"
    />

    <!-- Results Info -->
    <div class="text-sm text-gray-600 dark:text-white">
      Showing data for {{ filteredTransactions.length }} transactions
    </div>

    <!-- Monthly Report -->
    <div class="bg-white dark:bg-gray-600 rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar class="w-5 h-5 text-blue-600" />
        Monthly Breakdown
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b">
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white">Month</th>
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white text-right">
                Income
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white text-right">
                Expense
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white text-right">
                Net
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="([month, data], index) in Object.entries(monthlyData)"
              :key="month"
              :class="index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-400' : ''"
            >
              <td class="py-3 px-4">{{ month }}</td>
              <td class="py-3 px-4 text-right text-green-600 font-semibold">
                {{ formatCurrency(data.income, userSettings.currency) }}
              </td>
              <td class="py-3 px-4 text-right text-red-600 font-semibold">
                {{ formatCurrency(data.expense, userSettings.currency) }}
              </td>
              <td
                class="py-3 px-4 text-right font-bold"
                :class="
                  data.income - data.expense >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ formatCurrency(data.income - data.expense, userSettings.currency) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t-2">
            <tr class="bg-gray-100 dark:bg-gray-800 font-bold">
              <td class="py-3 px-4">Total</td>
              <td class="py-3 px-4 text-right text-green-600">
                {{ formatCurrency(filteredIncome, userSettings.currency) }}
              </td>
              <td class="py-3 px-4 text-right text-red-600">
                {{ formatCurrency(filteredExpense, userSettings.currency) }}
              </td>
              <td
                class="py-3 px-4 text-right"
                :class="
                  filteredBalance >= 0 ? 'text-green-600' : 'text-red-600'
                "
              >
                {{ formatCurrency(filteredBalance, userSettings.currency) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Category Report -->
    <div class="bg-white dark:bg-gray-600 rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4">Category Breakdown</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b">
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white">Category</th>
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white text-right">
                Income
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white text-right">
                Expense
              </th>
              <th class="py-3 px-4 font-semibold text-gray-700 dark:text-white text-right">
                Net
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="([category, data], index) in Object.entries(categoryData)"
              :key="category"
              :class="index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-400' : ''"
            >
              <td class="py-3 px-4">{{ category }}</td>
              <td class="py-3 px-4 text-right text-green-600 font-semibold">
                {{ formatCurrency(data.income, userSettings.currency) }}
              </td>
              <td class="py-3 px-4 text-right text-red-600 font-semibold">
                {{ formatCurrency(data.expense, userSettings.currency) }}
              </td>
              <td
                class="py-3 px-4 text-right font-bold"
                :class="
                  data.income - data.expense >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                "
              >
                {{ formatCurrency(data.income - data.expense, userSettings.currency) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredTransactions.length === 0"
      class="bg-white rounded-xl shadow p-12 text-center"
    >
      <FileText class="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <h3 class="text-xl font-semibold text-gray-700 dark:text-white mb-2">
        No data available
      </h3>
      <p class="text-gray-500">
        Add some transactions or adjust your filters to generate reports
      </p>
    </div>
  </div>
</template>
