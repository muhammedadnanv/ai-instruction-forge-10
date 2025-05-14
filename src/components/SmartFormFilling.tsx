
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGemini } from "@/hooks/use-gemini";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, MapPin, MessageSquare } from "lucide-react";

interface FormData {
  eventType?: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  attendees?: string[];
  description?: string;
  title?: string;
  priority?: 'low' | 'medium' | 'high';
  [key: string]: any;
}

interface SmartFormFillingProps {
  onSubmitForm?: (data: FormData) => void;
}

const SmartFormFilling = ({ onSubmitForm }: SmartFormFillingProps) => {
  const [naturalInput, setNaturalInput] = useState("");
  const [formData, setFormData] = useState<FormData>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { generateInstruction } = useGemini();
  const { toast } = useToast();
  
  const processNaturalLanguage = async () => {
    if (!naturalInput.trim()) return;
    
    setIsProcessing(true);
    
    const systemPrompt = `
You are an AI assistant specialized in converting natural language requests into structured form data.
Extract all relevant information to populate a form, calendar entry, or task.

Extract key fields such as:
- eventType (meeting, task, reminder, appointment, etc.)
- date (ISO format preferred, or infer from relative references)
- time (start time in 24h format)
- duration (in minutes or hours)
- location (physical or virtual)
- attendees (list of names/emails)
- description (summary of the event/task)
- title (brief title for the event/task)
- priority (low, medium, high)

Return ONLY a valid JSON object with these fields. Include only fields that can be confidently extracted.
Don't include explanations or any text outside the JSON structure.
`;

    try {
      const response = await generateInstruction({
        prompt: naturalInput,
        framework: "MOT", // Using MOT framework for this extraction task
        systemInstruction: systemPrompt,
        jsonMode: true,
        temperature: 0.1, // Low temperature for more deterministic extraction
      });
      
      if (response) {
        if (response.jsonResponse) {
          console.log("Extracted form data:", response.jsonResponse);
          setFormData(response.jsonResponse);
          toast({
            title: "Form Data Extracted",
            description: "Successfully extracted data from your input"
          });
        } else {
          // Try to manually parse JSON from the text response
          try {
            const jsonStart = response.generatedText.indexOf('{');
            const jsonEnd = response.generatedText.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              const jsonString = response.generatedText.substring(jsonStart, jsonEnd);
              const parsedJson = JSON.parse(jsonString);
              setFormData(parsedJson);
              toast({
                title: "Form Data Extracted",
                description: "Successfully extracted data from your input"
              });
            } else {
              throw new Error("No valid JSON found");
            }
          } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            toast({
              title: "Extraction Failed",
              description: "Could not extract structured data from your input",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      console.error("Error processing natural language:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process your request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmitForm = () => {
    if (onSubmitForm) {
      onSubmitForm(formData);
    }
    
    toast({
      title: "Form Submitted",
      description: `Successfully created ${formData.eventType || "item"}`
    });
    
    // Reset form after submission
    setFormData({});
    setNaturalInput("");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Smart Form Filling
        </CardTitle>
        <CardDescription>
          Type natural language instructions and watch forms fill themselves
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="naturalInput">Type your request in natural language</Label>
            <div className="flex space-x-2">
              <Textarea
                id="naturalInput"
                placeholder="Example: Schedule a meeting with John and Sarah for tomorrow at 2pm to discuss the Q3 marketing budget in the conference room for 1 hour"
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                className="flex-grow"
                rows={3}
              />
            </div>
            <Button 
              onClick={processNaturalLanguage} 
              disabled={isProcessing || !naturalInput.trim()} 
              className="mt-2"
            >
              {isProcessing ? "Processing..." : "Process"}
            </Button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-medium mb-4">Generated Form</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                  </span>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Input
                  id="eventType"
                  value={formData.eventType || ""}
                  onChange={(e) => handleFieldChange("eventType", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </span>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </span>
                  <Input
                    id="time"
                    value={formData.time || ""}
                    onChange={(e) => handleFieldChange("time", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration || ""}
                  onChange={(e) => handleFieldChange("duration", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </span>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attendees">Attendees</Label>
                <div className="flex items-center">
                  <span className="bg-gray-100 p-2 rounded-l-md border border-r-0">
                    <User className="h-4 w-4 text-gray-500" />
                  </span>
                  <Input
                    id="attendees"
                    value={formData.attendees ? Array.isArray(formData.attendees) ? formData.attendees.join(", ") : formData.attendees : ""}
                    onChange={(e) => handleFieldChange("attendees", e.target.value.split(",").map(a => a.trim()))}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <Button 
              className="mt-4" 
              onClick={handleSubmitForm}
              disabled={!formData.title}
            >
              Submit Form
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartFormFilling;
