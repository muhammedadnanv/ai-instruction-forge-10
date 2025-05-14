
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGemini } from "@/hooks/use-gemini";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, RefreshCw, Play, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PromptChain {
  id: string;
  prompt: string;
  response: string;
  refinementReason?: string;
}

const AutoRefineChains = () => {
  const [initialPrompt, setInitialPrompt] = useState("");
  const [goal, setGoal] = useState("");
  const [targetModel, setTargetModel] = useState("gemini-pro");
  const [iterations, setIterations] = useState<number[]>([3]);
  const [useContext, setUseContext] = useState(true);
  const [evaluateOutputs, setEvaluateOutputs] = useState(true);
  const [promptChain, setPromptChain] = useState<PromptChain[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  
  const { generateInstruction, streamInstruction } = useGemini();
  const { toast } = useToast();

  const startRefinement = async () => {
    if (!initialPrompt.trim() || !goal.trim()) {
      toast({
        title: "Input Required",
        description: "Please provide an initial prompt and a goal",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentIteration(0);
    setPromptChain([]);
    
    try {
      // Start with the initial prompt
      const firstChain: PromptChain = {
        id: `prompt-0`,
        prompt: initialPrompt,
        response: "",
      };
      
      setPromptChain([firstChain]);
      
      // Generate initial response
      await generateFirstResponse(firstChain);
      
    } catch (error) {
      console.error("Error starting refinement:", error);
      toast({
        title: "Process Failed",
        description: "Could not start the refinement process",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  const generateFirstResponse = async (chain: PromptChain) => {
    try {
      // Simulate response from the target model
      const initialResponse = await generateInstruction({
        prompt: chain.prompt,
        framework: "COT",
        temperature: 0.7,
      });
      
      if (initialResponse?.generatedText) {
        const updatedChain = {
          ...chain,
          response: initialResponse.generatedText,
        };
        
        setPromptChain([updatedChain]);
        
        // After getting the first response, start the refinement process
        await refinePrompt(updatedChain, 1);
      }
    } catch (error) {
      console.error("Error generating initial response:", error);
      toast({
        title: "Response Generation Failed",
        description: "Could not generate the initial response",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  const refinePrompt = async (previousChain: PromptChain, iteration: number) => {
    if (iteration > iterations[0]) {
      setIsProcessing(false);
      toast({
        title: "Process Complete",
        description: `Completed ${iteration - 1} refinement iterations`
      });
      return;
    }
    
    setCurrentIteration(iteration);
    
    try {
      // System prompt for refining based on previous steps
      const systemPrompt = `
You are an expert prompt engineer tasked with refining prompts for AI systems.
Goal of the prompt: ${goal}
Target model: ${targetModel}

${useContext ? `Context from previous iterations:
${promptChain.map(c => `Prompt: ${c.prompt}\nResponse: ${c.response}`).join('\n\n')}` : ''}

${evaluateOutputs ? `Evaluate the latest response:
- Does it meet the stated goal?
- What assumptions were made?
- What information is missing?
- How could the prompt be more specific?` : ''}

Based on this analysis, create a refined version of the prompt that:
1. Addresses any ambiguities or inefficiencies
2. Incorporates learnings from previous iterations
3. Is more likely to generate the desired output for the goal
4. Uses appropriate techniques (CoT, few-shot examples, etc.) if needed

Return a JSON object with:
- refinedPrompt: The improved prompt text
- reasoning: Explanation of what you changed and why
`;

      const refinementResponse = await generateInstruction({
        prompt: `Previous prompt: ${previousChain.prompt}\nPrevious response: ${previousChain.response}`,
        framework: "TREE",
        systemInstruction: systemPrompt,
        jsonMode: true,
        temperature: 0.3
      });
      
      if (refinementResponse?.jsonResponse) {
        const result = refinementResponse.jsonResponse;
        const newPrompt: PromptChain = {
          id: `prompt-${iteration}`,
          prompt: result.refinedPrompt,
          refinementReason: result.reasoning,
          response: ""
        };
        
        // Add the new prompt to the chain
        setPromptChain(prev => [...prev, newPrompt]);
        
        // Generate response for the refined prompt
        const newResponse = await generateInstruction({
          prompt: result.refinedPrompt,
          framework: "COT",
          temperature: 0.7,
        });
        
        if (newResponse?.generatedText) {
          // Update the response for this prompt
          newPrompt.response = newResponse.generatedText;
          setPromptChain(prev => [
            ...prev.slice(0, prev.length - 1),
            newPrompt
          ]);
          
          // Continue to next iteration
          await refinePrompt(newPrompt, iteration + 1);
        }
      }
    } catch (error) {
      console.error("Error refining prompt:", error);
      toast({
        title: "Refinement Failed",
        description: `Error during iteration ${iteration}`,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Refine Prompt Chains</CardTitle>
        <CardDescription>
          Automatically enhance and iterate prompt sequences using feedback loops and output analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Optimization Goal</Label>
              <Input
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Generate a detailed product description"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="initialPrompt">Initial Prompt</Label>
              <Textarea
                id="initialPrompt"
                value={initialPrompt}
                onChange={(e) => setInitialPrompt(e.target.value)}
                placeholder="Enter your starting prompt..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model">Target Model</Label>
              <Select value={targetModel} onValueChange={setTargetModel}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="llama-3">Llama 3</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label>Iterations: {iterations[0]}</Label>
              <Slider
                value={iterations}
                onValueChange={setIterations}
                min={1}
                max={10}
                step={1}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-context">Use Previous Context</Label>
                <Switch
                  id="use-context"
                  checked={useContext}
                  onCheckedChange={setUseContext}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="evaluate">Evaluate Outputs</Label>
                <Switch
                  id="evaluate"
                  checked={evaluateOutputs}
                  onCheckedChange={setEvaluateOutputs}
                />
              </div>
            </div>
            
            <Button
              className="w-full mt-6"
              onClick={startRefinement}
              disabled={isProcessing || !initialPrompt.trim() || !goal.trim()}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing Iteration {currentIteration}/{iterations[0]}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Refinement Process
                </>
              )}
            </Button>
          </div>
        </div>
        
        {promptChain.length > 0 && (
          <div className="mt-8 border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4">Prompt Refinement Chain</h3>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {promptChain.map((item, index) => (
                  <div key={item.id} className="border rounded-lg bg-muted/30">
                    <div className="bg-muted p-3 rounded-t-lg flex items-center justify-between">
                      <div className="font-medium">Iteration {index}</div>
                      {index > 0 && (
                        <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Refined
                        </div>
                      )}
                    </div>
                    
                    {item.refinementReason && (
                      <div className="px-4 py-2 bg-blue-50 border-y border-blue-100 text-sm">
                        <div className="font-medium text-blue-800">Refinement Reasoning:</div>
                        <p>{item.refinementReason}</p>
                      </div>
                    )}
                    
                    <div className="p-4 space-y-4">
                      <div>
                        <div className="font-medium mb-1">Prompt:</div>
                        <div className="bg-background p-3 rounded-md text-sm">
                          {item.prompt}
                        </div>
                      </div>
                      
                      {item.response && (
                        <div>
                          <div className="font-medium mb-1">Response:</div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                            {item.response}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {index < promptChain.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ChevronRight className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoRefineChains;
