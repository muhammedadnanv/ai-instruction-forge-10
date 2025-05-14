
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useGemini } from "@/hooks/use-gemini";
import { FileText, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import OutputPreview from "./OutputPreview";

interface ContentGeneratorProps {
  onSave?: (content: string, title: string) => void;
}

const ContentGenerator = ({ onSave }: ContentGeneratorProps) => {
  const [contentType, setContentType] = useState("blog");
  const [tone, setTone] = useState("professional");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("general");
  const [wordCount, setWordCount] = useState([500]);
  const [includeHeadings, setIncludeHeadings] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [output, setOutput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const { streamInstruction, isLoading, isStreaming } = useGemini();
  
  const generateContent = async () => {
    if (!topic) return;
    
    setOutput("");
    setStreamingContent("");
    
    const promptTemplate = buildPrompt();
    
    await streamInstruction(
      {
        prompt: promptTemplate,
        framework: "CRISP", // Using CRISP framework for content generation
        temperature: 0.7,
        systemInstruction: "You are an expert content creator specializing in creating high-quality, engaging content optimized for SEO and reader engagement."
      },
      {
        onStart: () => {
          // Starting the stream
        },
        onUpdate: (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        onComplete: (fullText) => {
          setOutput(fullText);
          setStreamingContent("");
        },
        onError: (error) => {
          console.error("Content generation error:", error);
        }
      }
    );
  };
  
  const buildPrompt = () => {
    const contentTypeMap = {
      blog: "blog post",
      article: "article",
      productDescription: "product description",
      adCopy: "advertising copy",
      socialPost: "social media post",
      emailNewsletter: "email newsletter"
    };
    
    const toneMap = {
      professional: "formal and professional",
      casual: "casual and conversational",
      authoritative: "authoritative and expert",
      witty: "witty and humorous",
      informative: "informative and educational",
      persuasive: "persuasive and compelling"
    };
    
    const audienceMap = {
      general: "general audience",
      technical: "technical professionals",
      beginners: "beginners with limited knowledge",
      executives: "business executives",
      youngAdults: "young adults",
      seniors: "senior citizens"
    };
    
    return `
# CRISP Content Generation Framework

## Context:
- Content Type: ${contentTypeMap[contentType as keyof typeof contentTypeMap]}
- Topic: ${topic}
- Target Audience: ${audienceMap[audience as keyof typeof audienceMap]}
- Keywords to include: ${keywords || "No specific keywords"}

## Request:
Create a high-quality ${contentTypeMap[contentType as keyof typeof contentTypeMap]} about ${topic} that is approximately ${wordCount[0]} words.

## Instructions:
- Write in a ${toneMap[tone as keyof typeof toneMap]} tone
- ${includeHeadings ? "Include well-structured headings and subheadings" : "Write in paragraph format without headings"}
- ${includeCTA ? "Include a strong call-to-action at the end" : "No call-to-action needed"}
- Incorporate the keywords naturally: ${keywords}
- Create content that resonates with ${audienceMap[audience as keyof typeof audienceMap]}

## Style:
- Be engaging and hold reader interest
- Use active voice
- Keep paragraphs concise and scannable
- Follow SEO best practices

## Parameters:
- Word count: approximately ${wordCount[0]} words
- Format: web-ready content
- Purpose: Inform and engage readers, establish authority
`;
  };
  
  const handleSaveContent = () => {
    if (onSave && output) {
      // Extract a title from the content
      let title = topic;
      const lines = output.split('\n');
      if (lines.length > 0 && lines[0].startsWith('# ')) {
        title = lines[0].substring(2);
      }
      
      onSave(output, title);
    }
  };
  
  const contentTypeOptions = [
    { value: "blog", label: "Blog Post" },
    { value: "article", label: "Article" },
    { value: "productDescription", label: "Product Description" },
    { value: "adCopy", label: "Ad Copy" },
    { value: "socialPost", label: "Social Media Post" },
    { value: "emailNewsletter", label: "Email Newsletter" }
  ];
  
  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "authoritative", label: "Authoritative" },
    { value: "witty", label: "Witty" },
    { value: "informative", label: "Informative" },
    { value: "persuasive", label: "Persuasive" }
  ];
  
  const audienceOptions = [
    { value: "general", label: "General" },
    { value: "technical", label: "Technical" },
    { value: "beginners", label: "Beginners" },
    { value: "executives", label: "Executives" },
    { value: "youngAdults", label: "Young Adults" },
    { value: "seniors", label: "Seniors" }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Content Generation at Scale
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input 
                    id="topic" 
                    placeholder="e.g., Benefits of Cloud Computing" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Input 
                    id="keywords" 
                    placeholder="e.g., cloud, infrastructure, business" 
                    value={keywords} 
                    onChange={(e) => setKeywords(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wordCount">Word Count: {wordCount[0]}</Label>
                  <Slider 
                    id="wordCount"
                    defaultValue={[500]} 
                    min={100} 
                    max={2000} 
                    step={50} 
                    value={wordCount}
                    onValueChange={setWordCount}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch 
                    id="includeHeadings" 
                    checked={includeHeadings} 
                    onCheckedChange={setIncludeHeadings} 
                  />
                  <Label htmlFor="includeHeadings">Include Headings</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="includeCTA" 
                    checked={includeCTA} 
                    onCheckedChange={setIncludeCTA} 
                  />
                  <Label htmlFor="includeCTA">Include Call to Action</Label>
                </div>
                
                <div className="pt-6">
                  <Button 
                    className="w-full" 
                    onClick={generateContent} 
                    disabled={!topic || isLoading || isStreaming}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {isLoading || isStreaming ? "Generating..." : "Generate Content"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="output">
            <OutputPreview
              output={output}
              streamingContent={streamingContent}
              isGenerating={isLoading || isStreaming}
              isStreaming={isStreaming}
            />
            
            {output && (
              <div className="mt-4 flex justify-end">
                <Button onClick={handleSaveContent}>Save Content</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentGenerator;
