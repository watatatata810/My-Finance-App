'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Search, Filter, ArrowUpDown, ChevronDown, Loader2, Calendar,
    Globe, Store, ShoppingCart, Utensils, Box, HelpCircle
} from 'lucide-react';
import { getTransactions } from '@/lib/actions/transactions';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

const PLACE_ICON_MAP: Record<string, any> = {
    net: Globe,
    convenience: Store,
    supermarket: ShoppingCart,
    restaurant: Utensils,
    vending: Box,
    other: HelpCircle,
};

interface TransactionListProps {
    initialTransactions: any[];
    categories: any[];
    accounts: any[];
    totalCount: number;
}

export function TransactionList({
    initialTransactions,
    categories,
    accounts,
    totalCount: initialTotalCount
}: TransactionListProps) {
    const [list, setList] = useState(initialTransactions);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(initialTransactions.length);
    const [hasMore, setHasMore] = useState(initialTransactions.length < initialTotalCount);

    // Filter states
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [categoryId, setCategoryId] = useState('all');
    const [accountId, setAccountId] = useState('all');

    const debouncedSearch = useDebounce(search, 500);

    const typeLabel = { expense: '支出', income: '収入', transfer: '移動', adjustment: '調整' } as Record<string, string>;
    const typeColorMap = {
        expense: 'bg-red-500/10 text-red-500',
        income: 'bg-green-500/10 text-green-500',
        transfer: 'bg-blue-500/10 text-blue-500',
        adjustment: 'bg-purple-500/10 text-purple-500'
    } as Record<string, string>;

    const fetchFiltered = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getTransactions({
                type,
                search: debouncedSearch,
                categoryId,
                fromAccountId: accountId,
                limit: 50,
                offset: 0
            });
            setList(result.transactions);
            setTotalCount(result.totalCount);
            setOffset(result.transactions.length);
            setHasMore(!!result.nextOffset);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [type, debouncedSearch, categoryId, accountId]);

    // Apply filters when they change
    useEffect(() => {
        fetchFiltered();
    }, [fetchFiltered]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const result = await getTransactions({
                type,
                search: debouncedSearch,
                categoryId,
                fromAccountId: accountId,
                limit: 50,
                offset
            });
            setList(prev => [...prev, ...result.transactions]);
            setOffset(prev => prev + result.transactions.length);
            setHasMore(!!result.nextOffset);
        } catch (error) {
            console.error('Load more error:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-4 border border-[var(--border)] shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="内容・場所で検索..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                    </div>

                    {/* Type Select */}
                    <div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        >
                            <option value="all">すべての種別</option>
                            <option value="expense">支出</option>
                            <option value="income">収入</option>
                            <option value="transfer">移動</option>
                            <option value="adjustment">調整</option>
                        </select>
                    </div>

                    {/* Category Select */}
                    <div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        >
                            <option value="all">すべてのカテゴリ</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Account Select */}
                    <div>
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        >
                            <option value="all">すべての口座</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count & Status */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {loading ? '読み込み中...' : `${totalCount} 件の取引が見つかりました`}
                </p>
            </div>

            {/* List/Table Container */}
            <div className={cn(
                "bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden transition-opacity",
                loading && "opacity-50"
            )}>
                {/* Desktop view */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--bg-secondary)] text-[var(--text-muted)] border-b border-[var(--border)] font-bold uppercase text-[10px] tracking-wider">
                                <th className="px-6 py-4">日付</th>
                                <th className="px-6 py-4">種別</th>
                                <th className="px-6 py-4">カテゴリ</th>
                                <th className="px-6 py-4">内容 / メモ</th>
                                <th className="px-6 py-4">口座</th>
                                <th className="px-6 py-4 text-right">金額</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {list.map((txn) => (
                                <tr key={txn.id} className="hover:bg-[var(--bg-hover)] transition-colors group">
                                    <td className="px-6 py-4 text-[var(--text-secondary)] font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-[var(--text-muted)]" />
                                            {txn.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                                            typeColorMap[txn.type]
                                        )}>
                                            {typeLabel[txn.type]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {txn.categories && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: txn.categories.color }} />
                                                <span className="font-semibold">{txn.categories.name}</span>
                                            </div>
                                        )}
                                        {!txn.categories && <span className="text-[var(--text-muted)]">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                                                {txn.place_category && PLACE_ICON_MAP[txn.place_category] && (
                                                    (() => {
                                                        const Icon = PLACE_ICON_MAP[txn.place_category];
                                                        return <Icon size={12} className="text-[var(--text-muted)]" />;
                                                    })()
                                                )}
                                                {txn.description || '内容なし'}
                                            </div>
                                            {txn.place && <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">{txn.place}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[var(--text-secondary)] text-xs font-medium truncate max-w-[120px]">
                                            {txn.type === 'transfer'
                                                ? `${txn.from_account?.name || '不明'} → ${txn.to_account?.name || '不明'}`
                                                : txn.from_account?.name || txn.to_account?.name || '不明'
                                            }
                                        </div>
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-right font-bold text-base",
                                        txn.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'
                                    )}>
                                        {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}
                                        {formatCurrency(txn.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view */}
                <div className="md:hidden divide-y divide-[var(--border)]">
                    {list.map((txn) => (
                        <div key={txn.id} className="p-4 flex items-center justify-between active:bg-[var(--bg-hover)] transition-colors">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner relative"
                                    style={{ background: `${txn.categories?.color || '#94a3b8'}15` }}
                                >
                                    {txn.type === 'income' ? '💰' : txn.type === 'transfer' ? '🔁' : txn.type === 'adjustment' ? '⚖️' : '🧾'}
                                    {txn.place_category && PLACE_ICON_MAP[txn.place_category] && (
                                        <div className="absolute -bottom-1 -right-1 bg-[var(--bg-card)] p-0.5 rounded-full border border-[var(--border)]">
                                            {(() => {
                                                const Icon = PLACE_ICON_MAP[txn.place_category];
                                                return <Icon size={10} className="text-[var(--text-muted)]" />;
                                            })()}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{txn.description || '内容なし'}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                                        <span>{txn.date}</span>
                                        <span>•</span>
                                        <span className="font-bold">{txn.categories?.name || '未分類'}</span>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                        {txn.type === 'transfer'
                                            ? `${txn.from_account?.name} → ${txn.to_account?.name}`
                                            : txn.from_account?.name || txn.to_account?.name
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-bold text-sm",
                                    txn.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'
                                )}>
                                    {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}
                                    {formatCurrency(txn.amount).replace(/[^0-9,]/g, '')}
                                </p>
                                <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">JPY</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!loading && list.length === 0 && (
                    <div className="py-20 text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-secondary)]">取引が見つかりません</h3>
                        <p className="text-sm text-[var(--text-muted)]">フィルタ条件を変えてみてください</p>
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="group relative px-8 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-2xl text-sm font-bold text-[var(--text-secondary)] transition-all flex items-center gap-3 overflow-hidden"
                    >
                        {loadingMore ? (
                            <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
                        ) : (
                            <>
                                <ChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
                                <span>さらに読み込む</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
