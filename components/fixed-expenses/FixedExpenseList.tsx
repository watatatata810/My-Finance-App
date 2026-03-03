'use client';

import { useState } from 'react';
import {
    Calendar,
    CreditCard,
    Smartphone,
    Building2,
    Wallet,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Power,
    Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toggleFixedExpenseStatus, deleteFixedExpense } from '@/lib/actions/fixed-expenses';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
    Building2, CreditCard, Smartphone, Wallet,
};

interface FixedExpenseListProps {
    expenses: any[];
}

export function FixedExpenseList({ expenses }: FixedExpenseListProps) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // 次回支払日の計算
    const getNextPaymentDate = (day: number) => {
        const now = new Date();
        let nextDate = new Date(now.getFullYear(), now.getMonth(), day);

        // 今日が決済日より後の場合は来月に
        if (now.getDate() > day) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }

        return nextDate;
    };

    // 残り日数の計算
    const getDaysRemaining = (date: Date) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diff = date.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleFixedExpenseStatus(id, currentStatus);
    };

    const handleDelete = async (id: string) => {
        if (confirm('この固定費設定を削除しますか？')) {
            setIsDeleting(id);
            await deleteFixedExpense(id);
            setIsDeleting(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.map((expense) => {
                const nextDate = getNextPaymentDate(expense.billing_day);
                const daysRemaining = getDaysRemaining(nextDate);
                const Icon = iconMap[expense.account?.icon] || Wallet;
                const isActive = expense.is_active;

                return (
                    <div
                        key={expense.id}
                        className={cn(
                            "bg-[var(--bg-card)] rounded-3xl border transition-all duration-300 overflow-hidden group",
                            isActive ? "border-[var(--border)] hover:border-[var(--accent)]/50 shadow-sm" : "border-dashed border-[var(--border)] opacity-60"
                        )}
                    >
                        {/* Header Area */}
                        <div className="p-6 pb-4">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                                        style={{ background: `${expense.account?.color || '#888'}15` }}
                                    >
                                        <Icon size={20} style={{ color: expense.account?.color || '#888' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)] leading-tight">{expense.name}</h3>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                                            {expense.category?.name || '未分類'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggle(expense.id, isActive)}
                                        className={cn(
                                            "p-2 rounded-xl transition-all",
                                            isActive ? "text-green-500 hover:bg-green-500/10" : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                                        )}
                                        title={isActive ? "一時停止" : "再開"}
                                    >
                                        <Power size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black tracking-tighter">
                                        {expense.amount ? formatCurrency(expense.amount) : '変動'}
                                    </span>
                                    {expense.amount && <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase italic">/ month</span>}
                                </div>
                            </div>
                        </div>

                        {/* Status Area */}
                        <div className="px-6 py-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border)]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-[var(--text-muted)]" />
                                    <span className="text-xs font-bold text-[var(--text-secondary)]">毎月 {expense.billing_day}日</span>
                                </div>
                                {isActive && (
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight",
                                        daysRemaining <= 3 ? "bg-red-500/10 text-red-500 animate-pulse" :
                                            daysRemaining <= 7 ? "bg-orange-500/10 text-orange-500" :
                                                "bg-blue-500/10 text-blue-500"
                                    )}>
                                        <Clock size={12} />
                                        あと {daysRemaining} 日
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-3 border-t border-[var(--border)] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-[var(--text-muted)] font-bold">NEXT: {nextDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                            <button
                                onClick={() => handleDelete(expense.id)}
                                disabled={isDeleting === expense.id}
                                className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
