
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
    <div className="flex flex-col min-h-screen no-scroll-x">
      <Header />
      <div className="container mx-auto max-w-7xl py-4 px-4 flex-grow safe-bottom">
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
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
          >
            <div className="mobile-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Instruct<span className="text-blue-600">AI</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm mobile-friendly-text">
                Advanced prompt engineering for AI models
              </p>
            </div>
            <div className="mobile-stack lg:flex-row items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
              <Link to="/ai-applications" className="mobile-full-width">
                <Button variant="default" className="gap-2 text-sm touch-target mobile-full-width" size={isMobile ? "default" : "default"}>
                  <Zap size={16} />
                  AI Applications
                </Button>
              </Link>
              <Link to="/prompt-engineering-tools" className="mobile-full-width">
                <Button variant="outline" className="gap-2 text-sm touch-target mobile-full-width" size={isMobile ? "default" : "default"}>
                  <Lightbulb size={16} />
                  Prompt Tools
                </Button>
              </Link>
              <Link to="/prompt-ide" className="mobile-full-width">
                <Button variant="outline" className="gap-2 text-sm touch-target mobile-full-width" size={isMobile ? "default" : "default"}>
                  <FileCode size={16} />
                  Prompt IDE
                </Button>
              </Link>
              <div className="mobile-full-width">
                <SystemInstructionDialog onSystemInstructionSet={handleSystemInstructionSet} />
              </div>
              <Button variant="outline" className="gap-2 text-sm touch-target mobile-full-width" size={isMobile ? "default" : "default"}>
                <Heart size={16} className="text-red-500" />
                Favorites
              </Button>
            </div>
          </motion.div>
        </header>

        <Tabs defaultValue="builder" className="mb-8">
          <div className="overflow-x-auto">
            <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger value="builder" className="gap-2 whitespace-nowrap touch-target text-xs sm:text-sm">
                <Code size={16} />
                <span className="hidden sm:inline">Prompt Builder</span>
                <span className="sm:hidden">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="engineering" className="gap-2 whitespace-nowrap touch-target text-xs sm:text-sm">
                <Lightbulb size={16} />
                <span className="hidden sm:inline">Prompt Engineering</span>
                <span className="sm:hidden">Engineering</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2 whitespace-nowrap touch-target text-xs sm:text-sm">
                <Heart size={16} />
                <span className="hidden sm:inline">Saved Instructions</span>
                <span className="sm:hidden">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 whitespace-nowrap touch-target text-xs sm:text-sm">
                <Lock size={16} />
                Security
              </TabsTrigger>
              <TabsTrigger value="promptops" className="gap-2 whitespace-nowrap touch-target text-xs sm:text-sm">
                <Server size={16} />
                <span className="hidden sm:inline">PromptOps</span>
                <span className="sm:hidden">Ops</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardContent className="responsive-p">
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
                <CardContent className="responsive-p h-full">
                  <OutputPreview output={output} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="engineering">
            <Card>
              <CardContent className="responsive-p">
                <PromptEngineeringGuide />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardContent className="responsive-p">
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

        <footer className="mt-16 border-t pt-6 text-center text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; 2025 InstructAI. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" className="hover:text-primary flex items-center gap-1 touch-target">
                Documentation <ArrowUpRight size={14} />
              </a>
              <a href="#" className="hover:text-primary flex items-center gap-1 touch-target">
                API Reference <ArrowUpRight size={14} />
              </a>
              <a href="#" className="hover:text-primary flex items-center gap-1 touch-target">
                Support <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
