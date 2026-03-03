import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 環境変数が不足している場合はミドルウェアをスキップ（デプロイ初期化時のエラー回避）
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Middleware: Missing Supabase environment variables');
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (
            !user &&
            !request.nextUrl.pathname.startsWith('/login') &&
            !request.nextUrl.pathname.startsWith('/auth')
        ) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        return supabaseResponse;
    } catch (e) {
        console.error('Middleware Error:', e);
        // エラー時はフェイルセーフとしてリクエストをそのまま通す
        return NextResponse.next({ request });
    }
}
