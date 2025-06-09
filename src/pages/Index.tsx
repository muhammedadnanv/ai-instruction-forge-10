
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Code, Lock, Server, ArrowUpRight, Lightbulb, FileCode } from "lucide-react";
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
import PromptEngineeringGuide from "@/components/PromptEngineeringGuide";
import PromptStrategies from "@/components/PromptStrategies";
import PromptCollection from "@/components/PromptCollection";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import paymentService from "@/services/paymentService";
import geminiService from "@/services/geminiService";
import ProSubscriptionDialog from "@/components/ProSubscriptionDialog";
import { usePayment } from "@/hooks/use-payment";

export default function Index() {
  const [framework, setFramework] = useState("ACT");
  const [instruction, setInstruction] = useState("");
  const [output, setOutput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [proSubscriptionDialogOpen, setProSubscriptionDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isPro, hasPaid } = usePayment();

  // Check authentication status on component mount
  useEffect(() => {
    const hasApiKey = !!geminiService.getApiKey();
    const hasPaid = paymentService.hasUserPaid();
    
    setIsAuthenticated(hasApiKey && hasPaid);
    
    // If user has API key but hasn't paid, show payment dialog
    if (hasApiKey && !hasPaid) {
      setPaymentDialogOpen(true);
    } 
    // If user has neither, show API key dialog first
    else if (!hasApiKey) {
      setApiKeyDialogOpen(true);
    }
  }, []);

  const handleSystemInstructionSet = () => {
    console.log("System instruction updated");
    toast({
      title: "System Instruction Updated",
      description: "Your system instruction has been updated successfully"
    });
  };

  const handleApiKeySubmit = () => {
    // Check if the user has paid
    if (!paymentService.hasUserPaid()) {
      setPaymentDialogOpen(true);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handlePaymentComplete = () => {
    setPaymentDialogOpen(false);
    setIsAuthenticated(true);
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed. You now have full access to the app."
    });
  };
  
  const handleProSubscriptionComplete = () => {
    setProSubscriptionDialogOpen(false);
    toast({
      title: "Pro Subscription Active",
      description: "Welcome to InstructAI Pro! You now have access to all premium features."
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="container mx-auto max-w-7xl py-4 px-4 flex-grow overflow-x-hidden">
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
        
        {/* Add the ProSubscriptionDialog regardless of authentication status */}
        <ProSubscriptionDialog
          open={proSubscriptionDialogOpen}
          onOpenChange={setProSubscriptionDialogOpen}
          onSubscriptionComplete={handleProSubscriptionComplete}
        />

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
                <Button variant="default" className="gap-2 text-sm" size={isMobile ? "sm" : "default"}>
                  <Zap size={16} />
                  <span className={isMobile ? "sr-only" : ""}>AI Applications</span>
                </Button>
              </Link>
              <Link to="/prompt-engineering-tools">
                <Button variant="outline" className="gap-2 text-sm" size={isMobile ? "sm" : "default"}>
                  <Lightbulb size={16} />
                  <span className={isMobile ? "sr-only" : ""}>Prompt Tools</span>
                </Button>
              </Link>
              <Link to="/prompt-ide">
                <Button variant="outline" className="gap-2 text-sm" size={isMobile ? "sm" : "default"}>
                  <FileCode size={16} />
                  <span className={isMobile ? "sr-only" : ""}>Prompt IDE</span>
                </Button>
              </Link>
              <SystemInstructionDialog onSystemInstructionSet={handleSystemInstructionSet} />
              <Button variant="outline" className="gap-2 text-sm" size={isMobile ? "sm" : "default"}>
                <Heart size={16} className="text-red-500" />
                <span className={isMobile ? "sr-only" : ""}>Favorites</span>
              </Button>
            </div>
          </motion.div>
        </header>

        <Tabs defaultValue="builder" className="mb-8">
          <TabsList className="mb-4 overflow-x-auto flex w-full">
            <TabsTrigger value="builder" className="gap-2 whitespace-nowrap">
              <Code size={16} />
              <span className={isMobile ? "hidden sm:inline" : ""}>Prompt Builder</span>
            </TabsTrigger>
            <TabsTrigger value="engineering" className="gap-2 whitespace-nowrap">
              <Lightbulb size={16} />
              <span className={isMobile ? "hidden sm:inline" : ""}>Prompt Engineering</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2 whitespace-nowrap">
              <Heart size={16} />
              <span className={isMobile ? "hidden sm:inline" : ""}>Saved Instructions</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 whitespace-nowrap">
              <Lock size={16} />
              <span className={isMobile ? "hidden sm:inline" : ""}>Security</span>
            </TabsTrigger>
            <TabsTrigger value="promptops" className="gap-2 whitespace-nowrap">
              <Server size={16} />
              <span className={isMobile ? "hidden sm:inline" : ""}>PromptOps</span>
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
          
          <TabsContent value="engineering">
            <Card>
              <CardContent className="p-6">
                <PromptEngineeringGuide />
              </CardContent>
            </Card>
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

        <div className="space-y-8 mt-12 mb-16">
          <PromptStrategies setInstruction={setInstruction} />
          <PromptCollection setInstruction={setInstruction} setSelectedFramework={setFramework} />
        </div>

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
