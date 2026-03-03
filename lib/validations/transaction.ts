import { z } from 'zod';

const transactionTypeSchema = z.enum(['expense', 'income', 'transfer', 'adjustment']);

export const transactionSchema = z.object({
    date: z.string().min(1, '日付を入力してください'),
    type: transactionTypeSchema,
    amount: z.number().positive('金額は1円以上で入力してください'),
    categoryId: z.string().nullable().optional(),
    fromAccountId: z.string().nullable().optional(),
    toAccountId: z.string().nullable().optional(),
    description: z.string().max(200, '内容は200文字以内で入力してください').nullable().optional(),
    place: z.string().max(100, '場所は100文字以内で入力してください').nullable().optional(),
    creditCardId: z.string().nullable().optional(),
    creditCardName: z.string().max(50, 'カード名は50文字以内で入力してください').nullable().optional(), // 互換性のために残す
    tags: z.array(z.string()).default([]),
    isAutoPayment: z.boolean().default(false),
}).refine((data) => {
    if (data.type === 'expense') return !!data.fromAccountId;
    if (data.type === 'income') return !!data.toAccountId;
    if (data.type === 'transfer') return !!data.fromAccountId && !!data.toAccountId && data.fromAccountId !== data.toAccountId;
    if (data.type === 'adjustment') return (!!data.fromAccountId || !!data.toAccountId) && !(data.fromAccountId && data.toAccountId);
    return true;
}, {
    message: '口座の選択が正しくありません',
    path: ['fromAccountId'],
});

export type TransactionInput = z.infer<typeof transactionSchema>;
