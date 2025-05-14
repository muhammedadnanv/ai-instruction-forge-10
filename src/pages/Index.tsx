
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Code, Lock, Server, ArrowUpRight } from "lucide-react";
import SaveInstructionDialog from "@/components/SaveInstructionDialog";
import SystemInstructionDialog from "@/components/SystemInstructionDialog";
import SavedInstructions from "@/components/SavedInstructions";
import FrameworkSelector from "@/components/FrameworkSelector";
import InstructionBuilder from "@/components/InstructionBuilder";
import OutputPreview from "@/components/OutputPreview";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import PaymentDialog from "@/components/PaymentDialog";
import SecuritySettings from "@/components/SecuritySettings";
import PromptOpsSettings from "@/components/PromptOpsSettings";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

export default function Index() {
  const [framework, setFramework] = useState("ACT");
  const [instruction, setInstruction] = useState("");
  const [output, setOutput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("gemini_api_key") !== null && 
           localStorage.getItem("has_paid") === "true";
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(!isAuthenticated);
  const { toast } = useToast();

  const handleSystemInstructionSet = () => {
    console.log("System instruction updated");
    toast({
      title: "System Instruction Updated",
      description: "Your system instruction has been updated successfully"
    });
  };

  const handleApiKeySubmit = () => {
    // Check if the user has paid
    if (localStorage.getItem("has_paid") !== "true") {
      setPaymentDialogOpen(true);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handlePaymentComplete = () => {
    localStorage.setItem("has_paid", "true");
    setPaymentDialogOpen(false);
    setIsAuthenticated(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto max-w-7xl py-4 px-4 flex-grow">
        {!isAuthenticated && (
          <>
            <ApiKeyDialog
              open={apiKeyDialogOpen}
              onOpenChange={setApiKeyDialogOpen}
              onApiKeySubmit={handleApiKeySubmit}
            />
            <PaymentDialog
              open={paymentDialogOpen}
              onOpenChange={setPaymentDialogOpen}
              onPaymentComplete={handlePaymentComplete}
            />
          </>
        )}

        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-between items-center"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Instruct<span className="text-blue-600">AI</span>
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Advanced prompt engineering for AI models
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0 justify-center sm:justify-start">
              <Link to="/ai-applications">
                <Button variant="default" className="gap-2">
                  <Zap size={16} />
                  AI Applications
                </Button>
              </Link>
              <SystemInstructionDialog onSystemInstructionSet={handleSystemInstructionSet} />
              <Button variant="outline" className="gap-2">
                <Heart size={16} className="text-red-500" />
                Favorites
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                <Zap size={16} />
                Upgrade Pro
              </Button>
            </div>
          </motion.div>
        </header>

        <Tabs defaultValue="builder" className="mb-8">
          <TabsList className="mb-4 overflow-x-auto flex w-full">
            <TabsTrigger value="builder" className="gap-2">
              <Code size={16} />
              <span className="whitespace-nowrap">Prompt Builder</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Heart size={16} />
              <span className="whitespace-nowrap">Saved Instructions</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock size={16} />
              <span className="whitespace-nowrap">Security & Access</span>
            </TabsTrigger>
            <TabsTrigger value="promptops" className="gap-2">
              <Server size={16} />
              <span className="whitespace-nowrap">PromptOps</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <FrameworkSelector
                      selectedFramework={framework}
                      onFrameworkSelect={setFramework}
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <InstructionBuilder
                      framework={framework}
                      instruction={instruction}
                      setInstruction={setInstruction}
                      onGenerate={setOutput}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <SaveInstructionDialog 
                    instruction={instruction} 
                    framework={framework} 
                  />
                </div>
              </div>

              <Card className="h-full">
                <CardContent className="p-6 h-full">
                  <OutputPreview output={output} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardContent className="p-6">
                <SavedInstructions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="promptops">
            <PromptOpsSettings />
          </TabsContent>
        </Tabs>

        <footer className="mt-16 border-t pt-6 text-center text-sm text-gray-500">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p>&copy; 2025 InstructAI. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 mt-4 sm:mt-0 justify-center">
              <a href="#" className="hover:text-blue-600 flex items-center gap-1">
                Documentation <ArrowUpRight size={14} />
              </a>
              <a href="#" className="hover:text-blue-600 flex items-center gap-1">
                API Reference <ArrowUpRight size={14} />
              </a>
              <a href="#" className="hover:text-blue-600 flex items-center gap-1">
                Support <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
