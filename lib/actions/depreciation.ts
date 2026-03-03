'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getDepreciableAssets() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('depreciable_assets')
        .select(`
            *,
            account:accounts(name, color, icon)
        `)
        .order('purchase_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function deleteAsset(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('depreciable_assets')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/depreciation');
    return { success: true };
}
