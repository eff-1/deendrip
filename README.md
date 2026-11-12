# Deen Drip — Faith-Driven Streetwear & Apparel

Contemporary Muslim-inspired luxury streetwear built with Next.js 16 (App Router), React 19, TypeScript, Turso cloud database, and Resend transactional email architecture.

---

## 🏛 E-Commerce Operations Admin Dashboard (`/admin`)

The Admin Operations Portal is a production-quality, calm-density dashboard inspired by **Shopify Polaris**, **Medusa Admin**, **Linear**, and **Vercel**. It operates completely isolated from the consumer storefront (zero storefront topbar or footer interference).

### 1. Information Architecture & Navigation
- **Collapsible Sidebar (Desktop ≥1200px):** 240px wide navigation with brand icon, storefront shortcut, and badges for active queues (New Orders, Due Follow-ups).
- **Tablet (768px - 1199px):** Collapsed layout with 2-column KPI grids.
- **Mobile (<768px):** Sticky header + Bottom Navigation bar (`Home`, `Orders`, `Products`, `Customers`, `Search`), touch targets ≥44px, no horizontal scroll.
- **Command Palette (`⌘K` / `Ctrl+K` & `/`):** Powered by `cmdk`. Fuzzy search across Orders, Products, Customers, navigation destinations, and actions ("Add product", "Mark as shipped", "Toggle dark mode").
- **Keyboard Shortcuts Dialog (`?`):** Built-in cheat-sheet for fast navigation (`G then O`, `G then D`, `N` for new product).

### 2. Design System Tokens
- **Palette (Black, White, Sky Blue + Neutral Greys):**
  - Ink: `#0A0A0A`
  - Canvas: `#F4F4F5` (Dark: `#0A0A0A`)
  - Surface: `#FFFFFF` (Dark: `#18181B`)
  - Border: `#E5E7EB` (Dark: `#27272A`)
  - Muted Text: `#52525B` (Dark: `#A1A1AA`)
  - Sky Accents:
    - `sky-100`: `#E0F2FE` (soft background pills)
    - `sky-400`: `#38BDF8` (fills on dark)
    - `sky-500`: `#0EA5E9` (primary interactive accent)
    - `sky-700`: `#0369A1` (accessible text on light surfaces)
- **Status Badges (Differentiated by Lightness & Structure):**
  - **Paid:** Sky-100 background with Sky-700 text.
  - **Pending:** White background with grey border.
  - **Shipped:** Black background with white text.
  - **Refunded:** Neutral grey badge.
  - **Cancelled:** Strikethrough neutral grey badge.
  - **Failed:** Black outline.
- **Typography:** Inter / system sans with `font-variant-numeric: tabular-nums` for all metrics, order numbers, and currency values.
- **Shapes:** Cards radius 16px, inputs & controls radius 12px, pills fully rounded, 1px subtle borders, zero heavy drop-shadows.
- **Motion:** 150ms ease-out transitions respecting `prefers-reduced-motion`.

---

## 📦 Core Feature Modules

### 1. Dashboard Home (Calm Density — Max 6 Blocks)
1. **Hero Revenue Block:** Deep ink card displaying verified gross revenue in NGN (₦).
2. **KPI Quad:** Net Revenue, Paid Orders, Average Order Value (AOV), and Store Conversion Rate with delta percentages vs previous period.
3. **Pipeline Stages Ribbon:** Clickable unfulfilled counts (`New` → `Packing` → `Shipped` → `Delivered`) that instantly filter the Orders table.
4. **Sales Chart:** Recharts bar chart displaying 12-month commercial trajectory with single sky-blue highlight for peak drop and an accessible **"View as Table"** toggle.
5. **Recent Orders List:** 5 latest orders with status badges and quick inspection drawer triggers.
6. **Needs Attention List:** Max 4 critical operational items (Out of stock variants, late courier deliveries, review follow-ups due today).

### 2. Orders & Courier Delivery Tracking
- Filterable by stage (`New`, `Packing`, `Shipped`, `Delivered`, `Cancelled`) and searchable by customer name, phone, email, or order reference.
- **Order Inspection Drawer (Desktop side drawer / Mobile full sheet):**
  - **Overview:** Customer contact, international WhatsApp direct chat link (`https://wa.me/234...`), address, subtotal, shipping fee, total, internal staff notes timeline.
  - **Items:** Snapshot product title, variant size, quantity, and line price in NGN.
  - **Delivery Tracking:** Vertical step timeline (`Ordered` → `Packed` → `Shipped` → `Delivered`), assigned carrier (GIG Logistics, Fez, DHL, Speedaf), copyable tracking link, and **"Simulate Next Update"** dev button that advances the package live.
  - **Print Packing Slip:** Print stylesheet formatting merchant and recipient details for warehouse couriers.
  - **Auto-Email Dispatch:** Option to auto-email customer upon dispatch.

