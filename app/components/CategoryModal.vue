<script setup lang="ts">
import { ref, watch } from "vue";
const props = defineProps<{
    show: boolean;
    category: any;
}>();
const emit = defineEmits(["close", "add"]);
const category = ref({ ...props.category });
watch(
    () => props.category,
    (val) => {
        category.value = { ...val };
    }
);
const onAdd = () => {
    emit("add", category.value);
};
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white dark:bg-gray-600 rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                &times;
            </button>
            <h2 class="text-xl font-bold mb-6 text-center">Add Category</h2>
            <form @submit.prevent="onAdd" class="space-y-4">
                <div>
                    <label class="block mb-1 font-medium">Category Name</label>
                    <input v-model="category.name" placeholder="Enter category name"
                        class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 dark:bg-gray-400" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Type</label>
                    <div class="flex gap-2">
                        <button type="button" @click="category.type = 'income'" :class="[
                            'flex-1 py-2 rounded-lg border font-semibold',
                            category.type === 'income'
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : 'bg-gray-50 border-gray-300 text-gray-500',
                        ]">
                            Income
                        </button>
                        <button type="button" @click="category.type = 'expense'" :class="[
                            'flex-1 py-2 rounded-lg border font-semibold',
                            category.type === 'expense'
                                ? 'bg-red-100 border-red-500 text-red-700'
                                : 'bg-gray-50 border-gray-300 text-gray-500',
                        ]">
                            Expense
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block mb-1 font-medium">Color</label>
                    <input v-model="category.color" type="color" class="mt-2 w-full h-10 border rounded" />
                </div>
                <button type="submit" class="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold mt-2">
                    Add Category
                </button>
            </form>
        </div>
    </div>
</template>
