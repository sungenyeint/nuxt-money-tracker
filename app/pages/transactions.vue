<script lang="ts" setup>
import Transactions from "~/components/Transactions.vue";
import TransactionFilters from "~/components/TransactionFilters.vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "#app";
import {
    useTransactions,
    type Transaction,
} from "~/composables/useTransactions";
import { useCategories } from "~/composables/useCategories";
import TransactionModal from "~/components/TransactionModal.vue";
import EditTransactionModal from "~/components/EditTransactionModal.vue";
import { useSettings } from "~/composables/useSettings";

const { userSettings } = useSettings();
const initialTransaction = {
    type: userSettings.value.defaultTransactionType as "income" | "expense",
    category: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
};

const showAddModal = ref(false);
const showEditModal = ref(false);
const editingTransaction = ref<Transaction | null>(null);
const showFilters = ref(false);

// Filter state object
const filters = ref({
    search: "",
    typeFilter: "all" as "all" | "income" | "expense",
    categoryFilter: "all",
    dateFrom: "",
    dateTo: "",
});

// Initial transaction for add modal
const newTransaction = ref(initialTransaction);

// Get transactions
const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    error,
} = useTransactions();

// Get categories
const { categories } = useCategories();
// Open add modal if URL query has add=1
const route = useRoute();
onMounted(() => {
    if (route.query.add === '1') {
        showAddModal.value = true;
    }
});

// Combined filter logic
const filteredTransactions = computed(() => {
    let filtered = transactions.value;

    // Search filter
    if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filtered = filtered.filter(
            (t) =>
                t.category?.toLowerCase().includes(searchLower) ||
                t.description?.toLowerCase().includes(searchLower) ||
                t.amount?.toString().includes(searchLower)
        );
    }

    // Type filter
    if (filters.value.typeFilter !== "all") {
        filtered = filtered.filter((t) => t.type === filters.value.typeFilter);
    }

    // Category filter
    if (filters.value.categoryFilter !== "all") {
        filtered = filtered.filter(
            (t) => t.category === filters.value.categoryFilter
        );
    }

    // Date range filter
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

// Check if any filters are active
const hasActiveFilters = computed(() => {
    return (
        filters.value.typeFilter !== "all" ||
        filters.value.categoryFilter !== "all" ||
        filters.value.dateFrom !== "" ||
        filters.value.dateTo !== ""
    );
});

// Clear all filters
const clearFilters = () => {
    filters.value = {
        search: "",
        typeFilter: "all",
        categoryFilter: "all",
        dateFrom: "",
        dateTo: "",
    };
};

// Handle add transaction
const handleAddTransaction = async (transaction: any) => {
    showAddModal.value = false;

    try {
        await addTransaction(transaction);
        newTransaction.value = initialTransaction;
    } catch (e) {
        console.error("Failed to add transaction:", e);
    }
};

// Edit transaction handler
const editTransaction = (transaction: Transaction) => {
    editingTransaction.value = { ...transaction };
    showEditModal.value = true;
};

// Handle update transaction
const handleUpdateTransaction = async (transaction: Transaction) => {
    showEditModal.value = false;
    try {
        await updateTransaction(transaction);
        editingTransaction.value = null;
    } catch (e) {
        console.error("Failed to update transaction:", e);
    }
};

// Handle delete transaction
const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Are you sure want to delete this transaction?")) {
        try {
            await deleteTransaction(transactionId);
        } catch (e) {
            console.error("Failed to delete transaction:", e);
        }
    }
};
</script>

<template>
    <div class="space-y-6">
        <!-- Error Display -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
        </div>

        <!-- Filters Component -->
        <TransactionFilters v-model:filters="filters" v-model:showFilters="showFilters" :categories="categories"
            @clearFilters="clearFilters">
            <template #actions>
                <button
                    class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    @click="showAddModal = true">
                    + Add Transaction
                </button>
            </template>
        </TransactionFilters>

        <!-- Results Count -->
        <div class="flex items-center justify-between text-sm text-gray-600 dark:text-white">
            <span>
                Showing {{ filteredTransactions.length }} of {{ transactions.length }}
                transactions
            </span>
            <span v-if="hasActiveFilters" class="text-blue-600">
                Filters active
            </span>
        </div>

        <!-- Transactions List -->
        <Transactions :transactions="filteredTransactions" @edit="editTransaction" @delete="handleDeleteTransaction" :currency="userSettings.currency" :format="userSettings.dateFormat" />

        <!-- Empty States -->
        <div v-if="filteredTransactions.length === 0 && transactions.length > 0"
            class="text-center py-12 text-gray-500">
            <p class="text-lg font-medium">No transactions match your filters</p>
            <p class="text-sm mt-2">Try adjusting your filter criteria</p>
            <button @click="clearFilters" class="mt-4 text-blue-600 hover:text-blue-700 font-medium">
                Clear Filters
            </button>
        </div>

        <div v-if="transactions.length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg font-medium">No transactions yet</p>
            <p class="text-sm mt-2">Click "Add Transaction" to get started</p>
        </div>
    </div>

    <!-- Modals -->
    <TransactionModal v-if="showAddModal" :show="showAddModal" :categories="categories" :transaction="newTransaction"
        @close="showAddModal = false" @add="handleAddTransaction" />

    <EditTransactionModal v-if="showEditModal && editingTransaction" :show="showEditModal" :categories="categories"
        :transaction="editingTransaction" @close="
            showEditModal = false;
        editingTransaction = null;
        " @update="handleUpdateTransaction" />
</template>
