// Shared application models

// Transactions
export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: any;
}

export interface NewTransactionInput {
  category: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string; // ISO date string YYYY-MM-DD
}

// Categories
export interface Category {
  id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  default: boolean;
  color: string;
  createdAt: any;
}

export interface NewCategoryInput {
  name: string;
  type: "income" | "expense";
  color: string;
}

// User Settings
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


