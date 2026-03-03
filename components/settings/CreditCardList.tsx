'use client';

import { useState } from 'react';
import { createCreditCard, deleteCreditCard } from '@/lib/actions/credit-cards';
import { Plus, Trash2, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Optional if we want to show anything else

interface CreditCard {
    id: string;
    name: string;
    created_at: string;
}

export default function CreditCardList({ initialCards }: { initialCards: CreditCard[] }) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const result = await createCreditCard(name);

        if (result?.error) {
            setError(result.error);
        } else {
            setName('');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('このカードを削除してもよろしいですか？')) return;

        setError(null);
        setDeletingId(id);

        const result = await deleteCreditCard(id);

        if (result?.error) {
            setError(result.error);
        }
        setDeletingId(null);
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
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-muted)] mb-4">新しいカードを登録</h2>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            <CreditCard size={18} />
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="カード名 (例: 楽天カード、JCB)"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 whitespace-nowrap"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        <span>追加</span>
                    </button>
                </form>
            </div>

            {/* カード一覧 */}
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                    <h2 className="text-sm font-bold text-[var(--text-muted)]">登録済みカード一覧 ({initialCards.length}件)</h2>
                </div>
                {initialCards.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        カードが登録されていません
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {initialCards.map((card) => (
                            <li key={card.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border)]">
                                        <CreditCard size={18} className="text-[var(--text-secondary)]" />
                                    </div>
                                    <span className="font-bold text-[var(--text-primary)]">{card.name}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(card.id)}
                                    disabled={deletingId === card.id}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-xl transition-all disabled:opacity-50"
                                    title="削除"
                                >
                                    {deletingId === card.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
