
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, IndianRupee, Wallet } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
}

const PaymentDialog = ({ open, onOpenChange, onPaymentComplete }: PaymentDialogProps) => {
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();
  const upiId = "adnanmuhammad4393@okicici";
  const amount = "199";

  // Generate UPI QR code link
  const upiQrLink = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=InstructAI Payment`;
  
  // Generate QR code image URL using a QR code API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiQrLink)}`;

  const handlePaymentConfirmation = () => {
    // In a real app, you would verify payment through a backend API
    // For this demo, we'll simulate payment verification
    localStorage.setItem('payment_verified', 'true');
    localStorage.setItem('payment_date', new Date().toISOString());
    
    setIsPaid(true);
    toast({
      title: "Payment Confirmed",
      description: "Thank you for your payment. You can now use all features."
    });
    
    setTimeout(() => {
      onPaymentComplete();
      onOpenChange(false);
    }, 2000);
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
              </div>
              
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
              <Button 
                onClick={handlePaymentConfirmation}
                className="gap-2 bg-green-600 hover:bg-green-700 sm:order-2"
              >
                <CreditCard size={16} />
                I've Made the Payment
              </Button>
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