### 3. Products & Stock Control
- Search by title or SKU with category filtering (`Tees`, `Caps`, `Hoodies & Polos`, `Trousers`, `Tracksuits`, `Shirts`).
- **Inline Editing:** Click any stock number to edit directly in the cell with Enter to save and Esc to cancel.
- **Product Drawer:** Title, category, price in Naira, compare-at price, SKU, total stock, low-stock threshold, variants size matrix, SEO metadata, and draft autosaving to `localStorage`.

### 4. Customers
- Audience segmented into `VIP`, `Repeat`, `New`, `At Risk`, and `Never Ordered`.
- Profile drawer showing Lifetime Value (LTV), total orders, order history list, tags, and one-click WhatsApp / Email links.

### 5. Email & Follow-ups
- **Personalized Email Composer:** Recipient selector, subject line, body with merge tags (`{{first_name}}`, `{{order_id}}`, `{{tracking_link}}`, `{{product_name}}`, `{{store_name}}`, `{{discount_code}}`).
- **Live Recipient Preview:** Toggles live preview showing merge tags filled with the customer's actual order and name.
- **"Write with AI" Generator:** Produces instant personalized drafts for review requests, shipping notices, thank-you notes, win-back discounts, or logistics delay apologies.
- **Automated Follow-up Rules:** Toggleable one-sentence rules with "Follow-ups Due Today" queue for 1-click review, snooze, or dismissal.

### 6. Analytics
- 12-month revenue velocity, revenue by marketing channel (Direct, Instagram, WhatsApp, Search), order stage distribution, and conversion funnel.

### 7. Settings
- Single scrollable page with anchored sections: Store Profile, Logistics Carriers, Transactional Email Provider, Team, Storefront Announcement Bar, and Development Store Reset.

---

## 🔌 Architecture: How to Swap Mock Repo for Real Database

The dashboard is engineered on top of a typed repository interface located in [`src/lib/repo/index.ts`](file:///c:/deendrip/src/lib/repo/index.ts):

```typescript
// All dashboard components consume this interface:
import {
  getDashboardMetrics,
  getOrders,
  getOrderById,
  updateOrder,
  simulateNextDeliveryStep,
  getProducts,
  updateProduct,
  addProduct,
  deleteProduct,
  getCustomers,
  getCustomerById,
  getEmailTemplates,
  getFollowUpRules,
  toggleFollowUpRule,
  getDueFollowUps,
  sendEmailDraft,
  generateAiDraft,
} from '@/lib/repo';
```

### To Connect Turso Cloud / PostgreSQL / Medusa / Supabase:
1. Open [`src/lib/repo/index.ts`](file:///c:/deendrip/src/lib/repo/index.ts).
2. Replace the in-memory / `localStorage` store reads and writes with your ORM / SQL query (`turso.execute(...)`, Prisma, Drizzle, etc.).
3. Because every repo function returns Promises matching the strict TypeScript types in [`src/lib/repo/types.ts`](file:///c:/deendrip/src/lib/repo/types.ts), zero UI components need to be modified.

---

## 💡 Assumptions & Design Decisions
1. **Currency & Locale:** Set strictly to **NGN (`₦`)** formatted via `Intl.NumberFormat('en-NG')`. Numbers use `tabular-nums` for scannability.
2. **Nigerian Names & Addresses:** Seed dataset includes realistic names (Amaka Okafor, Ibrahim Balogun, Tunde Adeleke, Zainab Alabi, Kelechi Eze, Ola Ariyo) across Lagos, Abuja, Port Harcourt, and Ibadan.
3. **Simulated Delays:** Repository methods include intentional 80ms–200ms `async` delays to demonstrate real loading states and smooth transitions.
4. **Storefront Isolation:** The consumer `<Navbar />`, `<CartDrawer />`, and `<Footer />` detect `pathname.startsWith('/admin')` and automatically suppress themselves, giving the staff portal a dedicated administrative layout.

---

## 🏃‍♂️ Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Type check & build verification
npx tsc --noEmit
npm run build
```

Admin portal is accessible at: `http://localhost:3000/admin` (or `/admin/login`).
- Superadmin: `admin@deendrip.com` / `deendripclothing@gmail.com`
- Password: `DeenDripAdmin2026!`
