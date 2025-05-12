import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import InstructionBuilder from "@/components/InstructionBuilder";
import FrameworkSelector from "@/components/FrameworkSelector";
import Header from "@/components/Header";
import OutputPreview from "@/components/OutputPreview";
import PromptCollection from "@/components/PromptCollection";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, Copy, Lightbulb } from "lucide-react";
const Index = () => {
  const [selectedFramework, setSelectedFramework] = useState("ACT");
  const [instruction, setInstruction] = useState("");
  const [generatedInstruction, setGeneratedInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const generateInstruction = async () => {
    if (!instruction.trim()) {
      toast({
        title: "Error",
        description: "Please enter an instruction prompt first.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      // In a real implementation, this would call the Gemini API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));
      const frameworkPrefix = getFrameworkPrefix(selectedFramework);
      const generatedText = `${frameworkPrefix}\n\n${instruction}\n\nYou are an AI assistant that helps with ${instruction.split(' ').slice(0, 3).join(' ')}... and follows these principles:\n\n- Respond concisely and accurately\n- Stay on topic and relevant to user queries\n- Provide helpful information without unnecessary details\n- Maintain a professional, friendly tone`;
      setGeneratedInstruction(generatedText);
      toast({
        title: "Success",
        description: "AI instruction generated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate instruction. Please try again.",
        variant: "destructive"
      });
      console.error("Error generating instruction:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  const getFrameworkPrefix = (framework: string) => {
    const frameworks: Record<string, string> = {
      "ACT": "# ACT Framework (Action, Context, Target)",
      "COT": "# Chain of Thought Framework",
      "ReACT": "# ReACT Framework (Reason + Act)",
      "TREE": "# TREE Framework (Tool-Reasoning Enhanced Execution)",
      "SCQA": "# SCQA Framework (Situation, Complication, Question, Answer)",
      "OODA": "# OODA Framework (Observe, Orient, Decide, Act)",
      "PROMPT": "# PROMPT Framework (Persona, Role, Objective, Method, Process, Tone)",
      "MOT": "# MOT Framework (Mode, Objective, Type)",
      "PEEL": "# PEEL Framework (Point, Evidence, Explain, Link)",
      "CRISP": "# CRISP Framework (Context, Request, Instruction, Style, Parameters)"
    };
    return frameworks[framework] || "# Custom Framework";
  };
  const copyToClipboard = () => {
    if (!generatedInstruction) {
      toast({
        title: "Nothing to copy",
        description: "Generate an instruction first",
        variant: "destructive"
      });
      return;
    }
    navigator.clipboard.writeText(generatedInstruction);
    toast({
      title: "Copied!",
      description: "Instruction copied to clipboard"
    });
  };
  return <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Header />
      
      <main className="container py-8 px-4 mx-auto">
        <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="create">Create Instruction</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="saved">Saved Instructions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold text-gray-800">Define Your AI Instructions</h2>
                    <Lightbulb size={20} className="text-amber-500" />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-700">
                      Select a framework and provide details about how you want the AI to behave.
                      The builder below will help you structure your instructions according to the 
                      chosen framework.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Framework
                    </label>
                    <FrameworkSelector selectedFramework={selectedFramework} setSelectedFramework={setSelectedFramework} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instruction Prompt
                    </label>
                    <Textarea placeholder="Enter details about how you want the AI to behave..." className="min-h-[150px] resize-y" value={instruction} onChange={e => setInstruction(e.target.value)} />
                  </div>
                  
                  <InstructionBuilder framework={selectedFramework} setInstruction={setInstruction} />
                  
                  <div className="flex gap-3">
                    <Button onClick={generateInstruction} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 flex gap-2">
                      <Sparkles size={18} />
                      {isGenerating ? "Generating..." : "Generate Instructions"}
                    </Button>
                    
                    <Button variant="outline" onClick={copyToClipboard} disabled={!generatedInstruction} className="flex gap-2">
                      <Copy size={18} />
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Generated Instruction</h2>
                  </div>
                  <OutputPreview generatedInstruction={generatedInstruction} isGenerating={isGenerating} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <PromptCollection setInstruction={setInstruction} setSelectedFramework={setSelectedFramework} />
            </TabsContent>
            
            <TabsContent value="saved">
              <div className="text-center py-10">
                <h3 className="text-xl font-medium text-gray-500">Saved instructions will appear here</h3>
                <p className="text-gray-400 mt-2">Generate and save instructions to access them later</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>AI System Instruction Generator © 2025</p>
          <p className="mt-1">Powered by Muhammed Adnan</p>
        </div>
      </footer>
    </div>;
};
export default Index;