
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface OutputPreviewProps {
  generatedInstruction: string;
  isGenerating: boolean;
}

const OutputPreview = ({ generatedInstruction, isGenerating }: OutputPreviewProps) => {
  if (isGenerating) {
    return (
      <div className="border rounded-md p-4 bg-white h-[400px]">
        <Skeleton className="h-6 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
      </div>
    );
  }

  if (!generatedInstruction) {
    return (
      <div className="border rounded-md p-4 bg-gray-50 h-[400px] flex items-center justify-center text-center">
        <div>
          <p className="text-gray-500">Generated instructions will appear here</p>
          <p className="text-gray-400 text-sm mt-1">Select a framework and generate an instruction</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="border rounded-md p-4 bg-white h-[400px]">
      <div className="whitespace-pre-wrap font-mono text-sm">
        {generatedInstruction}
      </div>
    </ScrollArea>
  );
};

export default OutputPreview;
