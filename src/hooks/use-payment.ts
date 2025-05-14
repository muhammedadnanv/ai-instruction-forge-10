
import { useState, useEffect } from 'react';
import paymentService, { PaymentDetails } from '@/services/paymentService';

export function usePayment() {
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check payment status on initial load
  useEffect(() => {
    const checkPaymentStatus = () => {
      const userHasPaid = paymentService.hasUserPaid();
      const details = paymentService.getPaymentDetails();
      
      setHasPaid(userHasPaid);
      setPaymentDetails(details);
      setIsLoading(false);
    };
    
    checkPaymentStatus();
  }, []);

  // Verification function
  const verifyPayment = async (paymentInitiated = false) => {
    setIsLoading(true);
    try {
      const success = await paymentService.verifyPayment(paymentInitiated);
      if (success) {
        setHasPaid(true);
        setPaymentDetails(paymentService.getPaymentDetails());
      }
      return success;
    } catch (error) {
      console.error("Payment verification error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset payment (mainly for testing)
  const resetPayment = () => {
    paymentService.clearPaymentData();
    setHasPaid(false);
    setPaymentDetails(null);
  };

  return {
    hasPaid,
    paymentDetails,
    isLoading,
    verifyPayment,
    resetPayment
  };
}
