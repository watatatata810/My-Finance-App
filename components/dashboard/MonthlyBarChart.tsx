'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { MonthlyData } from '@/lib/types';

interface MonthlyBarChartProps {
    data: MonthlyData[];
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 }} />
                    <Legend />
                    <Bar dataKey="income" name="収入" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
