import { getAccounts } from '@/lib/actions/accounts';
import AccountList from '@/components/settings/AccountList';
import { Landmark } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AccountsSettingsPage() {
    const accounts = await getAccounts();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/settings" className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <Landmark size={28} className="text-blue-500" />
                        口座マスタ設定
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        取引の入力や資産の管理に使用する口座（カテゴリ）を登録します
                    </p>
                </div>
            </div>

            <AccountList initialAccounts={accounts} />
        </div>
    );
}
