
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGemini } from "@/hooks/use-gemini";
import geminiService, { GeminiModelConfig } from "@/services/geminiService";
import { Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModelSelectorProps {
  onModelChange?: (model: string) => void;
  selectedModel?: string;
  showDetails?: boolean;
}

export default function ModelSelector({ 
  onModelChange, 
  selectedModel: propSelectedModel, 
  showDetails = false 
}: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(propSelectedModel || geminiService.getDefaultModel());
  const [models, setModels] = useState<GeminiModelConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getAvailableModels } = useGemini();
  const { toast } = useToast();
  
  useEffect(() => {
    // Update the state if the prop changes
    if (propSelectedModel && propSelectedModel !== selectedModel) {
      setSelectedModel(propSelectedModel);
    }
  }, [propSelectedModel]);
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const availableModels = await getAvailableModels();
        setModels(availableModels);
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
      onModelChange(value);
    } else {
      // If no onModelChange provided, set as default
      geminiService.setDefaultModel(value);
      toast({
        title: "Default Model Updated",
        description: `${value} is now your default model`
      });
    }
  };
  
  // Find the currently selected model
  const currentModel = models.find(model => model.name === selectedModel);
  
  return (
    <div className="space-y-4">
      <Select
        value={selectedModel}
        onValueChange={handleModelChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.name} value={model.name}>
              <div className="flex items-center justify-between w-full">
                <span>{model.displayName}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {model.version}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showDetails && currentModel && (
        <Card className="mt-4 bg-muted/40">
          <CardHeader className="py-3">
            <CardTitle className="text-md flex items-center">
              <Settings2 className="w-4 h-4 mr-2" />
              {currentModel.displayName}
            </CardTitle>
            <CardDescription className="text-xs">{currentModel.description}</CardDescription>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <div>
              <p className="text-xs font-medium mb-1">Supported Features</p>
              <div className="flex flex-wrap gap-1">
                {currentModel.supportedFeatures.map((feature, index) => (
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
                  {currentModel.inputModalities.map((modality, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {modality}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Max Tokens</p>
                <p className="mt-1">{currentModel.maxTokens.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
