import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark, Tags, Target, Key, ChevronRight } from 'lucide-react';

const settingsItems = [
    {
        href: '/settings/accounts',
        label: '口座マスタ設定',
        description: '銀行口座、現金、電子マネーなどの管理',
        icon: Landmark,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        href: '/settings/categories',
        label: 'カテゴリマスタ設定',
        description: '収入・支出のカテゴリ登録と分類',
        icon: Tags,
        color: 'text-green-500',
        bg: 'bg-green-500/10'
    },
    {
        href: '/settings/credit-cards',
        label: 'カード名マスタ設定',
        description: '取引入力で使用するクレジットカード一覧',
        icon: CreditCard,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        href: '/settings/budgets',
        label: '予算マスタ設定',
        description: '月別・年別、カテゴリ別の目標予算',
        icon: Target,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10'
    },
    {
        href: '/settings/api-keys',
        label: 'APIキー管理',
        description: '外部連携用のAPIキー発行と管理',
        icon: Key,
        color: 'text-cyan-500',
        bg: 'bg-cyan-500/10'
    }
];

export default function SettingsHubPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">設定・マスタ管理</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        アプリケーションの基本となるマスタデータを管理します
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md transition-all flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg}`}>
                                <item.icon size={24} className={item.color} />
                            </div>
                            <div>
                                <h2 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                                    {item.label}
                                </h2>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                        <div className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all">
                            <ChevronRight size={20} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
