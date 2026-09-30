"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { reportsPageData } from '@/data/reportsData';

export default function ExpenseBreakdown() {
  const { expenses, totalExpensesText } = reportsPageData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[320px]">
      <h3 className="text-[16px] font-bold text-[#102A20] mb-3 shrink-0">Expense Breakdown</h3>
      
      <div className="flex-1 flex items-center justify-between min-h-0">
        
        {/* Donut Chart */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenses}
                innerRadius="68%"
                outerRadius="92%"
                paddingAngle={3}
                dataKey="amount"
                stroke="none"
              >
                {expenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [`₹ ${Number(value).toLocaleString()} (${props.payload.percentage}%)`, props.payload.category]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E1E7E3', boxShadow: '0 4px 12px rgba(20,60,40,0.08)', fontSize: '12px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[18px] sm:text-[20px] font-bold text-[#102A20] leading-tight tracking-tight">
              {totalExpensesText}
            </span>
            <span className="text-[11px] font-medium text-[#52645D] mt-0.5">
              Total Expenses
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 pl-4 flex flex-col gap-2 justify-center">
          {expenses.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-[#102A20] truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-[#102A20] text-[11px]">{item.amountText}</span>
                <span className="font-medium text-[#52645D] text-[11px] w-8 text-right">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
