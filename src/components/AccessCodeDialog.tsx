
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2 } from "lucide-react";

interface AccessCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCodeSubmit: (code: string) => Promise<boolean>;
}

const AccessCodeDialog = ({ open, onOpenChange, onCodeSubmit }: AccessCodeDialogProps) => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) return;
    
    setIsValidating(true);
    
    try {
      const success = await onCodeSubmit(code.trim().toUpperCase());
      
      if (success) {
        setCode("");
        onOpenChange(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-blue-500" size={20} />
            Enter Access Code
          </DialogTitle>
          <DialogDescription>
            Please enter your access code to use the platform. If you don't have one, you'll need to complete payment first.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">Access Code</Label>
            <Input
              id="access-code"
              type="text"
              placeholder="AC-XXXXXXXX-XXXXXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="uppercase font-mono"
              disabled={isValidating}
              autoFocus
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isValidating}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              disabled={!code.trim() || isValidating}
              className="gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  Verify Code
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessCodeDialog;
