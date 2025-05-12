
// This is a mock service for now, to be replaced with actual Gemini API integration

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

export const generateInstruction = async (request: GeminiRequest): Promise<GeminiResponse> => {
  // In a real implementation, this would be an actual API call to Gemini
  // For demonstration purposes, we'll simulate a response
  
  console.log("Generating instruction with request:", request);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const frameworkTemplates: Record<string, string> = {
    "ACT": `# AI System Instruction: ${request.framework} Framework

## Action:
- Provide informative and helpful responses to user queries
- Generate content based on the following parameters: ${request.prompt}

## Context:
- You are an AI assistant designed to help users with their tasks
- You should use appropriate tone and style for each interaction

## Target:
- Support users in achieving their goals efficiently
- Maintain professionalism and accuracy in all responses`,

    "COT": `# AI System Instruction: Chain of Thought Framework

When responding to queries about ${request.prompt}, follow these steps:

1. First, understand the key components of the request
2. Consider different approaches to solving the problem
3. Reason through each step logically
4. Arrive at a comprehensive answer
5. Explain your reasoning process transparently`,

    "ReACT": `# AI System Instruction: Reason + Act Framework

When handling tasks related to ${request.prompt}:

## Observation:
- Note all relevant information provided by the user
- Identify the core problem that needs to be solved

## Reasoning:
- Consider different approaches to the problem
- Evaluate pros and cons of each approach
- Select the most effective solution

## Action:
- Implement the chosen solution clearly and efficiently
- Provide actionable next steps when appropriate`,
  };
  
  const generatedText = frameworkTemplates[request.framework] || 
    `# AI System Instruction: Custom Framework\n\n${request.prompt}\n\nAs an AI assistant, you should:\n- Respond to user queries helpfully and accurately\n- Maintain a professional tone\n- Provide relevant information`;
  
  return {
    generatedText,
    requestId: `mock-req-${Date.now()}`,
    model: "gemini-pro-simulate",
    timestamp: new Date().toISOString()
  };
};

export default {
  generateInstruction
};
