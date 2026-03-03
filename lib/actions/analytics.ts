'use server';

import { createClient } from '@/lib/supabase/server';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

/**
 * 月別収支推移を取得 (過去12ヶ月)
 */
export async function getMonthlyTrend(months: number = 12) {
    const supabase = await createClient();
    const now = new Date();

    const results = [];
    for (let i = months - 1; i >= 0; i--) {
        const d = subMonths(now, i);
        const s = format(startOfMonth(d), 'yyyy-MM-dd');
        const e = format(endOfMonth(d), 'yyyy-MM-dd');
        const label = format(d, 'M月');

        const { data } = await supabase
            .from('transactions')
            .select('type, amount')
            .gte('date', s)
            .lte('date', e)
            .in('type', ['income', 'expense']);

        const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const expense = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        results.push({
            month: label,
            monthKey: format(d, 'yyyy-MM'),
            income,
            expense,
            balance: income - expense
        });
    }

    return results;
}

/**
 * カテゴリ別支出ランキングを取得 (期間指定可能)
 */
export async function getExpenseByCategoryForPeriod(startDate: string, endDate: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            amount,
            categories(name, color)
        `)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

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

/**
 * 口座別支出ランキングを取得 (期間指定可能)
 */
export async function getExpenseByAccountForPeriod(startDate: string, endDate: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            amount,
            from_account:accounts!from_account_id(name, color, icon)
        `)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    const map = new Map<string, { name: string; value: number; color: string }>();
    (data as any[]).forEach(t => {
        const name = (t.from_account as any)?.name || '不明';
        const color = (t.from_account as any)?.color || '#999';
        const current = map.get(name) || { name, value: 0, color };
        map.set(name, { ...current, value: current.value + Number(t.amount) });
    });

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

/**
 * 分析ページに必要な全データをまとめて取得
 */
export async function getAnalyticsData() {
    const now = new Date();
    const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const currentMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
    const currentYearStart = format(startOfYear(now), 'yyyy-MM-dd');
    const currentYearEnd = format(endOfYear(now), 'yyyy-MM-dd');

    const [
        monthlyTrend,
        monthlyExpenseByCategory,
        yearlyExpenseByCategory,
        yearlyExpenseByAccount
    ] = await Promise.all([
        getMonthlyTrend(12),
        getExpenseByCategoryForPeriod(currentMonthStart, currentMonthEnd),
        getExpenseByCategoryForPeriod(currentYearStart, currentYearEnd),
        getExpenseByAccountForPeriod(currentYearStart, currentYearEnd)
    ]);

    // 年間サマリー
    const yearlyTotals = monthlyTrend.reduce(
        (acc, m) => ({
            income: acc.income + m.income,
            expense: acc.expense + m.expense
        }),
        { income: 0, expense: 0 }
    );

    return {
        monthlyTrend,
        monthlyExpenseByCategory,
        yearlyExpenseByCategory,
        yearlyExpenseByAccount,
        yearlyTotals,
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
    };
}
