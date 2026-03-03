'use client';

import { useState } from 'react';
import { createApiKey, deleteApiKey, toggleApiKeyStatus } from '@/lib/actions/api-keys';
import { Plus, Trash2, Key, Loader2, AlertCircle, Copy, CheckCheck, Shield, ShieldOff } from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    is_active: boolean;
    last_used_at: string | null;
    created_at: string;
}

export default function ApiKeyList({ initialKeys }: { initialKeys: ApiKey[] }) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // 新しく発行されたキーを一時的に表示する
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setNewlyCreatedKey(null);
        setIsSubmitting(true);

        const result = await createApiKey(name);

        if (result?.error) {
            setError(result.error);
        } else if (result?.rawKey) {
            setNewlyCreatedKey(result.rawKey);
            setName('');
        }
        setIsSubmitting(false);
    };

    const handleCopy = async () => {
        if (!newlyCreatedKey) return;
        await navigator.clipboard.writeText(newlyCreatedKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        setProcessingId(`toggle-${id}`);
        const result = await toggleApiKeyStatus(id, currentStatus);
        if (result?.error) setError(result.error);
        setProcessingId(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('このAPIキーを完全に削除しますか？\n使用中のアプリや連携が停止します。')) return;
        setError(null);
        setProcessingId(`delete-${id}`);
        const result = await deleteApiKey(id);
        if (result?.error) setError(result.error);
        setProcessingId(null);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '未使用';
        return new Date(dateStr).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={20} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* 新しく発行されたキーの表示 */}
            {newlyCreatedKey && (
                <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-3">
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCheck size={20} />
                        <p className="font-bold text-sm">APIキーが発行されました！</p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        ⚠️ このキーは二度と表示されません。必ずコピーして安全な場所に保管してください。
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-[var(--bg-primary)] p-3 rounded-xl text-xs font-mono break-all border border-[var(--border)]">
                            {newlyCreatedKey}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] rounded-xl transition-colors"
                            title="コピー"
                        >
                            {copied ? <CheckCheck size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            )}

            {/* 新規発行フォーム */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-muted)] mb-4">新しいAPIキーを発行</h2>
                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            <Key size={18} />
                        </span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="キーの名前 (例: iOSショートカット、Zapier)"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all font-medium"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--accent)]/20 whitespace-nowrap"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        <span>発行</span>
                    </button>
                </form>
            </div>

            {/* 使い方ガイド */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] shadow-sm">
                <h2 className="text-sm font-bold text-[var(--text-muted)] mb-3">📖 使い方</h2>
                <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border)] text-xs font-mono overflow-x-auto">
                    <p className="text-[var(--text-muted)] mb-2"># cURL で取引を追加する例:</p>
                    <p className="text-green-400">curl -X POST {typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}/api/transactions \</p>
                    <p className="text-green-400 pl-4">-H &quot;Content-Type: application/json&quot; \</p>
                    <p className="text-green-400 pl-4">-H &quot;Authorization: Bearer sk_xxxxx...&quot; \</p>
                    <p className="text-green-400 pl-4">{`-d '{"type":"expense","amount":500,"description":"コンビニ","category":"食費","from_account":"現金"}'`}</p>
                </div>
            </div>

            {/* APIキー一覧 */}
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                    <h2 className="text-sm font-bold text-[var(--text-muted)]">発行済みAPIキー ({initialKeys.length}件)</h2>
                </div>
                {initialKeys.length === 0 ? (
                    <div className="p-12 text-center text-[var(--text-muted)]">
                        APIキーがまだ発行されていません
                    </div>
                ) : (
                    <ul className="divide-y divide-[var(--border)]">
                        {initialKeys.map((key) => (
                            <li key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors group gap-3">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${key.is_active ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)]'}`}>
                                        {key.is_active ? <Shield size={18} /> : <ShieldOff size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${key.is_active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'}`}>{key.name}</span>
                                            <code className="text-[10px] bg-[var(--bg-secondary)] text-[var(--text-muted)] px-1.5 py-0.5 rounded font-mono">{key.key_prefix}...</code>
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-3">
                                            <span>最終利用: {formatDate(key.last_used_at)}</span>
                                            <span>作成: {formatDate(key.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:w-auto w-full justify-end">
                                    <button
                                        onClick={() => handleToggle(key.id, key.is_active)}
                                        disabled={processingId === `toggle-${key.id}`}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${key.is_active ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                    >
                                        {processingId === `toggle-${key.id}` ? <Loader2 size={14} className="animate-spin" /> : (key.is_active ? '無効化' : '有効化')}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(key.id)}
                                        disabled={processingId === `delete-${key.id}`}
                                        className="p-2 opacity-0 group-hover:opacity-100 sm:opacity-100 lg:opacity-0 hover:bg-red-500/10 text-red-500 rounded-xl transition-all disabled:opacity-50"
                                        title="削除"
                                    >
                                        {processingId === `delete-${key.id}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
