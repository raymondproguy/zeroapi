/**
 * Payments Feature Demo - Complete Payment Processing
 */

import zeroapi from '../index.js';

const app = zeroapi()
  .configure({ appName: 'ZeroAPI Payments Demo' })
  .database({ provider: 'sqlite' })
  .auth({ provider: 'jwt', secret: 'demo-secret' })
  .payments({ 
    provider: 'stripe',
    secretKey: 'sk_test_demo_key', // In production, use env var
    publishableKey: 'pk_test_demo_key'
  });

// Payment routes
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customerId } = req.body;
    
    const paymentIntent = await req.context.payments.createPaymentIntent(
      amount, 
      currency, 
      { customerId }
    );

    res.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payments/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const customer = await req.context.payments.createCustomer(email, { name });
    
    res.json({
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payments/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;
    
    const subscription = await req.context.payments.createSubscription(customerId, priceId);
    
    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.currentPeriodEnd * 1000).toISOString()
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payments/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await req.context.payments.cancelSubscription(subscriptionId);
    
    res.json({
      subscriptionId: subscription.id,
      status: subscription.status
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/payments/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    
    const refund = await req.context.payments.refundPayment(paymentIntentId, amount);
    
    res.json({
      refundId: refund.id,
      status: refund.status
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook endpoint (for Stripe, PayPal, etc.)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;
    
    const result = await req.context.payments.handleWebhook(payload, signature);
    
    res.json(result);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get payment provider info
app.get('/api/payments/info', async (req, res) => {
  res.json({
    provider: req.context.payments.getProviderName(),
    initialized: req.context.payments.isInitialized(),
    publishableKey: req.context.payments.getPublishableKey()
  });
});

// Protected payment (requires auth)
app.post('/api/payments/secure/create-intent', async (req, res) => {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await req.context.auth.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { amount, currency = 'usd' } = req.body;
    
    // Create or get customer
    let customer = await req.context.payments.createCustomer(user.email, { 
      name: user.name 
    });

    const paymentIntent = await req.context.payments.createPaymentIntent(
      amount, 
      currency, 
      { customerId: customer.id }
    );

    res.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
      customerId: customer.id,
      user: { id: user.id, email: user.email }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 ZeroAPI Payments Demo Running!');
  console.log('💳 Payments Provider: Stripe (demo mode)');
  console.log('');
  console.log('📍 Endpoints:');
  console.log('   POST http://localhost:3000/api/payments/create-intent');
  console.log('   POST http://localhost:3000/api/payments/create-customer');
  console.log('   POST http://localhost:3000/api/payments/create-subscription');
  console.log('   POST http://localhost:3000/api/payments/cancel-subscription');
  console.log('   POST http://localhost:3000/api/payments/refund');
  console.log('   POST http://localhost:3000/api/payments/webhook');
  console.log('   POST http://localhost:3000/api/payments/secure/create-intent (protected)');
  console.log('   GET  http://localhost:3000/api/payments/info');
  console.log('');
  console.log('💡 Try:');
  console.log('   http POST http://localhost:3000/api/payments/create-intent amount:=1000 currency=usd');
  console.log('   http POST http://localhost:3000/api/payments/create-customer email=customer@example.com name="Test Customer"');
  console.log('   http GET http://localhost:3000/api/payments/info');
});
