'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getAccounts() {
    const supabase = await createClient();

    // accounts と account_balances を別々に取得してマージ
    const [accountsRes, balancesRes] = await Promise.all([
        supabase.from('accounts').select('*').order('sort_order'),
        supabase.from('account_balances').select('account_id, balance')
    ]);

    if (accountsRes.error) throw accountsRes.error;
    if (balancesRes.error) throw balancesRes.error;

    const balanceMap = new Map(
        balancesRes.data.map(b => [b.account_id, b.balance])
    );

    return accountsRes.data.map(account => ({
        ...account,
        balance: balanceMap.get(account.id) ?? account.initial_balance
    }));
}

export async function createAccount(input: {
    name: string;
    type: 'bank' | 'cash' | 'credit' | 'epay' | 'investment' | 'asset';
    is_liquid: boolean;
    initial_balance: number;
    color?: string;
    icon?: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!input.name || input.name.trim() === '') {
        return { error: '口座名を入力してください' };
    }

    // sort_orderの最大値を取得して、末尾に追加する
    const { data: maxOrderData } = await supabase
        .from('accounts')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

    const sort_order = maxOrderData ? maxOrderData.sort_order + 1 : 1;

    const { error } = await supabase
        .from('accounts')
        .insert({
            user_id: user.id,
            name: input.name.trim(),
            type: input.type,
            is_liquid: input.is_liquid,
            initial_balance: input.initial_balance,
            color: input.color || null,
            icon: input.icon || null,
            sort_order
        });

    if (error) {
        if (error.code === '23505') { // unique violation
            return { error: 'この口座名は既に登録されています' };
        }
        console.error('Insert Error:', error);
        return { error: '口座の保存に失敗しました' };
    }

    revalidatePath('/settings/accounts');
    revalidatePath('/transactions/new');
    revalidatePath('/assets');
    return { success: true };
}

export async function deleteAccount(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') { // foreign key violation
            return { error: 'この口座は取引、固定費、減価償却などに使用されているため削除できません' };
        }
        console.error('Delete Error:', error);
        return { error: '口座の削除に失敗しました' };
    }

    revalidatePath('/settings/accounts');
    revalidatePath('/transactions/new');
    revalidatePath('/assets');
    return { success: true };
}
