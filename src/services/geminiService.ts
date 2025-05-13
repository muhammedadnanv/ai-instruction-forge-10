
// Gemini API service for generating AI instructions

export interface GeminiRequest {
  prompt: string;
  framework: string;
  systemInstruction?: string;
  parameters?: Record<string, any>;
  tools?: GeminiTool[];
}

export interface GeminiResponse {
  generatedText: string;
  requestId: string;
  model: string;
  timestamp: string;
}

export interface GeminiTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface GeminiStreamCallbacks {
  onStart?: () => void;
  onUpdate?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

class GeminiService {
  private apiKey: string | null = null;
  private readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  private defaultSystemInstruction: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    // Save to localStorage for persistence
    localStorage.setItem('gemini_api_key', key);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      // Try to load from localStorage if not set
      this.apiKey = localStorage.getItem('gemini_api_key');
    }
    return this.apiKey;
  }

  setDefaultSystemInstruction(instruction: string) {
    this.defaultSystemInstruction = instruction;
    localStorage.setItem('gemini_system_instruction', instruction);
  }

  getDefaultSystemInstruction(): string | null {
    if (!this.defaultSystemInstruction) {
      this.defaultSystemInstruction = localStorage.getItem('gemini_system_instruction');
    }
    return this.defaultSystemInstruction;
  }

  async generateInstruction(request: GeminiRequest): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please set your Gemini API key first.");
    }

    const frameworkPrompt = this.getFrameworkPrompt(request.framework);
    const systemInstruction = request.systemInstruction || this.defaultSystemInstruction || "";
    
    const promptText = `
${frameworkPrompt}

User instruction: ${request.prompt}

Generate a detailed AI system instruction using the ${request.framework} framework based on the user's request.
Make it clear, structured, and comprehensive.
`;

    try {
      const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...(systemInstruction ? [{
              role: 'system',
              parts: [{ text: systemInstruction }]
            }] : []),
            {
              role: 'user',
              parts: [{ text: promptText }]
            }
          ],
          tools: request.tools || [],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text || "No text generated";
      const functionCalls = data.candidates[0]?.content?.parts[0]?.functionCall || null;

      // Handle any function call results here if needed
      
      return {
        generatedText,
        requestId: `gemini-req-${Date.now()}`,
        model: "gemini-pro",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  async generateInstructionStream(
    request: GeminiRequest, 
    callbacks: GeminiStreamCallbacks
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please set your Gemini API key first.");
    }

    const frameworkPrompt = this.getFrameworkPrompt(request.framework);
    const systemInstruction = request.systemInstruction || this.defaultSystemInstruction || "";
    
    const promptText = `
${frameworkPrompt}

User instruction: ${request.prompt}

Generate a detailed AI system instruction using the ${request.framework} framework based on the user's request.
Make it clear, structured, and comprehensive.
`;

    try {
      callbacks.onStart?.();
      
      // Set up streaming with fetch
      const response = await fetch(`${this.API_URL}?key=${this.apiKey}&alt=sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...(systemInstruction ? [{
              role: 'system',
              parts: [{ text: systemInstruction }]
            }] : []),
            {
              role: 'user',
              parts: [{ text: promptText }]
            }
          ],
          tools: request.tools || [],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          streamGenerationConfig: {
            streamType: "tokens"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      // Process the stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let completeResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Process SSE format - each line starts with "data: "
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));
        
        for (const line of lines) {
          if (line === "data: [DONE]") continue;
          
          try {
            const jsonStr = line.substring(6); // Remove "data: " prefix
            const data = JSON.parse(jsonStr);
            
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
              const textChunk = data.candidates[0].content.parts[0].text;
              completeResponse += textChunk;
              callbacks.onUpdate?.(textChunk);
            }
          } catch (e) {
            console.warn("Error parsing SSE chunk:", e);
          }
        }
      }
      
      callbacks.onComplete?.(completeResponse);
    } catch (error) {
      console.error("Error in streaming Gemini response:", error);
      callbacks.onError?.(error instanceof Error ? error : new Error("Unknown error in stream"));
    }
  }

  private getFrameworkPrompt(framework: string): string {
    const frameworkPrompts: Record<string, string> = {
      "ACT": "ACT Framework (Action, Context, Target) is used to structure AI instructions by clearly defining what actions the AI should perform, in what context, and for what target audience or purpose.",
      "COT": "Chain of Thought Framework promotes step-by-step reasoning in AI systems, breaking complex tasks into a sequence of logical steps.",
      "ReACT": "ReACT Framework (Reason + Act) guides AI to first reason about a situation and then take appropriate action based on that reasoning.",
      "TREE": "TREE Framework (Tool-Reasoning Enhanced Execution) helps AI select and use appropriate tools with clear reasoning.",
      "SCQA": "SCQA Framework (Situation, Complication, Question, Answer) structures problem-solving by defining the current situation, the complication that arises, the question this raises, and the answer/solution.",
      "OODA": "OODA Framework (Observe, Orient, Decide, Act) is a decision-making cycle that guides AI through observing data, orienting to its meaning, deciding on action, and executing.",
      "PROMPT": "PROMPT Framework (Persona, Role, Objective, Method, Process, Tone) defines who the AI should be, what role it serves, what it aims to achieve, and how it should communicate.",
      "MOT": "MOT Framework (Mode, Objective, Type) specifies the AI's operating mode, its objective, and the type of interaction or output expected.",
      "PEEL": "PEEL Framework (Point, Evidence, Explain, Link) structures explanations by making a clear point, providing evidence, explaining the connection, and linking to the broader context.",
      "CRISP": "CRISP Framework (Context, Request, Instruction, Style, Parameters) provides complete context for AI tasks, clear requests, specific instructions, preferred style, and technical parameters."
    };

    return frameworkPrompts[framework] || `${framework} Framework helps structure AI instructions effectively.`;
  }
}

// Create and export singleton instance
const geminiService = new GeminiService();
export default geminiService;
