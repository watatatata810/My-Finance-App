import { getApiKeys } from '@/lib/actions/api-keys';
import ApiKeyList from '@/components/settings/ApiKeyList';
import { Key } from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ApiKeysSettingsPage() {
    const keys = await getApiKeys();

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/settings" className="p-2 hover:bg-[var(--bg-hover)] rounded-xl transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <Key size={28} className="text-[var(--accent)]" />
                        APIキー管理
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">
                        外部サービス（iOSショートカット等）から取引を登録するためのAPIキーを管理します
                    </p>
                </div>
            </div>

            <ApiKeyList initialKeys={keys} />
        </div>
    );
}
