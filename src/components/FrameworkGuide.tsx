
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Code, Lightbulb } from "lucide-react";

interface FrameworkInfo {
  name: string;
  fullName: string;
  description: string;
  structure: string[];
  useCases: string[];
  examples: string[];
}

const frameworkData: Record<string, FrameworkInfo> = {
  "ACT": {
    name: "ACT",
    fullName: "Action, Context, Target",
    description: "A framework for clearly specifying what action to take, in what context, and for what target audience.",
    structure: [
      "Action: Define what the AI should do",
      "Context: Describe the situation or background",
      "Target: Specify the audience or goal"
    ],
    useCases: [
      "Customer service interactions",
      "Educational content creation",
      "Marketing message creation"
    ],
    examples: [
      "Action: Explain | Context: When a customer is confused about our return policy | Target: New customers who have never returned an item before",
      "Action: Summarize | Context: Technical research papers | Target: Non-technical audience with basic scientific literacy"
    ]
  },
  "COT": {
    name: "COT",
    fullName: "Chain of Thought",
    description: "A framework that guides the AI through a step-by-step reasoning process to solve complex problems.",
    structure: [
      "Problem statement",
      "Step 1: Initial analysis",
      "Step 2: Consideration of options",
      "Step 3: Logical deduction",
      "Conclusion: Final answer"
    ],
    useCases: [
      "Mathematical problem solving",
      "Logical reasoning tasks",
      "Decision making processes"
    ],
    examples: [
      "Problem: Calculate the probability of drawing a red card followed by a black card from a standard deck without replacement.",
      "Step 1: Identify total cards and red cards (52 total, 26 red)",
      "Step 2: Calculate first probability (26/52 = 1/2)",
      "Step 3: Calculate second probability (26/51 after one red removed)",
      "Conclusion: Multiply probabilities: 1/2 × 26/51 = 26/102 = 13/51"
    ]
  },
  "ReACT": {
    name: "ReACT",
    fullName: "Reasoning + Acting",
    description: "A framework that alternates between reasoning about a situation and taking actions based on that reasoning.",
    structure: [
      "Thought: Analyze the current state",
      "Action: Decide on a specific action",
      "Observation: Process the results of the action",
      "Repeat until reaching a conclusion"
    ],
    useCases: [
      "Interactive problem solving",
      "Information retrieval and verification",
      "Multi-step tasks requiring adaptation"
    ],
    examples: [
      "Thought: I need to find the population of France as of 2023",
      "Action: Search for recent population statistics for France",
      "Observation: France's population is approximately 68 million as of 2023",
      "Thought: Now I need to compare this with Germany's population",
      "Action: Search for Germany's population statistics"
    ]
  },
  "CRISP": {
    name: "CRISP",
    fullName: "Context, Request, Instruction, Style, Parameters",
    description: "A comprehensive framework for structuring AI prompts with all necessary elements for optimal completion.",
    structure: [
      "Context: Background information and situation",
      "Request: Clear statement of what is needed",
      "Instruction: Specific guidance on how to complete the task",
      "Style: Tone, format, and presentation preferences", 
      "Parameters: Technical constraints and requirements"
    ],
    useCases: [
      "Content generation",
      "Technical documentation",
      "Creative writing with specific requirements"
    ],
    examples: [
      "Context: You are preparing materials for a technical workshop on cloud computing",
      "Request: Create a one-page handout explaining the concept of 'serverless' architecture",
      "Instruction: Include a definition, benefits, limitations, and one real-world example",
      "Style: Write for beginners with minimal technical jargon. Use analogies where helpful",
      "Parameters: Maximum 500 words, include 3-5 bullet points for key takeaways"
    ]
  },
  "PROMPT": {
    name: "PROMPT", 
    fullName: "Persona, Role, Objective, Method, Process, Tone",
    description: "A framework focused on defining the AI's identity and approach to generating responses.",
    structure: [
      "Persona: Who the AI is pretending to be",
      "Role: The function or position the AI serves",
      "Objective: The goal of the interaction",
      "Method: How to approach the task", 
      "Process: Step-by-step procedure to follow",
      "Tone: Communication style and voice"
    ],
    useCases: [
      "Role-playing scenarios",
      "Specialized professional advice",
      "Creative character-based content"
    ],
    examples: [
      "Persona: Expert data scientist with 10 years experience",
      "Role: Consultant helping analyze customer churn data",
      "Objective: Explain patterns in the data and recommend retention strategies",
      "Method: Use simple explanations with technical details only when necessary",
      "Process: First analyze the data patterns, then identify key factors, finally suggest 3-5 actionable strategies",
      "Tone: Professional but approachable, focused on practical applications"
    ]
  }
};

interface FrameworkGuideProps {
  framework?: string;
  onSelect?: (framework: string) => void;
}

export default function FrameworkGuide({ framework = "CRISP", onSelect }: FrameworkGuideProps) {
  const [selectedFramework, setSelectedFramework] = useState(framework);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleFrameworkSelect = (framework: string) => {
    setSelectedFramework(framework);
    if (onSelect) {
      onSelect(framework);
    }
  };
  
  const currentFramework = frameworkData[selectedFramework] || frameworkData["CRISP"];
  
  return (
    <>
      <Button
        variant="outline"
        className="flex items-center text-xs h-8 px-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <BookOpen className="mr-1 h-3 w-3" />
        {selectedFramework} Framework Guide
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Prompt Engineering Frameworks</DialogTitle>
            <DialogDescription>
              Choose the most appropriate framework for your prompt engineering needs
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={selectedFramework} className="mt-4">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="ACT">ACT</TabsTrigger>
              <TabsTrigger value="COT">COT</TabsTrigger>
              <TabsTrigger value="ReACT">ReACT</TabsTrigger>
              <TabsTrigger value="CRISP">CRISP</TabsTrigger>
              <TabsTrigger value="PROMPT">PROMPT</TabsTrigger>
            </TabsList>
            
            {Object.entries(frameworkData).map(([key, data]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{data.name}: {data.fullName}</CardTitle>
                    <CardDescription>{data.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium flex items-center mb-2">
                          <Code className="mr-2 h-4 w-4" />
                          Structure
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {data.structure.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-medium flex items-center mt-4 mb-2">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Use Cases
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {data.useCases.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Examples</h4>
                        <ScrollArea className="h-[260px] rounded border p-4">
                          <div className="space-y-4">
                            {data.examples.map((example, i) => (
                              <div key={i} className="text-sm">
                                <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-xs">{example}</pre>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                    
                    <Button 
                      className="mt-4" 
                      onClick={() => {
                        handleFrameworkSelect(key);
                        setIsDialogOpen(false);
                      }}
                    >
                      Use This Framework
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
