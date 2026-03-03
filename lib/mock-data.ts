import type { Account, Category, Transaction, AutoPayment, DepreciableAsset, SalaryRecord, MonthlyData, YearlyData } from './types';

// === 口座 ===
export const accounts: Account[] = [
    { id: 'acc-cash', name: '現金', type: 'cash', isLiquid: true, balance: 9870, color: '#22c55e', icon: 'Wallet' },
    { id: 'acc-rakuten', name: '楽天銀行', type: 'bank', isLiquid: true, balance: 16823, color: '#bf0000', icon: 'Building2' },
    { id: 'acc-yucho', name: 'ゆうちょ', type: 'bank', isLiquid: true, balance: 330396, color: '#0066cc', icon: 'Building2' },
    { id: 'acc-smbc', name: '三井住友銀行', type: 'bank', isLiquid: true, balance: 185366, color: '#006633', icon: 'Building2' },
    { id: 'acc-sbi', name: '住信SBI', type: 'bank', isLiquid: true, balance: 969597, color: '#003399', icon: 'Building2' },
    { id: 'acc-paypay', name: 'PayPay', type: 'epay', isLiquid: true, balance: 14233, color: '#ff0033', icon: 'Smartphone' },
    { id: 'acc-pasmo', name: 'PASMO', type: 'epay', isLiquid: true, balance: 10572, color: '#e91e8c', icon: 'CreditCard' },
    { id: 'acc-merpay', name: 'メルペイ', type: 'epay', isLiquid: true, balance: 27774, color: '#4dc4ff', icon: 'Smartphone' },
    { id: 'acc-credit', name: 'クレジットカード', type: 'credit', isLiquid: true, balance: -1313386, color: '#6b7280', icon: 'CreditCard' },
    { id: 'acc-nisa', name: 'SBI積立NISA', type: 'investment', isLiquid: false, balance: 997539, color: '#8b5cf6', icon: 'TrendingUp' },
    { id: 'acc-sbi-sec', name: 'SBI証券', type: 'investment', isLiquid: false, balance: 250000, color: '#7c3aed', icon: 'TrendingUp' },
    { id: 'acc-deprec', name: '償却資産', type: 'asset', isLiquid: false, balance: 510381, color: '#f59e0b', icon: 'Package' },
];

// === カテゴリ ===
export const categories: Category[] = [
    { id: 'cat-food', name: '食品', type: 'expense', color: '#ef4444', icon: 'UtensilsCrossed' },
    { id: 'cat-snack', name: '間食', type: 'expense', color: '#f97316', icon: 'Cookie' },
    { id: 'cat-hobby', name: '趣味・娯楽', type: 'expense', color: '#8b5cf6', icon: 'Gamepad2' },
    { id: 'cat-transport', name: '交通費', type: 'expense', color: '#3b82f6', icon: 'Train' },
    { id: 'cat-fixed', name: '固定費', type: 'expense', color: '#6b7280', icon: 'Home' },
    { id: 'cat-sub', name: 'サブスク', type: 'expense', color: '#ec4899', icon: 'RefreshCw' },
    { id: 'cat-daily', name: '日用品', type: 'expense', color: '#14b8a6', icon: 'ShoppingBag' },
    { id: 'cat-useful', name: '便利アイテム', type: 'expense', color: '#06b6d4', icon: 'Lightbulb' },
    { id: 'cat-tools', name: '道具類', type: 'expense', color: '#a855f7', icon: 'Wrench' },
    { id: 'cat-beauty', name: '美容費', type: 'expense', color: '#ec4899', icon: 'Sparkles' },
    { id: 'cat-clothes', name: '被服費', type: 'expense', color: '#f43f5e', icon: 'Shirt' },
    { id: 'cat-medical', name: '医療費', type: 'expense', color: '#10b981', icon: 'Heart' },
    { id: 'cat-telecom', name: '通信費', type: 'expense', color: '#2563eb', icon: 'Wifi' },
    { id: 'cat-social', name: '交際費', type: 'expense', color: '#d946ef', icon: 'Users' },
    { id: 'cat-depreciation', name: '減価償却', type: 'expense', color: '#78716c', icon: 'Calculator' },
    { id: 'cat-misc', name: '雑費', type: 'expense', color: '#9ca3af', icon: 'MoreHorizontal' },
    { id: 'cat-special', name: '特別費', type: 'expense', color: '#eab308', icon: 'Star' },
    { id: 'cat-salary', name: '給与', type: 'income', color: '#22c55e', icon: 'Banknote' },
    { id: 'cat-freelance', name: 'フリーランス', type: 'income', color: '#10b981', icon: 'Briefcase' },
    { id: 'cat-other-income', name: 'その他収入', type: 'income', color: '#84cc16', icon: 'Plus' },
];

