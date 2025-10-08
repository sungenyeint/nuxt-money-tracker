import { ref, onMounted, onUnmounted, watch } from "vue";
import { db } from "~/composables/useFirebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "~/composables/useAuth";

// TypeScript Interfaces
export interface Category {
  id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  color: string;
  createdAt: any;
}

export interface NewCategoryInput {
  name: string;
  type: "income" | "expense";
  color: string;
}

export function useCategories() {
  const { user } = useAuth();
  const categories = ref<Category[]>([]);
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
          collection(db, "categories"),
        //   where("userId", "==", val.uid)
        );

        // Store unsubscribe function
        unsubscribe = onSnapshot(q, (snapshot) => {
          categories.value = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Category)
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

  // Add Category
  const addCategory = async (newCategory: NewCategoryInput) => {
    try {
      error.value = null;

      if (!user.value) throw new Error("Please login first");
      if (!newCategory.name || !newCategory.type) {
        throw new Error("Please fill all fields");
      }

      // Check for duplicate category name
      const existingCategory = categories.value.find(
        (c) =>
          c.name.toLowerCase() === newCategory.name.toLowerCase() &&
          c.type === newCategory.type
      );
      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }

      await addDoc(collection(db, "categories"), {
        name: newCategory.name,
        type: newCategory.type,
        color: newCategory.color || "#3b82f6",
        userId: user.value.uid,
        createdAt: serverTimestamp(),
      });
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  // Update Category
  const updateCategory = async (category: Category) => {
    try {
      error.value = null;

      if (!user.value) throw new Error("Please login first");
      if (!category.name || !category.type) {
        throw new Error("Please fill all fields");
      }

      // Check for duplicate category name (excluding current category)
      const existingCategory = categories.value.find(
        (c) =>
          c.id !== category.id &&
          c.name.toLowerCase() === category.name.toLowerCase() &&
          c.type === category.type
      );
      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }

      await updateDoc(doc(db, "categories", category.id), {
        name: category.name,
        type: category.type,
        color: category.color,
      });
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  // Delete Category
  const deleteCategory = async (categoryId: string) => {
    try {
      error.value = null;

      if (!user.value) throw new Error("Please login first");

      await deleteDoc(doc(db, "categories", categoryId));
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}
