'use server';

import { createClient } from '@/lib/supabase/server';
import { transactionSchema, TransactionInput } from '@/lib/validations/transaction';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function getTransactionFormData() {
    const supabase = await createClient();

    const [accountsRes, categoriesRes, creditCardsRes] = await Promise.all([
        supabase.from('accounts').select('id, name, type, color, icon').order('sort_order'),
        supabase.from('categories').select('id, name, type, color, icon').order('sort_order'),
        supabase.from('credit_cards').select('id, name').order('name')
    ]);

    if (accountsRes.error) throw accountsRes.error;
    if (categoriesRes.error) throw categoriesRes.error;
    if (creditCardsRes.error) throw creditCardsRes.error;

    return {
        accounts: accountsRes.data,
        categories: categoriesRes.data,
        creditCards: creditCardsRes.data
    };
}

export async function createTransaction(input: TransactionInput) {
    const supabase = await createClient();

    // Server-side validation
    const result = transactionSchema.safeParse(input);
    if (!result.success) {
        return { error: result.error.format() };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        date: result.data.date,
        type: result.data.type,
        amount: result.data.amount,
        category_id: result.data.categoryId || null,
        from_account_id: result.data.fromAccountId || null,
        to_account_id: result.data.toAccountId || null,
        description: result.data.description || null,
        place: result.data.place || null,
        credit_card_id: result.data.creditCardId || null,
        credit_card_name: result.data.creditCardName || null,
        tags: result.data.tags || [],
        is_auto_payment: result.data.isAutoPayment || false,
        source: 'manual'
    });

    if (error) {
        console.error('Insert Error:', error);
        return { error: 'データの保存に失敗しました' };
    }

    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/assets');

    return { success: true };
}

export async function getTransactions(params: {
    type?: string;
    search?: string;
    categoryId?: string;
    fromAccountId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}) {
    const supabase = await createClient();

    // RLSが効いているため、自動的にログインユーザーのデータのみ取得される
    let query = supabase
        .from('transactions')
        .select(`
            *,
            categories(name, color, icon),
            from_account:accounts!from_account_id(name, color, icon),
            to_account:accounts!to_account_id(name, color, icon)
        `, { count: 'exact' });

    if (params.type && params.type !== 'all') {
        query = query.eq('type', params.type);
    }
    if (params.categoryId && params.categoryId !== 'all') {
        query = query.eq('category_id', params.categoryId);
    }
    if (params.fromAccountId && params.fromAccountId !== 'all') {
        query = query.or(`from_account_id.eq.${params.fromAccountId},to_account_id.eq.${params.fromAccountId}`);
    }
    if (params.startDate) {
        query = query.gte('date', params.startDate);
    }
    if (params.endDate) {
        query = query.lte('date', params.endDate);
    }
    if (params.search) {
        query = query.or(`description.ilike.%${params.search}%,place.ilike.%${params.search}%`);
    }

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    query = query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
        console.error('getTransactions Error:', error);
        throw error;
    }

    return {
        transactions: data || [],
        totalCount: count || 0,
        nextOffset: (data?.length || 0) >= limit ? offset + limit : null
    };
}
