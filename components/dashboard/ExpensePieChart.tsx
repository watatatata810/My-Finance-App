'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ExpensePieChartProps {
    data: { name: string; value: number; color: string }[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
    if (data.length === 0) {
        return <p className="text-[var(--text-muted)] text-center py-8">データなし</p>;
    }

    return (
        <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
                {data.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                            <span className="text-[var(--text-secondary)]">{item.name}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
