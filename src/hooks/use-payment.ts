
import { useState, useEffect } from 'react';
import paymentService, { PaymentDetails, SubscriptionDetails } from '@/services/paymentService';
import { useToast } from './use-toast';

export function usePayment() {
  const [hasPaid, setHasPaid] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check payment status on initial load
  useEffect(() => {
    const checkPaymentStatus = () => {
      const userHasPaid = paymentService.hasUserPaid();
      const userIsPro = paymentService.isProSubscriber();
      const details = paymentService.getPaymentDetails();
      const subDetails = paymentService.getSubscriptionDetails();
      
      setHasPaid(userHasPaid);
      setIsPro(userIsPro);
      setPaymentDetails(details);
      setSubscriptionDetails(subDetails);
      setIsLoading(false);
    };
    
    checkPaymentStatus();
  }, []);

  // Verification function
  const verifyPayment = async (paymentInitiated = true, isSubscription = false) => {
    setIsLoading(true);
    try {
      const success = await paymentService.verifyPayment(paymentInitiated, isSubscription);
      if (success) {
        setHasPaid(true);
        setPaymentDetails(paymentService.getPaymentDetails());
        
        if (isSubscription) {
          setIsPro(true);
          setSubscriptionDetails(paymentService.getSubscriptionDetails());
          
          toast({
            title: "Subscription Activated",
            description: "Thank you for subscribing to Pro. Full access enabled."
          });
        } else {
          toast({
            title: "Payment Verified",
            description: "Thank you for your payment. Full access enabled."
          });
        }
        
        return true;
      } else {
        toast({
          title: "Payment Verification Failed",
          description: "We couldn't verify your payment. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Verification Error",
        description: "An error occurred while verifying your payment.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset payment (mainly for testing)
  const resetPayment = () => {
    paymentService.clearPaymentData();
    setHasPaid(false);
    setIsPro(false);
    setPaymentDetails(null);
    setSubscriptionDetails(null);
    toast({
      title: "Payment Reset",
      description: "Payment status has been reset for testing."
    });
  };

  return {
    hasPaid,
    isPro,
    paymentDetails,
    subscriptionDetails,
    isLoading,
    verifyPayment,
    resetPayment
  };
}
