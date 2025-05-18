
import { usePayment } from "@/hooks/use-payment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentDialog from "@/components/PaymentDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard, Check, AlertTriangle, Info } from "lucide-react";

interface PaymentStatusProps {
  showReset?: boolean;
}

const PaymentStatus = ({ showReset = false }: PaymentStatusProps) => {
  const { hasPaid, paymentDetails, isLoading, resetPayment } = usePayment();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Checking payment status...
      </Badge>
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
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100 cursor-default">
              <AlertTriangle size={14} className="mr-1" /> Payment Required
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
        <CreditCard size={14} /> Make Payment
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
