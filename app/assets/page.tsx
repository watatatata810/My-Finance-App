import { getAssetData } from '@/lib/actions/assets';
import { formatCurrency } from '@/lib/utils';
import { AccountList } from '@/components/assets/AccountList';
import { AssetDistributionChart } from '@/components/assets/AssetDistributionChart';

export default async function AssetsPage() {
    const { accounts } = await getAssetData();

    const liquid = accounts.filter(a => a.isLiquid);
    const nonLiquid = accounts.filter(a => !a.isLiquid);

    const totalAll = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalLiquid = liquid.reduce((s, a) => s + (a.balance || 0), 0);
    const totalNonLiquid = nonLiquid.reduce((s, a) => s + (a.balance || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">資産管理</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        保有口座の残高推移と内訳を管理します
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">全資産合計</p>
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalAll)}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-green-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">💰</div>
                    <p className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest mb-2">流動資産</p>
                    <p className="text-3xl font-bold tracking-tight text-green-400">{formatCurrency(totalLiquid)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium italic">すぐに使えるお金</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-purple-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">📈</div>
                    <p className="text-[10px] font-bold text-purple-500/80 uppercase tracking-widest mb-2">非流動資産</p>
                    <p className="text-3xl font-bold tracking-tight text-purple-400">{formatCurrency(totalNonLiquid)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium italic">投資・償却資産</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Account List (Left) */}
                <div className="order-2 lg:order-1">
                    <AccountList accounts={accounts} />
                </div>

                {/* Analysis (Right) */}
                <div className="order-1 lg:order-2 space-y-6">
                    <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm sticky top-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold">口座別資産構成</h2>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold">BY BALANCE</span>
                        </div>
                        <AssetDistributionChart accounts={accounts} />

                        <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)]">
                            <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                資産バランスのヒント
                            </h3>
                            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                流動資産の割合は全体の <strong>{((totalLiquid / totalAll) * 100).toFixed(1)}%</strong> です。一般的に生活防衛資金として支出の3〜6ヶ月分を確保することが推奨されます。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
