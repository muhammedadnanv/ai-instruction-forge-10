
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGemini } from "@/hooks/use-gemini";
import { useHuggingFace } from "@/hooks/use-huggingface";
import { useToast } from "@/hooks/use-toast";
import { Code, Play, Save, FileCode, Settings, FileJson, Download, Sparkles, History } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import InstructionBuilder from "@/components/InstructionBuilder";
import ModelSelector from "@/components/ModelSelector";
import FrameworkGuide from "@/components/FrameworkGuide";

const IDEPromptEditor = () => {
  const [promptCode, setPromptCode] = useState(
    `# System Instruction
You are a helpful assistant that provides concise, accurate information.

# User Prompt
{{input}}

# Format
Respond with clear, structured information using markdown formatting.`
  );
  
  const [testInput, setTestInput] = useState("Explain the concept of prompt engineering");
  const [response, setResponse] = useState("");
  const [promptName, setPromptName] = useState("New Prompt");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("14");
  const [framework, setFramework] = useState("none");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [promptHistory, setPromptHistory] = useState<Array<{
    promptCode: string;
    response: string;
    timestamp: string;
  }>>([]);
  
  const { generateInstruction, streamInstruction, isLoading, isStreaming } = useGemini();
  const { generateCompletion, isLoading: isHfLoading } = useHuggingFace();
  const { toast } = useToast();
  
  const autoGeneratePrompt = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Empty Input",
        description: "Please provide a topic or goal for prompt generation",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      if (selectedProvider === "gemini") {
        // Use Gemini for prompt generation
        const result = await generateInstruction({
          prompt: `Generate a professional prompt that would help achieve the following goal: "${testInput}". 
          Format the prompt with clear sections including system instructions, user input placeholder (use {{input}} syntax), 
          and format requirements. Make it suitable for professional prompt engineering work.`,
          temperature: 0.7,
          framework: "CRISP",
          model: selectedModel
        });
        
        if (result?.generatedText) {
          setPromptCode(result.generatedText);
          setActiveTab("editor");
          toast({
            title: "Prompt Generated",
            description: "A new prompt has been created based on your input"
          });
        } else {
          throw new Error("Failed to generate prompt");
        }
      } else if (selectedProvider === "huggingface") {
        // Use Hugging Face for prompt generation
        const result = await generateCompletion({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a prompt engineer who specializes in creating effective prompts."
            },
            {
              role: "user",
              content: `Generate a professional prompt that would help achieve the following goal: "${testInput}". 
              Format the prompt with clear sections including system instructions, user input placeholder (use {{input}} syntax), 
              and format requirements. Make it suitable for professional prompt engineering work.`
            }
          ],
          temperature: 0.7
        });
        
        if (result) {
          setPromptCode(result);
          setActiveTab("editor");
          toast({
            title: "Prompt Generated",
            description: "A new prompt has been created based on your input using Hugging Face"
          });
        } else {
          throw new Error("Failed to generate prompt with Hugging Face");
        }
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate a prompt",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const runPrompt = async () => {
    if (!promptCode.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please write a prompt before testing",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const processedPrompt = promptCode.replace("{{input}}", testInput);
      
      if (selectedProvider === "gemini") {
        await streamInstruction(
          {
            prompt: processedPrompt,
            temperature: temperature[0],
            maxTokens: maxTokens[0],
            framework: framework !== "none" ? framework : undefined,
            model: selectedModel
          },
          {
            onStart: () => {
              setResponse("");
            },
            onUpdate: (chunk) => {
              setResponse(prev => prev + chunk);
            },
            onComplete: (fullText) => {
              setResponse(fullText);
              handleAddToHistory(fullText);
              setActiveTab("output");
            },
            onError: (error) => {
              console.error("Error streaming response:", error);
              toast({
                title: "Response Error",
                description: error.message,
                variant: "destructive"
              });
            }
          }
        );
      } else if (selectedProvider === "huggingface") {
        // For HuggingFace we use the non-streaming API
        const result = await generateCompletion({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: processedPrompt
            }
          ],
          temperature: temperature[0],
          max_tokens: maxTokens[0]
        });
        
        if (result) {
          setResponse(result);
          handleAddToHistory(result);
          setActiveTab("output");
        } else {
          throw new Error("No response from Hugging Face model");
        }
      }
    } catch (error) {
      console.error("Error running prompt:", error);
      toast({
        title: "Processing Failed",
        description: "Could not run the prompt",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleAddToHistory = (responseText: string) => {
    // Add to history
    const historyItem = {
      promptCode: promptCode,
      response: responseText,
      timestamp: new Date().toISOString()
    };
    
    setPromptHistory(prev => {
      const newHistory = [historyItem, ...prev];
      // Keep only last 10 items for memory management
      if (newHistory.length > 10) {
        return newHistory.slice(0, 10);
      }
      return newHistory;
    });
  };
  
  const savePrompt = () => {
    const savedPrompts = JSON.parse(localStorage.getItem("savedPrompts") || "[]");
    const timestamp = new Date().toISOString();
    
    const newPrompt = {
      id: `prompt-${timestamp}`,
      name: promptName,
      code: promptCode,
      createdAt: timestamp,
      framework: framework,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
      model: selectedModel,
      provider: selectedProvider
    };
    
    savedPrompts.push(newPrompt);
    localStorage.setItem("savedPrompts", JSON.stringify(savedPrompts));
    
    toast({
      title: "Prompt Saved",
      description: `"${promptName}" has been saved successfully`
    });
  };
  
  const exportPromptAsJS = () => {
    const jsCode = `// ${promptName}
// Generated by InstructAI
// ${new Date().toLocaleString()}

/**
 * A prompt function that can be used in applications
 * @param {string} input - The user input to process
 * @returns {string} - The formatted prompt ready to send to an LLM
 */
export function generatePrompt(input) {
  const template = \`${promptCode.replace(/`/g, '\\`')}\`;
  return template.replace("{{input}}", input);
}
`;

    const blob = new Blob([jsCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${promptName.toLowerCase().replace(/\s+/g, '-')}.js`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Prompt Exported",
      description: "JavaScript file downloaded successfully"
    });
  };

  const handleFrameworkSelect = (frameworkName: string) => {
    setFramework(frameworkName);
  };

  const handleRestoreFromHistory = (index: number) => {
    const historyItem = promptHistory[index];
    if (historyItem) {
      setPromptCode(historyItem.promptCode);
      setResponse(historyItem.response);
      
      toast({
        title: "History Restored",
        description: "Previous prompt and response loaded"
      });
    }
  };

  const handleModelChange = (model: string, provider?: string) => {
    setSelectedModel(model);
    if (provider) {
      setSelectedProvider(provider);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <div className="flex-1">
          <Input
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
            placeholder="Untitled Prompt"
            className="text-lg font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={savePrompt}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={exportPromptAsJS}
            className="flex items-center gap-1"
          >
            <FileCode className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={runPrompt}
            disabled={isProcessing || isLoading || isHfLoading || isStreaming}
            className="flex items-center gap-1"
          >
            <Play className="h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="editor" className="flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="github">GitHub</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <TabsContent value="editor" className="mt-2">
              <Card className="border border-gray-200">
                <CardContent className="p-0">
                  <Textarea
                    value={promptCode}
                    onChange={(e) => setPromptCode(e.target.value)}
                    className="font-mono h-[400px] resize-none border-0 focus-visible:ring-0"
                    placeholder="Write your prompt here..."
                    style={{ fontSize: `${fontSize}px` }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-2">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">AI Model</h3>
                      <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={handleModelChange}
                        showDetails={true}
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Variables</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Use {'{{variable}}'} syntax to insert dynamic content
                      </p>
                      <div className="bg-muted p-2 rounded text-sm">
                        <code>{'{{input}}'}</code> - User input
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="font-medium mb-2">Framework</h3>
                          <FrameworkGuide framework={framework} onSelect={handleFrameworkSelect} />
                        </div>
                        <Select value={framework} onValueChange={setFramework}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Framework" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="CRISP">CRISP Framework</SelectItem>
                            <SelectItem value="COT">Chain of Thought</SelectItem>
                            <SelectItem value="ReACT">ReACT</SelectItem>
                            <SelectItem value="PROMPT">PROMPT Framework</SelectItem>
                            <SelectItem value="ACT">ACT Framework</SelectItem>
                            <SelectItem value="TREE">TREE Framework</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">Temperature: {temperature[0].toFixed(2)}</h3>
                          <Badge variant={temperature[0] < 0.3 ? "outline" : temperature[0] > 0.7 ? "secondary" : "default"}>
                            {temperature[0] < 0.3 ? "Precise" : temperature[0] > 0.7 ? "Creative" : "Balanced"}
                          </Badge>
                        </div>
                        <Slider
                          defaultValue={temperature}
                          max={1}
                          min={0}
                          step={0.01}
                          value={temperature}
                          onValueChange={setTemperature}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Lower values produce focused, deterministic responses. Higher values produce more creative variations.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Max Tokens: {maxTokens[0]}</h3>
                        <Slider
                          defaultValue={maxTokens}
                          max={2048}
                          min={100}
                          step={100}
                          value={maxTokens}
                          onValueChange={setMaxTokens}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum length of the generated response.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-2">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] pr-4">
                    {promptHistory.length > 0 ? (
                      <div className="space-y-4">
                        {promptHistory.map((item, index) => (
                          <Card key={index} className="p-3 text-sm">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-6 text-xs"
                                onClick={() => handleRestoreFromHistory(index)}
                              >
                                Restore
                              </Button>
                            </div>
                            <div className="text-xs line-clamp-2 text-gray-600">
                              {item.promptCode.substring(0, 150)}...
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No history yet. Run prompts to see them here.
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Test Input</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={autoGeneratePrompt}
                disabled={isProcessing}
                className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Auto-Generate Prompt
              </Button>
            </div>
            <Textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test input here..."
              className="h-24 resize-none"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Tabs defaultValue="output">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  navigator.clipboard.writeText(response);
                  toast({ title: "Copied to clipboard" });
                }}
                className="h-8 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
            
            <TabsContent value="output" className="mt-2">
              <Card className="border border-gray-200">
                <CardContent className="p-0">
                  <ScrollArea className="h-[490px] w-full rounded-md">
                    <div className="p-4 prose prose-sm max-w-none">
                      {response ? (
                        <div dangerouslySetInnerHTML={{ __html: response }} />
                      ) : (
                        <div className="text-gray-400 text-center py-10">
                          Run your prompt to see the output here
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="json" className="mt-2">
              <Card className="border border-gray-200">
                <CardContent className="p-0">
                  <ScrollArea className="h-[490px] w-full rounded-md">
                    <pre className="p-4 text-xs font-mono">
                      {response ? JSON.stringify({
                        prompt: promptCode.replace("{{input}}", testInput),
                        response: response,
                        metadata: {
                          timestamp: new Date().toISOString(),
                          name: promptName,
                          model: selectedModel || "default",
                          provider: selectedProvider,
                          temperature: temperature[0],
                          maxTokens: maxTokens[0],
                          framework: framework
                        }
                      }, null, 2) : "No data available"}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IDEPromptEditor;
