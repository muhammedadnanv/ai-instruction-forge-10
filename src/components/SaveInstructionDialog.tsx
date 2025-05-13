
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SaveInstructionDialogProps {
  instruction: string;
  framework: string;
}

const SaveInstructionDialog = ({ instruction, framework }: SaveInstructionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [instructionName, setInstructionName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!instructionName.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for your instruction",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // Here we would normally save to a database
    // For now, we'll simulate saving to localStorage
    try {
      const savedInstructions = JSON.parse(localStorage.getItem("savedInstructions") || "[]");
      const newInstruction = {
        id: Date.now(),
        name: instructionName,
        framework,
        content: instruction,
        createdAt: new Date().toISOString(),
      };
      savedInstructions.push(newInstruction);
      localStorage.setItem("savedInstructions", JSON.stringify(savedInstructions));
      
      toast({
        title: "Instruction saved",
        description: "Your instruction has been saved successfully",
      });
      
      setOpen(false);
      setInstructionName("");
    } catch (error) {
      toast({
        title: "Error saving",
        description: "Failed to save your instruction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 flex gap-2 text-indigo-600"
          disabled={!instruction}
        >
          <Save size={18} />
          Save Instruction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Instruction</DialogTitle>
          <DialogDescription>
            Give your instruction a name to save it for future use.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="My Custom Instruction"
              className="col-span-3"
              value={instructionName}
              onChange={(e) => setInstructionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !instructionName.trim()} 
            className="bg-gradient-to-r from-indigo-600 to-blue-600"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveInstructionDialog;
