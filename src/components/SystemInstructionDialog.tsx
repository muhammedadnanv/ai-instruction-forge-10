
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, MessageSquareText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import geminiService from "@/services/geminiService";
import { useHuggingFace } from "@/hooks/use-huggingface";

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
  const [activeProvider, setActiveProvider] = useState("gemini");
  const [huggingFaceApiKey, setHuggingFaceApiKey] = useState("");
  const { setupHuggingFace, hasApiKey } = useHuggingFace();

  useEffect(() => {
    const storedInstruction = geminiService.getDefaultSystemInstruction();
    if (storedInstruction) {
      setSystemInstruction(storedInstruction);
      setHasStoredInstruction(true);
    }
    
    // Load the Hugging Face API key
    const hfApiKey = localStorage.getItem("huggingface_api_key");
    if (hfApiKey) {
      setHuggingFaceApiKey(hfApiKey);
    }
  }, []);

  const handleSaveInstruction = () => {
    try {
      if (activeProvider === "gemini") {
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
      } else if (activeProvider === "huggingface") {
        if (huggingFaceApiKey) {
          setupHuggingFace({ apiKey: huggingFaceApiKey });
          localStorage.setItem("hf_system_instruction", systemInstruction);
          toast({
            title: "Hugging Face Settings Saved",
            description: "Your API key and system instruction have been saved"
          });
          onSystemInstructionSet();
        } else {
          toast({
            title: "API Key Required",
            description: "Please enter a Hugging Face API key",
            variant: "destructive"
          });
          return;
        }
      }
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings",
        variant: "destructive"
      });
    }
  };

  const buttonLabel = hasStoredInstruction || hasApiKey ? "Edit Settings" : "Configure AI Settings";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={hasStoredInstruction || hasApiKey ? "outline" : "default"} className="gap-2">
          <MessageSquareText size={16} />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Model Configuration</DialogTitle>
          <DialogDescription>
            Configure your preferred AI providers and set up system instructions.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeProvider} onValueChange={setActiveProvider} className="pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gemini">Google Gemini</TabsTrigger>
            <TabsTrigger value="huggingface">Hugging Face</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="py-4 space-y-4">
          {activeProvider === "gemini" && (
            <>
              <div>
                <Label htmlFor="system-instruction">System Instruction</Label>
                <Textarea
                  id="system-instruction"
                  placeholder="Example: You are a helpful AI assistant specialized in creating clear and comprehensive instructions for AI systems."
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full h-40 resize-y mt-2"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="streaming-mode" 
                  checked={useStreaming} 
                  onCheckedChange={setUseStreaming} 
                />
                <Label htmlFor="streaming-mode">Enable streaming responses</Label>
              </div>
            </>
          )}
          
          {activeProvider === "huggingface" && (
            <>
              <div>
                <Label htmlFor="hf-api-key">API Key</Label>
                <Input
                  id="hf-api-key"
                  type="password"
                  value={huggingFaceApiKey}
                  onChange={(e) => setHuggingFaceApiKey(e.target.value)}
                  placeholder="Enter your Hugging Face API key"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="hf-system-instruction">System Instruction</Label>
                <Textarea
                  id="hf-system-instruction"
                  placeholder="Enter default system instruction for Hugging Face models"
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  className="w-full h-40 resize-y mt-2"
                />
              </div>
            </>
          )}
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
