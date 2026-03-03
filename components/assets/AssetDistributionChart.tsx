'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AssetDistributionChartProps {
    accounts: any[];
}

export function AssetDistributionChart({ accounts }: AssetDistributionChartProps) {
    const chartData = accounts
        .filter(a => a.balance !== 0)
        .sort((a, b) => b.balance - a.balance)
        .map(a => ({ name: a.name, value: a.balance, color: a.color }));

    if (chartData.length === 0) return (
        <div className="h-64 flex items-center justify-center text-[var(--text-muted)] text-sm">
            表示するデータがありません
        </div>
    );

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis
                        type="number"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 'bold' }}
                        width={100}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(v) => formatCurrency(Number(v))}
                        contentStyle={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                        cursor={{ fill: 'var(--bg-hover)', radius: 8 }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.value < 0 ? '#ef4444' : entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
