
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

// UPI payment details
export const UPI_PAYMENT_DETAILS = {
  upiId: 'adnanmuhammad4393@okicici',
  amount: '199',
  currency: 'INR',
  beneficiaryName: 'Muhammed Adnan VV',
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
    const amount = localStorage.getItem(STORAGE_KEYS.PAYMENT_AMOUNT) || UPI_PAYMENT_DETAILS.amount;
    const currency = localStorage.getItem(STORAGE_KEYS.PAYMENT_CURRENCY) || UPI_PAYMENT_DETAILS.currency;

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
   * Initialize Dodo payment
   * This would typically make an API call to Dodo to start a payment session
   */
  initiateDodoPayment(): Promise<{sessionId: string}> {
    // In a real implementation, this would make an API call to Dodo
    console.log('Initiating Dodo payment with API Key:', DODO_API_KEY);
    
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        resolve({
          sessionId: `dodo_session_${Date.now()}`
        });
      }, 1000);
    });
  }

  /**
   * Record a payment
   */
  recordPayment(paymentId: string = `dodo_${Date.now()}`, status: string = PAYMENT_STATUS.COMPLETED): void {
    const date = new Date().toISOString();
    const amount = UPI_PAYMENT_DETAILS.amount;
    const currency = UPI_PAYMENT_DETAILS.currency;

    localStorage.setItem(STORAGE_KEYS.PAYMENT_STATUS, status);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_DATE, date);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_ID, paymentId);
    localStorage.setItem(STORAGE_KEYS.HAS_PAID, 'true');
    localStorage.setItem(STORAGE_KEYS.PAYMENT_AMOUNT, amount);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CURRENCY, currency);
  }

  /**
   * Verify a payment with Dodo
   * In a real implementation, this would call Dodo's API to verify the payment
   */
  verifyPayment(paymentInitiated: boolean): Promise<boolean> {
    console.log('Verifying payment with Dodo using API Key:', DODO_API_KEY);
    
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
