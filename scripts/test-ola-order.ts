import { createOrderWithItems, updateOrderPayment, getOrderByReferenceAsync } from '../src/lib/db';
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from '../src/lib/email';
import { generateOrderReference } from '../src/lib/auth';

async function testCustomerOrder() {
  const orderRef = generateOrderReference();
  console.log(`Generating order for Ola (ola411089@gmail.com) with ref: ${orderRef}...`);

  const order = createOrderWithItems({
    orderReference: orderRef,
    customerName: 'Ola',
    customerEmail: 'ola411089@gmail.com',
    customerPhone: '+234 803 123 4567',
    deliveryAddress: 'Block 4, Lekki Phase 1',
    deliveryCity: 'Lekki',
    deliveryState: 'Lagos',
    deliveryFeeKobo: 0,
    subtotalKobo: 2500000,
    totalKobo: 2500000,
    items: [
      {
        productId: 'prod-dd-v-blk',
        variantId: 'var-dd-v-blk-l',
        productNameSnapshot: 'Deendrip vt-shirt black',
        variantNameSnapshot: 'Large',
        unitPriceKoboSnapshot: 2500000,
        quantity: 1,
        subtotalKobo: 2500000,
      },
    ],
  });

  console.log(`Order ${order.orderReference} created. Marking as paid...`);
  updateOrderPayment(orderRef, 'paid', `pay_live_test_${Date.now()}`);

  const updated = await getOrderByReferenceAsync(orderRef);
  if (!updated) {
    throw new Error('Order lookup failed');
  }

  console.log(`\n📨 Dispatching luxury order confirmation receipt to ola411089@gmail.com...`);
  const custRes = await sendOrderConfirmationEmail(updated);
  console.log('Customer receipt dispatched:', custRes);

  console.log(`\n📨 Dispatching store owner alert to deendripclothing@gmail.com...`);
  const adminRes = await sendAdminOrderAlertEmail(updated);
  console.log('Admin alert dispatched:', adminRes);

  console.log(`\n✨ Order Reference: ${orderRef}`);
  console.log(`Check inbox for: ola411089@gmail.com`);
}

testCustomerOrder().catch(console.error);
