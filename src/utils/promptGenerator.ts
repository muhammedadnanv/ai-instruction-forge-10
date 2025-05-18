
import { GeminiRequest } from "@/services/geminiService";
import { HuggingFaceRequest } from "@/hooks/use-huggingface";

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
}

export const predefinedTemplates: PromptTemplate[] = [
  {
    name: "Analytical Report",
    description: "Generate detailed analysis reports",
    template: `# System Instruction
You are an analytical expert who provides thorough, evidence-based analysis.

# User Prompt
{{input}}

# Format
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Detailed Analysis (2-3 paragraphs)
4. Recommendations (3-5 bullet points)
5. Conclusion (1 paragraph)`
  },
  {
    name: "Creative Writer",
    description: "Generate creative content and stories",
    template: `# System Instruction
You are a creative writer with a vivid imagination and engaging writing style.

# User Prompt
{{input}}

# Format
Write engaging prose with rich descriptions and compelling narrative. Use varied sentence structures and evocative language. Organize into clear beginning, middle, and end sections.`
  },
  {
    name: "Technical Documentation",
    description: "Create clear technical documentation",
    template: `# System Instruction
You are a technical documentation specialist who explains complex concepts clearly and concisely.

# User Prompt
{{input}}

# Format
## Overview
Brief explanation of the concept/feature

## Technical Details
- Specifications
- Requirements
- Dependencies

## Implementation
Step-by-step instructions with code examples where appropriate

## Troubleshooting
Common issues and solutions`
  },
  {
    name: "Prompt Engineer",
    description: "Create effective AI prompts",
    template: `# System Instruction
You are an expert prompt engineer who creates clear, effective prompts for AI systems.

# User Prompt
{{input}}

# Format
## Role Definition
Define the AI's role and expertise

## Context
Provide background information

## Task Instructions
Clear steps for what the AI should do

## Format Requirements
Specify output format, length, and style

## Constraints
Define any limitations or considerations`
  }
];

export const generatePromptRequest = (goal: string, provider: string = "gemini"): GeminiRequest | HuggingFaceRequest => {
  if (provider === "gemini") {
    return {
      prompt: `As an expert prompt engineer, create a professional prompt template for the following goal: "${goal}".
      
Your prompt should include:
1. A clear system instruction section defining the AI's role and expertise
2. A placeholder for user input marked as {{input}}
3. Specific format instructions for the desired output
4. Any relevant constraints or guidelines

Make the prompt specific, clear, and optimized for the stated goal. Format it with clear section headers.`,
      temperature: 0.7,
      framework: "CRISP"
    };
  } else {
    // For Hugging Face
    return {
      model: "mistralai/Mistral-7B-Instruct-v0.2", // Default model, can be overridden
      messages: [
        {
          role: "system", 
          content: "You are an expert prompt engineer who creates professional prompts."
        },
        {
          role: "user",
          content: `Create a professional prompt template for the following goal: "${goal}".
          
Your prompt should include:
1. A clear system instruction section defining the AI's role and expertise
2. A placeholder for user input marked as {{input}}
3. Specific format instructions for the desired output
4. Any relevant constraints or guidelines

Make the prompt specific, clear, and optimized for the stated goal. Format it with clear section headers.`
        }
      ],
      temperature: 0.7
    };
  }
};

// Helper function to determine the best AI model for a specific task
export const getSuggestedModel = (taskType: string): { provider: string, model?: string } => {
  switch (taskType.toLowerCase()) {
    case "creative":
    case "story":
    case "content":
      return { provider: "gemini", model: "gemini-pro" };
    
    case "analysis":
    case "analytical":
    case "report":
      return { provider: "huggingface", model: "mistralai/Mistral-7B-Instruct-v0.2" };
    
    case "technical":
    case "documentation":
    case "code":
      return { provider: "gemini", model: "gemini-pro" };
    
    default:
      return { provider: "gemini" }; // Default to Gemini
  }
};
