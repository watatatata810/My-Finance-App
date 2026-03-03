import { getFixedExpenses } from '@/lib/actions/fixed-expenses';
import { FixedExpenseList } from '@/components/fixed-expenses/FixedExpenseList';
import { formatCurrency } from '@/lib/utils';
import { Plus, CreditCard, CalendarClock } from 'lucide-react';

export default async function FixedExpensesPage() {
    const expenses = await getFixedExpenses();

    const activeExpenses = expenses.filter(e => e.is_active);
    const totalActiveAmount = activeExpenses.reduce((s, e) => s + (e.amount || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">固定費管理</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        サブスクリプションや家賃などの定期的な支払いを管理します
                    </p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20">
                    <Plus size={18} />
                    新規固定費を追加
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CreditCard size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">月間固定費合計 (有効のみ)</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalActiveAmount)}</p>
                        <span className="text-xs text-[var(--text-muted)] font-medium">/ month</span>
                    </div>
                </div>
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-blue-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CalendarClock size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">登録アイテム数</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold tracking-tight text-blue-400">{expenses.length}</p>
                        <span className="text-xs text-[var(--text-muted)] font-medium">個の設定</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">うち {activeExpenses.length} 個が現在有効</p>
                </div>
            </div>

            {/* Main List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                        固定費設定一覧
                    </h2>
                </div>
                <FixedExpenseList expenses={expenses} />
            </div>

            {expenses.length === 0 && (
                <div className="bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
                        <CalendarClock size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-[var(--text-primary)]">固定費が登録されていません</p>
                        <p className="text-sm text-[var(--text-muted)]">サブスクリプションなどを登録して、支払日を管理しましょう</p>
                    </div>
                </div>
            )}
        </div>
    );
}
