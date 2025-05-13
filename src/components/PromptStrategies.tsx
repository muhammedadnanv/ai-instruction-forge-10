
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptStrategiesProps {
  setInstruction: (instruction: string) => void;
}

const PromptStrategies = ({ setInstruction }: PromptStrategiesProps) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("general");
  
  const categories = [
    { id: "general", name: "General" },
    { id: "creative", name: "Creative Writing" },
    { id: "technical", name: "Technical" },
    { id: "business", name: "Business" },
  ];

  const strategies = {
    general: [
      {
        title: "Chain of Thought",
        description: "Break down complex problems into a series of smaller steps",
        template: "# Chain of Thought Prompting\n\nTo solve this problem, I want you to:\n\n1. Break down the problem into smaller components\n2. Reason through each component step by step\n3. Show your full thought process\n4. Arrive at a conclusion based on logical reasoning\n5. If necessary, consider alternative approaches"
      },
      {
        title: "Zero-Shot Learning",
        description: "Provide clear instructions without examples",
        template: "# Zero-Shot Instruction\n\nI need you to [task description].\n\nRequirements:\n- [requirement 1]\n- [requirement 2]\n- [requirement 3]\n\nConstraints:\n- [constraint 1]\n- [constraint 2]\n\nOutput format:\n[desired output format]"
      },
      {
        title: "Few-Shot Learning",
        description: "Provide examples to guide the model's response",
        template: "# Few-Shot Learning\n\nTask: [describe the task]\n\nExample 1:\nInput: [example input]\nOutput: [example output]\n\nExample 2:\nInput: [example input]\nOutput: [example output]\n\nExample 3:\nInput: [example input]\nOutput: [example output]\n\nNow complete this:\nInput: [actual input]"
      }
    ],
    creative: [
      {
        title: "Character Creation",
        description: "Create detailed fictional characters",
        template: "# Character Creation Framework\n\n## Background\nCreate a character with the following attributes:\n- Name and age\n- Physical appearance\n- Personality traits (3-5 key traits)\n- Background/history\n- Goals and motivations\n- Relationships with other characters\n- Key strengths and weaknesses\n\n## Development\nInclude character growth arcs and how they might respond to different scenarios."
      },
      {
        title: "Story Structure",
        description: "Create compelling narrative arcs",
        template: "# Story Structure Framework\n\n## Setup\n- Setting: time period and location\n- Main characters and their motivations\n- Initial situation/status quo\n\n## Conflict\n- Inciting incident\n- Rising action and complications\n- Stakes and obstacles\n\n## Resolution\n- Climax\n- Resolution\n- Character transformations\n\n## Theme\n- Central message or question the story explores"
      }
    ],
    technical: [
      {
        title: "Code Optimization",
        description: "Improve existing code for better performance",
        template: "# Code Optimization Request\n\n## Current Implementation\n[Insert code or pseudo-code here]\n\n## Performance Issues\n- [Describe specific performance issues]\n- [Include metrics if available]\n\n## Constraints\n- Must maintain all existing functionality\n- [Any specific constraints like memory usage, libraries, etc.]\n\n## Optimization Goals\n- [Specific goals like reduced time complexity, memory usage]\n- [Target metrics if applicable]"
      },
      {
        title: "Architecture Design",
        description: "Design software architecture for specific requirements",
        template: "# Architecture Design Request\n\n## System Requirements\n- [Functional requirement 1]\n- [Functional requirement 2]\n- [Non-functional requirement 1]\n\n## Technical Constraints\n- [Technology stack restrictions]\n- [Scaling requirements]\n- [Integration points]\n\n## Expected Output\n- High-level architecture diagram description\n- Component breakdown\n- Data flow explanation\n- API design considerations"
      }
    ],
    business: [
      {
        title: "Market Analysis",
        description: "Analyze market trends and opportunities",
        template: "# Market Analysis Framework\n\n## Industry Overview\n- Current market size and growth rate\n- Key players and market share\n- Recent trends and innovations\n\n## Target Market\n- Demographics and psychographics\n- Needs and pain points\n- Market segmentation\n\n## Competitive Analysis\n- Direct and indirect competitors\n- Competitive advantages and disadvantages\n- Positioning strategy\n\n## Opportunities and Threats\n- Unmet market needs\n- Emerging technologies\n- Regulatory considerations"
      },
      {
        title: "Business Plan",
        description: "Create comprehensive business plans",
        template: "# Business Plan Outline\n\n## Executive Summary\n- Business concept\n- Mission and vision\n- Value proposition\n\n## Market Analysis\n- Target market\n- Industry trends\n- Competitive landscape\n\n## Operations Plan\n- Business model\n- Production/service delivery\n- Supply chain\n\n## Financial Plan\n- Startup costs\n- Revenue projections\n- Break-even analysis\n\n## Marketing Strategy\n- Positioning\n- Pricing\n- Distribution\n- Promotion"
      }
    ],
  };
  
  const useStrategy = (strategy: any) => {
    setInstruction(strategy.template);
    toast({
      title: "Strategy Selected",
      description: `"${strategy.title}" strategy has been loaded`
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Prompt Strategies</h2>
      <p className="text-gray-600">
        Select a prompt strategy template to help structure your AI instructions effectively
      </p>
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 mb-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategies[category.id as keyof typeof strategies].map((strategy, index) => (
                  <Card key={index} className="border-gray-200 hover:border-indigo-300 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{strategy.title}</CardTitle>
                      <CardDescription>{strategy.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={() => useStrategy(strategy)}
                        variant="outline"
                        size="sm"
                      >
                        Use Strategy
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PromptStrategies;
