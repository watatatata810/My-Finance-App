-- === 初期マスタデータ挿入 SQL (修正版) ===
-- 手順:
-- 1. Supabase の Authentication > Users 画面を開きます。
-- 2. 自身のユーザーの「User ID (UUID)」をコピーします。
-- 3. 下の 'SET_YOUR_USER_ID_HERE' をコピーした UUID に書き換えて実行してください。

DO $$ 
DECLARE 
    uid UUID := 'c708c711-42e2-4692-9104-38dcaeb96fb3'; -- ここにコピーしたUUIDを貼り付けてください
BEGIN
    -- 1. 口座 (Accounts)
    INSERT INTO public.accounts (user_id, name, type, is_liquid, initial_balance, color, icon, sort_order) VALUES
    (uid, '現金', 'cash', true, 9870, '#22c55e', 'Wallet', 1),
    (uid, '楽天銀行', 'bank', true, 16823, '#bf0000', 'Building2', 2),
    (uid, 'ゆうちょ', 'bank', true, 330396, '#0066cc', 'Building2', 3),
    (uid, '三井住友銀行', 'bank', true, 185366, '#006633', 'Building2', 4),
    (uid, '住信SBI', 'bank', true, 969597, '#003399', 'Building2', 5),
    (uid, 'PayPay', 'epay', true, 14233, '#ff0033', 'Smartphone', 6),
    (uid, 'PASMO', 'epay', true, 10572, '#e91e8c', 'CreditCard', 7),
    (uid, 'メルペイ', 'epay', true, 27774, '#4dc4ff', 'Smartphone', 8),
    (uid, 'クレジットカード', 'credit', true, -1313386, '#6b7280', 'CreditCard', 9),
    (uid, 'SBI積立NISA', 'investment', false, 997539, '#8b5cf6', 'TrendingUp', 10),
    (uid, 'SBI証券', 'investment', false, 250000, '#7c3aed', 'TrendingUp', 11),
    (uid, '償却資産', 'asset', false, 510381, '#f59e0b', 'Package', 12)
    ON CONFLICT (user_id, name) DO NOTHING;

    -- 2. カテゴリ (Categories)
    INSERT INTO public.categories (user_id, name, type, color, icon, sort_order) VALUES
    (uid, '食品', 'expense', '#ef4444', 'UtensilsCrossed', 1),
    (uid, '間食', 'expense', '#f97316', 'Cookie', 2),
    (uid, '趣味・娯楽', 'expense', '#8b5cf6', 'Gamepad2', 3),
    (uid, '交通費', 'expense', '#3b82f6', 'Train', 4),
    (uid, '固定費', 'expense', '#6b7280', 'Home', 5),
    (uid, 'サブスク', 'expense', '#ec4899', 'RefreshCw', 6),
    (uid, '日用品', 'expense', '#14b8a6', 'ShoppingBag', 7),
    (uid, '便利アイテム', 'expense', '#06b6d4', 'Lightbulb', 8),
    (uid, '道具類', 'expense', '#a855f7', 'Wrench', 9),
    (uid, '美容費', 'expense', '#ec4899', 'Sparkles', 10),
    (uid, '被服費', 'expense', '#f43f5e', 'Shirt', 11),
    (uid, '医療費', 'expense', '#10b981', 'Heart', 12),
    (uid, '通信費', 'expense', '#2563eb', 'Wifi', 13),
    (uid, '交際費', 'expense', '#d946ef', 'Users', 14),
    (uid, '減価償却', 'expense', '#78716c', 'Calculator', 15),
    (uid, '雑費', 'expense', '#9ca3af', 'MoreHorizontal', 16),
    (uid, '特別費', 'expense', '#eab308', 'Star', 17),
    (uid, '給与', 'income', '#22c55e', 'Banknote', 18),
    (uid, 'フリーランス', 'income', '#10b981', 'Briefcase', 19),
    (uid, 'その他収入', 'income', '#84cc16', 'Plus', 20)
    ON CONFLICT (user_id, name) DO NOTHING;

END $$;
