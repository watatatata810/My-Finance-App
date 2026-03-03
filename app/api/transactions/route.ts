import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/lib/actions/api-keys';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * POST /api/transactions
 * 
 * クイック入力API。APIキー認証により外部から取引を登録できる。
 * 
 * Headers:
 *   Authorization: Bearer sk_xxxxx...
 * 
 * Body (JSON):
 *   {
 *     "type": "expense" | "income" | "transfer" | "adjustment",
 *     "amount": 1000,
 *     "date": "2026-03-03",           // optional, defaults to today
 *     "description": "ランチ",         // optional
 *     "place": "セブンイレブン",        // optional
 *     "category": "食費",              // optional, カテゴリ名で指定
 *     "from_account": "現金",          // optional, 口座名で指定
 *     "to_account": "楽天銀行",        // optional (transfer用), 口座名で指定
 *     "credit_card": "楽天カード",     // optional, カード名で指定
 *     "tags": ["tag1", "tag2"]         // optional
 *   }
 */
export async function POST(request: NextRequest) {
    try {
        // 1. APIキー認証
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization header is required. Use: Bearer sk_xxx...' },
                { status: 401 }
            );
        }

        const apiKey = authHeader.replace('Bearer ', '');
        const userId = await verifyApiKey(apiKey);

        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid or inactive API key' },
                { status: 401 }
            );
        }

        // 2. リクエストボディの読み取り
        const body = await request.json();

        // 3. type と amount のバリデーション
        const validTypes = ['expense', 'income', 'transfer', 'adjustment'];
        if (!body.type || !validTypes.includes(body.type)) {
            return NextResponse.json(
                { error: `"type" is required and must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
            return NextResponse.json(
                { error: '"amount" is required and must be a positive number' },
                { status: 400 }
            );
        }

        // 4. Supabase admin client で名前→ID解決
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            return NextResponse.json(
                { error: 'Server configuration error: missing service role key' },
                { status: 500 }
            );
        }

        const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

        // カテゴリ名 → ID
        let categoryId: string | null = null;
        if (body.category) {
            const { data: cat } = await supabase
                .from('categories')
                .select('id')
                .eq('user_id', userId)
                .eq('name', body.category)
                .single();
            categoryId = cat?.id || null;
        }

        // 口座名 → ID (from_account)
        let fromAccountId: string | null = null;
        if (body.from_account) {
            const { data: acc } = await supabase
                .from('accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('name', body.from_account)
                .single();
            fromAccountId = acc?.id || null;
        }

        // 口座名 → ID (to_account)
        let toAccountId: string | null = null;
        if (body.to_account) {
            const { data: acc } = await supabase
                .from('accounts')
                .select('id')
                .eq('user_id', userId)
                .eq('name', body.to_account)
                .single();
            toAccountId = acc?.id || null;
        }

        // カード名 → ID
        let creditCardId: string | null = null;
        if (body.credit_card) {
            const { data: card } = await supabase
                .from('credit_cards')
                .select('id')
                .eq('user_id', userId)
                .eq('name', body.credit_card)
                .single();
            creditCardId = card?.id || null;
        }

        // 5. 取引の登録
        const { data: txn, error: insertError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                type: body.type,
                amount: Math.round(body.amount),
                date: body.date || new Date().toISOString().split('T')[0],
                description: body.description || null,
                place: body.place || null,
                category_id: categoryId,
                from_account_id: fromAccountId,
                to_account_id: toAccountId,
                credit_card_id: creditCardId,
                credit_card_name: body.credit_card || null,
                source: 'api',
                tags: body.tags || [],
                is_auto_payment: false,
            })
            .select('id, type, amount, date, description')
            .single();

        if (insertError) {
            console.error('API Transaction Insert Error:', insertError);
            return NextResponse.json(
                { error: 'Failed to create transaction', details: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            transaction: txn
        }, { status: 201 });

    } catch (e: any) {
        console.error('API Error:', e);
        return NextResponse.json(
            { error: 'Internal server error', details: e.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/transactions
 * 簡単な使い方ガイドを返す
 */
export async function GET() {
    return NextResponse.json({
        message: '収支管理 クイック入力API',
        version: '1.0',
        usage: {
            method: 'POST',
            url: '/api/transactions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk_your_api_key_here'
            },
            body: {
                type: 'expense | income | transfer | adjustment (required)',
                amount: 'number (required, positive)',
                date: 'YYYY-MM-DD (optional, defaults to today)',
                description: 'string (optional)',
                place: 'string (optional)',
                category: 'string (optional, category name)',
                from_account: 'string (optional, account name)',
                to_account: 'string (optional, for transfers)',
                credit_card: 'string (optional, card name)',
                tags: 'string[] (optional)'
            }
        }
    });
}
