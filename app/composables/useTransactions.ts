import { useNuxtApp } from '#app'
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    type Firestore,
} from "firebase/firestore";
import { useAuth } from "~/composables/useAuth";
import type { Transaction, NewTransactionInput } from "~/types/models";

// Types moved to ~/types/models

export function useTransactions() {
    const nuxtApp = useNuxtApp()
    const $db = nuxtApp.$db as Firestore | undefined
    const { user } = useAuth();
    const transactions = ref<Transaction[]>([]);
    const loading = ref(true);
    const error = ref<string | null>(null);

    if (!$db) {
        console.error('Firebase Firestore is not initialized. Make sure the Firebase plugin is properly configured.');
        return {
            transactions,
            loading,
            error,
            income: computed(() => 0),
            expense: computed(() => 0),
            balance: computed(() => 0),
            recentTransactions: computed(() => []),
            addTransaction: () => Promise.reject(new Error('Firebase Firestore not initialized')),
            updateTransaction: () => Promise.reject(new Error('Firebase Firestore not initialized')),
            deleteTransaction: () => Promise.reject(new Error('Firebase Firestore not initialized')),
        };
    }

    // Store unsubscribe function for cleanup
    let unsubscribe: (() => void) | null = null;

    onMounted(() => {
        let stopWatch: (() => void) | undefined;
        stopWatch = watch(
            () => user.value,
            (val) => {
                loading.value = false;
                if (!val) return;

                const q = query(
                    collection($db, "transactions"),
                    where("userId", "==", val.uid),
                    orderBy("createdAt", "desc")
                );

                // Store unsubscribe function
                unsubscribe = onSnapshot(q, (snapshot) => {
                    transactions.value = snapshot.docs.map(
                        (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        } as Transaction)
                    );
                });

                stopWatch?.();
            },
            { immediate: true }
        );
    });

    // Cleanup listener on unmount
    onUnmounted(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    // Computed properties
    const income = computed(() =>
        transactions.value
            .filter((t) => t.type === "income")
            .reduce((a, b) => a + b.amount, 0)
    );

    const expense = computed(() =>
        transactions.value
            .filter((t) => t.type === "expense")
            .reduce((a, b) => a + b.amount, 0)
    );

    const balance = computed(() => income.value - expense.value);

    const recentTransactions = computed(() => transactions.value.slice(0, 5));

    // Add Transaction
    const addTransaction = async (newTransaction: NewTransactionInput) => {
        try {
            error.value = null;

            if (!user.value) throw new Error("Please login first");
            if (
                !newTransaction.category ||
                !newTransaction.description ||
                !newTransaction.amount
            ) {
                throw new Error("Please fill all fields");
            }
            if (newTransaction.amount <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            await addDoc(collection($db, "transactions"), {
                category: newTransaction.category,
                description: newTransaction.description,
                amount: newTransaction.amount,
                type: newTransaction.type,
                userId: user.value.uid,
                date: newTransaction.date,
                createdAt: serverTimestamp(),
            });
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    };

    // Update Transaction
    const updateTransaction = async (transaction: Transaction) => {
        try {
            error.value = null;

            if (!user.value) throw new Error("Please login first");
            if (
                !transaction.category ||
                !transaction.description ||
                !transaction.amount
            ) {
                throw new Error("Please fill all fields");
            }
            if (transaction.amount <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            await updateDoc(doc($db, "transactions", transaction.id), {
                category: transaction.category,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                date: transaction.date,
            });
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    };

    // Delete Transaction
    const deleteTransaction = async (transactionId: string) => {
        try {
            error.value = null;

            if (!user.value) throw new Error("Please login first");

            await deleteDoc(doc($db, "transactions", transactionId));
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    };

    return {
        transactions,
        loading,
        error,
        income,
        expense,
        balance,
        recentTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
    };
}
