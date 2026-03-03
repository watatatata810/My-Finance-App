-- Phase 5: クレジットカードマスタの作成

-- 1. credit_cards テーブルの作成
CREATE TABLE IF NOT EXISTS public.credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

-- 2. Row Level Security (RLS) 設定
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own credit_cards" 
ON public.credit_cards FOR ALL USING (auth.uid() = user_id);

-- 3. transactions テーブルへの relation 追加
-- 既存の credit_card_name は削除せず、新しい credit_card_id を追加して段階的に移行します
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES public.credit_cards(id) ON DELETE SET NULL;

-- 4. 既存データの移行 (オプション: 既存のテキストからマスタへ昇格)
-- すでに登録済みの transactions の credit_card_name を集めて credit_cards に自動登録し、その後 transactions.credit_card_id を更新します
INSERT INTO public.credit_cards (user_id, name)
SELECT DISTINCT user_id, credit_card_name 
FROM public.transactions 
WHERE credit_card_name IS NOT NULL AND credit_card_name != ''
ON CONFLICT (user_id, name) DO NOTHING;

UPDATE public.transactions t
SET credit_card_id = c.id
FROM public.credit_cards c
WHERE t.credit_card_name = c.name AND t.user_id = c.user_id;

-- （将来的に完全に移行できたら、 ALTER TABLE transactions DROP COLUMN credit_card_name; を実行します）
