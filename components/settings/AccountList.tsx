'use client';

import { useState } from 'react';
import { createAccount, deleteAccount } from '@/lib/actions/accounts';
import { Plus, Trash2, Landmark, Loader2, AlertCircle, Wallet, CreditCard, Building2, Smartphone, TrendingUp, Briefcase } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface Account {
    id: string;
    name: string;
    type: 'bank' | 'cash' | 'credit' | 'epay' | 'investment' | 'asset';
    is_liquid: boolean;
    initial_balance: number;
    balance: number; // View から取得した現在残高
    color: string | null;
}

const ACCOUNT_TYPES = [
    { value: 'bank', label: '銀行口座', icon: Building2 },
    { value: 'cash', label: '現金', icon: Wallet },
    { value: 'credit', label: 'クレジットカード', icon: CreditCard },
    { value: 'epay', label: '電子マネー', icon: Smartphone },
    { value: 'investment', label: '投資・証券', icon: TrendingUp },
    { value: 'asset', label: 'その他資産', icon: Briefcase },
] as const;

export default function AccountList({ initialAccounts }: { initialAccounts: Account[] }) {
    const [name, setName] = useState('');
    const [type, setType] = useState<Account['type']>('bank');
    const [initialBalance, setInitialBalance] = useState<number | ''>('');
    const [isLiquid, setIsLiquid] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const result = await createAccount({
            name,
            type,
            initial_balance: initialBalance === '' ? 0 : initialBalance,
            is_liquid: isLiquid,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            setName('');
            setInitialBalance('');
            // type や isLiquid はそのまま維持でもOK（連続入力しやすいため）
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('この口座を削除してもよろしいですか？\n※関連する取引データがある場合は削除できません。')) return;

        setError(null);
        setDeletingId(id);

        const result = await deleteAccount(id);

        if (result?.error) {
            setError(result.error);
        }
        setDeletingId(null);
    };

    const getIcon = (type: Account['type']) => {
        const item = ACCOUNT_TYPES.find(t => t.value === type);
        const IconComponent = item?.icon || Landmark;
        return <IconComponent size={18} />;
    };

    const getTypeLabel = (type: Account['type']) => {
        return ACCOUNT_TYPES.find(t => t.value === type)?.label || '不明';
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
                <h2 className="text-sm font-bold text-[var(--text-muted)]">新しい口座を登録</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 口座名 */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例: 三井住友銀行"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium"
                            required
                        />
                    </div>

                    {/* 種類 */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">種類</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as Account['type'])}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium appearance-none"
                        >
                            {ACCOUNT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* 初期残高 */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">初期残高 (任意)</label>
                        <input
                            type="number"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(e.target.value ? parseInt(e.target.value, 10) : '')}
                            placeholder="¥0"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium"
                        />
                    </div>

                    {/* 追加ボタン */}
                    <div className="flex items-end justify-between lg:justify-end gap-4 h-full pt-2">
                        <label className="flex items-center gap-2 cursor-pointer mt-auto mb-3 lg:mb-0">
                            <input
                                type="checkbox"
                                checked={isLiquid}
                                onChange={(e) => setIsLiquid(e.target.checked)}
                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--bg-secondary)]"
                            />
                            <span className="text-xs font-bold text-[var(--text-secondary)]">流動資産</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 whitespace-nowrap mt-auto"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            <span>追加</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 口座一覧 */}
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                    <h2 className="text-sm font-bold text-[var(--text-muted)]">登録済み口座一覧 ({initialAccounts.length}件)</h2>
                </div>
                {initialAccounts.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        口座が登録されていません
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {initialAccounts.map((account) => (
                            <li key={account.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors group gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)]">
                                        {getIcon(account.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[var(--text-primary)]">{account.name}</span>
                                            {!account.is_liquid && (
                                                <span className="text-[9px] bg-[var(--bg-secondary)] text-[var(--text-muted)] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">固定資産</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)] font-medium">{getTypeLabel(account.type)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                                    <div className="text-right">
                                        <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">現在残高</div>
                                        <div className="font-bold font-mono tracking-tight text-lg">{formatCurrency(account.balance)}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        disabled={deletingId === account.id}
                                        className="p-2 opacity-0 group-hover:opacity-100 sm:opacity-100 lg:opacity-0 hover:bg-red-500/10 text-red-500 rounded-xl transition-all disabled:opacity-50"
                                        title="削除"
                                    >
                                        {deletingId === account.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
