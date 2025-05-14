import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, FileText, Lightbulb, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGemini } from "@/hooks/use-gemini";
import { generatePromptRequest } from "@/utils/promptGenerator";

interface TechniqueProps {
  title: string;
  description: string;
  examples: string[];
  tips: string[];
}

const PromptEngineeringGuide = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basics");
  const [copiedExample, setCopiedExample] = useState<number | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [promptGoal, setPromptGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  
  const { generateInstruction } = useGemini();

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(index);
    setTimeout(() => setCopiedExample(null), 2000);
    
    toast({
      title: "Example copied",
      description: "The example has been copied to your clipboard"
    });
  };
  
  const handleGeneratePrompt = async () => {
    if (!promptGoal.trim()) {
      toast({
        title: "Empty goal",
        description: "Please enter a goal for your prompt",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const request = generatePromptRequest(promptGoal);
      const result = await generateInstruction(request);
      
      if (result?.generatedText) {
        setGeneratedPrompt(result.generatedText);
        
        // Save to localStorage for later use in IDE
        const generatedPrompts = JSON.parse(localStorage.getItem("generatedPrompts") || "[]");
        generatedPrompts.push({
          goal: promptGoal,
          prompt: result.generatedText,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem("generatedPrompts", JSON.stringify(generatedPrompts));
        
        toast({
          title: "Prompt Generated",
          description: "Your custom prompt has been generated successfully"
        });
      } else {
        throw new Error("Failed to generate prompt");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const techniques: Record<string, TechniqueProps[]> = {
    basics: [
      {
        title: "Clear Instructions",
        description: "Provide specific, unambiguous instructions to the AI model.",
        examples: [
          "Summarize the following text in 3 bullet points, focusing on the main arguments: [text]",
          "Analyze this code snippet for potential security vulnerabilities: [code]"
        ],
        tips: [
          "Be specific about what you want",
          "Use concrete language rather than abstract terms",
          "Specify format, length, and style when relevant"
        ]
      },
      {
        title: "Role Prompting",
        description: "Assign a specific role or persona to the AI to shape its response style.",
        examples: [
          "As an experienced software developer, review this code and suggest improvements: [code]",
          "Acting as a financial advisor, explain the pros and cons of index funds to a beginner"
        ],
        tips: [
          "Choose roles that have clear communication standards",
          "Be specific about expertise level and context",
          "Consider combining roles for nuanced responses"
        ]
      },
    ],
    advanced: [
      {
        title: "Chain of Thought (CoT)",
        description: "Guide the AI through a step-by-step reasoning process to solve complex problems.",
        examples: [
          "Let's solve this math problem step by step: A train leaves Station A at 8 AM traveling at 60 mph...",
          "Think through this logical puzzle carefully: If all A are B, and some B are C, what can we conclude about A and C?"
        ],
        tips: [
          "Explicitly ask for step-by-step reasoning",
          "Break complex problems into smaller parts",
          "Ask the model to verify its own logic"
        ]
      },
      {
        title: "Few-Shot Learning",
        description: "Provide examples of input-output pairs to demonstrate the desired pattern.",
        examples: [
          "Transform these sentences to past tense:\nInput: I eat an apple.\nOutput: I ate an apple.\nInput: She walks to school.\nOutput:",
          "Classify these statements as fact or opinion:\nInput: The Earth orbits the Sun.\nOutput: Fact\nInput: Chocolate ice cream is the best flavor.\nOutput:"
        ],
        tips: [
          "Use 3-5 examples for optimal results",
          "Ensure examples cover different cases",
          "Maintain consistent formatting across examples"
        ]
      },
    ],
    frameworks: [
      {
        title: "CRISPE Framework",
        description: "Capacity and Role, Insight, Statement, Personality, Experiment (CRISPE) framework for structured prompting.",
        examples: [
          "Capacity and Role: You are an expert software architect\nInsight: You specialize in scalable cloud applications\nStatement: Evaluate this system design for an e-commerce platform\nPersonality: You're detail-oriented and practical\nExperiment: Suggest three alternative approaches with their pros and cons"
        ],
        tips: [
          "Define the AI's capacity clearly",
          "Provide relevant insights that inform the response",
          "Make a clear statement of what you want",
          "Specify personality traits to influence tone",
          "Design experiments to explore alternatives"
        ]
      },
      {
        title: "REACT Framework",
        description: "Reasoning, Action, and Observation framework for problem-solving.",
        examples: [
          "Reasoning: To solve this optimization problem, we need to identify the constraints and variables\nAction: Let's first list all the variables and constraints\nObservation: There are 3 variables (x, y, z) and 2 constraints (x + y <= 10, y + z >= 5)"
        ],
        tips: [
          "Start with reasoning about the approach",
          "Specify concrete actions to take",
          "Include observations to refine the process",
          "Iterate through multiple reasoning-action-observation cycles"
        ]
      },
    ],
    tools: [
      {
        title: "Automatic Prompt Engineer (APE)",
        description: "A framework that treats prompt engineering as a natural language problem, automatically generating and selecting effective instructions.",
        examples: [
          "Using APE for text classification:\n1. Define task: Sentiment analysis\n2. Start with base prompt: 'Classify this text as positive or negative'\n3. Let APE iterate and test variations\n4. Select optimal prompt: 'Analyze the sentiment of the following text and classify it as positive, negative, or neutral. Provide a brief explanation for your classification.'"
        ],
        tips: [
          "Define clear evaluation metrics",
          "Let the system generate multiple prompt variations",
          "Test across diverse examples",
          "Consider the trade-off between prompt complexity and effectiveness"
        ]
      },
      {
        title: "ChatGPT Prompt Generator",
        description: "Tools to streamline the creation of effective prompts specifically for ChatGPT.",
        examples: [
          "Input: I need help with JavaScript promises\nGenerated prompt: 'Explain JavaScript promises in simple terms. Include: 1) Basic concept and purpose, 2) How to create and use promises, 3) Common patterns and best practices, 4) A simple example of error handling with promises.'"
        ],
        tips: [
          "Start with your topic and desired outcome",
          "Specify format preferences",
          "Indicate knowledge level (beginner, intermediate, expert)",
          "Use the generated prompt as a starting point and refine as needed"
        ]
      },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Lightbulb size={24} className="text-amber-500" />
            Prompt Engineering Guide
          </h2>
          <p className="text-gray-600">
            Learn advanced techniques to craft effective prompts for AI models
          </p>
        </div>
        
        <Button 
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600"
          onClick={() => setIsGenerateDialogOpen(true)}
        >
          <Zap size={16} />
          Auto-Generate Prompt
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>
        
        {Object.keys(techniques).map((category) => (
          <TabsContent key={category} value={category}>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {techniques[category].map((technique, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{technique.title}</CardTitle>
                      <CardDescription>{technique.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" /> Examples
                        </h4>
                        <div className="space-y-3">
                          {technique.examples.map((example, exIndex) => (
                            <div 
                              key={exIndex} 
                              className="bg-gray-50 p-3 rounded-md border border-gray-200 relative"
                            >
                              <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700">
                                {example}
                              </pre>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(example, index * 100 + exIndex)}
                              >
                                {copiedExample === index * 100 + exIndex ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tips</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {technique.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-gray-700">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
      
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Auto-Generate Prompt
            </DialogTitle>
            <DialogDescription>
              Describe your goal, and we'll generate an optimized prompt for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Your Goal</Label>
              <Input
                id="goal"
                value={promptGoal}
                onChange={(e) => setPromptGoal(e.target.value)}
                placeholder="e.g., Summarize scientific papers while extracting key findings"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about what you want to achieve with this prompt
              </p>
            </div>
            
            {generatedPrompt && (
              <div className="space-y-2">
                <Label>Generated Prompt</Label>
                <div className="bg-muted p-3 rounded-md border border-border">
                  <pre className="text-xs whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (generatedPrompt) {
                  navigator.clipboard.writeText(generatedPrompt);
                  toast({ title: "Copied to clipboard" });
                } else {
                  handleGeneratePrompt();
                }
              }}
              disabled={isGenerating || (!generatedPrompt && !promptGoal)}
            >
              {isGenerating ? "Generating..." : generatedPrompt ? "Copy to Clipboard" : "Generate Prompt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptEngineeringGuide;
