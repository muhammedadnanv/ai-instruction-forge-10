import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useGemini } from "@/hooks/use-gemini";
import { useVertexAI } from "@/hooks/use-vertex-ai";
import { Play, RefreshCw, PlusCircle, Trash2, ArrowDownUp, FileText, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ModelTestResult {
  id: string;
  modelName: string;
  prompt: string;
  response: string;
  timeTaken: number;
  tokenCount: number;
  timestamp: string;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model?: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
}

const MultiLLMRunner = () => {
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [results, setResults] = useState<ModelTestResult[]>([]);
  const [showVertexSettings, setShowVertexSettings] = useState(false);
  const [vertexProject, setVertexProject] = useState("gen-lang-client-0345764080");
  const [vertexLocation, setVertexLocation] = useState("us-central1");
  const [vertexApiKey, setVertexApiKey] = useState("");
  
  const [models, setModels] = useState<ModelConfig[]>([
    { id: "model-1", name: "Gemini Pro", provider: "Google", temperature: 0.7, maxTokens: 1024, enabled: true },
    { id: "model-2", name: "GPT-4o", provider: "OpenAI", temperature: 0.7, maxTokens: 1024, enabled: true },
    { id: "model-3", name: "Claude 3", provider: "Anthropic", temperature: 0.7, maxTokens: 1024, enabled: true },
    { id: "model-4", name: "Gemini 2.5 Pro", provider: "Vertex", model: "gemini-2.5-pro-preview-05-06", temperature: 1.0, maxTokens: 4096, enabled: true }
  ]);
  
  const { generateInstruction } = useGemini();
  const { setupVertexAI, generateContent } = useVertexAI();
  const { toast } = useToast();
  
  const saveVertexSettings = () => {
    const success = setupVertexAI({
      vertexai: true,
      project: vertexProject,
      location: vertexLocation,
      apiKey: vertexApiKey || undefined
    });
    
    if (success) {
      setShowVertexSettings(false);
    }
  };

  const runPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt before running",
        variant: "destructive"
      });
      return;
    }
    
    const enabledModels = models.filter(model => model.enabled);
    
    if (enabledModels.length === 0) {
      toast({
        title: "No Models Selected",
        description: "Enable at least one model to run the prompt",
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    setCurrentModelIndex(0);
    setResults([]);
    
    // Process each model sequentially
    for (let i = 0; i < enabledModels.length; i++) {
      const model = enabledModels[i];
      setCurrentModelIndex(i);
      
      try {
        // Track time
        const startTime = Date.now();
        
        let resultText = "";
        let tokenCount = 0;
        
        if (model.provider === "Vertex") {
          // Call Vertex AI service for Vertex models
          const result = await generateContent({
            model: model.model || "gemini-2.5-pro-preview-05-06",
            prompt,
            temperature: model.temperature,
            maxOutputTokens: model.maxTokens
          });
          
          if (result) {
            resultText = result.generatedText;
            // Estimate token count
            tokenCount = Math.round(resultText.split(/\s+/).length * 1.3);
          }
        } else {
          // Call Gemini for other models (in a real app, would call respective APIs)
          const result = await generateInstruction({
            prompt,
            temperature: model.temperature,
            maxTokens: model.maxTokens
          });
          
          if (result?.generatedText) {
            resultText = result.generatedText;
            // Estimate token count
            tokenCount = Math.round(resultText.split(/\s+/).length * 1.3);
          }
        }
        
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000; // seconds
        
        if (resultText) {
          setResults(prev => [...prev, {
            id: `result-${Date.now()}`,
            modelName: model.name,
            prompt,
            response: resultText,
            timeTaken,
            tokenCount,
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error(`Error with model ${model.name}:`, error);
        
        setResults(prev => [...prev, {
          id: `result-${Date.now()}-error`,
          modelName: model.name,
          prompt,
          response: "Error: Failed to generate response",
          timeTaken: 0,
          tokenCount: 0,
          timestamp: new Date().toISOString()
        }]);
      }
      
      // Add a small delay between API calls
      if (i < enabledModels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsRunning(false);
    
    toast({
      title: "Tests Complete",
      description: `Completed testing across ${enabledModels.length} models`
    });
  };
  
  const addModel = () => {
    const newId = `model-${models.length + 1}`;
    const newModel: ModelConfig = {
      id: newId,
      name: "Custom Model",
      provider: "Custom",
      temperature: 0.7,
      maxTokens: 1024,
      enabled: true
    };
    
    setModels([...models, newModel]);
  };
  
  const updateModel = (id: string, field: keyof ModelConfig, value: any) => {
    const updatedModels = models.map(model => {
      if (model.id === id) {
        return {
          ...model,
          [field]: value
        };
      }
      return model;
    });
    
    setModels(updatedModels);
  };
  
  const removeModel = (id: string) => {
    if (models.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You need at least one model",
        variant: "destructive"
      });
      return;
    }
    
    setModels(models.filter(model => model.id !== id));
  };
  
  const enabledModels = models.filter(model => model.enabled);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="font-medium">Prompt</h3>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt to test across multiple models..."
              className="h-28"
            />
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Models</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowVertexSettings(true)}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Vertex AI Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addModel}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Model
              </Button>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            {models.map((model) => (
              <div 
                key={model.id}
                className="flex flex-wrap items-center gap-2 p-3 rounded-md bg-muted/30 border"
              >
                <div className="flex items-center mr-auto">
                  <Switch
                    checked={model.enabled}
                    onCheckedChange={(checked) => updateModel(model.id, 'enabled', checked)}
                    className="mr-2"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={model.name}
                        onChange={(e) => updateModel(model.id, 'name', e.target.value)}
                        className="h-7 text-sm font-medium w-32 sm:w-40"
                      />
                      <Select 
                        value={model.provider} 
                        onValueChange={(value) => updateModel(model.id, 'provider', value)}
                      >
                        <SelectTrigger className="h-7 text-xs w-24">
                          <SelectValue placeholder="Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Google">Google</SelectItem>
                          <SelectItem value="OpenAI">OpenAI</SelectItem>
                          <SelectItem value="Anthropic">Anthropic</SelectItem>
                          <SelectItem value="Vertex">Vertex AI</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {model.provider === "Vertex" && (
                        <Select 
                          value={model.model} 
                          onValueChange={(value) => updateModel(model.id, 'model', value)}
                        >
                          <SelectTrigger className="h-7 text-xs w-40">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</SelectItem>
                            <SelectItem value="gemini-1.5-pro-preview-0514">Gemini 1.5 Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="space-y-1 w-36">
                    <div className="flex justify-between text-xs">
                      <span>Temp: {model.temperature.toFixed(1)}</span>
                      <span>Tokens: {model.maxTokens}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider 
                        value={[model.temperature]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) => updateModel(model.id, 'temperature', value)}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={model.maxTokens}
                        onChange={(e) => updateModel(model.id, 'maxTokens', parseInt(e.target.value))}
                        className="h-7 text-xs w-16"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeModel(model.id)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={runPrompt}
              disabled={isRunning || !prompt.trim() || enabledModels.length === 0}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing Model {currentModelIndex + 1}/{enabledModels.length}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Across {enabledModels.length} Models
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showVertexSettings} onOpenChange={setShowVertexSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertex AI Configuration</DialogTitle>
            <DialogDescription>
              Configure your Google Vertex AI settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project ID</Label>
              <Input 
                id="project" 
                value={vertexProject} 
                onChange={(e) => setVertexProject(e.target.value)}
                placeholder="e.g., gen-lang-client-0345764080"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={vertexLocation} 
                onChange={(e) => setVertexLocation(e.target.value)}
                placeholder="e.g., us-central1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (optional)</Label>
              <Input 
                id="apiKey" 
                value={vertexApiKey} 
                onChange={(e) => setVertexApiKey(e.target.value)}
                type="password"
                placeholder="Leave empty if using service account"
              />
              <p className="text-xs text-muted-foreground">
                Only needed if not using default authentication
              </p>
            </div>
            
            <Button onClick={saveVertexSettings} className="w-full">
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {results.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Results Comparison</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Export Report
              </Button>
            </div>
            
            <Tabs defaultValue="side-by-side">
              <TabsList className="mb-4">
                <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="side-by-side">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {results.map((result) => (
                    <Card key={result.id} className="h-full">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{result.modelName}</div>
                          <div className="text-xs text-gray-500">
                            {result.timeTaken.toFixed(1)}s | ~{result.tokenCount} tokens
                          </div>
                        </div>
                        <ScrollArea className="h-72">
                          <div className="prose prose-sm max-w-none">
                            {result.response}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="detailed">
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-lg">{result.modelName}</div>
                          <Button variant="ghost" size="sm">
                            <ArrowDownUp className="h-4 w-4 mr-1" />
                            Compare
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm font-medium mb-1">Prompt</div>
                            <div className="bg-muted/30 p-3 rounded-md text-sm">
                              {result.prompt}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-1">Metrics</div>
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <div className="text-gray-500">Time</div>
                                  <div>{result.timeTaken.toFixed(1)} seconds</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Tokens</div>
                                  <div>~{result.tokenCount} tokens</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Token Rate</div>
                                  <div>{Math.round(result.tokenCount / result.timeTaken)} tokens/sec</div>
                                </div>
                                <div>
                                  <div className="text-gray-500">Timestamp</div>
                                  <div>{new Date(result.timestamp).toLocaleTimeString()}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Response</div>
                          <ScrollArea className="h-40">
                            <div className="bg-muted/30 p-3 rounded-md prose prose-sm max-w-none">
                              {result.response}
                            </div>
                          </ScrollArea>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiLLMRunner;
