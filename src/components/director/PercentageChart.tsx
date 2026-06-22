'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b', '#06b6d4', '#f43f5e'];

interface PercentageChartProps {
    data: any[];
    title: string;
    type?: 'pie' | 'bar';
    dataKey?: string;
}

export function PercentageChart({ data, title, type = 'pie', dataKey = 'value' }: PercentageChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <span className="material-symbols-rounded text-3xl mb-2">analytics</span>
                <p className="text-sm font-bold">Sin datos</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">{title}</h4>
            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    {type === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey={dataKey}
                                nameKey="name"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percentage}%)`, name]}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                itemStyle={{ fontWeight: 700 }}
                            />
                            <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '10px', fontSize: '10px', fontWeight: 600, color: '#475569' }}
                            />
                        </PieChart>
                    ) : (
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                            <Tooltip 
                                formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percentage}%)`, 'Cantidad']}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                                cursor={{ fill: '#f8fafc' }}
                            />
                            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
