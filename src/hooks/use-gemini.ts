
import { useState } from "react";
import geminiService, { 
  GeminiRequest, 
  GeminiResponse, 
  GeminiStreamCallbacks 
} from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const generateInstruction = async (request: GeminiRequest): Promise<GeminiResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!geminiService.getApiKey()) {
        toast({
          title: "API Key Required",
          description: "Please set your Gemini API key in the settings",
          variant: "destructive"
        });
        return null;
      }
      
      const response = await geminiService.generateInstruction(request);
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
  
  const streamInstruction = async (
    request: GeminiRequest, 
    callbacks: GeminiStreamCallbacks
  ): Promise<void> => {
    setIsStreaming(true);
    setError(null);
    
    try {
      if (!geminiService.getApiKey()) {
        toast({
          title: "API Key Required",
          description: "Please set your Gemini API key in the settings",
          variant: "destructive"
        });
        callbacks.onError?.(new Error("API key not set"));
        return;
      }
      
      await geminiService.generateInstructionStream(request, {
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
    generateInstruction,
    streamInstruction,
    isLoading,
    isStreaming,
    error
  };
}
