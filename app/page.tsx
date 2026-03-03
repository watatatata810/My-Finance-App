import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDashboardData, getExpenseByCategory } from '@/lib/actions/dashboard';
import { formatCurrency } from '@/lib/utils';
import { ExpensePieChart } from '@/components/dashboard/ExpensePieChart';
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart';

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: `${color}20` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const { summary, recentTransactions, monthlyTrend } = await getDashboardData();
  const expenseByCategory = await getExpenseByCategory();

  const budgetPercent = summary.monthlyBudget > 0
    ? Math.min((summary.monthlyExpense / summary.monthlyBudget) * 100, 100)
    : 0;

  const monthBalance = summary.monthlyIncome - summary.monthlyExpense;
  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">ダッシュボード</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">{monthLabel}</p>
        </div>
        <Link
          href="/transactions/new"
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors no-underline"
        >
          ＋ 取引を追加
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="全資産合計"
          value={formatCurrency(summary.totalAssets)}
          sub="投資・償却含む"
          icon={Wallet}
          color="#3b82f6"
        />
        <StatCard
          title="流動資産"
          value={formatCurrency(summary.liquidAssets)}
          sub="すぐ使えるお金"
          icon={PiggyBank}
          color="#22c55e"
        />
        <StatCard
          title="今月の収入"
          value={formatCurrency(summary.monthlyIncome)}
          icon={TrendingUp}
          color="#22c55e"
        />
        <StatCard
          title="今月の支出"
          value={formatCurrency(summary.monthlyExpense)}
          sub={`収支: ${formatCurrency(monthBalance)}`}
          icon={TrendingDown}
          color={monthBalance < 0 ? '#ef4444' : '#22c55e'}
        />
      </div>

      {/* Budget Progress */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">月間予算</h2>
          <span className="text-sm text-[var(--text-muted)]">
            {summary.monthlyBudget > 0
              ? `${formatCurrency(summary.monthlyExpense)} / ${formatCurrency(summary.monthlyBudget)}`
              : '未設定'
            }
          </span>
        </div>
        {summary.monthlyBudget > 0 && (
          <>
            <div className="w-full h-3 bg-[var(--bg-hover)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${budgetPercent}%`,
                  background: budgetPercent > 100 ? '#ef4444' : budgetPercent > 80 ? '#f59e0b' : '#22c55e',
                }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {budgetPercent > 100
                ? `予算を ${formatCurrency(summary.monthlyExpense - summary.monthlyBudget)} オーバー`
                : `残り ${formatCurrency(summary.monthlyBudget - summary.monthlyExpense)}`
              }
            </p>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
          <h2 className="font-semibold mb-4">今月の支出内訳</h2>
          <ExpensePieChart data={expenseByCategory} />
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
          <h2 className="font-semibold mb-4">月別収支</h2>
          <MonthlyBarChart data={monthlyTrend} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最近の取引</h2>
          <Link href="/transactions" className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1 no-underline">
            すべて見る <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${txn.categoryColor || '#666'}20` }}
                >
                  {txn.type === 'income' ? '💰' : txn.type === 'transfer' ? '🔁' : txn.type === 'adjustment' ? '⚖️' : '🧾'}
                </div>
                <div>
                  <p className="text-sm font-medium">{txn.description || '内容なし'}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {txn.date} · {txn.categoryName || 'カテゴリなし'} · {txn.fromAccountName || txn.toAccountName}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
              </span>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <p className="text-[var(--text-muted)] text-center py-4">取引履歴がまだありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
