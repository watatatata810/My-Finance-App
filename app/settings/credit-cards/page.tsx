import { getCreditCards } from '@/lib/actions/credit-cards';
import CreditCardList from '@/components/settings/CreditCardList';
import { CreditCard as CardIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CreditCardsSettingsPage() {
    const cards = await getCreditCards();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <CardIcon size={28} className="text-[var(--accent)]" />
                        カードマスタ設定
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        取引入力で使用するクレジットカードの一覧を管理します
                    </p>
                </div>
            </div>

            <CreditCardList initialCards={cards} />
        </div>
    );
}
