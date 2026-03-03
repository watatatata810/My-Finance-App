'use client';

import { useState } from 'react';
import { createCategory, deleteCategory } from '@/lib/actions/categories';
import { Plus, Trash2, Tags, Loader2, AlertCircle, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    type: 'expense' | 'income' | 'both';
    color: string | null;
}

const CATEGORY_TYPES = [
    { value: 'expense', label: '支出', icon: ArrowDownToLine, color: 'text-red-500' },
    { value: 'income', label: '収入', icon: ArrowUpFromLine, color: 'text-blue-500' },
    { value: 'both', label: '共通', icon: ArrowRightLeft, color: 'text-purple-500' },
] as const;

export default function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
    const [name, setName] = useState('');
    const [type, setType] = useState<Category['type']>('expense');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // フィルタリング用
    const [filterType, setFilterType] = useState<Category['type'] | 'all'>('all');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const result = await createCategory({
            name,
            type,
        });

        if (result?.error) {
            setError(result.error);
        } else {
            setName('');
            // type は連続入力しやすいため維持
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('このカテゴリを削除してもよろしいですか？\n※関連する取引データがある場合は削除できません。')) return;

        setError(null);
        setDeletingId(id);

        const result = await deleteCategory(id);

        if (result?.error) {
            setError(result.error);
        }
        setDeletingId(null);
    };

    const getTypeInfo = (catType: Category['type']) => {
        return CATEGORY_TYPES.find(t => t.value === catType);
    };

    const filteredCategories = filterType === 'all'
        ? initialCategories
        : initialCategories.filter(c => c.type === filterType || c.type === 'both');

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
                <h2 className="text-sm font-bold text-[var(--text-muted)]">新しいカテゴリを登録</h2>
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">カテゴリ名</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                <Tags size={18} />
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="例: 食費、給与"
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">収支タイプ</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as Category['type'])}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium appearance-none"
                        >
                            {CATEGORY_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="w-full md:w-auto bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 whitespace-nowrap"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            <span>追加</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 一覧フィルタータブ */}
            <div className="flex gap-2 border-b border-[var(--border)] pb-4 overflow-x-auto hide-scrollbar">
                <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                    すべて
                </button>
                {CATEGORY_TYPES.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setFilterType(t.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${filterType === t.value ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <t.icon size={16} className={filterType === t.value ? 'text-[var(--bg-primary)]' : t.color} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* カテゴリ一覧 */}
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                    <h2 className="text-sm font-bold text-[var(--text-muted)]">登録済みカテゴリ ({filteredCategories.length}件)</h2>
                </div>
                {filteredCategories.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        カテゴリが登録されていません
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {filteredCategories.map((category) => {
                            const info = getTypeInfo(category.type);
                            const Icon = info?.icon || Tags;
                            return (
                                <li key={category.id} className="flex items-center justify-between p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border)]">
                                            <Icon size={18} className={info?.color || 'text-[var(--text-secondary)]'} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-[var(--text-primary)]">{category.name}</span>
                                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{info?.label}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        disabled={deletingId === category.id}
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-xl transition-all disabled:opacity-50"
                                        title="削除"
                                    >
                                        {deletingId === category.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
