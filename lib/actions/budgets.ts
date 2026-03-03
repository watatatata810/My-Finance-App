'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getBudgets() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('budgets')
        .select(`
            *,
            categories (
                id,
                name,
                color,
                icon
            )
        `)
        .order('period_type')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createBudget(input: {
    period_type: 'monthly' | 'yearly';
    amount: number;
    category_id?: string | null;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (input.amount <= 0) {
        return { error: '予算は1円以上で設定してください' };
    }

    // 既存の同条件（期間＆同じカテゴリ）予算がある場合は重複を防ぐロジックがあっても良いが、
    // ここではシンプルに Insert する (UI側で警告するか、Updateするかは要件次第)
    // 今回はすでにある場合はエラーにする

    let query = supabase
        .from('budgets')
        .select('id')
        .eq('period_type', input.period_type);

    if (input.category_id) {
        query = query.eq('category_id', input.category_id);
    } else {
        query = query.is('category_id', null);
    }

    const { data: existing } = await query;
    if (existing && existing.length > 0) {
        return { error: 'この条件の予算は既に設定されています' };
    }

    const { error } = await supabase
        .from('budgets')
        .insert({
            user_id: user.id,
            period_type: input.period_type,
            amount: input.amount,
            category_id: input.category_id || null,
            is_active: true
        });

    if (error) {
        console.error('Insert Error:', error);
        return { error: '予算の保存に失敗しました' };
    }

    revalidatePath('/settings/budgets');
    revalidatePath('/'); // ダッシュボードの再検証
    return { success: true };
}

export async function toggleBudgetStatus(id: string, currentStatus: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('budgets')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error('Update Error:', error);
        return { error: 'ステータスの更新に失敗しました' };
    }

    revalidatePath('/settings/budgets');
    revalidatePath('/');
    return { success: true };
}

export async function deleteBudget(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Delete Error:', error);
        return { error: '予算の削除に失敗しました' };
    }

    revalidatePath('/settings/budgets');
    revalidatePath('/');
    return { success: true };
}
