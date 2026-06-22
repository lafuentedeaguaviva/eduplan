'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DistributionChartProps {
    data: any[];
    colors?: string[];
    nameKey?: string;
    dataKey?: string;
}

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

export function DistributionChart({ 
    data, 
    colors = DEFAULT_COLORS,
    nameKey = 'name',
    dataKey = 'value'
}: DistributionChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 700 }}
                />
                <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
