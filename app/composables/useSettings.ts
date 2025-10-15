import { ref, watch, onMounted } from "vue";
import { useNuxtApp } from "#app";
import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
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
    defaultTransactionType: "income",
    monthlyBudget: 0,
    weeklyBudget: 0,
};

// --- SHARED REACTIVE STATE ---
const userSettings = ref<UserSettings>({ ...defaultSettings });
const loading = ref(true);
const error = ref<string | null>(null);

export function useSettings() {
    const nuxtApp = useNuxtApp();
    const $db = nuxtApp.$db as Firestore | undefined;
    const { user } = useAuth();

    if (!$db) {
        console.error('Firebase Firestore is not initialized. Make sure the Firebase plugin is properly configured.');
        return {
            userSettings,
            loading,
            error,
            loadUserSettings: () => Promise.reject(new Error('Firebase Firestore not initialized')),
            saveSettings: () => Promise.reject(new Error('Firebase Firestore not initialized')),
            resetSettings: () => Promise.reject(new Error('Firebase Firestore not initialized')),
        };
    }

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
            const settingsDoc = await getDoc(doc($db, "userSettings", user.value.uid));

            if (settingsDoc.exists()) {
                userSettings.value = settingsDoc.data() as UserSettings;
            }
        } catch (e: any) {
            error.value = e.message;
            console.error("Error loading settings:", e);
        }
    };

    const saveSettings = async (settings: UserSettings) => {
        try {
            if (!user.value) throw new Error("Please login first");

            await setDoc(doc($db, "userSettings", user.value.uid), {
                ...settings,
                updatedAt: new Date().toISOString(),
            });

            userSettings.value = { ...settings }; // update shared reactive state
        } catch (e: any) {
            error.value = e.message;
            throw e;
        }
    };

    const resetSettings = async () => {
        try {
            if (!user.value) throw new Error("Please login first");

            await setDoc(doc($db, "userSettings", user.value.uid), {
                ...defaultSettings,
                updatedAt: new Date().toISOString(),
            });

            userSettings.value = { ...defaultSettings };
        } catch (e: any) {
            error.value = e.message;
            console.error("Error resetting settings:", e);
            throw e;
        }
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
