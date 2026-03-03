import { getCategories } from '@/lib/actions/categories';
import CategoryList from '@/components/settings/CategoryList';
import { Tags } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CategoriesSettingsPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/settings" className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <Tags size={28} className="text-green-500" />
                        カテゴリマスタ設定
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        収支の分類に使用するカテゴリを管理します
                    </p>
                </div>
            </div>

            <CategoryList initialCategories={categories} />
        </div>
    );
}
