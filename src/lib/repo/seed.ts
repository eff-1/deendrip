import type {
  AdminOrder,
  AdminOrderItem,
  AdminProduct,
  AdminCustomer,
  EmailTemplate,
  FollowUpRule,
  DueFollowUp,
  SalesDataPoint,
  DeliveryTrackingEvent,
} from './types';

const NIGERIAN_FIRST_NAMES = ['Amaka', 'Ibrahim', 'Tunde', 'Zainab', 'Kelechi', 'Fatima', 'Babatunde', 'Aisha', 'Ola', 'Chioma', 'Yusuf', 'Emeka', 'Halima', 'Damilola', 'Mustapha', 'Chiamaka', 'Segun', 'Maryam', 'Chinedu', 'Khadijah'];
const NIGERIAN_LAST_NAMES = ['Okafor', 'Balogun', 'Adeleke', 'Alabi', 'Eze', 'Musa', 'Danjuma', 'Ariyo', 'Bello', 'Abubakar', 'Lawal', 'Nwosu', 'Idris', 'Suleiman', 'Okeke', 'Olatunji', 'Shehu', 'Obi', 'Sanusi', 'Adewale'];
const LAGOS_AREAS = [
  { city: 'Lekki Phase 1', state: 'Lagos' },
  { city: 'Ikeja GRA', state: 'Lagos' },
  { city: 'Victoria Island', state: 'Lagos' },
  { city: 'Yaba', state: 'Lagos' },
  { city: 'Surulere', state: 'Lagos' },
  { city: 'Wuse 2', state: 'Abuja' },
  { city: 'Maitama', state: 'Abuja' },
  { city: 'Port Harcourt GRA', state: 'Rivers' },
  { city: 'Bodija', state: 'Ibadan' },
];

