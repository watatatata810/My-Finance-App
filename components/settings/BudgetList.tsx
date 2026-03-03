'use client';

import { useState } from 'react';
import { createBudget, deleteBudget, toggleBudgetStatus } from '@/lib/actions/budgets';
import { Plus, Trash2, Target, Loader2, AlertCircle, CalendarDays, Tags } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Category {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
}

interface Budget {
    id: string;
    period_type: 'monthly' | 'yearly';
    amount: number;
    category_id: string | null;
    is_active: boolean;
    categories: Category | null;
    created_at: string;
}

export default function BudgetList({
    initialBudgets,
    categories
}: {
    initialBudgets: Budget[];
    categories: Category[];
}) {
    const [amount, setAmount] = useState<number | ''>('');
    const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
    const [categoryId, setCategoryId] = useState<string>(''); // 空文字列は「全体」を意味する

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const result = await createBudget({
            amount: amount === '' ? 0 : amount,
            period_type: periodType,
            category_id: categoryId === '' ? null : categoryId
        });

        if (result?.error) {
            setError(result.error);
        } else {
            setAmount('');
        }
        setIsSubmitting(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setProcessingId(`toggle-${id}`);
        const result = await toggleBudgetStatus(id, currentStatus);
        if (result?.error) setError(result.error);
        setProcessingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この予算を削除してもよろしいですか？')) return;

        setError(null);
        setProcessingId(`delete-${id}`);

        const result = await deleteBudget(id);

        if (result?.error) {
            setError(result.error);
        }
        setProcessingId(null);
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* 新規追加フォーム */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-[var(--text-muted)]">新しい予算を設定</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* 期間タイプ */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">期間</label>
                        <select
                            value={periodType}
                            onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'yearly')}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium appearance-none"
                        >
                            <option value="monthly">毎月</option>
                            <option value="yearly">年間</option>
                        </select>
                    </div>

                    {/* カテゴリ */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">対象カテゴリ</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium appearance-none"
                        >
                            <option value="">全体予算 (すべての支出)</option>
                            <optgroup label="支出カテゴリ">
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* 金額 */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">予算額</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">¥</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value, 10) : '')}
                                placeholder="0"
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    {/* 追加ボタン */}
                    <div className="flex items-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !amount || amount <= 0}
                            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 whitespace-nowrap"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            <span>設定</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 一覧 */}
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                    <h2 className="text-sm font-bold text-[var(--text-muted)]">設定済み予算一覧 ({initialBudgets.length}件)</h2>
                </div>
                {initialBudgets.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        予算が設定されていません
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {initialBudgets.map((budget) => (
                            <li key={budget.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors group gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${budget.is_active ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)]'}`}>
                                        <Target size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${budget.is_active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'}`}>
                                                {budget.category_id ? budget.categories?.name : '全体予算'}
                                            </span>
                                            <span className="text-[9px] bg-[var(--bg-secondary)] text-[var(--text-muted)] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border border-[var(--border)] flex items-center gap-1">
                                                <CalendarDays size={10} />
                                                {budget.period_type === 'monthly' ? '月間' : '年間'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                                            {budget.category_id ? <Tags size={12} /> : <Target size={12} />}
                                            {budget.category_id ? '特定カテゴリ' : '全支出対象'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                                    <div className={`text-right ${!budget.is_active && 'opacity-50'}`}>
                                        <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">予算額</div>
                                        <div className="font-bold font-mono tracking-tight text-lg">{formatCurrency(budget.amount)}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(budget.id, budget.is_active)}
                                            disabled={processingId === `toggle-${budget.id}`}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${budget.is_active ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]' : 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20'}`}
                                        >
                                            {processingId === `toggle-${budget.id}` ? <Loader2 size={14} className="animate-spin" /> : (budget.is_active ? '無効化' : '有効化')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget.id)}
                                            disabled={processingId === `delete-${budget.id}`}
                                            className="p-2 opacity-0 group-hover:opacity-100 sm:opacity-100 lg:opacity-0 hover:bg-red-500/10 text-red-500 rounded-xl transition-all disabled:opacity-50"
                                            title="削除"
                                        >
                                            {processingId === `delete-${budget.id}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
