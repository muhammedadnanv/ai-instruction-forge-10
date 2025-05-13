
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Copy, 
  MoreVertical, 
  Trash2, 
  FileText,
  Calendar,
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedInstruction {
  id: number;
  name: string;
  framework: string;
  content: string;
  createdAt: string;
}

const SavedInstructions = () => {
  const [instructions, setInstructions] = useState<SavedInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedInstructions = JSON.parse(localStorage.getItem("savedInstructions") || "[]");
      setInstructions(savedInstructions);
    } catch (error) {
      console.error("Error loading saved instructions:", error);
      toast({
        title: "Error",
        description: "Failed to load saved instructions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Instruction copied to clipboard",
    });
  };

  const deleteInstruction = (id: number) => {
    try {
      const updatedInstructions = instructions.filter(
        (instruction) => instruction.id !== id
      );
      localStorage.setItem(
        "savedInstructions",
        JSON.stringify(updatedInstructions)
      );
      setInstructions(updatedInstructions);
      toast({
        title: "Deleted",
        description: "Instruction has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete instruction",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-indigo-200"></div>
          <div className="h-3 w-3 rounded-full bg-indigo-300"></div>
          <div className="h-3 w-3 rounded-full bg-indigo-400"></div>
        </div>
      </div>
    );
  }

  if (instructions.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-500">No saved instructions</h3>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          Generate and save instructions to access them later. Your saved instructions will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instructions.map((instruction) => (
          <Card key={instruction.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800 line-clamp-1">{instruction.name}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => copyToClipboard(instruction.content)}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteInstruction(instruction.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="text-sm text-gray-500 mb-3 line-clamp-2">
              {instruction.content.substring(0, 100)}...
            </div>
            
            <div className="flex items-center text-xs text-gray-500 gap-3">
              <div className="flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                {instruction.framework}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(instruction.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SavedInstructions;
