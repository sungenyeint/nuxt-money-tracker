import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { db } from "~/composables/useFirebase";
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
} from "firebase/firestore";
import { useAuth } from "~/composables/useAuth";

// TypeScript Interfaces
export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: any;
}

export interface NewTransactionInput {
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const transactions = ref<Transaction[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

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
          collection(db, "transactions"),
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

      await addDoc(collection(db, "transactions"), {
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

      await updateDoc(doc(db, "transactions", transaction.id), {
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

      await deleteDoc(doc(db, "transactions", transactionId));
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
