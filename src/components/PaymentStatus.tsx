
import { usePayment } from "@/hooks/use-payment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentDialog from "@/components/PaymentDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, Check, AlertCircle, Wallet, Calendar } from "lucide-react";
import ProSubscriptionDialog from "./ProSubscriptionDialog";

interface PaymentStatusProps {
  showReset?: boolean;
}

const PaymentStatus = ({ showReset = false }: PaymentStatusProps) => {
  const { hasPaid, isPro, paymentDetails, subscriptionDetails, isLoading, resetPayment } = usePayment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showProDialog, setShowProDialog] = useState(false);

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Checking payment status...
      </Badge>
    );
  }

  if (isPro) {
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-default">
                <Calendar size={14} className="mr-1" /> Pro
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>Pro Subscription Active</p>
                <p>Started: {new Date(subscriptionDetails?.startDate || "").toLocaleDateString()}</p>
                <p>Amount: {subscriptionDetails?.currency} {subscriptionDetails?.amount}/month</p>
                {showReset && (
                  <p className="text-amber-500 mt-1">Admin: Reset option available</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {showReset && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetPayment} 
            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Reset All Payments
          </Button>
        )}
      </div>
    );
  }

  if (hasPaid) {
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100 cursor-default">
                <Check size={14} className="mr-1" /> Paid
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>Payment Date: {new Date(paymentDetails?.date || "").toLocaleDateString()}</p>
                <p>Amount: {paymentDetails?.currency} {paymentDetails?.amount}</p>
                {showReset && (
                  <p className="text-amber-500 mt-1">Admin: Reset option available</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button 
          variant="default" 
          size="sm" 
          className="h-7 text-xs gap-1 bg-gradient-to-r from-blue-600 to-indigo-600"
          onClick={() => setShowProDialog(true)}
        >
          <Calendar size={14} /> Upgrade to Pro
        </Button>

        {showReset && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetPayment} 
            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Reset Payment
          </Button>
        )}
        
        <ProSubscriptionDialog
          open={showProDialog}
          onOpenChange={setShowProDialog}
          onSubscriptionComplete={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-default">
              <AlertCircle size={14} className="mr-1" /> Payment Required
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">A one-time payment of ₹199 is required to use all features</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Button 
        variant="default" 
        size="sm" 
        className="h-7 text-xs gap-1 bg-gradient-to-r from-blue-600 to-indigo-600"
        onClick={() => setShowPaymentDialog(true)}
      >
        <Wallet size={14} /> Pay with Dodo
      </Button>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPaymentComplete={() => {}}
      />
    </div>
  );
};

export default PaymentStatus;
