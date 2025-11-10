/**
 * Payments Type Definitions
 */

export interface PaymentsOptions {
  provider: 'stripe' | 'paypal' | 'razorpay';
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret?: string;
  customer?: string;
}

export interface Customer {
  id: string;
  email: string;
  name?: string;
  description?: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  planId: string;
  customerId: string;
}

export interface Invoice {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  pdfUrl?: string;
  hostedInvoiceUrl?: string;
}

export interface PaymentsProvider {
  name: string;
  initialize(): Promise<void>;
  createPaymentIntent(amount: number, currency: string, options?: any): Promise<PaymentIntent>;
  createCustomer(email: string, options?: any): Promise<Customer>;
  createSubscription(customerId: string, priceId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;
  createInvoice(customerId: string, items: any[]): Promise<Invoice>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<any>;
  handleWebhook(payload: any, signature: string): Promise<any>;
}
