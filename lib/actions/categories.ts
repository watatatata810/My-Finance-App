'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type')
        .order('sort_order');

    if (error) throw error;
    return data;
}

export async function createCategory(input: {
    name: string;
    type: 'expense' | 'income' | 'both';
    color?: string;
    icon?: string;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!input.name || input.name.trim() === '') {
        return { error: 'カテゴリ名を入力してください' };
    }

    // sort_orderの最大値を取得して、末尾に追加する
    const { data: maxOrderData } = await supabase
        .from('categories')
        .select('sort_order')
        .eq('type', input.type)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

    const sort_order = maxOrderData ? maxOrderData.sort_order + 1 : 1;

    const { error } = await supabase
        .from('categories')
        .insert({
            user_id: user.id,
            name: input.name.trim(),
            type: input.type,
            color: input.color || null,
            icon: input.icon || null,
            sort_order
        });

    if (error) {
        if (error.code === '23505') { // unique violation
            return { error: 'このカテゴリ名は既に登録されています' };
        }
        console.error('Insert Error:', error);
        return { error: 'カテゴリの保存に失敗しました' };
    }

    revalidatePath('/settings/categories');
    revalidatePath('/transactions/new');
    return { success: true };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') { // foreign key violation
            return { error: 'このカテゴリは取引記録や予算などで使用されているため削除できません' };
        }
        console.error('Delete Error:', error);
        return { error: 'カテゴリの削除に失敗しました' };
    }

    revalidatePath('/settings/categories');
    revalidatePath('/transactions/new');
    return { success: true };
}
