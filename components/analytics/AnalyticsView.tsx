'use client';

import { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, CircleDollarSign, BarChart3, CalendarDays, Wallet } from 'lucide-react';

interface AnalyticsProps {
    monthlyTrend: {
        month: string;
        monthKey: string;
        income: number;
        expense: number;
        balance: number;
    }[];
    monthlyExpenseByCategory: { name: string; value: number; color: string }[];
    yearlyExpenseByCategory: { name: string; value: number; color: string }[];
    yearlyExpenseByAccount: { name: string; value: number; color: string }[];
    yearlyTotals: { income: number; expense: number };
    currentYear: number;
    currentMonth: number;
}

type RankingView = 'monthly' | 'yearly';
type RankingType = 'category' | 'account';

export default function AnalyticsView({
    monthlyTrend,
    monthlyExpenseByCategory,
    yearlyExpenseByCategory,
    yearlyExpenseByAccount,
    yearlyTotals,
    currentYear,
    currentMonth
}: AnalyticsProps) {
    const [rankingView, setRankingView] = useState<RankingView>('yearly');
    const [rankingType, setRankingType] = useState<RankingType>('category');

    const currentRanking = rankingView === 'monthly'
        ? monthlyExpenseByCategory
        : rankingType === 'category'
            ? yearlyExpenseByCategory
            : yearlyExpenseByAccount;

    const totalRankingValue = currentRanking.reduce((sum, item) => sum + item.value, 0);

    const yearBalance = yearlyTotals.income - yearlyTotals.expense;

    // 月別の平均
    const monthsWithData = monthlyTrend.filter(m => m.income > 0 || m.expense > 0).length;
    const avgMonthlyExpense = monthsWithData > 0 ? yearlyTotals.expense / monthsWithData : 0;
    const avgMonthlyIncome = monthsWithData > 0 ? yearlyTotals.income / monthsWithData : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                    <BarChart3 size={28} className="text-[var(--accent)]" />
                    分析・レポート
                </h1>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                    {currentYear}年の収支データに基づく分析
                </p>
            </div>

            {/* Year Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">年間収入</p>
                        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <TrendingUp size={18} className="text-green-500" />
                        </div>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold">{formatCurrency(yearlyTotals.income)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">月平均 {formatCurrency(avgMonthlyIncome)}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">年間支出</p>
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <TrendingDown size={18} className="text-red-500" />
                        </div>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold">{formatCurrency(yearlyTotals.expense)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">月平均 {formatCurrency(avgMonthlyExpense)}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">年間収支</p>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${yearBalance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                            <CircleDollarSign size={18} className={yearBalance >= 0 ? 'text-blue-500' : 'text-red-500'} />
                        </div>
                    </div>
                    <p className={`text-xl lg:text-2xl font-bold ${yearBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {yearBalance >= 0 ? '+' : ''}{formatCurrency(yearBalance)}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">貯蓄率 {yearlyTotals.income > 0 ? ((yearBalance / yearlyTotals.income) * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">データ月数</p>
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <CalendarDays size={18} className="text-purple-500" />
                        </div>
                    </div>
                    <p className="text-xl lg:text-2xl font-bold">{monthsWithData}ヶ月</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">過去12ヶ月分を表示</p>
                </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <CalendarDays size={18} className="text-[var(--accent)]" />
                    月次収支推移（過去12ヶ月）
                </h2>
                <div className="h-72 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyTrend}>
                            <defs>
                                <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`} />
                            <Tooltip
                                formatter={(v: number, name: string) => [formatCurrency(v), name]}
                                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 }}
                                labelStyle={{ color: 'var(--text-muted)' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="income" name="収入" stroke="#22c55e" strokeWidth={2} fill="url(#gradientIncome)" />
                            <Area type="monotone" dataKey="expense" name="支出" stroke="#ef4444" strokeWidth={2} fill="url(#gradientExpense)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Balance Table */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                <h2 className="font-semibold mb-4">月次収支テーブル</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                                <th className="px-4 py-3 font-medium">月</th>
                                <th className="px-4 py-3 font-medium text-right">収入</th>
                                <th className="px-4 py-3 font-medium text-right">支出</th>
                                <th className="px-4 py-3 font-medium text-right">収支</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyTrend.map(m => (
                                <tr key={m.monthKey} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                                    <td className="px-4 py-3 font-medium">{m.month}</td>
                                    <td className="px-4 py-3 text-right text-green-400">{m.income > 0 ? formatCurrency(m.income) : '-'}</td>
                                    <td className="px-4 py-3 text-right text-red-400">{m.expense > 0 ? formatCurrency(m.expense) : '-'}</td>
                                    <td className={`px-4 py-3 text-right font-semibold ${m.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {m.income > 0 || m.expense > 0 ? `${m.balance >= 0 ? '+' : ''}${formatCurrency(m.balance)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[var(--bg-secondary)]/50 font-bold text-sm">
                                <td className="px-4 py-3">合計</td>
                                <td className="px-4 py-3 text-right text-green-400">{formatCurrency(yearlyTotals.income)}</td>
                                <td className="px-4 py-3 text-right text-red-400">{formatCurrency(yearlyTotals.expense)}</td>
                                <td className={`px-4 py-3 text-right ${yearBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {yearBalance >= 0 ? '+' : ''}{formatCurrency(yearBalance)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Expense Ranking */}
            <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <h2 className="font-semibold">支出ランキング</h2>
                    <div className="flex gap-2">
                        {/* 期間切替 */}
                        <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 gap-1">
                            <button
                                onClick={() => setRankingView('monthly')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${rankingView === 'monthly' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                            >
                                今月
                            </button>
                            <button
                                onClick={() => setRankingView('yearly')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${rankingView === 'yearly' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
                            >
                                年間
                            </button>
                        </div>
                        {/* カテゴリ / 口座 切替 (年間のみ) */}
                        {rankingView === 'yearly' && (
                            <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1 gap-1">
                                <button
                                    onClick={() => setRankingType('category')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${rankingType === 'category' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'}`}
                                >
                                    カテゴリ
                                </button>
                                <button
                                    onClick={() => setRankingType('account')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${rankingType === 'account' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'}`}
                                >
                                    口座別
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {currentRanking.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        この期間の支出データがありません
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentRanking.map((item, i) => {
                            const maxVal = currentRanking[0]?.value || 1;
                            const barPercent = (item.value / maxVal) * 100;
                            const sharePercent = totalRankingValue > 0 ? ((item.value / totalRankingValue) * 100).toFixed(1) : '0';

                            return (
                                <div key={item.name} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-[var(--text-muted)] w-5 text-right text-xs font-bold">{i + 1}</span>
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-[var(--text-muted)] font-bold">{sharePercent}%</span>
                                            <span className="font-bold font-mono tabular-nums">{formatCurrency(item.value)}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden ml-8">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${barPercent}%`, background: item.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {/* Total */}
                        <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-sm font-bold">
                            <span className="ml-8">合計</span>
                            <span className="font-mono tabular-nums">{formatCurrency(totalRankingValue)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
