import { login, signup } from './actions';

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message?: string; error?: string };
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">ShushiKanri</h1>
                    <p className="text-gray-400">収支管理システム v1.2</p>
                </div>

                <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#333] shadow-2xl">
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-300">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full bg-[#2a2a2a] border-[#333] text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" title="password" className="text-sm font-medium text-gray-300">
                                パスワード
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-[#2a2a2a] border-[#333] text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>

                        {searchParams?.error && (
                            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {searchParams.error}
                            </div>
                        )}

                        {searchParams?.message && (
                            <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                                {searchParams.message}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button
                                formAction={login}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                            >
                                ログイン
                            </button>
                            <button
                                formAction={signup}
                                className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#333] font-medium py-2 rounded-lg transition-all text-sm"
                            >
                                新規登録（メール確認が必要です）
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-600 mt-8">
                    &copy; 2026 ShushiKanri Team. All rights reserved.
                </p>
            </div>
        </div>
    );
}
