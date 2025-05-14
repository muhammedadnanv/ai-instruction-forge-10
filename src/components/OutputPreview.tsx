
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OutputPreviewProps {
  output?: string;
  generatedInstruction?: string;
  isGenerating?: boolean;
  streamingContent?: string;
  isStreaming?: boolean;
}

const OutputPreview = ({ 
  output = "",
  generatedInstruction = "", 
  isGenerating = false, 
  streamingContent = "", 
  isStreaming = false 
}: OutputPreviewProps) => {
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const contentToDisplay = output || generatedInstruction || streamingContent;
  
  // Auto-scroll to bottom when streaming content updates
  useEffect(() => {
    if (isStreaming && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [streamingContent, isStreaming]);
  
  const copyToClipboard = async () => {
    const contentToCopy = contentToDisplay;
    if (!contentToCopy) return;
    
    setCopying(true);
    try {
      await navigator.clipboard.writeText(contentToCopy);
      toast({
        title: "Copied!",
        description: "Instruction copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  if (isGenerating && !isStreaming) {
    return (
      <div className="border rounded-lg p-5 bg-white h-[400px] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        
        <Skeleton className="h-6 w-1/2 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        
        <div className="mt-6">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-2" />
        </div>
        
        <div className="animate-pulse mt-4 flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-indigo-200"></div>
          <div className="h-3 w-3 rounded-full bg-indigo-300"></div>
          <div className="h-3 w-3 rounded-full bg-indigo-400"></div>
        </div>
      </div>
    );
  }

  if (!contentToDisplay) {
    return (
      <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-blue-50 h-[400px] flex items-center justify-center text-center">
        <div>
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12"></path>
              <path d="M16.24 7.76l-8.49 8.49"></path>
              <path d="m14.83 11.17 4.95-4.95"></path>
              <path d="m19.78 6.22-1-1"></path>
              <path d="m1 22 1-1"></path>
              <path d="m21 22-1-1"></path>
              <path d="m18 22-1.5-1.5"></path>
              <path d="m15 22-7-7"></path>
              <path d="m22 15-1-1"></path>
            </svg>
          </div>
          <p className="text-gray-700 font-medium">Generated instructions will appear here</p>
          <p className="text-gray-500 text-sm mt-2">Select a framework and generate an instruction to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white h-[400px] shadow-sm flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-gray-700">
          {isStreaming && isGenerating ? "Streaming Response..." : "Generated Instruction"}
        </h3>
        <button 
          onClick={copyToClipboard} 
          className={`p-2 rounded-full transition-all ${copying ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-600'}`}
          aria-label="Copy to clipboard"
        >
          <Copy size={16} />
        </button>
      </div>
      <ScrollArea className="p-4 flex-grow" ref={scrollAreaRef}>
        <div className="whitespace-pre-wrap font-mono text-sm">
          {contentToDisplay}
          {isStreaming && isGenerating && (
            <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse"></span>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OutputPreview;
