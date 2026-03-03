'use client';

import { useState } from 'react';
import { Building2, CreditCard, Smartphone, TrendingUp, Package, Wallet, Scale } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AdjustmentModal } from './AdjustmentModal';
import { useRouter } from 'next/navigation';

const iconMap: Record<string, React.ElementType> = {
    Building2, CreditCard, Smartphone, TrendingUp, Package, Wallet,
};

interface AccountListProps {
    accounts: any[];
}

export function AccountList({ accounts }: AccountListProps) {
    const router = useRouter();
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const liquid = accounts.filter(a => a.isLiquid);
    const nonLiquid = accounts.filter(a => !a.isLiquid);

    const handleAdjustment = (acc: any) => {
        setSelectedAccount(acc);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        router.refresh();
    };

    const AccountItem = ({ acc }: { acc: any }) => {
        const Icon = iconMap[acc.icon] || Wallet;
        return (
            <div className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0 group">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: `${acc.color}15` }}>
                        <Icon size={20} style={{ color: acc.color }} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{acc.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                            {acc.type === 'bank' ? '銀行' : acc.type === 'credit' ? 'クレジット' : acc.type === 'investment' ? '投資' : acc.type === 'asset' ? '固定資産' : acc.type === 'epay' ? '電子マネー' : '現金'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className={`text-sm font-bold ${acc.balance < 0 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                            {formatCurrency(acc.balance)}
                        </p>
                        <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-tighter italic">JPY</span>
                    </div>
                    <button
                        onClick={() => handleAdjustment(acc)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-hover)] rounded-xl text-[var(--text-muted)] hover:text-purple-500 transition-all transform hover:scale-110"
                        title="残高調整"
                    >
                        <Scale size={18} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Liquid Assets Section */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💳</span>
                        <h2 className="font-bold text-[var(--text-primary)]">流動資産</h2>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold uppercase">すぐ使える</span>
                </div>
                <div className="space-y-1">
                    {liquid.map(acc => <AccountItem key={acc.id} acc={acc} />)}
                </div>
            </div>

            {/* Non-Liquid Assets Section */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📈</span>
                        <h2 className="font-bold text-[var(--text-primary)]">非流動資産</h2>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full font-bold uppercase">投資・固定資産</span>
                </div>
                <div className="space-y-1">
                    {nonLiquid.map(acc => <AccountItem key={acc.id} acc={acc} />)}
                </div>
            </div>

            {selectedAccount && (
                <AdjustmentModal
                    account={selectedAccount}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
