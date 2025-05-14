// Gemini API service for generating AI instructions

export interface GeminiRequest {
  prompt: string;
  framework?: string;
  systemInstruction?: string;
  parameters?: Record<string, any>;
  tools?: GeminiTool[];
  jsonMode?: boolean;
  language?: string;
  safetySettings?: GeminiSafetySetting[];
  temperature?: number;
  topK?: number;
  topP?: number;
  candidateCount?: number;
  maxTokens?: number;  // Added this property
}

export interface GeminiResponse {
  generatedText: string;
  requestId: string;
  model: string;
  timestamp: string;
  jsonResponse?: any;
  safetyRatings?: GeminiSafetyRating[];
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

export interface GeminiSafetySetting {
  category: string; // "HARM_CATEGORY_HARASSMENT" | "HARM_CATEGORY_HATE_SPEECH" etc.
  threshold: string; // "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_ONLY_HIGH"
}

export interface GeminiSafetyRating {
  category: string;
  probability: string; // "NEGLIGIBLE" | "LOW" | "MEDIUM" | "HIGH"
}

export interface BatchRequest {
  requests: GeminiRequest[];
}

class GeminiService {
  private apiKey: string | null = null;
  private readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  private readonly BATCH_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:batchGenerateContent";
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

    const frameworkPrompt = request.framework ? this.getFrameworkPrompt(request.framework) : '';
    const systemInstruction = request.systemInstruction || this.defaultSystemInstruction || "";
    
    const promptText = request.framework ? `
${frameworkPrompt}

User instruction: ${request.prompt}

Generate a detailed AI system instruction using the ${request.framework} framework based on the user's request.
Make it clear, structured, and comprehensive.
${request.language ? `Please respond in ${request.language}.` : ""}
` : request.prompt;

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
          safetySettings: request.safetySettings || [],
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            topK: request.topK ?? 40,
            topP: request.topP ?? 0.95,
            maxOutputTokens: request.maxTokens ?? 1000,
            candidateCount: request.candidateCount ?? 1,
            ...(request.jsonMode && { responseSchema: { type: "json" } })
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
      const safetyRatings = data.candidates[0]?.safetyRatings || [];
      
      // Handle JSON response if JSON mode is enabled
      let jsonResponse = undefined;
      if (request.jsonMode && generatedText) {
        try {
          jsonResponse = JSON.parse(generatedText);
        } catch (e) {
          console.warn("Error parsing JSON response:", e);
        }
      }
      
      return {
        generatedText,
        requestId: `gemini-req-${Date.now()}`,
        model: "gemini-pro",
        timestamp: new Date().toISOString(),
        jsonResponse,
        safetyRatings
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

    const frameworkPrompt = request.framework ? this.getFrameworkPrompt(request.framework) : '';
    const systemInstruction = request.systemInstruction || this.defaultSystemInstruction || "";
    
    const promptText = request.framework ? `
${frameworkPrompt}

User instruction: ${request.prompt}

Generate a detailed AI system instruction using the ${request.framework} framework based on the user's request.
Make it clear, structured, and comprehensive.
${request.language ? `Please respond in ${request.language}.` : ""}
` : request.prompt;

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
          safetySettings: request.safetySettings || [],
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            topK: request.topK ?? 40,
            topP: request.topP ?? 0.95,
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

  async batchGenerateInstructions(batchRequest: BatchRequest): Promise<GeminiResponse[]> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please set your Gemini API key first.");
    }

    // Format each request in the batch
    const formattedRequests = batchRequest.requests.map(request => {
      const frameworkPrompt = request.framework ? this.getFrameworkPrompt(request.framework) : '';
      const systemInstruction = request.systemInstruction || this.defaultSystemInstruction || "";
      
      const promptText = request.framework ? `
${frameworkPrompt}

User instruction: ${request.prompt}

Generate a detailed AI system instruction using the ${request.framework} framework based on the user's request.
Make it clear, structured, and comprehensive.
${request.language ? `Please respond in ${request.language}.` : ""}
` : request.prompt;

      return {
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
        safetySettings: request.safetySettings || [],
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          topK: request.topK ?? 40,
          topP: request.topP ?? 0.95,
          maxOutputTokens: 1000,
          candidateCount: request.candidateCount ?? 1,
          ...(request.jsonMode && { responseSchema: { type: "json" } })
        }
      };
    });

