'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SalaryTrendChartProps {
    data: any[];
}

export function SalaryTrendChart({ data }: SalaryTrendChartProps) {
    const chartData = data.map(record => ({
        date: record.date.substring(0, 7), // YYYY-MM
        gross: record.gross_amount,
        net: record.net_amount,
        deductions: record.social_insurance + record.income_tax
    }));

    if (chartData.length === 0) return (
        <div className="h-64 flex items-center justify-center text-[var(--text-muted)] text-sm">
            表示するデータがありません
        </div>
    );

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                        tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`}
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
                        labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                    <Line
                        name="支給額 (額面)"
                        type="monotone"
                        dataKey="gross"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line
                        name="手取り額"
                        type="monotone"
                        dataKey="net"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#22c55e' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
