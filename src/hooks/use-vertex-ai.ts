
import { useState } from "react";
import vertexAIService, { 
  VertexAIRequest, 
  VertexAIResponse, 
  VertexAIConfig,
  VertexAIStreamCallbacks 
} from "@/services/vertexAIService";
import { useToast } from "@/hooks/use-toast";

export function useVertexAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const setupVertexAI = (config: VertexAIConfig) => {
    try {
      vertexAIService.setConfig(config);
      toast({
        title: "Vertex AI Configured",
        description: "Your Vertex AI configuration has been saved",
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast({
        title: "Configuration Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const generateContent = async (request: VertexAIRequest): Promise<VertexAIResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!vertexAIService.getConfig()) {
        toast({
          title: "Configuration Required",
          description: "Please configure Vertex AI first",
          variant: "destructive"
        });
        return null;
      }
      
      const response = await vertexAIService.generateContent(request);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast({
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const streamContent = async (
    request: VertexAIRequest, 
    callbacks: VertexAIStreamCallbacks
  ): Promise<void> => {
    setIsStreaming(true);
    setError(null);
    
    try {
      if (!vertexAIService.getConfig()) {
        toast({
          title: "Configuration Required",
          description: "Please configure Vertex AI first",
          variant: "destructive"
        });
        callbacks.onError?.(new Error("Vertex AI not configured"));
        return;
      }
      
      await vertexAIService.generateContentStream(request, {
        onStart: () => {
          callbacks.onStart?.();
        },
        onUpdate: (chunk) => {
          callbacks.onUpdate?.(chunk);
        },
        onComplete: (text) => {
          setIsStreaming(false);
          callbacks.onComplete?.(text);
        },
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
          callbacks.onError?.(err);
          toast({
            title: "Streaming Failed",
            description: err.message,
            variant: "destructive"
          });
        }
      });
    } catch (err) {
      setIsStreaming(false);
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
      callbacks.onError?.(err instanceof Error ? err : new Error("Unknown error occurred"));
      toast({
        title: "Streaming Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  return {
    setupVertexAI,
    generateContent,
    streamContent,
    isLoading,
    isStreaming,
    error
  };
}
