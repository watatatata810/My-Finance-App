'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getSalaryRecords() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('salary_records')
        .select('*')
        .order('date', { ascending: true });

    if (error) throw error;
    return data;
}

export async function deleteSalaryRecord(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('salary_records')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/salary');
    return { success: true };
}
