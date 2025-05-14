
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReversePromptDecoder from "@/components/ReversePromptDecoder";
import PromptDebugger from "@/components/PromptDebugger";
import AutoRefineChains from "@/components/AutoRefineChains";
import ClearFrameworkAPI from "@/components/ClearFrameworkAPI";
import PromptABTesting from "@/components/PromptABTesting";

const PromptEngineeringTools = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Prompt Engineering Tools</h1>
      
      <Tabs defaultValue="decoder" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="decoder">Reverse Decoder</TabsTrigger>
          <TabsTrigger value="debugger">Prompt Debugger</TabsTrigger>
          <TabsTrigger value="autorefine">Auto-Refine</TabsTrigger>
          <TabsTrigger value="framework">CLEAR Framework</TabsTrigger>
          <TabsTrigger value="abtesting">A/B Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="decoder" className="mt-6">
          <ReversePromptDecoder />
        </TabsContent>
        
        <TabsContent value="debugger" className="mt-6">
          <PromptDebugger />
        </TabsContent>
        
        <TabsContent value="autorefine" className="mt-6">
          <AutoRefineChains />
        </TabsContent>
        
        <TabsContent value="framework" className="mt-6">
          <ClearFrameworkAPI />
        </TabsContent>
        
        <TabsContent value="abtesting" className="mt-6">
          <PromptABTesting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptEngineeringTools;
