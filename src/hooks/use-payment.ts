
import { useState, useEffect, useCallback } from 'react';
import paymentService, { PaymentDetails, SubscriptionDetails } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

export function usePayment() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const { toast } = useToast();

  // Load payment status on mount
  useEffect(() => {
    loadPaymentStatus();
  }, []);

  // Load payment status from service
  const loadPaymentStatus = useCallback(() => {
    try {
      const hasUserPaid = paymentService.hasUserPaid();
      const isProSubscriber = paymentService.isProSubscriber();
      
      setHasPaid(hasUserPaid);
      setIsPro(isProSubscriber);
      
      if (hasUserPaid) {
        const details = paymentService.getPaymentDetails();
        setPaymentDetails(details);
      }
      
      if (isProSubscriber) {
        const subDetails = paymentService.getSubscriptionDetails();
        setSubscriptionDetails(subDetails);
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify payment (renamed to verifyPaymentStatus to avoid conflicts)
  const verifyPaymentStatus = useCallback(async (paymentInitiated = false, isSubscription = false) => {
    try {
      const result = await paymentService.verifyPayment(paymentInitiated, isSubscription);
      
      // Reload payment status after verification
      loadPaymentStatus();
      
      return result;
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify payment status. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [loadPaymentStatus, toast]);

  // Reset payment data (for testing)
  const resetPayment = useCallback(() => {
    try {
      paymentService.clearPaymentData();
      loadPaymentStatus();
      
      toast({
        title: "Payment Data Reset",
        description: "All payment data has been cleared for testing.",
      });
    } catch (error) {
      console.error("Error resetting payment data:", error);
      toast({
        title: "Reset Error",
        description: "Failed to reset payment data. Please try again.",
        variant: "destructive",
      });
    }
  }, [loadPaymentStatus, toast]);

  return {
    isLoading,
    hasPaid,
    isPro,
    paymentDetails,
    subscriptionDetails,
    verifyPaymentStatus, // Renamed function
    resetPayment,
  };
}
