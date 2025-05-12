
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FrameworkSelectorProps {
  selectedFramework: string;
  setSelectedFramework: (framework: string) => void;
}

const FrameworkSelector = ({ selectedFramework, setSelectedFramework }: FrameworkSelectorProps) => {
  const frameworks = [
    { value: "ACT", label: "ACT - Action, Context, Target" },
    { value: "COT", label: "COT - Chain of Thought" },
    { value: "ReACT", label: "ReACT - Reason + Act" },
    { value: "TREE", label: "TREE - Tool-Reasoning Enhanced Execution" },
    { value: "SCQA", label: "SCQA - Situation, Complication, Question, Answer" },
    { value: "OODA", label: "OODA - Observe, Orient, Decide, Act" },
    { value: "PROMPT", label: "PROMPT - Persona, Role, Objective, Method, Process, Tone" },
    { value: "MOT", label: "MOT - Mode, Objective, Type" },
    { value: "PEEL", label: "PEEL - Point, Evidence, Explain, Link" },
    { value: "CRISP", label: "CRISP - Context, Request, Instruction, Style, Parameters" }
  ];

  return (
    <Select value={selectedFramework} onValueChange={setSelectedFramework}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Framework" />
      </SelectTrigger>
      <SelectContent>
        {frameworks.map((framework) => (
          <SelectItem key={framework.value} value={framework.value}>
            {framework.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FrameworkSelector;
