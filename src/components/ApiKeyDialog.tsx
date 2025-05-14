
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Key } from "lucide-react";
import geminiService from "@/services/geminiService";
import PaymentDialog from "./PaymentDialog";

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
  const [hasPaid, setHasPaid] = useState(false);
  
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
    
    // Check if payment has been made
    const paymentVerified = localStorage.getItem('payment_verified') === 'true';
    setHasPaid(paymentVerified);
  }, []);

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
    setHasPaid(true);
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
