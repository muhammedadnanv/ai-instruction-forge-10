import { useState, useEffect } from "react";
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
import SavedInstructions from "@/components/SavedInstructions";
import SaveInstructionDialog from "@/components/SaveInstructionDialog";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import SystemInstructionDialog from "@/components/SystemInstructionDialog";
import FunctionCallingTools from "@/components/FunctionCallingTools";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Lightbulb, Info, FileText as FileTextIcon, AlertCircle, FileCode } from "lucide-react";
import geminiService, { GeminiTool } from "@/services/geminiService";

const Index = () => {
  const [selectedFramework, setSelectedFramework] = useState("ACT");
  const [instruction, setInstruction] = useState("");
  const [generatedInstruction, setGeneratedInstruction] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasSystemInstruction, setHasSystemInstruction] = useState(false);
  const [tools, setTools] = useState<GeminiTool[]>([]);
  const { toast } = useToast();

  // Check if streaming is enabled
  const isStreamingEnabled = () => {
    return localStorage.getItem("use_streaming") === "true";
  };

  useEffect(() => {
    // Check if API key is already set
    const apiKey = geminiService.getApiKey();
    setHasApiKey(!!apiKey);

    // Check if system instruction is set
    const systemInstruction = geminiService.getDefaultSystemInstruction();
    setHasSystemInstruction(!!systemInstruction);
  }, []);

  const generateInstruction = async () => {
    if (!geminiService.getApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key first",
        variant: "destructive"
      });
      return;
    }

    if (!instruction.trim()) {
      toast({
        title: "Error",
        description: "Please enter an instruction prompt first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    // Reset generated content
    if (isStreamingEnabled()) {
      setStreamingContent("");
    } else {
      setGeneratedInstruction("");
    }

    const request = {
      prompt: instruction,
      framework: selectedFramework,
      tools: tools.length > 0 ? tools : undefined
    };

    try {
      if (isStreamingEnabled()) {
        // Use streaming API
        await geminiService.generateInstructionStream(request, {
          onStart: () => {
            console.log("Stream started");
          },
          onUpdate: (chunk) => {
            setStreamingContent(prev => prev + chunk);
          },
          onComplete: (fullText) => {
            setStreamingContent(fullText);
            setIsGenerating(false);
            toast({
              title: "Success",
              description: "AI instruction generated successfully!"
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: error.message || "Failed to generate instruction. Please try again.",
              variant: "destructive"
            });
            setIsGenerating(false);
          }
        });
      } else {
        // Use regular API
        const response = await geminiService.generateInstruction(request);
        setGeneratedInstruction(response.generatedText);
        toast({
          title: "Success",
          description: "AI instruction generated successfully!"
        });
        setIsGenerating(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate instruction. Please try again.",
        variant: "destructive"
      });
      console.error("Error generating instruction:", error);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const contentToCopy = isStreamingEnabled() ? streamingContent : generatedInstruction;
    
    if (!contentToCopy) {
      toast({
        title: "Nothing to copy",
        description: "Generate an instruction first",
        variant: "destructive"
      });
      return;
    }
    navigator.clipboard.writeText(contentToCopy);
    toast({
      title: "Copied!",
      description: "Instruction copied to clipboard"
    });
  };

  const handleAddTool = (tool: GeminiTool) => {
    setTools(prev => [...prev, tool]);
  };

  const handleRemoveTool = (toolName: string) => {
    setTools(prev => prev.filter(tool => tool.name !== toolName));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      <Header />
      
      <main className="container py-8 px-4 mx-auto">
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">Create Powerful AI Instructions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use proven frameworks and Gemini AI to generate effective instructions that guide AI behavior with precision and clarity
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <ApiKeyDialog onApiKeySet={() => setHasApiKey(true)} />
            <SystemInstructionDialog onSystemInstructionSet={() => setHasSystemInstruction(true)} />
          </div>
        </section>

        {!hasApiKey && (
          <div className="mb-6 flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="text-amber-500 mr-2 flex-shrink-0" />
            <p className="text-amber-700">
              To use instruction generation features, please set your Gemini API key using the button above.
            </p>
          </div>
        )}

        <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-xl">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 p-1 bg-gray-100 rounded-lg">
              <TabsTrigger value="create" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Create Instruction</TabsTrigger>
              <TabsTrigger value="templates" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Templates</TabsTrigger>
              <TabsTrigger value="saved" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Saved Instructions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="flex items-center space-x-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Info size={22} className="text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Select a framework and provide details about how you want the AI to behave. 
                      The generated instruction will help guide AI models to produce better responses.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Framework
                    </label>
                    <FrameworkSelector selectedFramework={selectedFramework} setSelectedFramework={setSelectedFramework} />
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span>Instruction Prompt</span>
                      <Lightbulb size={16} className="text-amber-500 ml-2" />
                    </label>
                    <Textarea 
                      placeholder="Enter details about how you want the AI to behave..." 
                      className="min-h-[150px] resize-y border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" 
                      value={instruction} 
                      onChange={e => setInstruction(e.target.value)} 
                    />
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <FileCode size={16} />
                        Function Calling Tools
                      </h3>
                    </div>
                    <FunctionCallingTools 
                      onAddTool={handleAddTool} 
                      onRemoveTool={handleRemoveTool}
                      tools={tools} 
                    />
                  </div>
                  
                  <InstructionBuilder framework={selectedFramework} setInstruction={setInstruction} />
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={generateInstruction} 
                      disabled={isGenerating || !hasApiKey} 
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex gap-2"
                    >
                      <Sparkles size={18} />
                      {isGenerating ? "Generating..." : "Generate Instructions"}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={copyToClipboard} 
                      disabled={!(isStreamingEnabled() ? streamingContent : generatedInstruction)} 
                      className="border-gray-300 hover:bg-gray-50 flex gap-2"
                    >
                      <Copy size={18} />
                      Copy to Clipboard
                    </Button>

                    {(isStreamingEnabled() ? streamingContent : generatedInstruction) && (
                      <SaveInstructionDialog 
                        instruction={isStreamingEnabled() ? streamingContent : generatedInstruction} 
                        framework={selectedFramework}
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <OutputPreview 
                    generatedInstruction={generatedInstruction} 
                    isGenerating={isGenerating} 
                    streamingContent={streamingContent}
                    isStreaming={isStreamingEnabled()}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <PromptCollection setInstruction={setInstruction} setSelectedFramework={setSelectedFramework} />
            </TabsContent>
            
            <TabsContent value="saved">
              <SavedInstructions />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="bg-blue-50 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
              <Sparkles className="text-blue-500" size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Framework-Based</h3>
            <p className="text-gray-600 text-sm">Create AI instructions using proven frameworks designed for optimal AI performance.</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="bg-amber-50 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
              <Lightbulb className="text-amber-500" size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ready Templates</h3>
            <p className="text-gray-600 text-sm">Access pre-made templates for common AI instruction scenarios and use cases.</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="bg-green-50 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
              <FileTextIcon className="text-green-500" size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Save & Reuse</h3>
            <p className="text-gray-600 text-sm">Store your custom instructions for quick access and future reference.</p>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">InstructAI - System Instruction Generator © 2025</p>
          <p className="mt-1 text-gray-400 text-xs">Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
