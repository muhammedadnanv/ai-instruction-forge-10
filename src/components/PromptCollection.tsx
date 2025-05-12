
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PromptCollectionProps {
  setInstruction: (instruction: string) => void;
  setSelectedFramework: (framework: string) => void;
}

const PromptCollection = ({ setInstruction, setSelectedFramework }: PromptCollectionProps) => {
  const { toast } = useToast();
  
  const templates = [
    {
      title: "Customer Support Assistant",
      description: "An AI that handles customer inquiries with empathy and efficiency",
      framework: "PROMPT",
      template: "# Customer Support Assistant\n\nPersona: Friendly, patient support agent\nRole: Assist customers with their inquiries and issues\nObjective: Resolve customer problems efficiently while maintaining a positive experience\nMethod: Identify the issue, provide solutions, escalate when necessary\nProcess: Greet > Understand > Solve > Follow-up\nTone: Professional, empathetic, and clear"
    },
    {
      title: "Data Analysis Assistant",
      description: "An AI that helps analyze and interpret complex datasets",
      framework: "COT",
      template: "# Data Analysis Assistant\n\nInitial State: Receive raw data and analysis requirements\nStep 1: Clean and prepare data for analysis\nStep 2: Apply appropriate statistical methods\nStep 3: Interpret results and identify patterns\nStep 4: Present insights in clear, actionable format\nFinal State: Deliver comprehensive analysis with visualizations and recommendations"
    },
    {
      title: "Content Creation Helper",
      description: "An AI that assists in generating various types of content",
      framework: "ReACT",
      template: "# Content Creation Helper\n\nObservation: Understand the content type, target audience, and key messages\nReasoning: Determine the appropriate tone, style, and structure for the content\nAction: Generate content drafts, suggest improvements, and refine based on feedback"
    },
    {
      title: "Decision-Making Advisor",
      description: "An AI that helps evaluate options and make decisions",
      framework: "OODA",
      template: "# Decision-Making Advisor\n\nObserve: Gather relevant information and data points\nOrient: Analyze the situation within appropriate context\nDecide: Evaluate options and recommend best courses of action\nAct: Outline implementation steps and potential outcomes"
    },
    {
      title: "Research Assistant",
      description: "An AI that helps with research and information gathering",
      framework: "TREE",
      template: "# Research Assistant\n\nTool: Use search capabilities to find relevant information\nReasoning: Evaluate sources for credibility and relevance\nExecution: Synthesize information into comprehensive summaries"
    },
    {
      title: "Learning Tutor",
      description: "An AI that helps explain and teach complex concepts",
      framework: "PEEL",
      template: "# Learning Tutor\n\nPoint: Identify the key concept or learning objective\nEvidence: Provide examples, facts, and supporting information\nExplain: Break down complex ideas into understandable components\nLink: Connect new knowledge to existing understanding or real-world applications"
    }
  ];
  
  const useTemplate = (template: any) => {
    setSelectedFramework(template.framework);
    setInstruction(template.template);
    toast({
      title: "Template Selected",
      description: `"${template.title}" template has been loaded`
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Pre-built Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <Card key={index} className="border-gray-200 hover:border-indigo-300 transition-colors">
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                {template.framework} Framework
              </span>
              <Button 
                onClick={() => useTemplate(template)}
                variant="outline"
                size="sm"
              >
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromptCollection;
