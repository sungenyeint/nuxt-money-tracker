<script lang="ts" setup>
import { computed } from "vue";
import { useCategories } from "~/composables/useCategories";
import { Trash2, EditIcon, WalletCardsIcon } from "lucide-vue-next";
import { useTransactions } from "~/composables/useTransactions";
import type { Category, NewCategoryInput } from "~/types/models";

const showCategoryModal = ref(false);
const showEditCategoryModal = ref(false);
const editingCategory = ref<any>(null);
const newCategory = ref({
    name: "",
    type: "income",
    color: "#3B82F6",
});

const { categories, addCategory, updateCategory, deleteCategory } =
    useCategories();
const { transactions } = useTransactions();

const incomeCategories = computed(() =>
    categories.value.filter((c) => c.type === "income")
);
const expenseCategories = computed(() =>
    categories.value.filter((c) => c.type === "expense")
);

const handleAddCategory = async (category: NewCategoryInput) => {
    showCategoryModal.value = false;

    try {
        await addCategory(category);
        // Reset form
        newCategory.value = {
            type: "income",
            name: "",
            color: "#3B82F6",
        };
    } catch (e) {
        console.error("Failed to add category:", e);
    }
};

const editCategory = (category: Category) => {
    editingCategory.value = { ...category };
    console.log("editingCategory", editingCategory.value);
    showEditCategoryModal.value = true;
};

const handleUpdateCategory = async (category: Category) => {
    showEditCategoryModal.value = false;

    try {
        await updateCategory(category);
    } catch (e) {
        console.error("Failed to update category:", e);
    }
};

const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure want to delete this category?')) {
        await deleteCategory(categoryId);
    }
}
</script>

<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Manage Categories</h2>
            <button @click="showCategoryModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                + Add Category
            </button>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="order-1 space-y-3">
                <div v-for="category in incomeCategories" :key="category.id"
                    class="bg-white dark:bg-gray-600 rounded-xl shadow p-4 border hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }"></div>
                            <h3 class="font-semibold text-gray-800 dark:text-white">{{ category.name }}</h3>
                        </div>
                        <div v-if="category.default === false" class="flex gap-1">
                            <button @click="editCategory(category)"
                                class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit category">
                                <EditIcon class="w-4 h-4" />
                            </button>
                            <button @click="handleDeleteCategory(category.id)"
                                class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete category">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <span class="px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">Income</span>
                        <span class="text-xs text-gray-400">
                            {{ transactions.filter((t) => t.category === category.name).length }}
                            transactions
                        </span>
                    </div>
                </div>
            </div>
            <div class="order-2 space-y-3">
                <div v-for="category in expenseCategories" :key="category.id"
                    class="bg-white dark:bg-gray-600 rounded-xl shadow p-4 border hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }"></div>
                            <h3 class="font-semibold text-gray-800 dark:text-white">{{ category.name }}</h3>
                        </div>
                        <div v-if="category.default === false" class="flex gap-1">
                            <button @click="editCategory(category)"
                                class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit category">
                                <EditIcon class="w-4 h-4" />
                            </button>
                            <button @click="handleDeleteCategory(category.id)"
                                class="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete category">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <span class="px-2 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">Expense</span>
                        <span class="text-xs text-gray-400">
                            {{ transactions.filter((t) => t.category === category.name).length }}
                            transactions
                        </span>
                    </div>
                </div>
            </div>


        </div>

        <!-- Empty State -->
        <div v-if="categories.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-4">
                <WalletCardsIcon class="w-16 h-16 mx-auto" />
            </div>
            <h3 class="text-lg font-semibold text-gray-600 mb-2">
                No categories yet
            </h3>
            <p class="text-gray-500 mb-4">
                Create your first category to organize your transactions
            </p>
            <button @click="showCategoryModal = true"
                class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                + Add Category
            </button>
        </div>
    </div>

    <CategoryModal v-if="showCategoryModal" :show="showCategoryModal" :category="newCategory"
        @close="showCategoryModal = false" @add="handleAddCategory" />

    <EditCategoryModal v-if="showEditCategoryModal" :show="showEditCategoryModal" :category="editingCategory"
        @close="showEditCategoryModal = false" @update="handleUpdateCategory" />
</template>
