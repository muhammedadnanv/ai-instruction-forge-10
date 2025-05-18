
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key, Info } from "lucide-react";
import geminiService from "@/services/geminiService";
import PaymentDialog from "./PaymentDialog";
import paymentService from "@/services/paymentService";
import { usePayment } from "@/hooks/use-payment";

interface ApiKeyDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApiKeySubmit?: () => void;
  onApiKeySet?: () => void;
}

const ApiKeyDialog = ({ open: controlledOpen, onOpenChange, onApiKeySubmit, onApiKeySet }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState("");
  const [open, setOpen] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { toast } = useToast();
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const { hasPaid, verifyPayment } = usePayment();
  
  // Handle controlled/uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  useEffect(() => {
    const storedKey = geminiService.getApiKey();
    setHasStoredKey(!!storedKey);
    
    // Pre-fill the input field with the stored API key (if available)
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Gemini API key",
        variant: "destructive"
      });
      return;
    }

    try {
      geminiService.setApiKey(apiKey.trim());
      setHasStoredKey(true);
      
      // If user hasn't paid, show payment dialog
      if (!hasPaid) {
        setShowPaymentDialog(true);
      } else {
        // If already paid, just complete the flow
        completeSetup();
      }
    } catch (error) {
      toast({
        title: "Error Saving API Key",
        description: "There was a problem saving your API key",
        variant: "destructive"
      });
    }
  };
  
  const completeSetup = () => {
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved"
    });
    
    if (onApiKeySet) {
      onApiKeySet();
    }
    
    if (onApiKeySubmit) {
      onApiKeySubmit();
    }
    
    handleOpenChange(false);
  };

  const handlePaymentComplete = () => {
    completeSetup();
  };

  const buttonLabel = hasStoredKey ? "Update API Key" : "Set API Key";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant={hasStoredKey ? "outline" : "default"} className="gap-2">
            <Key size={16} />
            {buttonLabel}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API Key</DialogTitle>
            <DialogDescription>
              Enter your Gemini API key to use AI instruction generation features.
              You can get a Gemini API key from the <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            
            <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md flex items-start gap-2">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                After setting your API key, a one-time payment of ₹199 is required to use the full features of InstructAI. 
                You will be prompted for payment after saving your API key.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSaveApiKey}>Save API Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <PaymentDialog 
        open={showPaymentDialog} 
        onOpenChange={setShowPaymentDialog} 
        onPaymentComplete={handlePaymentComplete} 
      />
    </>
  );
};

export default ApiKeyDialog;
