
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileCode, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { GeminiTool } from "@/services/geminiService";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface FunctionCallingToolsProps {
  onAddTool: (tool: GeminiTool) => void;
  onRemoveTool: (toolName: string) => void;
  tools: GeminiTool[];
}

const parameterTypeOptions = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "object", label: "Object" },
  { value: "array", label: "Array" },
];

const toolSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  description: z.string().min(1, "Description is required"),
  parameterName: z.string().min(1, "Parameter name is required"),
  parameterType: z.string().min(1, "Parameter type is required"),
  parameterDescription: z.string().min(1, "Parameter description is required"),
  required: z.boolean().default(true),
});

type ToolFormValues = z.infer<typeof toolSchema>;

const FunctionCallingTools = ({ onAddTool, onRemoveTool, tools }: FunctionCallingToolsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: "",
      description: "",
      parameterName: "",
      parameterType: "string",
      parameterDescription: "",
      required: true,
    },
  });

  const handleSubmit = (data: ToolFormValues) => {
    const newTool: GeminiTool = {
      name: data.name,
      description: data.description,
      parameters: {
        type: "object",
        properties: {
          [data.parameterName]: {
            type: data.parameterType,
            description: data.parameterDescription,
          },
        },
        required: data.required ? [data.parameterName] : [],
      },
    };
    
    onAddTool(newTool);
    toast({
      title: "Tool Added",
      description: `${data.name} has been added as a function calling tool`,
    });
    
    form.reset();
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Function Calling Tools</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus size={14} />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Function Calling Tool</DialogTitle>
              <DialogDescription>
                Define a tool that Gemini can use during instruction generation.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool Name</FormLabel>
                      <FormControl>
                        <Input placeholder="get_weather" {...field} />
                      </FormControl>
                      <FormDescription>
                        The function name (no spaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tool Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Gets current weather for a location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parameterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameter Name</FormLabel>
                        <FormControl>
                          <Input placeholder="location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="parameterType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameter Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            {parameterTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="parameterDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parameter Description</FormLabel>
                      <FormControl>
                        <Input placeholder="The city and state, e.g. San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox" 
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Required Parameter</FormLabel>
                        <FormDescription>
                          Is this parameter required for the function call?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Tool</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {tools.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No function calling tools defined</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {tools.map((tool, index) => (
              <Card key={index} className="bg-white border-gray-200">
                <div className="flex justify-between p-4">
                  <div className="flex items-start gap-2">
                    <div className="p-2 bg-indigo-50 rounded-md">
                      <FileCode size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemoveTool(tool.name)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunctionCallingTools;
