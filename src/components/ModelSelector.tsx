
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGemini } from "@/hooks/use-gemini";
import geminiService, { GeminiModelConfig } from "@/services/geminiService";
import { Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModelSelectorProps {
  onModelChange?: (model: string, provider?: string) => void;
  selectedModel?: string;
  showDetails?: boolean;
}

export interface HuggingFaceModel {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  maxTokens?: number;
}

// Predefined Hugging Face models
const huggingFaceModels: HuggingFaceModel[] = [
  {
    id: "deepseek-ai/DeepSeek-Prover-V2-671B",
    name: "DeepSeek Prover V2 671B",
    description: "A powerful mathematical reasoning model capable of solving complex problems.",
    tags: ["reasoning", "mathematics", "proofs"],
    maxTokens: 4096
  },
  {
    id: "meta-llama/Llama-3-8b-chat-hf",
    name: "Llama 3 8B Chat",
    description: "Meta's Llama 3 model optimized for conversational use cases.",
    tags: ["chat", "instruction", "reasoning"],
    maxTokens: 8192
  },
  {
    id: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    name: "Mixtral 8x7B Instruct",
    description: "Mistral's mixture of experts model designed for instruction following.",
    tags: ["chat", "instruction", "reasoning"],
    maxTokens: 32768
  }
];

export default function ModelSelector({ 
  onModelChange, 
  selectedModel: propSelectedModel, 
  showDetails = false 
}: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(propSelectedModel || geminiService.getDefaultModel());
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [geminiModels, setGeminiModels] = useState<GeminiModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getAvailableModels } = useGemini();
  const { toast } = useToast();
  
  useEffect(() => {
    // Update the state if the prop changes
    if (propSelectedModel && propSelectedModel !== selectedModel) {
      setSelectedModel(propSelectedModel);
      // Try to determine provider from model ID
      if (propSelectedModel.includes("/")) {
        setSelectedProvider("huggingface");
      } else {
        setSelectedProvider("gemini");
      }
    }
  }, [propSelectedModel]);
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const availableModels = await getAvailableModels();
        setGeminiModels(availableModels);
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModels();
  }, [getAvailableModels]);
  
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    
    if (onModelChange) {
      onModelChange(value, selectedProvider);
    } else {
      // If no onModelChange provided, set as default
      if (selectedProvider === "gemini") {
        geminiService.setDefaultModel(value);
        toast({
          title: "Default Model Updated",
          description: `${value} is now your default model`
        });
      } else {
        localStorage.setItem("default_hf_model", value);
        toast({
          title: "Default Hugging Face Model Updated",
          description: `${value} is now your default model`
        });
      }
    }
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    
    // When changing providers, update the selected model to the default for that provider
    if (provider === "gemini") {
      const defaultGeminiModel = geminiService.getDefaultModel();
      setSelectedModel(defaultGeminiModel);
      if (onModelChange) onModelChange(defaultGeminiModel, "gemini");
    } else {
      const defaultHfModel = localStorage.getItem("default_hf_model") || huggingFaceModels[0].id;
      setSelectedModel(defaultHfModel);
      if (onModelChange) onModelChange(defaultHfModel, "huggingface");
    }
  };
  
  // Find the currently selected model
  const currentGeminiModel = geminiModels.find(model => model.name === selectedModel);
  const currentHfModel = huggingFaceModels.find(model => model.id === selectedModel);
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue={selectedProvider} onValueChange={handleProviderChange} className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gemini">Google Gemini</TabsTrigger>
          <TabsTrigger value="huggingface">Hugging Face</TabsTrigger>
        </TabsList>
      </Tabs>

      <Select
        value={selectedModel}
        onValueChange={handleModelChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {selectedProvider === "gemini" ? (
            geminiModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex items-center justify-between w-full">
                  <span>{model.displayName}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {model.version}
                  </Badge>
                </div>
              </SelectItem>
            ))
          ) : (
            huggingFaceModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{model.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {showDetails && selectedProvider === "gemini" && currentGeminiModel && (
        <Card className="mt-4 bg-muted/40">
          <CardHeader className="py-3">
            <CardTitle className="text-md flex items-center">
              <Settings2 className="w-4 h-4 mr-2" />
              {currentGeminiModel.displayName}
            </CardTitle>
            <CardDescription className="text-xs">{currentGeminiModel.description}</CardDescription>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <div>
              <p className="text-xs font-medium mb-1">Supported Features</p>
              <div className="flex flex-wrap gap-1">
                {currentGeminiModel.supportedFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-medium">Input</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentGeminiModel.inputModalities.map((modality, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {modality}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Max Tokens</p>
                <p className="mt-1">{currentGeminiModel.maxTokens.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showDetails && selectedProvider === "huggingface" && currentHfModel && (
        <Card className="mt-4 bg-muted/40">
          <CardHeader className="py-3">
            <CardTitle className="text-md flex items-center">
              <Settings2 className="w-4 h-4 mr-2" />
              {currentHfModel.name}
            </CardTitle>
            <CardDescription className="text-xs">{currentHfModel.description}</CardDescription>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            {currentHfModel.tags && (
              <div>
                <p className="text-xs font-medium mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {currentHfModel.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-medium">Model ID</p>
                <p className="mt-1 text-xs break-all">{currentHfModel.id}</p>
              </div>
              {currentHfModel.maxTokens && (
                <div>
                  <p className="font-medium">Max Tokens</p>
                  <p className="mt-1">{currentHfModel.maxTokens.toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
