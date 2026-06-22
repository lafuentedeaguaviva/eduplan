'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GrowthChartProps {
    data: any[];
    colorUsuarios?: string;
    colorPdcs?: string;
}

export function GrowthChart({ data, colorUsuarios = '#6366f1', colorPdcs = '#ec4899' }: GrowthChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorUsuarios} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colorUsuarios} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPdcs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorPdcs} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colorPdcs} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }} />
                <Area 
                    type="monotone" 
                    dataKey="usuarios" 
                    name="Usuarios Activos"
                    stroke={colorUsuarios} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUsuarios)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                    type="monotone" 
                    dataKey="pdcs" 
                    name="PDCs Generados"
                    stroke={colorPdcs} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPdcs)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
