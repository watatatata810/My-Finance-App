INSERT INTO public.auto_payments (user_id, name, amount, interval, billing_day, from_account_id, category_id, is_active)
VALUES 
('82f9d98e-c5f2-4cff-a28f-d2a332983443', 'Netflix', 1490, 'monthly', 1, (SELECT id FROM public.accounts WHERE name='楽天銀行' LIMIT 1), (SELECT id FROM public.categories WHERE name='娯楽' LIMIT 1), true),
('82f9d98e-c5f2-4cff-a28f-d2a332983443', '家賃', 85000, 'monthly', 27, (SELECT id FROM public.accounts WHERE name='楽天銀行' LIMIT 1), (SELECT id FROM public.categories WHERE name='住居' LIMIT 1), true),
('82f9d98e-c5f2-4cff-a28f-d2a332983443', 'ジム会費', 7700, 'monthly', 10, (SELECT id FROM public.accounts WHERE name='三井住友銀行' LIMIT 1), (SELECT id FROM public.categories WHERE name='自己研鑽' LIMIT 1), false);
