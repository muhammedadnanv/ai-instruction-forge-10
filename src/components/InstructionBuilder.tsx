
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface InstructionBuilderProps {
  framework: string;
  setInstruction: (instruction: string) => void;
}

const InstructionBuilder = ({ framework, setInstruction }: InstructionBuilderProps) => {
  const [fields, setFields] = useState<Record<string, string>>({});
  
  const frameworkFields: Record<string, string[]> = {
    "ACT": ["Action", "Context", "Target"],
    "COT": ["Initial State", "Step 1", "Step 2", "Final State"],
    "ReACT": ["Observation", "Reasoning", "Action"],
    "TREE": ["Tool Name", "Reasoning Steps", "Expected Outcome"],
    "SCQA": ["Situation", "Complication", "Question", "Answer"],
    "OODA": ["Observe", "Orient", "Decide", "Act"],
    "PROMPT": ["Persona", "Role", "Objective", "Method", "Process", "Tone"],
    "MOT": ["Mode", "Objective", "Type"],
    "PEEL": ["Point", "Evidence", "Explain", "Link"],
    "CRISP": ["Context", "Request", "Instruction", "Style", "Parameters"]
  };
  
  const handleFieldChange = (field: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const buildInstruction = () => {
    const currentFrameworkFields = frameworkFields[framework] || [];
    let instructionText = `# ${framework} Framework\n\n`;
    
    currentFrameworkFields.forEach(field => {
      instructionText += `## ${field}:\n${fields[field] || "[Not provided]"}\n\n`;
    });
    
    setInstruction(instructionText);
  };

  return (
    <Card className="p-4 bg-gray-50 border border-gray-200">
      <h3 className="text-md font-medium mb-3">Framework Builder</h3>
      <div className="space-y-3">
        {(frameworkFields[framework] || []).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field}
            </label>
            <Input
              placeholder={`Enter ${field.toLowerCase()}...`}
              value={fields[field] || ""}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
          </div>
        ))}
        <Button 
          onClick={buildInstruction} 
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusCircle size={16} />
          Build Framework Structure
        </Button>
      </div>
    </Card>
  );
};

export default InstructionBuilder;