// === 場所リスト ===
const places = [
    'スーパー・小売', '飲食店', 'コンビニ', 'ネット', 'その他',
    '自動販売機', 'ドラッグストア', '100円ショップ', 'Amazon', '楽天市場',
];

// === モック取引データ生成（約100件） ===
function generateTransactions(): Transaction[] {
    const txns: Transaction[] = [];
    let id = 1;

    const expenseCategories = categories.filter(c => c.type === 'expense' && c.id !== 'cat-depreciation');

    // 2026年1月〜3月のデータを生成
    for (let month = 1; month <= 3; month++) {
        const daysInMonth = month === 2 ? 28 : month === 3 ? 3 : 31;
        const dailyCount = month === 3 ? 10 : Math.floor(35 / 1); // 3月は3日分だけ

        for (let day = 1; day <= daysInMonth; day++) {
            // 1日あたり1〜3件の支出
            const txnCount = month === 3 ? (day <= 3 ? 3 : 0) : (1 + Math.floor(Math.random() * 2));
            for (let t = 0; t < txnCount; t++) {
                const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                const amounts: Record<string, [number, number]> = {
                    'cat-food': [300, 3000], 'cat-snack': [100, 800], 'cat-hobby': [500, 5000],
                    'cat-transport': [200, 1000], 'cat-fixed': [3000, 55000], 'cat-sub': [300, 2000],
                    'cat-daily': [200, 3000], 'cat-useful': [500, 5000], 'cat-tools': [1000, 20000],
                    'cat-beauty': [1000, 10000], 'cat-clothes': [1000, 8000], 'cat-medical': [500, 7000],
                    'cat-telecom': [1000, 5000], 'cat-social': [500, 5000], 'cat-misc': [200, 5000],
                    'cat-special': [5000, 30000],
                };
                const [min, max] = amounts[cat.id] || [500, 3000];
                const amount = Math.round((min + Math.random() * (max - min)) / 10) * 10;
                const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const place = places[Math.floor(Math.random() * places.length)];
                const payMethods = ['acc-credit', 'acc-cash', 'acc-paypay', 'acc-pasmo'];
                const fromAcc = payMethods[Math.floor(Math.random() * payMethods.length)];
                const descs: Record<string, string[]> = {
                    'cat-food': ['夕食', '昼食', '朝食', '食材'],
                    'cat-snack': ['おやつ', 'コーヒー', 'ジュース'],
                    'cat-hobby': ['ゲーム', '映画', '漫画', 'ライブ'],
                    'cat-transport': ['電車', 'バス', 'タクシー'],
                    'cat-fixed': ['家賃', '国民年金', '健康保険'],
                    'cat-sub': ['YouTube Premium', 'Google One', 'Spotify'],
                    'cat-daily': ['洗剤', 'ティッシュ', 'シャンプー'],
                    'cat-useful': ['モバイルバッテリー', 'USBケーブル'],
                    'cat-tools': ['工具', 'DIY材料'],
                    'cat-beauty': ['ヘアカット', '化粧品'],
                    'cat-clothes': ['Tシャツ', '靴'],
                    'cat-medical': ['花粉症 薬', '診察'],
                    'cat-telecom': ['スマホ代', 'Wi-Fi'],
                    'cat-social': ['飲み会', '差し入れ'],
                    'cat-misc': ['その他支出'],
                    'cat-special': ['プレゼント', '旅行'],
                };
                const descList = descs[cat.id] || ['その他'];
                const desc = descList[Math.floor(Math.random() * descList.length)];

                txns.push({
                    id: `txn-${id++}`,
                    date: dateStr,
                    type: 'expense',
                    amount,
                    categoryId: cat.id,
                    fromAccountId: fromAcc,
                    description: desc,
                    place,
                    tags: [],
                });
            }
        }

        // 月初に固定費を追加
        if (month <= 2) {
            const dateStr = `2026-${String(month).padStart(2, '0')}-01`;
            txns.push(
                { id: `txn-${id++}`, date: dateStr, type: 'expense', amount: 54300, categoryId: 'cat-fixed', fromAccountId: 'acc-yucho', description: '家賃', place: 'ネット', tags: [] },
                { id: `txn-${id++}`, date: dateStr, type: 'expense', amount: 17510, categoryId: 'cat-fixed', fromAccountId: 'acc-credit', description: '国民年金', place: 'ネット', tags: [] },
                { id: `txn-${id++}`, date: dateStr, type: 'expense', amount: 21000, categoryId: 'cat-fixed', fromAccountId: 'acc-credit', description: '国民健康保険', place: 'ネット', tags: [] },
            );
        }

        // 収入（給与）
        if (month <= 2) {
            const dateStr = `2026-${String(month).padStart(2, '0')}-25`;
            const salary = month === 1 ? 153181 : 199580;
            txns.push({
                id: `txn-${id++}`,
                date: dateStr,
                type: 'income',
                amount: salary,
                categoryId: 'cat-freelance',
                fromAccountId: 'acc-sbi',
                description: month === 1 ? 'SP給与' : 'TwoFace給与',
                place: '',
                tags: [],
            });
        }

        // 資金移動を1件
        if (month <= 2) {
            txns.push({
                id: `txn-${id++}`,
                date: `2026-${String(month).padStart(2, '0')}-15`,
                type: 'transfer',
                amount: 30000,
                categoryId: '',
                fromAccountId: 'acc-sbi',
                toAccountId: 'acc-cash',
                description: '生活費引き出し',
                place: '',
                tags: [],
            });
        }
    }

    // 合計が約100件になるよう調整
    return txns.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 105);
}

