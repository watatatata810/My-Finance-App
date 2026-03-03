'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

/**
 * APIキー一覧を取得 (現在のユーザーのみ)
 */
export async function getApiKeys() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, is_active, last_used_at, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * 新しいAPIキーを発行する。
 * 生のAPIキーはこの1回のレスポンスでのみ返される（DBにはハッシュのみ保存）。
 */
export async function createApiKey(name: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!name || name.trim() === '') {
        return { error: 'APIキー名を入力してください' };
    }

    // ランダムなAPIキーを生成
    const rawKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 10); // 先頭10文字を保存（表示用）
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const { error } = await supabase
        .from('api_keys')
        .insert({
            user_id: user.id,
            name: name.trim(),
            key_hash: keyHash,
            key_prefix: keyPrefix,
            is_active: true,
        });

    if (error) {
        console.error('Insert Error:', error);
        return { error: 'APIキーの保存に失敗しました' };
    }

    revalidatePath('/settings/api-keys');
    return { success: true, rawKey }; // 初回のみ、生のキーを返す
}

/**
 * APIキーの有効/無効を切り替え
 */
export async function toggleApiKeyStatus(id: string, currentStatus: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error('Update Error:', error);
        return { error: 'APIキーの更新に失敗しました' };
    }

    revalidatePath('/settings/api-keys');
    return { success: true };
}

/**
 * APIキーを削除する
 */
export async function deleteApiKey(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete Error:', error);
        return { error: 'APIキーの削除に失敗しました' };
    }

    revalidatePath('/settings/api-keys');
    return { success: true };
}

/**
 * APIキーの認証（API Routeから呼ばれる）
 * 有効なキーであれば user_id を返す。
 */
export async function verifyApiKey(rawKey: string): Promise<string | null> {
    // admin系のクライアントではなく、service roleを使わず、
    // RLSバイパスのため直接ハッシュで検索する必要がある。
    // ここではサーバーアクション内で supabase admin を使う想定。
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        // service role がない場合は通常のクライアントで試みる（RLSがあるので制限あり）
        console.error('SUPABASE_SERVICE_ROLE_KEY is not set. API key verification may fail with RLS.');
        return null;
    }

    const adminClient = createAdminClient(supabaseUrl, supabaseServiceKey);

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const { data, error } = await adminClient
        .from('api_keys')
        .select('user_id, id')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return null;
    }

    // last_used_at を更新
    await adminClient
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);

    return data.user_id;
}
