
import { GeminiRequest } from "@/services/geminiService";

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
  }
];

export const generatePromptRequest = (goal: string): GeminiRequest => {
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
};
