'use server';

import { createClient } from '@/lib/supabase/server';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { Account, Transaction, Category, MonthlyData } from '@/lib/types';

export async function getDashboardData() {
    const supabase = await createClient();
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

    // 1. 口座残高の取得 (Viewを使用)
    const { data: balances, error: balanceError } = await supabase
        .from('account_balances')
        .select('*');

    if (balanceError) throw balanceError;

    // 2. 口座マスタの取得 (流動性フラグなどのメタデータ)
    const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('sort_order');

    if (accountsError) throw accountsError;

    // 口座情報に残高を統合
    const accounts: Account[] = accountsData.map(acc => ({
        id: acc.id,
        userId: acc.user_id,
        name: acc.name,
        type: acc.type,
        isLiquid: acc.is_liquid,
        initialBalance: Number(acc.initial_balance),
        balance: Number(balances.find(b => b.account_id === acc.id)?.balance || acc.initial_balance),
        color: acc.color,
        icon: acc.icon,
        sortOrder: acc.sort_order
    }));

    // 3. 今月の収支計算 (expense / income, adjustment除外)
    const { data: monthlyTxns, error: txnsError } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .in('type', ['expense', 'income']);

    if (txnsError) throw txnsError;

    const monthlyIncome = monthlyTxns
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const monthlyExpense = monthlyTxns
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // 4. 最近の取引 (直近8件)
    const { data: recentTxnsData, error: recentError } = await supabase
        .from('transactions')
        .select(`
            *,
            categories(name, color, icon),
            from_account:accounts!from_account_id(name),
            to_account:accounts!to_account_id(name)
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);

    if (recentError) throw recentError;

    const recentTransactions = recentTxnsData.map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        place: t.place,
        categoryName: t.categories?.name,
        categoryColor: t.categories?.color,
        categoryIcon: t.categories?.icon,
        fromAccountName: t.from_account?.name,
        toAccountName: t.to_account?.name
    }));

    // 5. 予算進捗 (全体予算)
    const { data: budgetData } = await supabase
        .from('budgets')
        .select('amount')
        .eq('period_type', 'monthly')
        .is('category_id', null)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

    const monthlyBudget = budgetData?.amount ? Number(budgetData.amount) : 0;

    // 6. 月別収支推移 (過去3ヶ月)
    const monthlyTrend: MonthlyData[] = [];
    for (let i = 2; i >= 0; i--) {
        const d = subMonths(now, i);
        const s = format(startOfMonth(d), 'yyyy-MM-dd');
        const e = format(endOfMonth(d), 'yyyy-MM-dd');
        const m = format(d, 'yyyy-MM');

        const { data: tData } = await supabase
            .from('transactions')
            .select('type, amount')
            .gte('date', s)
            .lte('date', e)
            .in('type', ['income', 'expense']);

        const inc = tData?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const exp = tData?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        monthlyTrend.push({
            month: m,
            income: inc,
            expense: exp,
            balance: inc - exp
        });
    }

    return {
        accounts,
        summary: {
            totalAssets: accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
            liquidAssets: accounts.filter(a => a.isLiquid).reduce((sum, a) => sum + (a.balance || 0), 0),
            monthlyIncome,
            monthlyExpense,
            monthlyBudget
        },
        recentTransactions,
        monthlyTrend
    };
}

export async function getExpenseByCategory() {
    const supabase = await createClient();
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            amount,
            categories(name, color)
        `)
        .eq('type', 'expense')
        .gte('date', monthStart)
        .lte('date', monthEnd);

    if (error) throw error;

    const map = new Map<string, { name: string; value: number; color: string }>();
    (data as any[]).forEach(t => {
        const name = t.categories?.name || '未分類';
        const color = t.categories?.color || '#999';
        const current = map.get(name) || { name, value: 0, color };
        map.set(name, { ...current, value: current.value + Number(t.amount) });
    });

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
}
