
/**
 * Payment Service
 * Handles payment-related functionality and verification
 */

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
  PAYMENT_CURRENCY: 'payment_currency'
};

export interface PaymentDetails {
  status: string;
  date: string;
  id: string;
  amount: string;
  currency: string;
}

/**
 * PaymentService class to handle payment operations
 */
class PaymentService {
  /**
   * Check if user has paid
   */
  hasUserPaid(): boolean {
    return localStorage.getItem(STORAGE_KEYS.HAS_PAID) === 'true';
  }

  /**
   * Get payment details
   */
  getPaymentDetails(): PaymentDetails | null {
    const status = localStorage.getItem(STORAGE_KEYS.PAYMENT_STATUS);
    const date = localStorage.getItem(STORAGE_KEYS.PAYMENT_DATE);
    const id = localStorage.getItem(STORAGE_KEYS.PAYMENT_ID);
    const amount = localStorage.getItem(STORAGE_KEYS.PAYMENT_AMOUNT) || '199';
    const currency = localStorage.getItem(STORAGE_KEYS.PAYMENT_CURRENCY) || 'INR';

    if (!status || !date) {
      return null;
    }

    return {
      status,
      date,
      id: id || 'unknown',
      amount,
      currency
    };
  }

  /**
   * Record a payment
   */
  recordPayment(paymentId: string = `pay_${Date.now()}`, status: string = PAYMENT_STATUS.COMPLETED): void {
    const date = new Date().toISOString();
    const amount = '199';
    const currency = 'INR';

    localStorage.setItem(STORAGE_KEYS.PAYMENT_STATUS, status);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_DATE, date);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_ID, paymentId);
    localStorage.setItem(STORAGE_KEYS.HAS_PAID, 'true');
    localStorage.setItem(STORAGE_KEYS.PAYMENT_AMOUNT, amount);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CURRENCY, currency);
  }

  /**
   * Verify a payment
   * In a real implementation, this would call an API to verify with the payment provider
   */
  verifyPayment(paymentInitiated: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate verification delay
      setTimeout(() => {
        // Higher chance of success if payment was initiated
        const randomSuccess = paymentInitiated || Math.random() > 0.3;
        
        if (randomSuccess) {
          this.recordPayment();
          resolve(true);
        } else {
          resolve(false);
        }
      }, 2000);
    });
  }

  /**
   * Clear payment data (for testing)
   */
  clearPaymentData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export a singleton instance
const paymentService = new PaymentService();
export default paymentService;
