
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CustomerSupportChat from "@/components/CustomerSupportChat";
import ContentGenerator from "@/components/ContentGenerator";
import InternalKnowledgeAgent from "@/components/InternalKnowledgeAgent";
import SmartFormFilling from "@/components/SmartFormFilling";
import PersonalizedLearningBot from "@/components/PersonalizedLearningBot";
import { MessageSquare, FileText, Book, CalendarIcon, GraduationCap } from "lucide-react";

const AIApplications = () => {
  const [selectedTab, setSelectedTab] = useState("support");
  
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gemini-Powered AI Applications
        </h1>
        <p className="text-gray-500 mt-2">
          Explore practical business applications powered by Gemini AI and advanced prompt engineering
        </p>
      </div>
      
      <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="mb-8 space-y-6">
        <div className="border-b">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="support" className="flex items-center gap-2 px-4 py-2">
              <MessageSquare size={16} />
              Customer Support
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 px-4 py-2">
              <FileText size={16} />
              Content Generation
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2 px-4 py-2">
              <Book size={16} />
              Knowledge Agent
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2 px-4 py-2">
              <CalendarIcon size={16} />
              Smart Forms
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2 px-4 py-2">
              <GraduationCap size={16} />
              Learning Bot
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="support" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Customer Support Chatbot Optimization</CardTitle>
              <CardDescription>
                <span className="font-medium">C:</span> Uses Gemini API to fine-tune chatbot responses<br />
                <span className="font-medium">L:</span> Multilingual queries & context-aware replies<br />
                <span className="font-medium">E:</span> Reduces customer support costs and improves response time<br />
                <span className="font-medium">A:</span> Prompt engineered templates for FAQs, escalation logic, and emotional tone detection<br />
                <span className="font-medium">R:</span> Increased CSAT, faster ticket resolution, and reduced agent workload
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CustomerSupportChat />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle>Content Generation at Scale</CardTitle>
              <CardDescription>
                <span className="font-medium">C:</span> Uses prompt engineering to instruct Gemini for tone, style, length, and structure<br />
                <span className="font-medium">L:</span> Contextually relevant blog posts, ad copies, and SEO-optimized product descriptions<br />
                <span className="font-medium">E:</span> Saves 80%+ time vs manual writing<br />
                <span className="font-medium">A:</span> Reusable prompt templates for headlines, CTAs, and audience persona targeting<br />
                <span className="font-medium">R:</span> 3x content output with consistent brand voice
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ContentGenerator />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="knowledge" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Internal Knowledge Agent for Enterprises</CardTitle>
              <CardDescription>
                <span className="font-medium">C:</span> Uses Gemini to build an internal AI that retrieves SOPs, policies, and training materials<br />
                <span className="font-medium">L:</span> Employees ask natural language queries across departments<br />
                <span className="font-medium">E:</span> Reduces internal training burden<br />
                <span className="font-medium">A:</span> Engineered prompts guide Gemini to summarize, explain, or cross-link documents<br />
                <span className="font-medium">R:</span> Employees get answers in seconds vs hours/days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <InternalKnowledgeAgent />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="form" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
              <CardTitle>Smart Form Filling / Automation Assistant</CardTitle>
              <CardDescription>
                <span className="font-medium">C:</span> Uses Gemini API with dynamic prompts to convert natural language into structured form data<br />
                <span className="font-medium">L:</span> Example: "Schedule a 30-min call with John next Friday at 2 PM" → calendar invite JSON<br />
                <span className="font-medium">E:</span> Automates manual data entry and backend form filling<br />
                <span className="font-medium">A:</span> Prompt templates extract intents, entities, and actions<br />
                <span className="font-medium">R:</span> Increased operational speed and reduced input errors
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SmartFormFilling />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="learning" className="mt-6 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-lg">
              <CardTitle>Personalized Learning/Coaching Bots</CardTitle>
              <CardDescription>
                <span className="font-medium">C:</span> Uses Gemini to create adaptive tutoring agents using tailored prompts<br />
                <span className="font-medium">L:</span> Learners interact with bots for quizzes, concept breakdowns, and step-by-step guidance<br />
                <span className="font-medium">E:</span> Enhances learner retention through AI-driven personalization<br />
                <span className="font-medium">A:</span> Prompt frameworks adjust difficulty, tone, and examples based on user performance<br />
                <span className="font-medium">R:</span> Higher engagement and improved learning outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <PersonalizedLearningBot />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIApplications;
