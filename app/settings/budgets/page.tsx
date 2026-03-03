import { getBudgets } from '@/lib/actions/budgets';
import { getCategories } from '@/lib/actions/categories';
import BudgetList from '@/components/settings/BudgetList';
import { Target } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function BudgetsSettingsPage() {
    const [budgets, categories] = await Promise.all([
        getBudgets(),
        getCategories()
    ]);

    // 支出または共通のカテゴリのみ予算対象にする
    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/settings" className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <Target size={28} className="text-orange-500" />
                        予算マスタ設定
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        月別や年別の目標予算を設定し、支出をコントロールします
                    </p>
                </div>
            </div>

            <BudgetList initialBudgets={budgets} categories={expenseCategories} />
        </div>
    );
}
