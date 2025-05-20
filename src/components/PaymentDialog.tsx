import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Wallet, AlertCircle, Loader2, RefreshCw, Copy, FileText } from "lucide-react";
import paymentService, { PAYMENT_STATUS, UPI_PAYMENT_DETAILS } from "@/services/paymentService";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { usePayment } from "@/hooks/use-payment";

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
  const [paymentTab, setPaymentTab] = useState("dodo");
  const [isProcessingDodo, setIsProcessingDodo] = useState(false);
  const { toast } = useToast();
  const { verifyPayment } = usePayment();
  
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
      const { sessionId } = await paymentService.initiateDodoPayment();
      
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed. Transaction ID: " + sessionId
      });
      
      setIsPaid(true);
      
      // Notify the parent component
      setTimeout(() => {
        onPaymentComplete();
        onOpenChange(false);
      }, 2000);
      
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
            A one-time payment of ₹{amount} is required to use this application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {!isPaid ? (
            <>
              <Tabs value={paymentTab} onValueChange={setPaymentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dodo">Dodo Pay</TabsTrigger>
                  <TabsTrigger value="upi">UPI QR Code</TabsTrigger>
                  <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                </TabsList>
                
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
                          Pay Now with Dodo
                        </>
                      )}
                    </Button>
                    
                    {paymentInitiated && (
                      <div className="mt-3 text-sm text-center text-green-600">
                        <Check size={14} className="inline mr-1" />
                        Payment initiated. Click "Verify Payment" below after completing.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="upi" className="flex flex-col items-center space-y-4 mt-4">
                  <div className="bg-white p-3 rounded-lg border shadow-sm">
                    <img 
                      src={qrCodeUrl} 
                      alt="UPI Payment QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="font-medium">Scan with any UPI app to pay</p>
                    <div className="flex items-center justify-center gap-2">
                      <Input 
                        value={upiId} 
                        readOnly 
                        className="text-sm text-center w-64"
                      />
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => copyToClipboard(upiId, "UPI ID")}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
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
                </TabsContent>
                
                <TabsContent value="bank" className="space-y-4 mt-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Beneficiary Details</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Name:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{beneficiaryName}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(beneficiaryName, "Name")}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{accountNumber}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(accountNumber, "Account Number")}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">IFSC Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ifscCode}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={() => copyToClipboard(ifscCode, "IFSC Code")}
                          >
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Amount:</span>
                        <Badge variant="outline" className="font-medium">₹{amount}</Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center gap-2" 
                        onClick={() => {
                          const details = `Name: ${beneficiaryName}\nAccount: ${accountNumber}\nIFSC: ${ifscCode}\nAmount: ₹${amount}`;
                          copyToClipboard(details, "All details");
                        }}
                      >
                        <FileText size={16} />
                        Copy All Details
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-center text-gray-500">
                    After making the bank transfer, click "Verify Payment" below.
                  </div>
                </TabsContent>
              </Tabs>
              
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
                <span>Dodo Pay, Google Pay, PhonePe, Paytm, BHIM & other UPI apps supported</span>
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
