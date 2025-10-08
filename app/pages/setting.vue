<script lang="ts" setup>
import { ref, computed } from "vue";
import { useAuth } from "~/composables/useAuth";
import { useSettings } from "~/composables/useSettings";
import {
  User,
  Bell,
  Globe,
  Palette,
  DollarSign,
  LogOut,
  Save,
  Shield,
} from "lucide-vue-next";
import { useRouter } from "#imports";

const { user, signout } = useAuth();
const { userSettings, saveSettings } = useSettings();
const router = useRouter();

// Local state for form
const localSettings = ref({ ...userSettings.value });
const saving = ref(false);
const saveMessage = ref("");

// Available options
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
];

const dateFormats = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
];

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto (System)" },
];

// Check if settings have changed
const hasChanges = computed(() => {
  return (
    JSON.stringify(localSettings.value) !== JSON.stringify(userSettings.value)
  );
});

// Save settings
const handleSave = async () => {
  saving.value = true;
  saveMessage.value = "";

  try {
    await saveSettings(localSettings.value);
    saveMessage.value = "Settings saved successfully!";
    setTimeout(() => {
      saveMessage.value = "";
    }, 3000);
  } catch (error) {
    saveMessage.value = "Failed to save settings. Please try again.";
    console.error("Error saving settings:", error);
  } finally {
    saving.value = false;
  }
};

// Reset to defaults
const resetToDefaults = () => {
  if (confirm("Are you sure you want to reset all settings to defaults?")) {
    localSettings.value = {
      currency: "USD",
      dateFormat: "MM/DD/YYYY",
      theme: "light",
      notifications: true,
      autoBackup: true,
      defaultTransactionType: "expense",
      monthlyBudget: 0,
      weeklyBudget: 0,
    };
  }
};

// Logout handler
const handleLogout = async () => {
  if (confirm("Are you sure you want to logout?")) {
    await signout();
    router.push("/login");
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Settings</h2>
      <p class="text-gray-600 text-sm mt-1">
        Manage your account and application preferences
      </p>
    </div>

    <!-- Save Message -->
    <div
      v-if="saveMessage"
      :class="[
        'px-4 py-3 rounded-lg',
        saveMessage.includes('success')
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700',
      ]"
    >
      {{ saveMessage }}
    </div>

    <!-- Account Section -->
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <User class="w-5 h-5 text-blue-600" />
        Account Information
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            :value="user?.email"
            disabled
            class="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            :value="user?.uid"
            disabled
            class="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Currency & Format Settings -->
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign class="w-5 h-5 text-green-600" />
        Currency & Format
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            v-model="localSettings.currency"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            <option
              v-for="curr in currencies"
              :key="curr.code"
              :value="curr.code"
            >
              {{ curr.symbol }} {{ curr.name }} ({{ curr.code }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            v-model="localSettings.dateFormat"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            <option
              v-for="format in dateFormats"
              :key="format.value"
              :value="format.value"
            >
              {{ format.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Budget Settings -->
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Globe class="w-5 h-5 text-purple-600" />
        Budget Settings
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Monthly Budget
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-gray-500">$</span>
            <input
              v-model.number="localSettings.monthlyBudget"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              class="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Set to 0 to disable monthly budget tracking
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Weekly Budget
          </label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-gray-500">$</span>
            <input
              v-model.number="localSettings.weeklyBudget"
              type="number"
              min="0"
              step="50"
              placeholder="0"
              class="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Set to 0 to disable weekly budget tracking
          </p>
        </div>
      </div>
    </div>

    <!-- Appearance Settings -->
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Palette class="w-5 h-5 text-pink-600" />
        Appearance
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="theme in themes"
              :key="theme.value"
              @click="localSettings.theme = theme.value"
              :class="[
                'px-4 py-3 rounded-lg border-2 font-medium transition-all',
                localSettings.theme === theme.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              {{ theme.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Default Transaction Type
          </label>
          <div class="flex gap-3">
            <button
              @click="localSettings.defaultTransactionType = 'income'"
              :class="[
                'flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all',
                localSettings.defaultTransactionType === 'income'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              Income
            </button>
            <button
              @click="localSettings.defaultTransactionType = 'expense'"
              :class="[
                'flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all',
                localSettings.defaultTransactionType === 'expense'
                  ? 'border-red-600 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300',
              ]"
            >
              Expense
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications & Privacy -->
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell class="w-5 h-5 text-orange-600" />
        Notifications & Privacy
      </h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-800">Enable Notifications</p>
            <p class="text-sm text-gray-500">
              Receive alerts for budget limits and reminders
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="localSettings.notifications"
              type="checkbox"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-800">Auto Backup</p>
            <p class="text-sm text-gray-500">
              Automatically backup your data to the cloud
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="localSettings.autoBackup"
              type="checkbox"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        @click="handleSave"
        :disabled="!hasChanges || saving"
        :class="[
          'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors',
          hasChanges && !saving
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed',
        ]"
      >
        <Save class="w-5 h-5" />
        {{ saving ? "Saving..." : "Save Changes" }}
      </button>
      <button
        @click="resetToDefaults"
        class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        <Shield class="w-5 h-5" />
        Reset to Defaults
      </button>
      <button
        @click="handleLogout"
        class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors sm:ml-auto"
      >
        <LogOut class="w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
</template>
