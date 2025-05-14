
import { useState } from "react";
import geminiService, { 
  GeminiRequest, 
  GeminiResponse, 
  GeminiStreamCallbacks,
  GeminiModelConfig
} from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [availableModels, setAvailableModels] = useState<GeminiModelConfig[]>([]);
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
  
  // New function to get available Gemini models
  const getAvailableModels = async (): Promise<GeminiModelConfig[]> => {
    try {
      const models = await geminiService.getAvailableModels();
      setAvailableModels(models);
      return models;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch available models"));
      toast({
        title: "Model Fetch Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
      return [];
    }
  };

  // Function for complex multi-step reasoning with chain prompts
  const executePromptChain = async (
    prompts: GeminiRequest[],
    options: {
      stopOnError?: boolean;
      aggregateResults?: boolean;
    } = {}
  ): Promise<GeminiResponse[] | null> => {
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
      
      const results: GeminiResponse[] = [];
      const { stopOnError = true, aggregateResults = false } = options;
      
      for (let i = 0; i < prompts.length; i++) {
        try {
          // Integrate previous results in the context if needed
          if (aggregateResults && i > 0) {
            const previousResults = results.map(r => r.generatedText).join("\n\n");
            prompts[i].context = `Previous results:\n${previousResults}\n\n${prompts[i].context || ''}`;
          }
          
          const response = await geminiService.generateInstruction(prompts[i]);
          if (response) results.push(response);
        } catch (err) {
          if (stopOnError) {
            throw err;
          } else {
            console.warn(`Error in prompt chain step ${i}:`, err);
            // Add an error placeholder in the results
            results.push({
              generatedText: `[ERROR: ${err instanceof Error ? err.message : "Unknown error"}]`,
              requestId: `error-${Date.now()}`,
              model: prompts[i].model || "unknown",
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      return results;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Chain execution failed"));
      toast({
        title: "Chain Execution Failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateInstruction,
    streamInstruction,
    executePromptChain,
    getAvailableModels,
    availableModels,
    isLoading,
    isStreaming,
    error
  };
}
