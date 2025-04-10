'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    } from 'recharts'

    interface MonthlySalesChartProps {
    data: { month: string; sales: number }[]
    }

    export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
    return (
        <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
            <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" />
            <XAxis dataKey="month" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Bar dataKey="sales" fill="#c084fc" radius={[10, 10, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>
    )
}
