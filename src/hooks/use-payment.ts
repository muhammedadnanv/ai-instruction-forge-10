
import { useState, useEffect } from 'react';
import paymentService, { PaymentDetails } from '@/services/paymentService';
import { useToast } from './use-toast';

export function usePayment() {
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
        
        toast({
          title: "Payment Verified",
          description: "Thank you for your payment. Full access enabled."
        });
        
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
    setPaymentDetails(null);
    toast({
      title: "Payment Reset",
      description: "Payment status has been reset for testing."
    });
  };

  return {
    hasPaid,
    paymentDetails,
    isLoading,
    verifyPayment,
    resetPayment
  };
}
