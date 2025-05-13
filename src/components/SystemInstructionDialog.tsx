
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, MessageSquareText } from "lucide-react";
import { Label } from "@/components/ui/label";
import geminiService from "@/services/geminiService";

interface SystemInstructionDialogProps {
  onSystemInstructionSet: () => void;
}

const SystemInstructionDialog = ({ onSystemInstructionSet }: SystemInstructionDialogProps) => {
  const [systemInstruction, setSystemInstruction] = useState("");
  const [open, setOpen] = useState(false);
  const [useStreaming, setUseStreaming] = useState(() => {
    return localStorage.getItem("use_streaming") === "true";
  });
  const { toast } = useToast();
  const [hasStoredInstruction, setHasStoredInstruction] = useState(false);

  useEffect(() => {
    const storedInstruction = geminiService.getDefaultSystemInstruction();
    if (storedInstruction) {
      setSystemInstruction(storedInstruction);
      setHasStoredInstruction(true);
    }
  }, []);

  const handleSaveInstruction = () => {
    try {
      geminiService.setDefaultSystemInstruction(systemInstruction.trim());
      localStorage.setItem("use_streaming", useStreaming.toString());
      
      setHasStoredInstruction(!!systemInstruction.trim());
      toast({
        title: "System Instruction Saved",
        description: systemInstruction.trim() 
          ? "Your system instruction has been saved" 
          : "System instruction has been cleared"
      });
      onSystemInstructionSet();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error Saving System Instruction",
        description: "There was a problem saving your system instruction",
        variant: "destructive"
      });
    }
  };

  const buttonLabel = hasStoredInstruction ? "Edit System Instruction" : "Set System Instruction";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={hasStoredInstruction ? "outline" : "default"} className="gap-2">
          <MessageSquareText size={16} />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gemini System Instructions</DialogTitle>
          <DialogDescription>
            Define persistent behavior for Gemini across conversations. System instructions help establish tone, persona, boundaries, or task-specific logic.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <Textarea
            placeholder="Example: You are a helpful AI assistant specialized in creating clear and comprehensive instructions for AI systems."
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            className="w-full h-40 resize-y"
          />
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="streaming-mode" 
              checked={useStreaming} 
              onCheckedChange={setUseStreaming} 
            />
            <Label htmlFor="streaming-mode">Enable streaming responses</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveInstruction}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SystemInstructionDialog;