export function generateSeedData() {
  // 1. Generate 40 Products
  const categories: AdminProduct['category'][] = ['tees', 'caps', 'hoodies-polos', 'trousers', 'tracksuits', 'shirts'];
  const products: AdminProduct[] = [];

  const baseProductTitles = [
    { title: 'Deen Drip Classic Arch Tee', cat: 'tees' as const, price: 2500000, img: '/assets/campaign/product-tshirt.webp' },
    { title: 'Sabr Heavyweight Oversized Tee', cat: 'tees' as const, price: 2800000, img: '/assets/campaign/hero-architectural-brutalist.webp' },
    { title: 'Tawakkul Distressed Black Hoodie', cat: 'hoodies-polos' as const, price: 5500000, img: '/assets/campaign/hero-editorial-movement.webp' },
    { title: 'Deen Trucker Cap Midnight', cat: 'caps' as const, price: 1800000, img: '/assets/brand/deen-drip-logo-black.png' },
    { title: 'Ihsan Structured Polo Cream', cat: 'hoodies-polos' as const, price: 3800000, img: '/assets/campaign/hero-subway-concrete.webp' },
    { title: 'Bayaan Cargo Trousers Stone', cat: 'trousers' as const, price: 4200000, img: '/assets/campaign/hero-architectural-brutalist.webp' },
    { title: 'Ummah Velour Tracksuit Onyx', cat: 'tracksuits' as const, price: 7500000, img: '/assets/campaign/hero-editorial-movement.webp' },
    { title: 'Noor Heavy Cotton Oxford Shirt', cat: 'shirts' as const, price: 3200000, img: '/assets/campaign/product-tshirt.webp' },
  ];

  for (let i = 0; i < 40; i++) {
    const base = baseProductTitles[i % baseProductTitles.length];
    const suffix = i >= baseProductTitles.length ? ` Edition ${Math.floor(i / baseProductTitles.length) + 1}` : '';
    const title = `${base.title}${suffix}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const stock = i === 3 ? 0 : i === 7 ? 4 : 15 + ((i * 7) % 60);

    products.push({
      id: `prod_${i + 1}`,
      title,
      slug: `${slug}-${i + 1}`,
      description: 'Engineered from custom 300GSM heavyweight organic cotton with architectural silhouettes and reinforced twin-needle hems.',
      category: base.cat,
      priceKobo: base.price + ((i % 5) * 200000),
      compareAtPriceKobo: i % 3 === 0 ? base.price + 1000000 : null,
      sku: `DD-${base.cat.slice(0, 3).toUpperCase()}-${100 + i}`,
      stock,
      lowStockThreshold: 10,
      images: [base.img],
      tags: ['Streetwear', 'Faith', 'Heavyweight', i % 2 === 0 ? 'Best Seller' : 'New Drop'],
      variants: [
        { id: `var_${i}_s`, size: 'S', sku: `DD-${base.cat.slice(0, 3).toUpperCase()}-${100 + i}-S`, stockQuantity: Math.max(0, Math.floor(stock * 0.2)) },
        { id: `var_${i}_m`, size: 'M', sku: `DD-${base.cat.slice(0, 3).toUpperCase()}-${100 + i}-M`, stockQuantity: Math.max(0, Math.floor(stock * 0.35)) },
        { id: `var_${i}_l`, size: 'L', sku: `DD-${base.cat.slice(0, 3).toUpperCase()}-${100 + i}-L`, stockQuantity: Math.max(0, Math.floor(stock * 0.3)) },
        { id: `var_${i}_xl`, size: 'XL', sku: `DD-${base.cat.slice(0, 3).toUpperCase()}-${100 + i}-XL`, stockQuantity: Math.max(0, Math.floor(stock * 0.15)) },
      ],
      status: i === 35 ? 'draft' : i === 38 ? 'archived' : 'active',
      createdAt: new Date(Date.now() - (40 - i) * 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - (40 - i) * 86400000 * 2).toISOString(),
    });
  }

  // 2. Generate 80 Customers
  const customers: AdminCustomer[] = [];
  const segments: AdminCustomer['segment'][] = ['vip', 'repeat', 'new', 'at_risk', 'never_ordered'];

  for (let i = 0; i < 80; i++) {
    const fName = NIGERIAN_FIRST_NAMES[i % NIGERIAN_FIRST_NAMES.length];
    const lName = NIGERIAN_LAST_NAMES[(i * 3) % NIGERIAN_LAST_NAMES.length];
    const location = LAGOS_AREAS[i % LAGOS_AREAS.length];
    const segment = segments[i % segments.length];
    const orderCount = segment === 'never_ordered' ? 0 : segment === 'new' ? 1 : segment === 'vip' ? 6 + (i % 8) : 2 + (i % 3);
    const avgSpend = 3500000;

    customers.push({
      id: `cust_${i + 1}`,
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i > 20 ? i : ''}@gmail.com`,
      phone: `+234 80${(10000000 + i * 111111).toString().slice(0, 8)}`,
      city: location.city,
      state: location.state,
      totalOrders: orderCount,
      totalSpentKobo: orderCount * avgSpend,
      segment,
      tags: segment === 'vip' ? ['High LTV', 'Lagos VIP'] : ['Instagram Inbound'],
      lastOrderDate: orderCount > 0 ? new Date(Date.now() - (i % 30) * 86400000).toISOString() : undefined,
      createdAt: new Date(Date.now() - (100 - i) * 86400000 * 2).toISOString(),
    });
  }

  // 3. Generate 60 Orders
  const orders: AdminOrder[] = [];
  const stages: AdminOrder['fulfillmentStatus'][] = ['new', 'packing', 'shipped', 'delivered', 'delivered', 'cancelled'];
  const carriers = ['GIG Logistics', 'Fez Delivery', 'DHL Express', 'Speedaf Express'];

  for (let i = 0; i < 60; i++) {
    const cust = customers[i % customers.length];
    const stage = stages[i % stages.length];
    const isPaid = stage !== 'cancelled' || i % 4 === 0;
    const paymentStatus: AdminOrder['paymentStatus'] = stage === 'cancelled' && i % 2 === 0 ? 'refunded' : isPaid ? 'paid' : 'pending';
    const numItems = 1 + (i % 3);
    const orderItems: AdminOrderItem[] = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const prod = products[(i + j) % products.length];
      const variant = prod.variants[j % prod.variants.length];
      const price = prod.priceKobo;
      subtotal += price;
      orderItems.push({
        id: `item_${i}_${j}`,
        productId: prod.id,
        productTitle: prod.title,
        variantTitle: `Size ${variant.size}`,
        sku: variant.sku,
        priceKobo: price,
        quantity: 1,
        imageUrl: prod.images[0],
      });
    }

    const deliveryFee = subtotal >= 8500000 ? 0 : 350000;
    const total = subtotal + deliveryFee;
    const createdAt = new Date(Date.now() - (60 - i) * 86400000 * 0.8).toISOString();
    const trackingNumber = (stage === 'shipped' || stage === 'delivered') ? `GIG-NG-${884000 + i}` : undefined;
    const carrier = trackingNumber ? carriers[i % carriers.length] : undefined;

    const timeline: DeliveryTrackingEvent[] = [
      { id: `t1_${i}`, status: 'ordered', title: 'Order Placed & Verified', description: 'Customer completed checkout successfully.', timestamp: createdAt, location: 'Online Storefront' },
    ];

    if (stage === 'packing' || stage === 'shipped' || stage === 'delivered') {
      timeline.push({ id: `t2_${i}`, status: 'packed', title: 'Packed at Lagos Hub', description: 'Quality inspection passed. Sealed in matte tamper-proof packaging.', timestamp: new Date(new Date(createdAt).getTime() + 14400000).toISOString(), location: 'Lekki Fulfillment Center' });
    }
    if (stage === 'shipped' || stage === 'delivered') {
      timeline.push({ id: `t3_${i}`, status: 'shipped', title: `Handed over to ${carrier}`, description: `Assigned waybill ${trackingNumber}. In transit to destination.`, timestamp: new Date(new Date(createdAt).getTime() + 28800000).toISOString(), location: 'Central Dispatch Hub' });
    }
    if (stage === 'delivered') {
      timeline.push({ id: `t4_${i}`, status: 'delivered', title: 'Delivered to Recipient', description: 'Package signed for and received.', timestamp: new Date(new Date(createdAt).getTime() + 86400000).toISOString(), location: `${cust.city}, ${cust.state}` });
    }

    orders.push({
      id: `ord_${i + 1}`,
      orderNumber: (10450 + i).toString(),
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      deliveryAddress: `House ${12 + (i % 40)}, Admiralty Way`,
      deliveryCity: cust.city,
      deliveryState: cust.state,
      totalKobo: total,
      subtotalKobo: subtotal,
      deliveryFeeKobo: deliveryFee,
      paymentStatus,
      fulfillmentStatus: stage,
      carrier,
      trackingNumber,
      trackingLink: trackingNumber ? `https://track.deendrip.shop/${trackingNumber}` : undefined,
      timeline,
      items: orderItems,
      notes: i % 5 === 0 ? ['Customer requested afternoon delivery call before dispatch.'] : [],
      createdAt,
      isDelayed: (stage === 'shipped' && i % 6 === 0),
    });
  }

  // 4. Generate 12 Months Sales Analytics Points
  const salesHistory: SalesDataPoint[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let m = 0; m < 12; m++) {
    const isPeak = m === 10; // Nov peak drop
    const baseRev = (45000000 + (m * 8500000)) + (isPeak ? 35000000 : 0);
    const orderCount = Math.floor(baseRev / 3800000);
    salesHistory.push({
      date: `2026-${(m + 1).toString().padStart(2, '0')}-01`,
      label: monthNames[m],
      revenueKobo: baseRev,
      ordersCount: orderCount,
      isHighlight: isPeak,
    });
  }

  // 5. Email Templates
  const emailTemplates: EmailTemplate[] = [
    {
      id: 'tpl_1',
      name: 'Order Shipped with Tracking',
      subject: '🚀 Your Deen Drip Order #{{order_id}} has been dispatched',
      body: `Salam {{first_name}},\n\nYour order #{{order_id}} is officially on its way to you!\n\nYou can track the live courier progress here: {{tracking_link}}\n\nThank you for choosing {{store_name}}.\n\nWarm regards,\nThe Deen Drip Team`,
      category: 'shipping',
    },
    {
      id: 'tpl_2',
      name: 'Post-Delivery Review Request',
      subject: 'How is your new {{product_name}} fitting?',
      body: `Salam {{first_name}},\n\nWe hope you are loving your pieces from {{store_name}}! Could you take 30 seconds to let us know your thoughts?\n\nAs a thank you, enjoy 10% off your next order with code: {{discount_code}}\n\nStay blessed,\nDeen Drip Lagos`,
      category: 'retention',
    },
    {
      id: 'tpl_3',
      name: 'VIP Early Access Notification',
      subject: 'Exclusive: The new AW-26 Capsule is live for you',
      body: `Salam {{first_name}},\n\nAs one of our most valued collectors, you have first-priority access to our upcoming limited release before the public drop.\n\nUse your VIP code {{discount_code}} at checkout.\n\nWith gratitude,\n{{store_name}}`,
      category: 'marketing',
    },
    {
      id: 'tpl_4',
      name: 'Delivery Delay Apology & Update',
      subject: 'Update on Order #{{order_id}} — Deen Drip',
      body: `Salam {{first_name}},\n\nWe are reaching out to let you know your order #{{order_id}} is experiencing a slight logistics delay with the courier.\n\nOur team is actively supervising dispatch. You can view latest tracking here: {{tracking_link}}\n\nWe sincerely apologize for any inconvenience.\n\nPeace & blessings,\n{{store_name}}`,
      category: 'support',
    },
    {
      id: 'tpl_5',
      name: 'Win-Back / We Miss You',
      subject: 'Salam {{first_name}} — New silhouettes just dropped',
      body: `Salam {{first_name}},\n\nIt’s been a minute since your last order at {{store_name}}. We’ve just introduced new heavyweight silhouettes tailored for effortless expression.\n\nHere is a 15% welcome-back code for you: {{discount_code}}\n\nExplore now,\nDeen Drip`,
      category: 'retention',
    },
  ];

  // 6. Follow-up Rules
  const followUpRules: FollowUpRule[] = [
    { id: 'rule_1', title: '3 days after delivery → Ask for a review', description: 'Automatically reaches out to verified delivered orders for fit and quality feedback.', triggerDays: 3, isEnabled: true, templateId: 'tpl_2' },
    { id: 'rule_2', title: 'Cart abandoned 24h → Send reminder', description: 'Gentle nudge for shoppers who left items in cart without completing checkout.', triggerDays: 1, isEnabled: true, templateId: 'tpl_1' },
    { id: 'rule_3', title: 'No order in 60 days → Send win-back discount', description: 'Re-engages previous repeat customers with an exclusive return voucher.', triggerDays: 60, isEnabled: true, templateId: 'tpl_5' },
    { id: 'rule_4', title: 'Delivery in transit >3 days → Proactive status update', description: 'Informs customer when an interstate courier is taking longer than usual.', triggerDays: 3, isEnabled: false, templateId: 'tpl_4' },
  ];

  // 7. Due Follow-ups Today
  const dueFollowUps: DueFollowUp[] = [
    { id: 'due_1', ruleId: 'rule_1', ruleTitle: '3 days after delivery → Ask for a review', customerName: 'Zainab Alabi', customerEmail: 'zainab.alabi@gmail.com', orderNumber: '10478', dueDate: 'Today, 2:00 PM', previewMessage: 'Salam Zainab, how is your Deen Drip Classic Arch Tee fitting? Enjoy 10% off your next...' },
    { id: 'due_2', ruleId: 'rule_3', ruleTitle: 'No order in 60 days → Send win-back discount', customerName: 'Ibrahim Balogun', customerEmail: 'ibrahim.balogun@gmail.com', orderNumber: '10420', dueDate: 'Today, 4:30 PM', previewMessage: 'Salam Ibrahim, new silhouettes have just dropped. Here is 15% off with code SABR15...' },
    { id: 'due_3', ruleId: 'rule_1', ruleTitle: '3 days after delivery → Ask for a review', customerName: 'Kelechi Eze', customerEmail: 'kelechi.eze@gmail.com', orderNumber: '10479', dueDate: 'Today, 5:00 PM', previewMessage: 'Salam Kelechi, thank you for supporting Deen Drip. We would love your feedback on...' },
  ];

  return { products, customers, orders, salesHistory, emailTemplates, followUpRules, dueFollowUps };
}