export const transactions = generateTransactions();

// === 固定費 ===
export const autoPayments: AutoPayment[] = [
    { id: 'ap-1', name: 'Rentio ルンバレンタル', amount: 1280, interval: 'monthly', billingDay: 10, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-sub', isActive: true },
    { id: 'ap-2', name: 'ソフトバンク光', amount: 4734, interval: 'monthly', billingDay: 15, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-telecom', isActive: true },
    { id: 'ap-3', name: 'スマホ', amount: null, interval: 'monthly', billingDay: 15, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-telecom', isActive: true },
    { id: 'ap-4', name: '家賃', amount: 54300, interval: 'monthly', billingDay: 27, paymentMethod: 'ゆうちょ', fromAccountId: 'acc-yucho', categoryId: 'cat-fixed', isActive: true },
    { id: 'ap-5', name: 'ガス代', amount: null, interval: 'monthly', billingDay: 25, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-fixed', isActive: true },
    { id: 'ap-6', name: '電気代', amount: null, interval: 'monthly', billingDay: 0, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-fixed', isActive: true },
    { id: 'ap-7', name: '国民年金', amount: 17510, interval: 'monthly', billingDay: 1, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-fixed', isActive: true },
    { id: 'ap-8', name: '国民健康保険', amount: 21000, interval: 'monthly', billingDay: 1, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-fixed', isActive: true },
    { id: 'ap-9', name: 'Google One 200GB', amount: 440, interval: 'monthly', billingDay: 2, paymentMethod: 'クレジットカード', fromAccountId: 'acc-credit', categoryId: 'cat-sub', isActive: true },
    { id: 'ap-10', name: 'SBI積立NISA', amount: 60000, interval: 'monthly', billingDay: 9, paymentMethod: '住信SBI', fromAccountId: 'acc-sbi', categoryId: 'cat-special', isActive: true },
];

// === 減価償却 ===
export const depreciableAssets: DepreciableAsset[] = [
    { id: 'da-1', name: 'Galaxy S24 Ultra 512GB', purchasePrice: 204100, purchaseDate: '2024-04-03', billingDay: 1, totalInstallments: 24, remainingCount: 0, monthlyAmount: 8504, isCompleted: true },
    { id: 'da-2', name: '車検_法定費用', purchasePrice: 34450, purchaseDate: '2024-09-26', billingDay: 1, totalInstallments: 24, remainingCount: 5, monthlyAmount: 1435, isCompleted: false },
    { id: 'da-3', name: '車検_整備費用', purchasePrice: 56810, purchaseDate: '2024-09-26', billingDay: 1, totalInstallments: 24, remainingCount: 5, monthlyAmount: 2367, isCompleted: false },
    { id: 'da-4', name: '自動車保険_2024', purchasePrice: 85147, purchaseDate: '2024-11-13', billingDay: 1, totalInstallments: 12, remainingCount: 0, monthlyAmount: 7095, isCompleted: true },
    { id: 'da-5', name: 'コンタクト360枚_202510', purchasePrice: 28495, purchaseDate: '2025-10-10', billingDay: 1, totalInstallments: 6, remainingCount: 0, monthlyAmount: 4749, isCompleted: true },
    { id: 'da-6', name: '2025年度自動車税', purchasePrice: 34500, purchaseDate: '2025-05-12', billingDay: 1, totalInstallments: 12, remainingCount: 1, monthlyAmount: 2875, isCompleted: false },
    { id: 'da-7', name: 'Youtube Premium_2025', purchasePrice: 12800, purchaseDate: '2025-08-22', billingDay: 1, totalInstallments: 12, remainingCount: 4, monthlyAmount: 1067, isCompleted: false },
    { id: 'da-8', name: '自動車保険2025', purchasePrice: 56500, purchaseDate: '2025-09-30', billingDay: 1, totalInstallments: 12, remainingCount: 6, monthlyAmount: 4708, isCompleted: false },
    { id: 'da-9', name: 'DXR12mkIIなど', purchasePrice: 482800, purchaseDate: '2026-01-25', billingDay: 26, totalInstallments: 36, remainingCount: 34, monthlyAmount: 13411, isCompleted: false },
];

// === 給与 ===
export const salaryRecords: SalaryRecord[] = [
    { id: 'sal-1', date: '2026-02-01', companyName: '大澤さん', grossAmount: 18000, netAmount: 18000, socialInsurance: 0, incomeTax: 0, notes: 'ギャラ' },
    { id: 'sal-2', date: '2026-01-01', companyName: 'SP', grossAmount: 180000, netAmount: 153181, socialInsurance: 15000, incomeTax: 11819, notes: '' },
    { id: 'sal-3', date: '2025-12-01', companyName: 'SP', grossAmount: 350000, netAmount: 278004, socialInsurance: 40000, incomeTax: 31996, notes: '' },
    { id: 'sal-4', date: '2025-12-01', companyName: 'TwoFace', grossAmount: 250000, netAmount: 199580, socialInsurance: 28000, incomeTax: 22420, notes: '' },
    { id: 'sal-5', date: '2025-11-01', companyName: '大澤さん', grossAmount: 45000, netAmount: 36000, socialInsurance: 0, incomeTax: 9000, notes: '' },
    { id: 'sal-6', date: '2025-11-01', companyName: 'TwoFace', grossAmount: 380000, netAmount: 299370, socialInsurance: 45000, incomeTax: 35630, notes: '' },
    { id: 'sal-7', date: '2025-11-01', companyName: 'SP', grossAmount: 290000, netAmount: 231600, socialInsurance: 33000, incomeTax: 25400, notes: '' },
    { id: 'sal-8', date: '2025-10-01', companyName: 'TwoFace', grossAmount: 330000, netAmount: 262648, socialInsurance: 38000, incomeTax: 29352, notes: '' },
    { id: 'sal-9', date: '2025-10-01', companyName: 'SP', grossAmount: 450000, netAmount: 360251, socialInsurance: 50000, incomeTax: 39749, notes: '' },
    { id: 'sal-10', date: '2025-09-01', companyName: 'SP', grossAmount: 300000, netAmount: 239496, socialInsurance: 34000, incomeTax: 26504, notes: '' },
];

// === 月次推移 ===
export const monthlyData: MonthlyData[] = [
    { month: '2026-01', income: 693444, expense: 504491, balance: 188953 },
    { month: '2026-02', income: 370761, expense: 420186, balance: -49425 },
    { month: '2026-03', income: 1000, expense: 83604, balance: -82604 },
];

// === 年次推移 ===
export const yearlyData: YearlyData[] = [
    { year: 2020, income: 500000, expense: 318524, netBalance: 181476, totalAssets: 181476 },
    { year: 2021, income: 850000, expense: 744619, netBalance: 105381, totalAssets: 286857 },
    { year: 2022, income: 1700000, expense: 1269804, netBalance: 430196, totalAssets: 717053 },
    { year: 2023, income: 2700000, expense: 1606508, netBalance: 1093492, totalAssets: 1810545 },
    { year: 2024, income: 2800000, expense: 1846665, netBalance: 953335, totalAssets: 2763880 },
    { year: 2025, income: 3200000, expense: 2448051, netBalance: 751949, totalAssets: 3515830 },
    { year: 2026, income: 1065205, expense: 1008280, netBalance: 56925, totalAssets: 3572754 },
];

// === ヘルパー関数 ===
export function getCategoryById(id: string): Category | undefined {
    return categories.find(c => c.id === id);
}
export function getAccountById(id: string): Account | undefined {
    return accounts.find(a => a.id === id);
}
export function formatCurrency(amount: number): string {
    return `¥${amount.toLocaleString('ja-JP')}`;
}
export function getTotalAssets(): number {
    return accounts.reduce((sum, a) => sum + a.balance, 0);
}
export function getLiquidAssets(): number {
    return accounts.filter(a => a.isLiquid).reduce((sum, a) => sum + a.balance, 0);
}
export function getExpenseByCategory(txns: Transaction[]): { name: string; value: number; color: string }[] {
    const map = new Map<string, number>();
    txns.filter(t => t.type === 'expense').forEach(t => {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    });
    return Array.from(map.entries())
        .map(([catId, value]) => {
            const cat = getCategoryById(catId);
            return { name: cat?.name || '不明', value, color: cat?.color || '#999' };
        })
        .sort((a, b) => b.value - a.value);
}
