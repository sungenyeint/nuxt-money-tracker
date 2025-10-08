import { ref, watch, onMounted } from "vue";
import { db } from "~/composables/useFirebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "~/composables/useAuth";

export interface UserSettings {
  currency: string;
  dateFormat: string;
  theme: string;
  notifications: boolean;
  autoBackup: boolean;
  defaultTransactionType: "income" | "expense";
  monthlyBudget: number;
  weeklyBudget: number;
}

const defaultSettings: UserSettings = {
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  theme: "light",
  notifications: true,
  autoBackup: true,
  defaultTransactionType: "expense",
  monthlyBudget: 0,
  weeklyBudget: 0,
};

export function useSettings() {
  const { user } = useAuth();
  const userSettings = ref<UserSettings>({ ...defaultSettings });
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Load settings when user is available
  onMounted(() => {
    watch(
      () => user.value,
      async (val) => {
        if (val) {
          await loadUserSettings();
        }
        loading.value = false;
      },
      { immediate: true }
    );
  });

  const loadUserSettings = async () => {
    try {
      if (!user.value) return;

      error.value = null;
      const settingsDoc = await getDoc(doc(db, "userSettings", user.value.uid));

      if (settingsDoc.exists()) {
        userSettings.value = {
          ...defaultSettings,
          ...(settingsDoc.data() as UserSettings),
        };
      }
    } catch (e: any) {
      error.value = e.message;
      console.error("Error loading settings:", e);
    }
  };

  const saveSettings = async (settings: UserSettings) => {
    try {
      if (!user.value) throw new Error("Please login first");

      error.value = null;
      await setDoc(doc(db, "userSettings", user.value.uid), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      userSettings.value = { ...settings };
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const resetSettings = () => {
    userSettings.value = { ...defaultSettings };
  };

  return {
    userSettings,
    loading,
    error,
    loadUserSettings,
    saveSettings,
    resetSettings,
  };
}
