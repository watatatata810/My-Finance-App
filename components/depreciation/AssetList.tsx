'use client';

import {
    Package,
    Calendar,
    Trash2,
    ChevronRight,
    ArrowUpRight,
    Layers
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { deleteAsset } from '@/lib/actions/depreciation';
import { cn } from '@/lib/utils';

interface AssetListProps {
    assets: any[];
}

export function AssetList({ assets }: AssetListProps) {
    const handleDelete = async (id: string) => {
        if (confirm('この資産データを削除しますか？')) {
            await deleteAsset(id);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => {
                const total = asset.purchase_price;
                const installments = asset.total_installments;
                const remaining = asset.remaining_count;
                const monthly = Math.round(total / installments);
                const progress = ((installments - remaining) / installments) * 100;
                const currentValue = Math.max(0, Math.round(total * (remaining / installments)));

                const isCompleted = asset.is_completed || remaining === 0;

                return (
                    <div
                        key={asset.id}
                        className={cn(
                            "bg-[var(--bg-card)] rounded-3xl border transition-all duration-300 overflow-hidden group",
                            isCompleted ? "border-[var(--border)] opacity-60" : "border-[var(--border)] hover:border-purple-500/50 shadow-sm"
                        )}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                                        style={{ background: `${asset.account?.color || '#888'}15` }}
                                    >
                                        <Package size={20} style={{ color: asset.account?.color || '#888' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)] leading-tight">{asset.name}</h3>
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                                            {asset.account?.name || '未分類口座'}
                                        </p>
                                    </div>
                                </div>
                                {isCompleted && (
                                    <span className="bg-green-500/10 text-green-500 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
                                        償却完了
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">償却進捗 ({installments - remaining} / {installments} ヶ月)</p>
                                        <p className="text-xs font-bold text-purple-400">{Math.round(progress)}%</p>
                                    </div>
                                    <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1">月々の償却額</p>
                                        <p className="text-sm font-bold">{formatCurrency(monthly)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mb-1">現在の評価価値</p>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{formatCurrency(currentValue)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border)] flex justify-between items-center group-hover:bg-[var(--bg-secondary)] transition-colors">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-[var(--text-muted)]" />
                                <span className="text-[10px] font-bold text-[var(--text-secondary)]">{asset.purchase_date} 購入</span>
                            </div>
                            <button
                                onClick={() => handleDelete(asset.id)}
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
