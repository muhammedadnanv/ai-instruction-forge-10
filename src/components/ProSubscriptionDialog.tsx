
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Loader2, RefreshCw, BadgeIndianRupee, Calendar } from "lucide-react";
import paymentService, { PRO_SUBSCRIPTION_DETAILS } from "@/services/paymentService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ProSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionComplete: () => void;
}

const ProSubscriptionDialog = ({ open, onOpenChange, onSubscriptionComplete }: ProSubscriptionDialogProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingDodo, setIsProcessingDodo] = useState(false);
  const { toast } = useToast();
  
  const { amount, currency, period } = PRO_SUBSCRIPTION_DETAILS;

  // Check subscription status when dialog opens
  useState(() => {
    if (open) {
      const isAlreadySubscribed = paymentService.isProSubscriber();
      if (isAlreadySubscribed) {
        setIsSubscribed(true);
      }
    }
  });

  // Process subscription with Dodo
  const processSubscription = async () => {
    setIsProcessingDodo(true);
    
    try {
      // Call the Dodo payment initiation for subscription
      const { sessionId } = await paymentService.initiateDodoPayment(true);
      
      toast({
        title: "Subscription Initiated",
        description: "Dodo payment process started. Transaction ID: " + sessionId
      });
      
      setPaymentInitiated(true);
      
      // For demo purposes, simulate processing
      setTimeout(() => {
        setIsProcessingDodo(false);
        toast({
          title: "Ready to Verify",
          description: "Click 'Verify Subscription' to complete the process"
        });
      }, 2000);
      
    } catch (error) {
      console.error("Dodo subscription error:", error);
      setIsProcessingDodo(false);
      toast({
        title: "Payment Error",
        description: "Failed to initiate subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Verify subscription payment
  const verifySubscription = async () => {
    setIsVerifying(true);
    setVerificationMessage("Verifying your subscription...");
    
    try {
      const success = await paymentService.verifyPayment(paymentInitiated, true);
      
      if (success) {
        setIsSubscribed(true);
        setVerificationMessage("");
        
        toast({
          title: "Subscription Activated",
          description: "Thank you! Your Pro subscription is now active."
        });
        
        setTimeout(() => {
          onSubscriptionComplete();
          onOpenChange(false);
        }, 2000);
      } else {
        setIsVerifying(false);
        setVerificationMessage("We couldn't verify your subscription. If you've already paid, please try again.");
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your subscription. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsVerifying(false);
      setVerificationMessage("An error occurred during verification. Please try again.");
      toast({
        title: "Verification Error",
        description: "An error occurred while verifying your subscription.",
        variant: "destructive"
      });
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    
    try {
      const success = await paymentService.verifyPayment(true, true);
      
      if (success) {
        setIsSubscribed(true);
        toast({
          title: "Subscription Found",
          description: "Your Pro subscription has been successfully verified."
        });
        
        setTimeout(() => {
          onSubscriptionComplete();
          onOpenChange(false);
        }, 1000);
      } else {
        toast({
          title: "No Subscription Found",
          description: "We couldn't find your subscription. Please try again after completing payment."
        });
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh subscription status. Please try again.",
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
            <BadgeIndianRupee className="text-blue-500" size={20} />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Subscribe to InstructAI Pro for ₹{amount}/{period} to unlock all premium features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {!isSubscribed ? (
            <>
              <div className="bg-white p-5 rounded-lg border-2 border-blue-500 shadow-md w-full">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-1">Pro Subscription</h3>
                  <p className="text-sm text-gray-600">Unlock all premium features</p>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Price:</span>
                    <Badge variant="outline" className="font-medium bg-blue-100">₹{amount}/{period}</Badge>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-md">
                    <h4 className="font-medium text-sm mb-2">Pro Benefits:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Unlimited prompt generations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Access to all advanced features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={processSubscription} 
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
                      Subscribe Now - ₹{amount}/{period}
                    </>
                  )}
                </Button>
                
                {paymentInitiated && (
                  <div className="mt-3 text-sm text-center text-green-600">
                    <Check size={14} className="inline mr-1" />
                    Payment initiated. Click "Verify Subscription" below after completing.
                  </div>
                )}
              </div>
              
              {verificationMessage && (
                <div className={`flex items-center gap-2 text-sm ${isSubscribed ? 'text-green-600' : 'text-amber-600'}`}>
                  {isVerifying ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Calendar size={14} />
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
              <p className="text-xl font-medium text-green-600">You're a Pro!</p>
              <p className="text-gray-500 text-sm mt-1">Your subscription is active</p>
              <Badge variant="outline" className="mt-3 bg-blue-50 text-blue-600 px-3 py-1">
                <Calendar size={14} className="mr-1" />
                Pro Subscriber
              </Badge>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {!isSubscribed ? (
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
                  Verifying Subscription
                </Button>
              ) : (
                <div className="flex gap-2 sm:order-2">
                  <Button
                    variant="outline"
                    onClick={handleRefreshStatus}
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
                    onClick={verifySubscription}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard size={16} />
                    Verify Subscription
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button 
              onClick={() => {
                onSubscriptionComplete();
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

export default ProSubscriptionDialog;
