'use client';

import { useState } from 'react';
import { X, Scale, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createTransaction } from '@/lib/actions/transactions';
import { cn } from '@/lib/utils';

interface AdjustmentModalProps {
    account: { id: string; name: string; balance: number };
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AdjustmentModal({ account, isOpen, onClose, onSuccess }: AdjustmentModalProps) {
    const [actualBalance, setActualBalance] = useState<number | string>(account.balance);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const calculated = account.balance;
    const actual = Number(actualBalance) || 0;
    const diff = actual - calculated;

    const handleSubmit = async () => {
        if (diff === 0) {
            onClose();
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const amount = Math.abs(diff);
            const input = {
                date: new Date().toISOString().split('T')[0],
                type: 'adjustment' as const,
                amount,
                description: `残高調整: ${account.name}`,
                fromAccountId: diff < 0 ? account.id : null,
                toAccountId: diff > 0 ? account.id : null,
                source: 'manual' as const,
                isAutoPayment: false,
                tags: []
            };

            const result = await createTransaction(input);
            if (result.error) {
                setError('保存に失敗しました');
            } else {
                onSuccess();
                onClose();
            }
        } catch (e) {
            setError('エラーが発生しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] w-full max-w-md rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                            <Scale size={20} />
                        </div>
                        <h3 className="font-bold text-lg">残高調整: {account.name}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Comparison Card */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">計算上の残高</p>
                            <p className="text-lg font-bold">{formatCurrency(calculated)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">実際の残高との差分</p>
                            <p className={cn(
                                "text-lg font-bold",
                                diff > 0 ? "text-[var(--success)]" : diff < 0 ? "text-red-500" : "text-[var(--text-muted)]"
                            )}>
                                {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                            </p>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-muted)] px-1">実際の残高を入力</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-muted)]">¥</span>
                            <input
                                type="number"
                                value={actualBalance}
                                onChange={(e) => setActualBalance(e.target.value)}
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl pl-10 pr-4 py-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="bg-[var(--bg-secondary)] p-4 rounded-2xl space-y-2">
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            調整を保存すると、「調整」タイプの取引が作成され、計算上の残高が入力した値と一致するようになります。この取引は収支分析からは除外されます。
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-[var(--bg-secondary)]/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-[var(--border)] hover:bg-[var(--bg-secondary)] rounded-2xl text-sm font-bold transition-all"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || diff === 0}
                        className="flex-[2] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Scale size={18} />}
                        残高を確定する
                    </button>
                </div>
            </div>
        </div>
    );
}
