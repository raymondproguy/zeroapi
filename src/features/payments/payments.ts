/**
 * Main Payments Class - Unified payments interface
 */

import { PaymentsOptions, PaymentsProvider, PaymentIntent, Customer, Subscription, Invoice } from './types.js';
import { StripeProvider } from './providers/stripe.js';
import { PayPalProvider } from './providers/paypal.js';

export class Payments {
  private provider: PaymentsProvider;
  private options: PaymentsOptions;

  constructor(options: PaymentsOptions = { provider: 'stripe' }) {
    this.options = options;
    this.provider = this.createProvider(options);
  }

  private createProvider(options: PaymentsOptions): PaymentsProvider {
    switch (options.provider) {
      case 'paypal':
        return new PayPalProvider(options);
      case 'stripe':
      default:
        return new StripeProvider(options);
    }
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  // Payment operations
  async createPaymentIntent(amount: number, currency: string, options?: any): Promise<PaymentIntent> {
    return await this.provider.createPaymentIntent(amount, currency, options);
  }

  async createCustomer(email: string, options?: any): Promise<Customer> {
    return await this.provider.createCustomer(email, options);
  }

  async createSubscription(customerId: string, priceId: string): Promise<Subscription> {
    return await this.provider.createSubscription(customerId, priceId);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return await this.provider.cancelSubscription(subscriptionId);
  }

  async createInvoice(customerId: string, items: any[]): Promise<Invoice> {
    return await this.provider.createInvoice(customerId, items);
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    return await this.provider.refundPayment(paymentIntentId, amount);
  }

  async handleWebhook(payload: any, signature: string): Promise<any> {
    return await this.provider.handleWebhook(payload, signature);
  }

  // Utility methods
  getProviderName(): string {
    return this.provider.name;
  }

  isInitialized(): boolean {
    return (this.provider as any).initialized === true;
  }

  getPublishableKey(): string | undefined {
    return this.options.publishableKey;
  }
}
