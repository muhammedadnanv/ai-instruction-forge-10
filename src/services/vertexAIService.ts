
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

export interface VertexAIConfig {
  vertexai: boolean;
  project: string;
  location: string;
  apiKey?: string;
}

export interface VertexAIRequest {
  model: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  safetySettings?: Array<{
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }>;
}

export interface VertexAIResponse {
  generatedText: string;
  requestId: string;
  model: string;
  timestamp: string;
}

export interface VertexAIStreamCallbacks {
  onStart?: () => void;
  onUpdate?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

class VertexAIService {
  private config: VertexAIConfig | null = null;
  private genAI: GoogleGenerativeAI | null = null;

  setConfig(config: VertexAIConfig) {
    this.config = config;
    
    if (config.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.apiKey);
    } else {
      // For Vertex AI API, we need to pass the API key as a string
      // Since direct initialization with project/location isn't supported in the current API
      // We'll handle this case differently by using a placeholder and relying on environment auth
      this.genAI = new GoogleGenerativeAI("vertex_ai_auth");
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('vertex_ai_config', JSON.stringify(config));
  }

  getConfig(): VertexAIConfig | null {
    if (!this.config) {
      // Try to load from localStorage if not set
      const savedConfig = localStorage.getItem('vertex_ai_config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        
        if (this.config?.apiKey) {
          this.genAI = new GoogleGenerativeAI(this.config.apiKey);
        } else if (this.config) {
          // Same handling as above for Vertex AI
          this.genAI = new GoogleGenerativeAI("vertex_ai_auth");
        }
      }
    }
    return this.config;
  }

  async generateContent(request: VertexAIRequest): Promise<VertexAIResponse> {
    if (!this.genAI) {
      throw new Error("Vertex AI not configured. Please set your configuration first.");
    }

    try {
      // Get the model
      const model = this.genAI.getGenerativeModel({
        model: request.model || "gemini-2.5-pro-preview-05-06",
        generationConfig: {
          maxOutputTokens: request.maxOutputTokens || 2048,
          temperature: request.temperature || 0.7,
          topP: request.topP || 0.95,
          topK: request.topK || 40,
        },
        safetySettings: request.safetySettings || [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          }
        ]
      });

      // Generate content
      const result = await model.generateContent(request.prompt);
      const response = result.response;
      const text = response.text();

      return {
        generatedText: text,
        requestId: `vertex-req-${Date.now()}`,
        model: request.model || "gemini-2.5-pro-preview-05-06",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error calling Vertex AI API:", error);
      throw error;
    }
  }

  async generateContentStream(
    request: VertexAIRequest,
    callbacks: VertexAIStreamCallbacks
  ): Promise<void> {
    if (!this.genAI) {
      throw new Error("Vertex AI not configured. Please set your configuration first.");
    }

    try {
      callbacks.onStart?.();
      
      // Get the model
      const model = this.genAI.getGenerativeModel({
        model: request.model || "gemini-2.5-pro-preview-05-06",
        generationConfig: {
          maxOutputTokens: request.maxOutputTokens || 2048,
          temperature: request.temperature || 0.7,
          topP: request.topP || 0.95,
          topK: request.topK || 40,
        },
        safetySettings: request.safetySettings || [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          }
        ]
      });

      // Generate content with streaming
      const streamingResponse = await model.generateContentStream(request.prompt);
      
      let completeText = "";
      
      for await (const chunk of streamingResponse.stream) {
        const textChunk = chunk.text();
        completeText += textChunk;
        callbacks.onUpdate?.(textChunk);
      }
      
      callbacks.onComplete?.(completeText);
    } catch (error) {
      console.error("Error in streaming Vertex AI response:", error);
      callbacks.onError?.(error instanceof Error ? error : new Error("Unknown error in stream"));
    }
  }
}

// Create and export singleton instance
const vertexAIService = new VertexAIService();
export default vertexAIService;
