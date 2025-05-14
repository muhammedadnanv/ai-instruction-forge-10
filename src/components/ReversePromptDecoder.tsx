
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGemini } from "@/hooks/use-gemini";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowDown, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ReversePromptDecoder = () => {
  const [aiOutput, setAiOutput] = useState("");
  const [decodedPrompt, setDecodedPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const { generateInstruction } = useGemini();
  const { toast } = useToast();

  const analyzeOutput = async () => {
    if (!aiOutput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter AI generated text to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const systemPrompt = `
You are an expert prompt engineer with the ability to reverse-engineer prompts from AI outputs.
Analyze the provided AI output and reconstruct the most likely prompt that generated it.
Consider:
1. Style, tone and formatting patterns
2. Specific instructions that might have been given
3. Constraints or guidelines evident in the response
4. Technical elements like specified frameworks or methodologies
5. Possible system messages that shaped the response

Return a JSON object with:
- reconstructedPrompt: Your best estimation of the original prompt
- confidence: A number between 0-100 indicating your confidence level
- reasoning: Brief explanation of how you arrived at this prompt
- possibleAlternatives: Array of other potential prompts (2-3 alternatives)
`;

      const response = await generateInstruction({
        prompt: `Here is the AI output to analyze:\n\n${aiOutput}`,
        framework: "TREE",
        systemInstruction: systemPrompt,
        jsonMode: true,
        temperature: 0.2
      });
      
      if (response?.jsonResponse) {
        const result = response.jsonResponse;
        setDecodedPrompt(result.reconstructedPrompt);
        setConfidence(result.confidence);
        
        toast({
          title: "Analysis Complete",
          description: "Prompt reconstruction finished"
        });
      }
    } catch (error) {
      console.error("Error analyzing output:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the provided text",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setAiOutput("");
    setDecodedPrompt("");
    setConfidence(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reverse Prompt Decoder</CardTitle>
        <CardDescription>
          Analyze AI outputs to reconstruct the likely prompts that generated them
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Paste AI Output</label>
          <Textarea 
            value={aiOutput}
            onChange={(e) => setAiOutput(e.target.value)}
            placeholder="Paste the AI-generated text you want to analyze..."
            className="min-h-[200px]"
          />
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={analyzeOutput}
            disabled={isAnalyzing || !aiOutput.trim()}
            className="mx-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ArrowDown className="mr-2 h-4 w-4" />
                Reconstruct Prompt
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClear}
            className="mx-2"
          >
            Clear
          </Button>
        </div>
        
        {decodedPrompt && (
          <div className="space-y-4 mt-6 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Reconstructed Prompt</h3>
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                Confidence: {confidence}%
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap">{decodedPrompt}</pre>
            </div>
            
            <Alert>
              <AlertTitle>How This Works</AlertTitle>
              <AlertDescription>
                This tool analyzes patterns, structures, and content in the AI output to infer the
                likely prompt that generated it. Higher confidence scores indicate stronger pattern recognition.
                Results are educated estimates and may not match the exact original prompt.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReversePromptDecoder;
