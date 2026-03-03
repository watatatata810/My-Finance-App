'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCreditCards() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

export async function createCreditCard(name: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    if (!name || name.trim() === '') {
        return { error: 'カード名を入力してください' };
    }

    const { error } = await supabase
        .from('credit_cards')
        .insert({
            user_id: user.id,
            name: name.trim()
        });

    if (error) {
        if (error.code === '23505') { // unique violation
            return { error: 'このカード名は既に登録されています' };
        }
        console.error('Insert Error:', error);
        return { error: 'カードの保存に失敗しました' };
    }

    revalidatePath('/settings/credit-cards');
    revalidatePath('/transactions/new');
    return { success: true };
}

export async function deleteCreditCard(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') { // foreign key violation
            return { error: 'このカードは取引で使用されているため削除できません' };
        }
        throw error;
    }

    revalidatePath('/settings/credit-cards');
    revalidatePath('/transactions/new');
    return { success: true };
}
