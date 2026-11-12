'use client';

import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Mail,
  BarChart3,
  Settings,
  Plus,
  Truck,
  Moon,
  Sun,
  AlertTriangle,
  FileText,
  Search,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { AdminOrder, AdminCustomer, AdminProduct } from '@/lib/repo/types';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string) => void;
  orders: AdminOrder[];
  products: AdminProduct[];
  customers: AdminCustomer[];
  onSelectOrder: (order: AdminOrder) => void;
  onSelectCustomer: (customer: AdminCustomer) => void;
  onOpenNewProduct: () => void;
  onOpenEmailComposer: () => void;
}

export default function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  orders,
  products,
  customers,
  onSelectOrder,
  onSelectCustomer,
  onOpenNewProduct,
  onOpenEmailComposer,
}: CommandPaletteProps) {
  const { theme, toggleTheme } = useTheme();

  // Keyboard shortcut listener for ⌘K / Ctrl+K and ?
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 10, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px 16px 20px 16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--admin-surface, #FFFFFF)',
          borderRadius: '16px',
          border: '1px solid var(--admin-border, #E5E7EB)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '480px',
        }}
      >
        <Command label="Global Command Menu">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 18px',
              borderBottom: '1px solid var(--admin-border, #E5E7EB)',
              gap: '10px',
            }}
          >
            <Search size={18} style={{ color: 'var(--admin-muted, #71717A)' }} />
            <Command.Input
              autoFocus
              placeholder="Type a command, order #, product, or customer name…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: 'var(--admin-text, #0A0A0A)',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--admin-muted, #71717A)', fontWeight: 600 }}>
              ESC to close
            </span>
          </div>

          <Command.List
            style={{
              padding: '8px',
              overflowY: 'auto',
              maxHeight: '380px',
            }}
          >
            <Command.Empty style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--admin-muted, #71717A)' }}>
              No matching commands or entities found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="QUICK ACTIONS" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted, #71717A)', padding: '6px 10px' }}>
              <Command.Item
                onSelect={() => { onOpenNewProduct(); onOpenChange(false); }}
                style={itemStyle}
              >
                <Plus size={16} />
                <span>Add new product</span>
                <span style={hintStyle}>N</span>
              </Command.Item>
              <Command.Item
                onSelect={() => { onOpenEmailComposer(); onOpenChange(false); }}
                style={itemStyle}
              >
                <Mail size={16} />
                <span>Compose personalized email</span>
              </Command.Item>
              <Command.Item
                onSelect={() => { toggleTheme(); onOpenChange(false); }}
                style={itemStyle}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Toggle theme ({theme === 'dark' ? 'Light' : 'Dark'})</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading="NAVIGATION" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted, #71717A)', padding: '6px 10px' }}>
              <Command.Item onSelect={() => { onNavigate('dashboard'); onOpenChange(false); }} style={itemStyle}>
                <LayoutDashboard size={16} />
                <span>Go to Dashboard</span>
                <span style={hintStyle}>G then D</span>
              </Command.Item>
              <Command.Item onSelect={() => { onNavigate('orders'); onOpenChange(false); }} style={itemStyle}>
                <ShoppingBag size={16} />
                <span>Go to Orders</span>
                <span style={hintStyle}>G then O</span>
              </Command.Item>
              <Command.Item onSelect={() => { onNavigate('products'); onOpenChange(false); }} style={itemStyle}>
                <Package size={16} />
                <span>Go to Products</span>
                <span style={hintStyle}>G then P</span>
              </Command.Item>
              <Command.Item onSelect={() => { onNavigate('customers'); onOpenChange(false); }} style={itemStyle}>
                <Users size={16} />
                <span>Go to Customers</span>
                <span style={hintStyle}>G then C</span>
              </Command.Item>
              <Command.Item onSelect={() => { onNavigate('email'); onOpenChange(false); }} style={itemStyle}>
                <Mail size={16} />
                <span>Go to Email & Follow-ups</span>
              </Command.Item>
              <Command.Item onSelect={() => { onNavigate('analytics'); onOpenChange(false); }} style={itemStyle}>
                <BarChart3 size={16} />
                <span>Go to Analytics</span>
              </Command.Item>
              <Command.Item onSelect={() => { onNavigate('settings'); onOpenChange(false); }} style={itemStyle}>
                <Settings size={16} />
                <span>Go to Settings</span>
              </Command.Item>
            </Command.Group>

            {/* Orders */}
            <Command.Group heading="RECENT ORDERS" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted, #71717A)', padding: '6px 10px' }}>
              {orders.slice(0, 6).map((order) => (
                <Command.Item
                  key={order.id}
                  value={`order ${order.orderNumber} ${order.customerName}`}
                  onSelect={() => {
                    onSelectOrder(order);
                    onOpenChange(false);
                  }}
                  style={itemStyle}
                >
                  <FileText size={16} />
                  <span>Order #{order.orderNumber} — {order.customerName}</span>
                  <span style={{ ...hintStyle, textTransform: 'uppercase' }}>{order.fulfillmentStatus}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Customers */}
            <Command.Group heading="CUSTOMERS" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted, #71717A)', padding: '6px 10px' }}>
              {customers.slice(0, 6).map((cust) => (
                <Command.Item
                  key={cust.id}
                  value={`customer ${cust.name} ${cust.email}`}
                  onSelect={() => {
                    onSelectCustomer(cust);
                    onOpenChange(false);
                  }}
                  style={itemStyle}
                >
                  <Users size={16} />
                  <span>{cust.name} ({cust.city})</span>
                  <span style={hintStyle}>{cust.segment}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Filter shortcuts */}
            <Command.Group heading="FILTER SHORTCUTS" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-muted, #71717A)', padding: '6px 10px' }}>
              <Command.Item
                onSelect={() => { onNavigate('products'); onOpenChange(false); }}
                style={itemStyle}
              >
                <AlertTriangle size={16} />
                <span>View Low Stock Products</span>
              </Command.Item>
              <Command.Item
                onSelect={() => { onNavigate('orders'); onOpenChange(false); }}
                style={itemStyle}
              >
                <Truck size={16} />
                <span>View Late Courier Deliveries</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  color: 'var(--admin-text, #0A0A0A)',
};

const hintStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: '11px',
  color: 'var(--admin-muted, #71717A)',
  fontFamily: 'monospace',
};
