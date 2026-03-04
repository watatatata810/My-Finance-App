'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, TransactionInput } from '@/lib/validations/transaction';
import { createTransaction } from '@/lib/actions/transactions';
import {
    ArrowLeft, Save, Loader2, AlertCircle,
    Globe, Store, ShoppingCart, Utensils, Box, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const PLACE_CATEGORIES = [
    { value: 'net', label: 'ネット', icon: Globe },
    { value: 'convenience', label: 'コンビニ', icon: Store },
    { value: 'supermarket', label: 'スーパー・小売', icon: ShoppingCart },
    { value: 'restaurant', label: '飲食店', icon: Utensils },
    { value: 'vending', label: '自動販売機', icon: Box },
    { value: 'other', label: 'その他', icon: HelpCircle },
];

interface TransactionFormProps {
    accounts: any[];
    categories: any[];
    creditCards?: any[];
}

export default function TransactionForm({ accounts, categories, creditCards = [] }: TransactionFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            amount: 0,
            tags: [],
            isAutoPayment: false,
        },
    });

    const type = watch('type');
    const fromAccountId = watch('fromAccountId');

    // クレジットカード選択時の自動処理など
    const selectedFromAccount = accounts.find(a => a.id === fromAccountId);
    const isCreditCard = selectedFromAccount?.type === 'credit';

    const onSubmit = async (data: TransactionInput) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await createTransaction(data);
            if (result.error) {
                setError(typeof result.error === 'string' ? result.error : '入力内容に誤りがあります');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (e) {
            setError('システムエラーが発生しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-[var(--bg-app)] py-4 z-10">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">取引を追加</h1>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>保存中...</span>
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            <span>保存</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Type Selector */}
            <div className="grid grid-cols-4 gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]">
                {['expense', 'income', 'transfer', 'adjustment'].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setValue('type', t as any)}
                        className={cn(
                            "py-2.5 px-2 rounded-xl text-xs font-bold transition-all transform active:scale-95",
                            type === t
                                ? "bg-[var(--bg-card)] text-[var(--accent)] shadow-sm border border-[var(--border)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        )}
                    >
                        {t === 'expense' ? '支出' : t === 'income' ? '収入' : t === 'transfer' ? '移動' : '調整'}
                    </button>
                ))}
            </div>

            {/* Main Inputs Card */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] space-y-6 shadow-sm">
                {/* Date and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] px-1">日付</label>
                        <input
                            type="date"
                            {...register('date')}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                        {errors.date && <p className="text-xs text-red-500 px-1">{errors.date.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] px-1">金額</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">¥</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl pl-8 pr-4 py-3.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                                placeholder="0"
                                value={new Intl.NumberFormat('ja-JP').format(watch('amount') || 0)}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/,/g, '');
                                    const num = parseInt(val, 10);
                                    setValue('amount', isNaN(num) ? 0 : num, { shouldValidate: true });
                                }}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500 px-1">{errors.amount.message}</p>}
                    </div>
                </div>

                {/* Category & Account Selectors */}
                <div className="space-y-6 pt-2">
                    {/* Category (Expense/Income only) */}
                    {(type === 'expense' || type === 'income') && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[var(--text-muted)] px-1">カテゴリ</label>
                            <select
                                {...register('categoryId')}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none transition-all"
                            >
                                <option value="">選択してください</option>
                                {categories.filter(c => c.type === type || c.type === 'both').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* From/To Accounts based on Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* From Account */}
                        {(type === 'expense' || type === 'transfer' || type === 'adjustment') && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-muted)] px-1">
                                    {type === 'adjustment' ? '調整対象（減額・修正）' : '支払い元 / 振替元'}
                                </label>
                                <select
                                    {...register('fromAccountId')}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none transition-all"
                                >
                                    <option value="">選択してください</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                                {errors.fromAccountId && <p className="text-xs text-red-500 px-1">口座を選択してください</p>}
                            </div>
                        )}

                        {/* To Account */}
                        {(type === 'income' || type === 'transfer' || type === 'adjustment') && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[var(--text-muted)] px-1">
                                    {type === 'adjustment' ? '調整対象（増額・修正）' : '受け取り先 / 振替先'}
                                </label>
                                <select
                                    {...register('toAccountId')}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none transition-all"
                                >
                                    <option value="">選択してください</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Credit Card Name (Only when expense + credit card) */}
                    {type === 'expense' && isCreditCard && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-[var(--accent)] px-1 flex items-center justify-between">
                                カード名
                                <span className="text-[10px] bg-[var(--bg-secondary)] text-[var(--text-muted)] px-1.5 py-0.5 rounded">
                                    設定 {'>'} カードマスタ で編集
                                </span>
                            </label>
                            <select
                                {...register('creditCardId')}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--accent)]/30 rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] appearance-none transition-all"
                            >
                                <option value="">選択してください (任意)</option>
                                {creditCards.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {/* 後方互換性のため creditCardName は送信時に付与しないか、空にする等できますがここでは creditCardId のみ使用 */}
                        </div>
                    )}
                </div>
            </div>

            {/* Optional Details */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] space-y-6 shadow-sm">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--text-muted)] px-1">内容 / メモ</label>
                    <input
                        type="text"
                        {...register('description')}
                        placeholder="例: スーパーでの買い物"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] px-1">詳細 / メモ</label>
                        <input
                            type="text"
                            {...register('place')}
                            placeholder="例: イオン、ローソン、または備考など"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] px-1">場所(大分類)</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {PLACE_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = watch('placeCategory') === cat.value;
                                return (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setValue('placeCategory', isSelected ? null : cat.value as any)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1",
                                            isSelected
                                                ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]"
                                                : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                                        )}
                                        title={cat.label}
                                    >
                                        <Icon size={16} />
                                        <span className="text-[9px] whitespace-nowrap">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
