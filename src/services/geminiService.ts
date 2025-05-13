
// Gemini API service for generating AI instructions

export interface GeminiRequest {
  prompt: string;
  framework: string;
  parameters?: Record<string, any>;
}

export interface GeminiResponse {
  generatedText: string;
  requestId: string;
  model: string;
  timestamp: string;
}

class GeminiService {
  private apiKey: string | null = null;
  private readonly API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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

  async generateInstruction(request: GeminiRequest): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error("API key not set. Please set your Gemini API key first.");
    }

    const frameworkPrompt = this.getFrameworkPrompt(request.framework);
    
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
            {
              parts: [
                { text: promptText }
              ]
            }
          ],
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
