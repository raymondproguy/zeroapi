/**
 * Base Payments Provider - All providers extend this
 */

import { PaymentsProvider, PaymentIntent, Customer, Subscription, Invoice } from '../types.js';

export abstract class BasePaymentsProvider implements PaymentsProvider {
  abstract name: string;
  protected initialized: boolean = false;

  abstract initialize(): Promise<void>;
  abstract createPaymentIntent(amount: number, currency: string, options?: any): Promise<PaymentIntent>;
  abstract createCustomer(email: string, options?: any): Promise<Customer>;
  abstract createSubscription(customerId: string, priceId: string): Promise<Subscription>;
  abstract cancelSubscription(subscriptionId: string): Promise<Subscription>;
  abstract createInvoice(customerId: string, items: any[]): Promise<Invoice>;
  abstract refundPayment(paymentIntentId: string, amount?: number): Promise<any>;
  abstract handleWebhook(payload: any, signature: string): Promise<any>;

  protected validateInitialization(): void {
    if (!this.initialized) {
      throw new Error(`Payments provider ${this.name} is not initialized`);
    }
  }

  protected generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  protected validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (amount > 1000000) { // $10,000 limit
      throw new Error('Amount exceeds maximum limit');
    }
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected formatAmount(amount: number, currency: string): number {
    // Convert dollars to cents for Stripe, etc.
    if (['usd', 'eur', 'gbp'].includes(currency.toLowerCase())) {
      return Math.round(amount * 100);
    }
    return amount;
  }
}
