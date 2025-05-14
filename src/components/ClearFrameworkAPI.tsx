
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Code, Copy, Check, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ClearFrameworkAPI = () => {
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Code snippet copied to clipboard"
    });
  };
  
  const handleGenerateKey = () => {
    // In a real implementation, this would call an API to generate a key
    // For demo purposes, we'll simulate it with a fake key
    const demoKey = `clear_${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(demoKey);
    
    toast({
      title: "API Key Generated",
      description: "This is a demo key for illustration purposes"
    });
  };
  
  const pythonCode = `
import requests

def optimize_prompt(prompt, goal, framework="CLEAR"):
    url = "https://api.clearframework.ai/v1/optimize"
    
    headers = {
        "Authorization": f"Bearer {YOUR_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "prompt": prompt,
        "goal": goal,
        "framework": framework,
        "options": {
            "temperature": 0.3,
            "max_tokens": 1000
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

# Example usage
result = optimize_prompt(
    prompt="Write me a blog post about artificial intelligence",
    goal="Create engaging, factual content with concrete examples"
)

print(result["optimizedPrompt"])
  `.trim();
  
  const javascriptCode = `
async function optimizePrompt(prompt, goal, framework = "CLEAR") {
  const url = "https://api.clearframework.ai/v1/optimize";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${YOUR_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      goal,
      framework,
      options: {
        temperature: 0.3,
        maxTokens: 1000
      }
    })
  });
  
  return await response.json();
}

// Example usage
const result = await optimizePrompt(
  "Write me a blog post about artificial intelligence",
  "Create engaging, factual content with concrete examples"
);

console.log(result.optimizedPrompt);
  `.trim();
  
  const apiReference = {
    endpoints: [
      {
        name: "Optimize Prompt",
        url: "/v1/optimize",
        method: "POST",
        description: "Optimize a prompt using the CLEAR framework",
        parameters: [
          { name: "prompt", type: "string", required: true, description: "The original prompt to optimize" },
          { name: "goal", type: "string", required: true, description: "The intended goal or outcome for the prompt" },
          { name: "framework", type: "string", required: false, description: "Framework to use: CLEAR, ACT, COT, etc." },
          { name: "options", type: "object", required: false, description: "Additional options like temperature, maxTokens" }
        ],
        returns: "An object containing the optimized prompt, quality score, and optimization details"
      },
      {
        name: "Analyze Prompt",
        url: "/v1/analyze",
        method: "POST",
        description: "Analyze a prompt for clarity, context, ambiguity, etc.",
        parameters: [
          { name: "prompt", type: "string", required: true, description: "The prompt to analyze" },
          { name: "verbose", type: "boolean", required: false, description: "Whether to return detailed analysis" }
        ],
        returns: "An object containing analysis results with scores and improvement suggestions"
      },
      {
        name: "Generate Chain",
        url: "/v1/generate-chain",
        method: "POST",
        description: "Generate a sequence of prompts that build on each other",
        parameters: [
          { name: "initialPrompt", type: "string", required: true, description: "Starting prompt for the chain" },
          { name: "goal", type: "string", required: true, description: "The overall goal to achieve" },
          { name: "iterations", type: "number", required: false, description: "Number of refinement iterations to perform" }
        ],
        returns: "An array of prompt objects with refinements and explanations"
      }
    ]
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>C.L.E.A.R. Framework API</CardTitle>
        <CardDescription>
          Integrate advanced prompt optimization directly into your applications and workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="reference">API Reference</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">What is the C.L.E.A.R. Framework?</h3>
                <p>
                  The C.L.E.A.R. Framework (Context, Language, Examples, Adjustments, Refinements) is a 
                  comprehensive approach to optimizing prompts for AI systems. This API provides programmatic
                  access to these optimization techniques.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Key Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Optimize prompts for any AI model using proven frameworks</li>
                  <li>Analyze existing prompts for quality and improvement opportunities</li>
                  <li>Generate sequences of prompts that build on each other</li>
                  <li>A/B test different prompt approaches automatically</li>
                  <li>Integrate with REST API or client libraries</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Get Started</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="mb-4">
                    To use the C.L.E.A.R. Framework API, you'll need an API key. 
                    In production, you would obtain this through our developer portal.
                  </p>
                  
                  <div className="flex gap-4 items-end">
                    <div className="space-y-2 flex-grow">
                      <Label htmlFor="api-key">Your API Key</Label>
                      <Input 
                        id="api-key" 
                        value={apiKey} 
                        readOnly 
                        placeholder="Generate an API key to get started"
                      />
                    </div>
                    <Button onClick={handleGenerateKey}>
                      Generate Test Key
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="python">
            <div className="space-y-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(pythonCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <pre className="p-4 text-sm">
                    <code>{pythonCode}</code>
                  </pre>
                </ScrollArea>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Installation</h3>
                <pre className="bg-gray-800 text-white p-2 rounded text-sm">pip install clearframework</pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="javascript">
            <div className="space-y-4">
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(javascriptCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <pre className="p-4 text-sm">
                    <code>{javascriptCode}</code>
                  </pre>
                </ScrollArea>
              </div>
              
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Installation</h3>
                <pre className="bg-gray-800 text-white p-2 rounded text-sm">npm install clearframework</pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reference">
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                <h3 className="text-xl font-medium">API Endpoints</h3>
                
                {apiReference.endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">{endpoint.name}</h4>
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mr-2">
                          {endpoint.method}
                        </span>
                        <code className="text-sm">{endpoint.url}</code>
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600">{endpoint.description}</p>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-2">Parameters</h5>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Required</th>
                            <th className="text-left p-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.parameters.map((param, paramIndex) => (
                            <tr key={paramIndex} className="border-b">
                              <td className="p-2 font-mono">{param.name}</td>
                              <td className="p-2 text-gray-600">{param.type}</td>
                              <td className="p-2">{param.required ? "Yes" : "No"}</td>
                              <td className="p-2">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-sm mb-1">Returns</h5>
                      <p className="text-sm">{endpoint.returns}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </Button>
          <Button className="gap-2">
            <Code className="h-4 w-4" />
            Get API Key
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClearFrameworkAPI;