    try {
      const response = await fetch(`${this.BATCH_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: formattedRequests })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Process batch responses
      return data.candidates.map((candidate: any, index: number) => {
        const generatedText = candidate?.content?.parts[0]?.text || "No text generated";
        const safetyRatings = candidate?.safetyRatings || [];
        
        // Handle JSON if JSON mode was requested
        let jsonResponse = undefined;
        if (batchRequest.requests[index].jsonMode && generatedText) {
          try {
            jsonResponse = JSON.parse(generatedText);
          } catch (e) {
            console.warn("Error parsing JSON response for batch item:", e);
          }
        }
        
        return {
          generatedText,
          requestId: `gemini-batch-req-${index}-${Date.now()}`,
          model: "gemini-pro",
          timestamp: new Date().toISOString(),
          jsonResponse,
          safetyRatings
        };
      });
    } catch (error) {
      console.error("Error calling Gemini Batch API:", error);
      throw error;
    }
  }

  // Check if a content violates content safety policies
  async moderateContent(content: string): Promise<{isSafe: boolean; ratings: GeminiSafetyRating[]}> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please set your Gemini API key first.");
    }

    try {
      const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: content }]
            }
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const safetyRatings = data.promptFeedback?.safetyRatings || [];
      
      // Check if any rating is MEDIUM or HIGH
      const isSafe = !safetyRatings.some((rating: GeminiSafetyRating) => 
        rating.probability === "MEDIUM" || rating.probability === "HIGH"
      );
      
      return { isSafe, ratings: safetyRatings };
    } catch (error) {
      console.error("Error in content moderation:", error);
      throw error;
    }
  }

  // Function for long-term agentic planning with memory
  async runAgentLoop({
    initialPrompt,
    maxSteps = 5,
    memory = [],
    tools = [],
    systemInstruction = "",
    language
  }: {
    initialPrompt: string;
    maxSteps?: number;
    memory?: Array<{role: string; content: string}>;
    tools?: GeminiTool[];
    systemInstruction?: string;
    language?: string;
  }): Promise<{finalResponse: string; memory: Array<{role: string; content: string}>}> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please set your Gemini API key first.");
    }

    // Use the provided memory or initialize a new one
    let currentMemory = [...memory];
    let stepCount = 0;
    let isDone = false;
    let finalResponse = "";
    
    // Add the initial prompt to memory
    currentMemory.push({role: "user", content: initialPrompt});
    
    // Initialize system instruction if provided
    if (systemInstruction) {
      currentMemory = [{role: "system", content: systemInstruction}, ...currentMemory];
    }
    
    // Add an agent directive to guide the model
    const agentDirective = {
      role: "system", 
      content: `You are an agent that can perform multiple steps of thinking to solve complex problems. 
      Use the available tools when needed. When you've reached a final conclusion or completed the task,
      end your response with [DONE]. ${language ? `Please respond in ${language}.` : ""}`
    };
    
    if (!currentMemory.some(m => m.role === "system")) {
      currentMemory = [agentDirective, ...currentMemory];
    }

    while (!isDone && stepCount < maxSteps) {
      stepCount++;
      
      try {
        const response = await fetch(`${this.API_URL}?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: currentMemory.map(m => ({
              role: m.role,
              parts: [{ text: m.content }]
            })),
            tools: tools || [],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const agentResponse = data.candidates[0]?.content?.parts[0]?.text || "";
        const functionCalls = data.candidates[0]?.content?.parts[0]?.functionCall;
        
        // Add the agent's response to memory
        currentMemory.push({role: "assistant", content: agentResponse});
        
        // Check if we're done
        if (agentResponse.includes("[DONE]")) {
          isDone = true;
          finalResponse = agentResponse.replace("[DONE]", "").trim();
        }
        
        // Handle function calling if present
        if (functionCalls && !isDone) {
          const { name, args } = functionCalls;
          
          // In a real implementation, you would execute the function here
          // For this example, we'll simulate a function response
          const functionResponse = `Function ${name} was called with args: ${JSON.stringify(args)}`;
          
          // Add the function response to memory
          currentMemory.push({role: "function", content: functionResponse});
        }
        
        // If we've reached max steps without completion, provide a final response
        if (!isDone && stepCount >= maxSteps) {
          finalResponse = "Maximum number of steps reached. Here's my current progress: " + agentResponse;
        }
        
      } catch (error) {
        console.error(`Error in agent step ${stepCount}:`, error);
        throw error;
      }
    }
    
    return {
      finalResponse,
      memory: currentMemory
    };
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
