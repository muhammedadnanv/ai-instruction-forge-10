
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Wallet, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import paymentService, { PAYMENT_STATUS } from "@/services/paymentService";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
}

const PaymentDialog = ({ open, onOpenChange, onPaymentComplete }: PaymentDialogProps) => {
  const [isPaid, setIsPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const upiId = "adnanmuhammad4393@okicici";
  const amount = "199";

  // Generate UPI QR code link
  const upiQrLink = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=InstructAI Payment`;
  
  // Generate QR code image URL using a QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiQrLink)}`;

  // Check payment status when dialog opens
  useEffect(() => {
    if (open) {
      const hasAlreadyPaid = paymentService.hasUserPaid();
      if (hasAlreadyPaid) {
        setIsPaid(true);
      }
    }
  }, [open]);

  // Simulated payment verification
  const verifyPayment = async () => {
    setIsVerifying(true);
    setVerificationMessage("Verifying your payment...");
    
    try {
      const success = await paymentService.verifyPayment(paymentInitiated);
      
      if (success) {
        setIsPaid(true);
        setVerificationMessage("");
        
        toast({
          title: "Payment Verified",
          description: "Thank you for your payment. You can now use all features."
        });
        
        setTimeout(() => {
          onPaymentComplete();
          onOpenChange(false);
        }, 2000);
      } else {
        setIsVerifying(false);
        setVerificationMessage("We couldn't verify your payment. If you've already paid, please try again in a few moments.");
        toast({
          title: "Payment Verification Failed",
          description: "We couldn't verify your payment. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsVerifying(false);
      setVerificationMessage("An error occurred during verification. Please try again.");
      toast({
        title: "Verification Error",
        description: "An error occurred while verifying your payment.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentInitiation = () => {
    // Track that payment was initiated via QR code
    setPaymentInitiated(true);
    toast({
      title: "Payment Initiated",
      description: "After completing the payment, click 'Verify Payment' button."
    });
    
    // In a real app, you would open the user's UPI app or payment method
    try {
      window.open(upiQrLink, '_blank');
    } catch (error) {
      console.error("Failed to open UPI app:", error);
      toast({
        title: "Failed to Open UPI App",
        description: "Please scan the QR code with your UPI app manually.",
        variant: "destructive"
      });
    }
  };

  const handleRefreshPaymentStatus = async () => {
    setIsRefreshing(true);
    
    try {
      const success = await paymentService.verifyPayment(true);
      
      if (success) {
        setIsPaid(true);
        toast({
          title: "Payment Found",
          description: "Your payment has been successfully verified."
        });
        
        setTimeout(() => {
          onPaymentComplete();
          onOpenChange(false);
        }, 1000);
      } else {
        toast({
          title: "No Payment Found",
          description: "We couldn't find your payment. Please try again after completing payment."
        });
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh payment status. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsRefreshing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="text-green-500" size={20} />
            Payment Required
          </DialogTitle>
          <DialogDescription>
            A one-time payment of ₹199 is required to use this application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {!isPaid ? (
            <>
              <div className="bg-white p-3 rounded-lg border shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI Payment QR Code" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-medium">Scan with any UPI app to pay</p>
                <p className="text-sm text-gray-500">UPI ID: {upiId}</p>
                <p className="text-sm text-gray-500">Amount: ₹{amount}</p>
                
                <Button 
                  onClick={handlePaymentInitiation}
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Open UPI App
                </Button>
              </div>
              
              {verificationMessage && (
                <div className={`flex items-center gap-2 text-sm ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {isVerifying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  <p>{verificationMessage}</p>
                </div>
              )}
              
              <div className="flex gap-2 items-center justify-center mt-4 text-xs text-gray-500">
                <Wallet size={14} />
                <span>Google Pay, PhonePe, Paytm, BHIM & other UPI apps supported</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <Check className="text-green-600 w-8 h-8" />
              </div>
              <p className="text-xl font-medium text-green-600">Payment Successful!</p>
              <p className="text-gray-500 text-sm mt-1">Thank you for your payment</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {!isPaid ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="sm:order-1"
              >
                Cancel
              </Button>
              
              {isVerifying ? (
                <Button 
                  disabled
                  className="gap-2 bg-blue-600 hover:bg-blue-700 sm:order-2"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Verifying Payment
                </Button>
              ) : (
                <div className="flex gap-2 sm:order-2">
                  <Button
                    variant="outline"
                    onClick={handleRefreshPaymentStatus}
                    disabled={isRefreshing}
                    className="gap-1"
                  >
                    {isRefreshing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Refresh
                  </Button>
                  
                  <Button 
                    onClick={verifyPayment}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard size={16} />
                    Verify Payment
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button 
              onClick={() => {
                onPaymentComplete();
                onOpenChange(false);
              }}
              className="w-full sm:w-auto"
            >
              Continue to App
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
