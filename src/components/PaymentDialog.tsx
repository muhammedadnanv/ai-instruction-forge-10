
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Wallet, AlertCircle, Loader2, RefreshCw, Copy, FileText } from "lucide-react";
import paymentService, { PAYMENT_STATUS, UPI_PAYMENT_DETAILS } from "@/services/paymentService";
import { usePayment } from "@/hooks/use-payment";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: (accessCode: string) => void;
}

const PaymentDialog = ({ open, onOpenChange, onPaymentComplete }: PaymentDialogProps) => {
  const [isPaid, setIsPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paymentTab, setPaymentTab] = useState("upi");
  const [isProcessingDodo, setIsProcessingDodo] = useState(false);
  const { toast } = useToast();
  const { verifyPaymentStatus } = usePayment();
  
  const { upiId, amount, currency, beneficiaryName, accountNumber, ifscCode } = UPI_PAYMENT_DETAILS;

  // Generate UPI QR code link
  const upiQrLink = `upi://pay?pa=${upiId}&am=${amount}&cu=${currency}&tn=InstructAI Payment`;
  
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

  // Copy text to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually",
        variant: "destructive"
      });
      console.error("Failed to copy:", err);
    });
  };

  // Process payment with Dodo
  const processDodoPayment = async () => {
    setIsProcessingDodo(true);
    
    try {
      // Call the Dodo payment initiation
      const { sessionId, accessCode } = await paymentService.initiateDodoPayment();
      
      if (accessCode) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed. Transaction ID: " + sessionId
        });
        
        setIsPaid(true);
        
        // Notify the parent component with the access code
        setTimeout(() => {
          onPaymentComplete(accessCode);
          onOpenChange(false);
        }, 1000);
      }
      
    } catch (error) {
      console.error("Dodo payment error:", error);
      setIsProcessingDodo(false);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingDodo(false);
    }
  };

  // Simulated payment verification
  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    setVerificationMessage("Verifying your payment...");
    
    try {
      const success = await verifyPaymentStatus(paymentInitiated);
      
      if (success) {
        // Generate access code after verification
        const accessCode = paymentService.recordPayment();
        
        setIsPaid(true);
        setVerificationMessage("");
        
        toast({
          title: "Payment Verified",
          description: "Thank you for your payment. You now have full access to all features."
        });
        
        setTimeout(() => {
          onPaymentComplete(accessCode || "GENERATING...");
          onOpenChange(false);
        }, 1000);
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
      const success = await verifyPaymentStatus(true);
      
      if (success) {
        const accessCode = paymentService.recordPayment();
        setIsPaid(true);
        toast({
          title: "Payment Found",
          description: "Your payment has been successfully verified."
        });
        
        setTimeout(() => {
          onPaymentComplete(accessCode || "GENERATING...");
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
            Purchase Platform Access
          </DialogTitle>
          <DialogDescription>
            A one-time payment of ₹{amount} grants you lifetime access to InstructAI with a unique access code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {!isPaid ? (
            <>
              {/* UPI Gateway Widget */}
              <div className="w-full max-w-sm mx-auto border border-gray-200 rounded-lg p-5 shadow-sm bg-white upi-gateway-container">
                <style jsx>{`
                  @media (max-width: 480px) {
                    .upi-gateway-container {
                      max-width: 100% !important;
                      margin: 0 !important;
                      border-radius: 8px !important;
                      padding: 16px !important;
                    }
                    .upi-gateway-title {
                      font-size: 18px !important;
                    }
                    .upi-gateway-details {
                      font-size: 13px !important;
                    }
                    .upi-gateway-button {
                      padding: 14px 0 !important;
                      font-size: 15px !important;
                    }
                    .upi-gateway-qr {
                      width: 160px !important;
                      height: 160px !important;
                    }
                    .upi-gateway-note {
                      font-size: 11px !important;
                    }
                  }
                `}</style>
                
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-4 upi-gateway-title">
                  Pay with UPI
                </h3>
                
                <div className="text-center mb-5">
                  <img 
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code" 
                    className="w-48 h-48 border-2 border-gray-100 rounded-lg mx-auto upi-gateway-qr"
                  />
                  <p className="mt-3 text-xs text-gray-500 font-medium">
                    Scan with any UPI app
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1 upi-gateway-details">
                    <strong>UPI ID:</strong> {upiId}
                  </p>
                  <p className="text-sm text-gray-600 mb-1 upi-gateway-details">
                    <strong>Payee:</strong> {beneficiaryName}
                  </p>
                  <p className="text-sm text-gray-600 upi-gateway-details">
                    <strong>Amount:</strong> ₹{amount}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 text-center">
                  <p className="text-xs text-gray-500 mb-3">Or click to pay directly</p>
                  <a 
                    href={upiQrLink}
                    className="block no-underline"
                    onClick={handlePaymentInitiation}
                  >
                    <button 
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-base font-semibold rounded-lg cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 upi-gateway-button"
                    >
                      💳 Pay ₹{amount} via UPI
                    </button>
                  </a>
                </div>

                <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed upi-gateway-note">
                  Supports PhonePe, Google Pay, Paytm, BHIM & all UPI apps<br />
                  Secure payment powered by UPI
                </p>
              </div>
              
              <Tabs value={paymentTab} onValueChange={setPaymentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upi">UPI Payment</TabsTrigger>
                  <TabsTrigger value="dodo">Dodo Pay</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upi" className="mt-4">
                  {paymentInitiated && (
                    <div className="mt-3 text-sm text-center text-green-600 bg-green-50 p-2 rounded">
                      <Check size={14} className="inline mr-1" />
                      Payment initiated. Click "Verify Payment" below after completing.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="dodo" className="flex flex-col items-center space-y-4 mt-4">
                  <div className="bg-white p-5 rounded-lg border-2 border-blue-500 shadow-md w-full">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold mb-1">Pay with Dodo</h3>
                      <p className="text-sm text-gray-600">Fast and secure payment gateway</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Amount:</span>
                        <Badge variant="outline" className="font-medium bg-blue-100">₹{amount}</Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Access:</span>
                        <Badge variant="outline" className="font-medium bg-green-100 text-green-600">Lifetime</Badge>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={processDodoPayment} 
                      disabled={isProcessingDodo}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessingDodo ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} className="mr-2" />
                          Pay ₹{amount} & Get Access Code
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="sm:justify-between w-full flex flex-col sm:flex-row gap-2 mt-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleRefreshPaymentStatus}
                    variant="outline"
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    {isRefreshing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Refresh Status
                  </Button>
                  
                  <Button 
                    onClick={handleVerifyPayment}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard size={16} />
                    Verify Payment
                  </Button>
                </div>
              </DialogFooter>
              
              {verificationMessage && (
                <div className={`flex items-center gap-2 text-sm ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {isVerifying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isPaid ? (
                    <Check size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  <p>{verificationMessage}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <Check className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 text-center max-w-xs">
                Thank you for your payment. Your access code will be generated shortly.
              </p>
              
              <Button 
                onClick={() => {
                  onPaymentComplete("GENERATING...");
                  onOpenChange(false);
                }}
                className="mt-6"
                variant="default"
              >
                Continue to Get Access Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
