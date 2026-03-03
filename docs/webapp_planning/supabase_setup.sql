-- === 収支管理ウェブアプリ Supabase セットアップ SQL ===

-- 1. 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. テーブル作成

-- 口座・財布
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'credit', 'epay', 'investment', 'asset')),
    is_liquid BOOLEAN NOT NULL DEFAULT true,
    initial_balance BIGINT NOT NULL DEFAULT 0,
    color TEXT,
    icon TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

-- カテゴリ
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    color TEXT,
    icon TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

-- 取引記録
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer', 'adjustment')),
    amount BIGINT NOT NULL CHECK (amount >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    description TEXT,
    place TEXT,
    credit_card_name TEXT,
    source TEXT NOT NULL DEFAULT 'manual',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_auto_payment BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 固定費
CREATE TABLE IF NOT EXISTS public.auto_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount BIGINT, -- NULLは変動
    interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly')),
    billing_day INT CHECK (billing_day >= 0 AND billing_day <= 31),
    payment_method TEXT,
    from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    start_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 減価償却資産
CREATE TABLE IF NOT EXISTS public.depreciable_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    purchase_price BIGINT NOT NULL,
    purchase_date DATE NOT NULL,
    billing_day INT DEFAULT 1,
    total_installments INT NOT NULL CHECK (total_installments > 0),
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    remaining_count INT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 給与記録
CREATE TABLE IF NOT EXISTS public.salary_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    company_name TEXT NOT NULL,
    gross_amount BIGINT NOT NULL DEFAULT 0,
    net_amount BIGINT NOT NULL DEFAULT 0,
    social_insurance BIGINT NOT NULL DEFAULT 0,
    income_tax BIGINT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 予算設定
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'yearly')),
    amount BIGINT NOT NULL CHECK (amount >= 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- NULLは全体予算
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- APIキー管理
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Row Level Security (RLS) 設定

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depreciable_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ユーザー本人のデータのみアクセス可能にするポリシー
CREATE POLICY "Users can manage their own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own auto_payments" ON public.auto_payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own depreciable_assets" ON public.depreciable_assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own salary_records" ON public.salary_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own api_keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);

-- 4. 便利な View の作成

-- 口座別残高 View
CREATE OR REPLACE VIEW public.account_balances AS
SELECT 
    a.id as account_id,
    a.user_id,
    a.name as account_name,
    a.initial_balance + 
    COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.to_account_id = a.id AND t.type IN ('income', 'transfer', 'adjustment')), 0) -
    COALESCE((SELECT SUM(amount) FROM public.transactions t WHERE t.from_account_id = a.id AND t.type IN ('expense', 'transfer', 'adjustment')), 0) as balance
FROM public.accounts a;

-- 5. Updated At 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
