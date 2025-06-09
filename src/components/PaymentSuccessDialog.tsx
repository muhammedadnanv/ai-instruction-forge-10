
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, KeyRound, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessCode: string;
  onContinue: () => void;
}

const PaymentSuccessDialog = ({ open, onOpenChange, accessCode, onContinue }: PaymentSuccessDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Access code copied to clipboard"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive"
      });
    }
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([`InstructAI Access Code\n\nYour Access Code: ${accessCode}\n\nGenerated: ${new Date().toLocaleString()}\n\nPlease keep this code safe and secure.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `InstructAI-Access-Code-${accessCode}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Code Downloaded",
      description: "Your access code has been saved to a text file"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Check className="bg-green-100 rounded-full p-1" size={24} />
            Payment Successful!
          </DialogTitle>
          <DialogDescription>
            Your payment has been processed successfully. Here's your unique access code:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Your Access Code</span>
            </div>
            
            <div className="bg-white border border-blue-300 rounded-md p-3 mb-3">
              <code className="text-lg font-mono text-center block text-blue-900 font-bold">
                {accessCode}
              </code>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex-1 gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCode}
                className="gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Download size={14} />
                Download
              </Button>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Please save this code securely. You'll need it to access the platform.
            </p>
          </div>
          
          <Badge variant="outline" className="w-full justify-center py-2 bg-green-50 text-green-700 border-green-200">
            <Check size={14} className="mr-1" />
            Access Granted - Welcome to InstructAI!
          </Badge>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => {
              onContinue();
              onOpenChange(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Continue to Platform
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessDialog;
