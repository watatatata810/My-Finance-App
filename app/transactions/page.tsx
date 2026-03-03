import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getTransactions, getTransactionFormData } from '@/lib/actions/transactions';
import { TransactionList } from '@/components/transactions/TransactionList';

export default async function TransactionsPage() {
    const [transactionsData, formData] = await Promise.all([
        getTransactions({ limit: 50 }),
        getTransactionFormData()
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">取引一覧</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        記録されたすべての取引を管理します
                    </p>
                </div>
                <Link
                    href="/transactions/new"
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95 no-underline"
                >
                    <Plus size={18} />
                    <span>新規取引</span>
                </Link>
            </div>

            <TransactionList
                initialTransactions={transactionsData.transactions}
                totalCount={transactionsData.totalCount}
                categories={formData.categories}
                accounts={formData.accounts}
            />
        </div>
    );
}
