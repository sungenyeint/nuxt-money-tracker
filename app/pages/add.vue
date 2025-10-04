<script setup lang="ts">
import { ref } from "vue"
import { db } from "~/composables/useFirebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "~/composables/useAuth"

const { user } = useAuth()

const text = ref("")
const amount = ref<number | null>(null)
const category = ref("Other")

const categories = ["Food", "Salary", "Rent", "Shopping", "Transport", "Other"]

async function addTransaction() {
  if (!user.value) return alert("Please login first")
  if (!text.value || !amount.value) return alert("Fill all fields")

  await addDoc(collection(db, "transactions"), {
    text: text.value,
    amount: amount.value,
    category: category.value,
    userId: user.value.uid,
    createdAt: serverTimestamp()
  })

  text.value = ""
  amount.value = null
  category.value = "Other"
  alert("Transaction added ✅")
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-xl shadow mt-10">
    <h2 class="text-xl font-bold mb-4">Add Transaction</h2>

    <label class="block mb-2">Description</label>
    <input
      v-model="text"
      placeholder="Enter description"
      class="w-full p-2 border rounded-lg mb-4 focus:ring focus:ring-blue-200"
    />

    <label class="block mb-2">Amount</label>
    <input
      v-model.number="amount"
      type="number"
      placeholder="Positive = income, Negative = expense"
      class="w-full p-2 border rounded-lg mb-4 focus:ring focus:ring-blue-200"
    />

    <label class="block mb-2">Category</label>
    <select v-model="category" class="w-full p-2 border rounded-lg mb-4">
      <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
    </select>

    <button
      @click="addTransaction"
      class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Save
    </button>
  </div>
</template>
