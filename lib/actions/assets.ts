'use server';

import { createClient } from '@/lib/supabase/server';
import { Account } from '@/lib/types';

export async function getAssetData() {
    const supabase = await createClient();

    // 1. 口座残高の取得 (Viewを使用)
    const { data: balances, error: balanceError } = await supabase
        .from('account_balances')
        .select('*');

    if (balanceError) throw balanceError;

    // 2. 口座マスタの取得 (メタデータ)
    const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('sort_order');

    if (accountsError) throw accountsError;

    // 口座情報に残高を統合
    const accounts: Account[] = accountsData.map(acc => ({
        id: acc.id,
        userId: acc.user_id,
        name: acc.name,
        type: acc.type,
        isLiquid: acc.is_liquid,
        initialBalance: Number(acc.initial_balance),
        balance: Number(balances.find(b => b.account_id === acc.id)?.balance || acc.initial_balance),
        color: acc.color,
        icon: acc.icon,
        sortOrder: acc.sort_order
    }));

    return { accounts };
}
