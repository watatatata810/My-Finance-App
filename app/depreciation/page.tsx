import { getDepreciableAssets } from '@/lib/actions/depreciation';
import { AssetList } from '@/components/depreciation/AssetList';
import { formatCurrency } from '@/lib/utils';
import { Plus, Package, TrendingDown, Layers } from 'lucide-react';

export default async function DepreciationPage() {
    const assets = await getDepreciableAssets();

    const activeAssets = assets.filter(a => !a.is_completed && a.remaining_count > 0);
    const totalCurrentValue = assets.reduce((s, a) => {
        const remaining = a.remaining_count;
        const total = a.total_installments;
        return s + Math.max(0, Math.round(a.purchase_price * (remaining / total)));
    }, 0);

    const monthlyDepreciation = activeAssets.reduce((s, a) => {
        return s + Math.round(a.purchase_price / a.total_installments);
    }, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">減価償却管理</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        高額な購入資産の価値を期間で分割して管理します
                    </p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20">
                    <Plus size={18} />
                    新規資産を登録
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-purple-500">
                        <Package size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">現在の総資産価値</p>
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalCurrentValue)}</p>
                    <p className="text-[10px] text-purple-500 mt-2 font-bold uppercase tracking-tighter">未償却分合計</p>
                </div>

                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-pink-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-pink-500">
                        <TrendingDown size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-2">今月の減価償却額</p>
                    <p className="text-3xl font-bold tracking-tight text-pink-400">{formatCurrency(monthlyDepreciation)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium italic">自動で「支出」として考慮されます</p>
                </div>

                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-blue-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-blue-500">
                        <Layers size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">登録アイテム数</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold tracking-tight text-blue-400">{assets.length}</p>
                        <span className="text-xs text-[var(--text-muted)] font-medium">個の資産</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">うち {activeAssets.length} 個が償却中</p>
                </div>
            </div>

            {/* Asset List Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        償却資産一覧
                    </h2>
                </div>
                <AssetList assets={assets} />
            </div>

            {assets.length === 0 && (
                <div className="bg-[var(--bg-card)] border-2 border-dashed border-[var(--border)] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto text-[var(--text-muted)]">
                        <Package size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-[var(--text-primary)]">資産が登録されていません</p>
                        <p className="text-sm text-[var(--text-muted)]">PCや家電などの高額資産を登録して、月々のコストを平準化しましょう</p>
                    </div>
                </div>
            )}
        </div>
    );
}
