
import { useState } from "react";
import { InferenceClient } from "@huggingface/inference";
import { useToast } from "@/hooks/use-toast";

export interface HuggingFaceConfig {
  apiKey: string;
}

export interface HuggingFaceMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Define the provider types according to the library's actual types
export type HuggingFaceProvider = 
  | "auto" 
  | "black-forest-labs"
  | "cerebras" 
  | "cohere" 
  | "fal-ai" 
  | "featherless-ai" 
  | "fireworks-ai" 
  | "groq" 
  | "hf-inference" 
  | "hyperbolic" 
  | "nebius" 
  | "novita" 
  | "nscale" 
  | "sambanova"
  | "text-gen-web" 
  | "thebloke" 
  | "together";

export interface HuggingFaceRequest {
  model: string;
  messages: HuggingFaceMessage[];
  temperature?: number;
  max_tokens?: number;
  provider?: HuggingFaceProvider;
}

export interface HuggingFaceStreamCallbacks {
  onStart?: () => void;
  onUpdate?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

// Store the api key in localStorage
const getApiKey = (): string | null => {
  return localStorage.getItem("huggingface_api_key");
};

const setApiKey = (apiKey: string): void => {
  localStorage.setItem("huggingface_api_key", apiKey);
};

export function useHuggingFace() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const setupHuggingFace = (config: HuggingFaceConfig) => {
    try {
      setApiKey(config.apiKey);
      toast({
        title: "Hugging Face Configured",
        description: "Your Hugging Face API key has been saved",
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
  
  const generateCompletion = async (request: HuggingFaceRequest): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set your Hugging Face API key in the settings",
          variant: "destructive"
        });
        return null;
      }
      
      const client = new InferenceClient(apiKey);
      
      // Convert HuggingFaceMessage[] to the format expected by the API
      const messages = request.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const chatCompletion = await client.chatCompletion({
        model: request.model,
        provider: (request.provider || "auto") as any,
        messages: messages as any,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
      });
      
      return chatCompletion.choices[0].message.content;
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
  
  return {
    setupHuggingFace,
    generateCompletion,
    isLoading,
    isStreaming,
    error,
    hasApiKey: !!getApiKey()
  };
}
