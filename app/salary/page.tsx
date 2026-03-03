import { getSalaryRecords, deleteSalaryRecord } from '@/lib/actions/salary';
import { SalaryTrendChart } from '@/components/salary/SalaryTrendChart';
import { formatCurrency } from '@/lib/utils';
import { Plus, Briefcase, TrendingUp, PieChart, Trash2, Calendar } from 'lucide-react';

export default async function SalaryPage() {
    const records = await getSalaryRecords();

    // 直近12ヶ月分などの集計
    const totalGross = records.reduce((s, r) => s + r.gross_amount, 0);
    const totalNet = records.reduce((s, r) => s + r.net_amount, 0);
    const avgNet = records.length > 0 ? Math.round(totalNet / records.length) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">給与管理</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        手取り、額面、控除額の推移を詳細に記録・分析します
                    </p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[var(--accent)]/20">
                    <Plus size={18} />
                    給与明細を登録
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-blue-500">
                        <Briefcase size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">平均月収 (手取り)</p>
                    <p className="text-3xl font-bold tracking-tight">{formatCurrency(avgNet)}</p>
                    <p className="text-[10px] text-blue-500 mt-2 font-bold uppercase tracking-tighter">MONTHLY AVERAGE</p>
                </div>

                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-green-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-green-500">
                        <TrendingUp size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-2">総支給額 (累計)</p>
                    <p className="text-3xl font-bold tracking-tight text-green-400">{formatCurrency(totalGross)}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium italic">額面合計</p>
                </div>

                <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-orange-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-orange-500">
                        <PieChart size={64} />
                    </div>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">累計天引き額</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold tracking-tight text-orange-400">{formatCurrency(totalGross - totalNet)}</p>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 font-medium">税金・社会保険料の合計</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold">給与推移チャート</h2>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold">GROSS VS NET</span>
                </div>
                <SalaryTrendChart data={records} />
            </div>

            {/* History Table */}
            <div className="space-y-4">
                <h2 className="font-bold px-2">履歴明細</h2>
                <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-widest">
                                <th className="px-6 py-4">支給日</th>
                                <th className="px-6 py-4">会社名</th>
                                <th className="px-6 py-4 text-right">額面</th>
                                <th className="px-6 py-4 text-right">手取り</th>
                                <th className="px-6 py-4 text-right">控除</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
                            {records.map((r) => (
                                <tr key={r.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        <Calendar size={14} className="text-[var(--text-muted)]" />
                                        {r.date}
                                    </td>
                                    <td className="px-6 py-4">{r.company_name}</td>
                                    <td className="px-6 py-4 text-right font-bold text-[var(--text-primary)]">{formatCurrency(r.gross_amount)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-400">{formatCurrency(r.net_amount)}</td>
                                    <td className="px-6 py-4 text-right text-red-500/80">{formatCurrency(r.social_insurance + r.income_tax)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {records.length === 0 && (
                        <div className="p-12 text-center text-[var(--text-muted)]">
                            明細履歴がまだありません
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
