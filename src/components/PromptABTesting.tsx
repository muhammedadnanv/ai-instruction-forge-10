
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGemini } from "@/hooks/use-gemini";
import { useToast } from "@/hooks/use-toast";
import { LineChart, BarChart, Play, PlusCircle, RefreshCw, Trash2, ArrowRightLeft, ListFilter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart as ReChartsBarChart,
  Bar,
  LineChart as ReChartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface PromptVariation {
  id: string;
  name: string;
  prompt: string;
  response?: string;
  metrics?: {
    relevance: number;
    coherence: number;
    accuracy: number;
    creativity: number;
    overall: number;
  };
}

interface TestResult {
  timestamp: string;
  variationId: string;
  variationName: string;
  metrics: {
    relevance: number;
    coherence: number;
    accuracy: number;
    creativity: number;
    overall: number;
  };
}

const PromptABTesting = () => {
  const [promptVariations, setPromptVariations] = useState<PromptVariation[]>([
    { id: "var-1", name: "Variation A", prompt: "" },
    { id: "var-2", name: "Variation B", prompt: "" }
  ]);
  const [promptGoal, setPromptGoal] = useState("");
  const [evaluationCriteria, setEvaluationCriteria] = useState("relevance,coherence,accuracy,creativity");
  const [sampleSize, setSampleSize] = useState<number[]>([3]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeVariation, setActiveVariation] = useState("var-1");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [samplePrompt, setSamplePrompt] = useState("");
  const [chartView, setChartView] = useState<"bar" | "line">("bar");
  
  const { generateInstruction } = useGemini();
  const { toast } = useToast();

  const addPromptVariation = () => {
    const newId = `var-${promptVariations.length + 1}`;
    const newVariation: PromptVariation = {
      id: newId,
      name: `Variation ${String.fromCharCode(65 + promptVariations.length)}`, // A, B, C, etc.
      prompt: ""
    };
    
    setPromptVariations([...promptVariations, newVariation]);
    setActiveVariation(newId);
  };
  
  const removePromptVariation = (id: string) => {
    if (promptVariations.length <= 2) {
      toast({
        title: "Cannot Remove",
        description: "You need at least two variations for A/B testing",
        variant: "destructive"
      });
      return;
    }
    
    const updatedVariations = promptVariations.filter(v => v.id !== id);
    setPromptVariations(updatedVariations);
    
    // If the active variation was removed, select another one
    if (activeVariation === id) {
      setActiveVariation(updatedVariations[0].id);
    }
    
    // Remove test results for this variation
    const updatedResults = testResults.filter(r => r.variationId !== id);
    setTestResults(updatedResults);
  };
  
  const updatePromptVariation = (id: string, prompt: string) => {
    const updated = promptVariations.map(v => {
      if (v.id === id) {
        return { ...v, prompt };
      }
      return v;
    });
    
    setPromptVariations(updated);
  };
  
  const updateVariationName = (id: string, name: string) => {
    const updated = promptVariations.map(v => {
      if (v.id === id) {
        return { ...v, name };
      }
      return v;
    });
    
    setPromptVariations(updated);
  };
  
  const runABTest = async () => {
    // Validation
    if (!promptGoal.trim()) {
      toast({
        title: "Goal Required",
        description: "Please specify a goal for your prompt test",
        variant: "destructive"
      });
      return;
    }
    
    const invalidVariations = promptVariations.filter(v => !v.prompt.trim());
    if (invalidVariations.length > 0) {
      toast({
        title: "Incomplete Prompts",
        description: `Please fill in all prompt variations before testing`,
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const criteriaArray = evaluationCriteria.split(',').map(c => c.trim());
      
      // Process each variation
      for (const variation of promptVariations) {
        // Get or create sample input if needed
        const testInput = samplePrompt.trim() || "Sample input for testing";
        
        // Run the samples
        const batchResults = [];
        for (let i = 0; i < sampleSize[0]; i++) {
          toast({
            title: "Running Test",
            description: `Evaluating ${variation.name}: Sample ${i + 1}/${sampleSize[0]}`
          });
          
          // Generate response using the prompt variation
          const response = await generateInstruction({
            prompt: variation.prompt,
            framework: "COT",
            temperature: 0.7,
          });
          
          if (response?.generatedText) {
            // Store the response
            variation.response = response.generatedText;
            
            // Evaluate the response against criteria
            const evaluationPrompt = `
You are an objective evaluator of AI output quality.

Goal of the prompt: ${promptGoal}

Original prompt: ${variation.prompt}

AI response to evaluate:
"""
${response.generatedText}
"""

Please evaluate this response on these criteria (scale of 1-10):
${criteriaArray.map(c => `- ${c}`).join('\n')}

Also calculate an overall score as an average of the individual scores.

Return your evaluation as a JSON object with lowercase criteria names as keys and numeric scores as values.
Include an "overall" key with the average score.
`;
            
            const evaluation = await generateInstruction({
              prompt: evaluationPrompt,
              framework: "TREE",
              systemInstruction: "You are an objective evaluator. Be fair and consistent in your assessments.",
              jsonMode: true,
              temperature: 0.1
            });
            
            if (evaluation?.jsonResponse) {
              const metrics = evaluation.jsonResponse;
              
              // Store the metrics
              batchResults.push({
                timestamp: new Date().toISOString(),
                variationId: variation.id,
                variationName: variation.name,
                metrics: metrics
              });
            }
          }
        }
        
        // Calculate average scores across samples
        if (batchResults.length > 0) {
          const avgMetrics = {
            relevance: 0,
            coherence: 0,
            accuracy: 0,
            creativity: 0,
            overall: 0
          };
          
          batchResults.forEach(result => {
            avgMetrics.relevance += result.metrics.relevance || 0;
            avgMetrics.coherence += result.metrics.coherence || 0;
            avgMetrics.accuracy += result.metrics.accuracy || 0;
            avgMetrics.creativity += result.metrics.creativity || 0;
            avgMetrics.overall += result.metrics.overall || 0;
          });
          
          Object.keys(avgMetrics).forEach(key => {
            avgMetrics[key as keyof typeof avgMetrics] /= batchResults.length;
          });
          
          // Update the variation with the average metrics
          const updatedVariations = promptVariations.map(v => {
            if (v.id === variation.id) {
              return { ...v, metrics: avgMetrics };
            }
            return v;
          });
          
          setPromptVariations(updatedVariations);
          
          // Add results to test history
          setTestResults(prev => [
            ...prev,
            {
              timestamp: new Date().toISOString(),
              variationId: variation.id,
              variationName: variation.name,
              metrics: avgMetrics
            }
          ]);
        }
      }
      
      toast({
        title: "Testing Complete",
        description: "All prompt variations have been evaluated"
      });
    } catch (error) {
      console.error("Error running A/B test:", error);
      toast({
        title: "Testing Failed",
        description: "There was an error running the A/B test",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  const getWinningVariation = () => {
    if (!promptVariations.some(v => v.metrics)) return null;
    
    return promptVariations.reduce((best, current) => {
      if (!best.metrics) return current;
      if (!current.metrics) return best;
      return current.metrics.overall > best.metrics.overall ? current : best;
    }, promptVariations[0]);
  };
  
  const activeVariationData = promptVariations.find(v => v.id === activeVariation);
  const winningVariation = getWinningVariation();
  
  // Prepare chart data
  const barChartData = promptVariations
    .filter(v => v.metrics)
    .map(v => ({
      name: v.name,
      "Relevance": v.metrics?.relevance || 0,
      "Coherence": v.metrics?.coherence || 0,
      "Accuracy": v.metrics?.accuracy || 0,
      "Creativity": v.metrics?.creativity || 0,
      "Overall": v.metrics?.overall || 0,
    }));
  
  const lineChartData = testResults
    .map(result => ({
      timestamp: new Date(result.timestamp).toLocaleTimeString(),
      name: result.variationName,
      score: result.metrics.overall
    }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto A/B Testing for Prompts</CardTitle>
        <CardDescription>
          Run controlled experiments to compare different prompts and track output quality metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup">
          <TabsList className="mb-6 grid grid-cols-3">
            <TabsTrigger value="setup">Setup & Configure</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Prompt Goal</Label>
                <Textarea 
                  value={promptGoal}
                  onChange={(e) => setPromptGoal(e.target.value)}
                  placeholder="What are you trying to achieve with this prompt? E.g., Generate concise product descriptions, Create engaging blog titles, etc."
                  className="mt-1.5"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Evaluation Criteria (comma-separated)</Label>
                  <Input
                    value={evaluationCriteria}
                    onChange={(e) => setEvaluationCriteria(e.target.value)}
                    placeholder="e.g., relevance,coherence,accuracy,creativity"
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label>Number of Samples: {sampleSize[0]}</Label>
                  <Slider
                    value={sampleSize}
                    onValueChange={setSampleSize}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-4"
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <Label>Optional: Sample Input for Testing</Label>
                <Textarea
                  value={samplePrompt}
                  onChange={(e) => setSamplePrompt(e.target.value)}
                  placeholder="If your prompts require specific input data for testing, enter it here."
                  className="mt-1.5"
                />
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Prompt Variations</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addPromptVariation}
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Variation
                </Button>
              </div>
              
              <div className="flex space-x-2 mb-4">
                {promptVariations.map((variation) => (
                  <Button
                    key={variation.id}
                    variant={activeVariation === variation.id ? "default" : "outline"}
                    onClick={() => setActiveVariation(variation.id)}
                    className="relative flex-grow"
                  >
                    {variation.name}
                    {variation.id !== activeVariation && promptVariations.length > 2 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 absolute -top-2 -right-2 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePromptVariation(variation.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                ))}
              </div>
              
              {activeVariationData && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-grow">
                      <Label>Variation Name</Label>
                      <Input
                        value={activeVariationData.name}
                        onChange={(e) => updateVariationName(activeVariationData.id, e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Prompt Template</Label>
                    <Textarea
                      value={activeVariationData.prompt}
                      onChange={(e) => updatePromptVariation(activeVariationData.id, e.target.value)}
                      placeholder={`Enter your variation ${activeVariationData.name} prompt here...`}
                      className="mt-1.5 min-h-[150px]"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={runABTest} 
                disabled={isRunning}
                className="min-w-32"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run A/B Test
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="results">
            {barChartData.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Comparison Results</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={chartView === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartView("bar")}
                    >
                      <BarChart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartView === "line" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartView("line")}
                    >
                      <LineChart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="h-80 w-full">
                  {chartView === "bar" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsBarChart
                        data={barChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Relevance" fill="#8884d8" />
                        <Bar dataKey="Coherence" fill="#82ca9d" />
                        <Bar dataKey="Accuracy" fill="#ffc658" />
                        <Bar dataKey="Creativity" fill="#ff7300" />
                        <Bar dataKey="Overall" fill="#0088fe" />
                      </ReChartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartsLineChart
                        data={lineChartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        {promptVariations.map((variation, index) => (
                          <Line
                            key={variation.id}
                            type="monotone"
                            dataKey="score"
                            data={lineChartData.filter(d => d.name === variation.name)}
                            name={variation.name}
                            stroke={`hsl(${index * 60}, 70%, 50%)`}
                            activeDot={{ r: 8 }}
                          />
                        ))}
                      </ReChartsLineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                {winningVariation && (
                  <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                    <AlertTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4" /> 
                      Winner: {winningVariation.name}
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          Overall Score: <strong>{winningVariation.metrics?.overall.toFixed(2)}</strong>
                        </div>
                        <div className="space-x-1">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            <ArrowRightLeft className="mr-1.5 h-3 w-3" />
                            Compare
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            Use This Prompt
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <BarChart className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Test Results Yet</h3>
                <p className="text-gray-500 max-w-md">
                  Configure your prompt variations and run an A/B test to see results here.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  onClick={() => document.querySelector('[data-value="setup"]')?.click()}
                >
                  Set Up Test
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {testResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Test History</h3>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px] text-xs h-7">
                        <SelectValue placeholder="Filter by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Results</SelectItem>
                        {promptVariations.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">
                      <ListFilter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[450px]">
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{result.variationName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Relevance</div>
                            <div className="font-medium">{result.metrics.relevance.toFixed(1)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Coherence</div>
                            <div className="font-medium">{result.metrics.coherence.toFixed(1)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Accuracy</div>
                            <div className="font-medium">{result.metrics.accuracy.toFixed(1)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Creativity</div>
                            <div className="font-medium">{result.metrics.creativity.toFixed(1)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Overall</div>
                            <div className="font-medium">{result.metrics.overall.toFixed(1)}</div>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <ListFilter className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Test History</h3>
                <p className="text-gray-500 max-w-md">
                  Run an A/B test to start building your test history and optimization insights.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  onClick={() => document.querySelector('[data-value="setup"]')?.click()}
                >
                  Set Up Test
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PromptABTesting;
