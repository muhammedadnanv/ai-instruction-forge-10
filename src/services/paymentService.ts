
/**
 * Payment Service
 * Handles payment-related functionality and verification
 */

import accessCodeService from './accessCodeService';

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  VERIFIED: 'verified'
};

// Payment storage keys
const STORAGE_KEYS = {
  PAYMENT_STATUS: 'payment_status',
  PAYMENT_DATE: 'payment_date',
  PAYMENT_ID: 'payment_id',
  HAS_PAID: 'has_paid',
  PAYMENT_AMOUNT: 'payment_amount',
  PAYMENT_CURRENCY: 'payment_currency',
  IS_PRO_SUBSCRIBER: 'is_pro_subscriber',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_ID: 'subscription_id'
};

export interface PaymentDetails {
  status: string;
  date: string;
  id: string;
  amount: string;
  currency: string;
  accessCode?: string;
}

export interface SubscriptionDetails {
  id: string;
  startDate: string;
  amount: string;
  currency: string;
  isActive: boolean;
}

// UPI payment details - Updated with new details
export const UPI_PAYMENT_DETAILS = {
  upiId: 'adnanmuhammad4393@okicici',
  amount: '99.99',
  currency: 'INR',
  beneficiaryName: 'Muhammed Adnan',
  accountNumber: '19020100094298',
  ifscCode: 'FDRL0001902'
};

// Subscription details
export const PRO_SUBSCRIPTION_DETAILS = {
  amount: '599',
  currency: 'INR',
  period: 'monthly',
  beneficiaryName: 'Muhammed Adnan',
  accountNumber: '19020100094298',
  ifscCode: 'FDRL0001902'
};

// Dodo payment gateway configuration
const DODO_API_KEY = 'VjyJF4pywuQ1M5du.CR8UuaFRFuyIA36fqnQkETWXtYxeEP_2aziowRWwAt8YgIsF';

/**
 * PaymentService class to handle payment operations
 */
class PaymentService {
  /**
   * Check if user has paid (now checks access code validity)
   */
  hasUserPaid(): boolean {
    return accessCodeService.hasValidAccess();
  }

  /**
   * Check if user is a pro subscriber
   */
  isProSubscriber(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_PRO_SUBSCRIBER) === 'true' && this.hasUserPaid();
  }

  /**
   * Get payment details
   */
  getPaymentDetails(): PaymentDetails | null {
    const status = localStorage.getItem(STORAGE_KEYS.PAYMENT_STATUS);
    const date = localStorage.getItem(STORAGE_KEYS.PAYMENT_DATE);
    const id = localStorage.getItem(STORAGE_KEYS.PAYMENT_ID);
    const amount = localStorage.getItem(STORAGE_KEYS.PAYMENT_AMOUNT) || UPI_PAYMENT_DETAILS.amount;
    const currency = localStorage.getItem(STORAGE_KEYS.PAYMENT_CURRENCY) || UPI_PAYMENT_DETAILS.currency;
    const accessCode = accessCodeService.getUserAccessCode();

    if (!status || !date) {
      return null;
    }

    return {
      status,
      date,
      id: id || 'unknown',
      amount,
      currency,
      accessCode: accessCode || undefined
    };
  }

  /**
   * Get subscription details
   */
  getSubscriptionDetails(): SubscriptionDetails | null {
    const isSubscriber = this.isProSubscriber();
    const startDate = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_START);
    const id = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_ID);
    
    if (!isSubscriber || !startDate || !id) {
      return null;
    }
    
    return {
      id,
      startDate,
      amount: PRO_SUBSCRIPTION_DETAILS.amount,
      currency: PRO_SUBSCRIPTION_DETAILS.currency,
      isActive: true
    };
  }

  /**
   * Initialize Dodo payment with access code generation
   */
  initiateDodoPayment(isSubscription = false): Promise<{sessionId: string, accessCode?: string}> {
    console.log('Initiating Dodo payment with API Key:', DODO_API_KEY);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const paymentType = isSubscription ? 'subscription' : 'one-time';
        const sessionId = `dodo_${paymentType}_${Date.now()}`;
        
        let accessCode: string | undefined;
        
        // Generate access code after successful payment
        if (isSubscription) {
          this.recordSubscription(sessionId);
          accessCode = accessCodeService.storeAccessCode(sessionId, 'user@example.com');
        } else {
          this.recordPayment(sessionId);
          accessCode = accessCodeService.storeAccessCode(sessionId, 'user@example.com');
        }
        
        resolve({
          sessionId,
          accessCode
        });
      }, 1000);
    });
  }

  /**
   * Record a payment and return access code
   */
  recordPayment(paymentId: string = `upi_${Date.now()}`, status: string = PAYMENT_STATUS.COMPLETED): string | null {
    const date = new Date().toISOString();
    const amount = UPI_PAYMENT_DETAILS.amount;
    const currency = UPI_PAYMENT_DETAILS.currency;

    localStorage.setItem(STORAGE_KEYS.PAYMENT_STATUS, status);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_DATE, date);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_ID, paymentId);
    localStorage.setItem(STORAGE_KEYS.HAS_PAID, 'true');
    localStorage.setItem(STORAGE_KEYS.PAYMENT_AMOUNT, amount);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CURRENCY, currency);
    
    // Generate and return access code
    const accessCode = accessCodeService.storeAccessCode(paymentId, 'user@example.com');
    return accessCode;
  }

  /**
   * Record a subscription
   */
  recordSubscription(subscriptionId: string = `upi_sub_${Date.now()}`): void {
    const startDate = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.IS_PRO_SUBSCRIBER, 'true');
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_START, startDate);
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_ID, subscriptionId);
    
    // Also mark as paid for basic access
    if (!this.hasUserPaid()) {
      this.recordPayment(`upi_sub_payment_${Date.now()}`);
    }
  }

  /**
   * Verify a payment with Dodo
   * In a real implementation, this would call Dodo's API to verify the payment
   */
  verifyPayment(paymentInitiated: boolean, isSubscription = false): Promise<boolean> {
    console.log('Verifying payment with Dodo using API Key:', DODO_API_KEY);
    
    return new Promise((resolve) => {
      // For demo purposes, always verify successfully
      setTimeout(() => {
        if (isSubscription) {
          if (!this.isProSubscriber()) {
            this.recordSubscription();
          }
        } else {
          if (!this.hasUserPaid()) {
            this.recordPayment();
          }
        }
        resolve(true);
      }, 1000);
    });
  }

  /**
   * Clear payment data (for testing)
   */
  clearPaymentData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // Also clear access codes
    accessCodeService.clearAllData();
  }
}

// Export a singleton instance
const paymentService = new PaymentService();
export default paymentService;
