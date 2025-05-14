
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import IDEPromptEditor from "@/components/IDEPromptEditor";
import VisualWorkflowBuilder from "@/components/VisualWorkflowBuilder";
import MultiLLMRunner from "@/components/MultiLLMRunner";
import PromptDeployment from "@/components/PromptDeployment";

export default function PromptIDE() {
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto max-w-7xl py-4 px-4 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Prompt <span className="text-blue-600">IDE</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Advanced tools for prompt engineering and development
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">IDE Editor</TabsTrigger>
            <TabsTrigger value="workflow">Visual Workflow</TabsTrigger>
            <TabsTrigger value="multi-llm">Multi-LLM Testing</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>IDE for Prompt Engineering</CardTitle>
                <CardDescription>
                  Professional development environment for creating, testing, and optimizing prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IDEPromptEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow">
            <Card>
              <CardHeader>
                <CardTitle>Visual Workflow Builder</CardTitle>
                <CardDescription>
                  Design complex prompt chains with a visual, drag-and-drop interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VisualWorkflowBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-llm">
            <Card>
              <CardHeader>
                <CardTitle>Multi-LLM Testing</CardTitle>
                <CardDescription>
                  Run the same prompt across multiple language models to compare performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiLLMRunner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment">
            <Card>
              <CardHeader>
                <CardTitle>Generate & Deploy Prompts</CardTitle>
                <CardDescription>
                  Export and deploy prompts as scripts or APIs for production use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PromptDeployment />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
