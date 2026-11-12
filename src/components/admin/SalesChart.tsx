'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Table, BarChart2 } from 'lucide-react';
import type { SalesDataPoint } from '@/lib/repo/types';
import styles from '@/app/admin/admin-dashboard.module.css';

interface SalesChartProps {
  data: SalesDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const [metricType, setMetricType] = useState<'revenue' | 'orders'>('revenue');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const formatNgnCompact = (kobo: number) => {
    const naira = kobo / 100;
    if (naira >= 1000000) return `₦${(naira / 1000000).toFixed(1)}M`;
    if (naira >= 1000) return `₦${Math.round(naira / 1000)}k`;
    return `₦${naira}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as SalesDataPoint;
      return (
        <div style={{ backgroundColor: '#0A0A0A', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #27272A', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
          <div style={{ fontWeight: 700, marginBottom: '2px' }}>{point.label} 2026</div>
          <div style={{ color: '#38BDF8', fontWeight: 800 }}>
            ₦{(point.revenueKobo / 100).toLocaleString('en-NG')}
          </div>
          <div style={{ fontSize: '11px', color: '#A1A1AA' }}>
            {point.ordersCount} confirmed orders
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.card} style={{ marginBottom: '24px' }}>
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Sales Performance</h3>
          <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>12-month commercial revenue trajectory</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Revenue / Orders Pill Toggle */}
          <div style={{ display: 'inline-flex', background: 'var(--admin-canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
            <button
              onClick={() => setMetricType('revenue')}
              style={{
                border: 'none',
                background: metricType === 'revenue' ? 'var(--admin-surface)' : 'transparent',
                color: metricType === 'revenue' ? 'var(--admin-text)' : 'var(--admin-muted)',
                fontWeight: metricType === 'revenue' ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Revenue (₦)
            </button>
            <button
              onClick={() => setMetricType('orders')}
              style={{
                border: 'none',
                background: metricType === 'orders' ? 'var(--admin-surface)' : 'transparent',
                color: metricType === 'orders' ? 'var(--admin-text)' : 'var(--admin-muted)',
                fontWeight: metricType === 'orders' ? 600 : 500,
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Orders Count
            </button>
          </div>

          {/* Chart / Table View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className={styles.btnSecondary}
            style={{ padding: '4px 10px', height: '28px', fontSize: '12px' }}
            title={viewMode === 'chart' ? 'View as accessible table' : 'View chart visualization'}
          >
            {viewMode === 'chart' ? <Table size={14} /> : <BarChart2 size={14} />}
            <span>{viewMode === 'chart' ? 'Table' : 'Chart'}</span>
          </button>
        </div>
      </div>

      {/* Visual Render */}
      {viewMode === 'chart' ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={{ stroke: 'var(--admin-border)' }} />
              <YAxis
                stroke="var(--admin-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => metricType === 'revenue' ? formatNgnCompact(v) : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={metricType === 'revenue' ? 'revenueKobo' : 'ordersCount'} radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isHighlight ? '#0EA5E9' : 'var(--admin-ink)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Accessible Table View */
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Period</th>
                <th>Confirmed Orders</th>
                <th>Gross Revenue (₦)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.date}>
                  <td><strong>{p.label} 2026</strong></td>
                  <td className={styles.tabular}>{p.ordersCount}</td>
                  <td className={styles.tabular} style={{ fontWeight: 700 }}>
                    ₦{(p.revenueKobo / 100).toLocaleString('en-NG')}
                  </td>
                  <td>
                    {p.isHighlight ? (
                      <span className={styles.badge} style={{ backgroundColor: 'var(--admin-sky-100)', color: 'var(--admin-sky-700)' }}>
                        Peak Capsule Drop
                      </span>
                    ) : 'Standard'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
