
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGemini } from "@/hooks/use-gemini";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, Search, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface PromptIssue {
  type: "ambiguity" | "verbosity" | "contradiction" | "logical_flaw" | "missing_context" | "inefficiency";
  severity: "low" | "medium" | "high";
  description: string;
  suggestion: string;
  location: {
    start: number;
    end: number;
  };
}

interface PromptAnalysis {
  score: number;
  issues: PromptIssue[];
  strengths: string[];
  improvedPrompt: string;
}

const PromptDebugger = () => {
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { generateInstruction } = useGemini();
  const { toast } = useToast();

  const analyzePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const systemPrompt = `
You are an expert prompt debugger with deep knowledge of LLM behavior. 
Analyze the provided prompt for inefficiencies, ambiguities, logical flaws, contradictions, and other issues.

Return a JSON object with:
- score: A quality score from 0-100
- issues: An array of identified problems, each with:
  - type: One of ["ambiguity", "verbosity", "contradiction", "logical_flaw", "missing_context", "inefficiency"]
  - severity: One of ["low", "medium", "high"]
  - description: Brief explanation of the issue
  - suggestion: Concrete recommendation to address it
  - location: Object with "start" and "end" character indices in the prompt
- strengths: Array of strings describing what works well in the prompt
- improvedPrompt: A refined version of the original prompt
`;

      const response = await generateInstruction({
        prompt: `Analyze this prompt:\n\n${prompt}`,
        framework: "TREE",
        systemInstruction: systemPrompt,
        jsonMode: true,
        temperature: 0.1
      });
      
      if (response?.jsonResponse) {
        setAnalysis(response.jsonResponse as PromptAnalysis);
        
        toast({
          title: "Analysis Complete",
          description: `Prompt score: ${response.jsonResponse.score}/100`
        });
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the prompt",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyImproved = () => {
    if (analysis?.improvedPrompt) {
      setPrompt(analysis.improvedPrompt);
      toast({
        title: "Applied Improvement",
        description: "The improved prompt has been applied"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "text-red-500 bg-red-50 border-red-200";
      case "medium": return "text-amber-500 bg-amber-50 border-amber-200";
      case "low": return "text-blue-500 bg-blue-50 border-blue-200";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Prompt Debugger</CardTitle>
        <CardDescription>
          Instantly scan and diagnose prompts for inefficiencies, ambiguity, or logical flaws
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Prompt</label>
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the prompt you want to analyze and debug..."
            className="min-h-[150px]"
          />
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={analyzePrompt}
            disabled={isAnalyzing || !prompt.trim()}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Debug Prompt
              </>
            )}
          </Button>
        </div>
        
        {analysis && (
          <div className="space-y-6 mt-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Prompt Quality Score</h3>
                <span className={`font-medium ${analysis.score >= 80 ? 'text-green-600' : analysis.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {analysis.score}/100
                </span>
              </div>
              <Progress value={analysis.score} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Issues Detected</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {analysis.issues.map((issue, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-md ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium capitalize">{issue.type.replace("_", " ")}</div>
                        <div className="text-sm capitalize px-2 py-1 rounded-full border">
                          {issue.severity} severity
                        </div>
                      </div>
                      <p className="text-sm mt-2">{issue.description}</p>
                      <div className="mt-2 text-sm font-medium">Suggestion:</div>
                      <p className="text-sm">{issue.suggestion}</p>
                    </div>
                  ))}
                  
                  {analysis.issues.length === 0 && (
                    <div className="flex items-center justify-center p-4 text-green-600">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      No significant issues detected
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Strengths</h3>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                <ul className="list-disc pl-5 space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {analysis.improvedPrompt && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Improved Prompt</h3>
                  <Button variant="outline" size="sm" onClick={handleApplyImproved}>
                    Apply Improvement
                  </Button>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">{analysis.improvedPrompt}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptDebugger;
