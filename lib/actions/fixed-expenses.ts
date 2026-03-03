'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getFixedExpenses() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('auto_payments')
        .select(`
            *,
            account:accounts(name, color, icon),
            category:categories(name, color, icon)
        `)
        .order('billing_day');

    if (error) throw error;
    return data;
}

export async function toggleFixedExpenseStatus(id: string, currentStatus: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('auto_payments')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/fixed-expenses');
    return { success: true };
}

export async function deleteFixedExpense(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('auto_payments')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/fixed-expenses');
    return { success: true };
}
