// === 型定義 ===

export type AccountType = 'bank' | 'cash' | 'credit' | 'epay' | 'investment' | 'asset';
export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment';

export interface Account {
    id: string;
    userId: string;
    name: string;
    type: AccountType;
    isLiquid: boolean;
    initialBalance: number;
    balance?: number; // 計算後の現在残高
    color: string;
    icon: string;
    sortOrder: number;
}

export interface Category {
    id: string;
    userId: string;
    name: string;
    type: 'expense' | 'income' | 'both';
    color: string;
    icon: string;
    sortOrder: number;
}

export interface Transaction {
    id: string;
    userId: string;
    date: string;
    type: TransactionType;
    amount: number;
    categoryId: string | null;
    fromAccountId: string | null;
    toAccountId: string | null;
    description: string | null;
    place: string | null;
    creditCardName: string | null;
    source: 'manual' | 'api' | 'csv_import';
    tags: string[];
    isAutoPayment: boolean;
    createdAt: string;
}

export interface AutoPayment {
    id: string;
    name: string;
    amount: number | null;
    interval: 'monthly' | 'yearly';
    billingDay: number;
    paymentMethod: string;
    fromAccountId: string;
    categoryId: string;
    isActive: boolean;
}

export interface DepreciableAsset {
    id: string;
    name: string;
    purchasePrice: number;
    purchaseDate: string;
    billingDay: number;
    totalInstallments: number;
    remainingCount: number;
    monthlyAmount: number;
    isCompleted: boolean;
}

export interface SalaryRecord {
    id: string;
    date: string;
    companyName: string;
    grossAmount: number;
    netAmount: number;
    socialInsurance: number;
    incomeTax: number;
    notes: string;
}

export interface MonthlyData {
    month: string;
    income: number;
    expense: number;
    balance: number;
}

export interface YearlyData {
    year: number;
    income: number;
    expense: number;
    netBalance: number;
    totalAssets: number;
}
