
import { InfoIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FrameworkSelectorProps {
  selectedFramework: string;
  onFrameworkSelect: (framework: string) => void;
}

const FrameworkSelector = ({ selectedFramework, onFrameworkSelect }: FrameworkSelectorProps) => {
  const frameworks = [
    { 
      value: "ACT", 
      label: "ACT - Action, Context, Target",
      description: "Define what to do, in what context, and for whom"
    },
    { 
      value: "COT", 
      label: "COT - Chain of Thought",
      description: "Step-by-step reasoning process for solving problems"
    },
    { 
      value: "ReACT", 
      label: "ReACT - Reason + Act",
      description: "Alternate between reasoning and acting to achieve a goal"
    },
    { 
      value: "TREE", 
      label: "TREE - Tool-Reasoning Enhanced Execution",
      description: "Use tools with reasoning to enhance execution"
    },
    { 
      value: "SCQA", 
      label: "SCQA - Situation, Complication, Question, Answer",
      description: "Present a situation, identify complications, pose questions, provide answers"
    },
    { 
      value: "OODA", 
      label: "OODA - Observe, Orient, Decide, Act",
      description: "Decision-making cycle: observe, orient, decide, and act"
    },
    { 
      value: "PROMPT", 
      label: "PROMPT - Persona, Role, Objective, Method, Process, Tone",
      description: "Define who the AI is and how it should behave"
    },
    { 
      value: "MOT", 
      label: "MOT - Mode, Objective, Type",
      description: "Specify the mode of operation, objective, and type of response"
    },
    { 
      value: "PEEL", 
      label: "PEEL - Point, Evidence, Explain, Link",
      description: "State a point, provide evidence, explain, and link to broader context"
    },
    { 
      value: "CRISP", 
      label: "CRISP - Context, Request, Instruction, Style, Parameters",
      description: "Define context, make requests, provide instructions with style guidelines"
    }
  ];

  // Show description of selected framework
  const selectedFrameworkInfo = frameworks.find(f => f.value === selectedFramework);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={selectedFramework} onValueChange={onFrameworkSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Framework" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {frameworks.map((framework) => (
              <SelectItem key={framework.value} value={framework.value} className="flex items-center justify-between">
                <div className="flex items-center justify-between w-full">
                  <span>{framework.label}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon size={16} className="ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>{framework.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedFrameworkInfo && (
        <p className="text-sm text-gray-500 italic">
          {selectedFrameworkInfo.description}
        </p>
      )}
    </div>
  );
};

export default FrameworkSelector;
