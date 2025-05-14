
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useGemini } from "@/hooks/use-gemini";
import { MessageSquare, Send, User, Bot, Globe, Sparkles, AlertTriangle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  sentiment?: 'neutral' | 'positive' | 'negative';
}

interface CustomerSupportChatProps {
  initialPrompt?: string;
}

const CustomerSupportChat = ({ initialPrompt }: CustomerSupportChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("english");
  const [responseType, setResponseType] = useState("standard");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { streamInstruction, isStreaming } = useGemini();
  
  // Initialize with system message
  useEffect(() => {
    const welcomeMessage = "Hello! I'm your AI customer support assistant. How can I help you today?";
    setMessages([
      {
        id: Date.now().toString(),
        content: welcomeMessage,
        role: "assistant",
        timestamp: new Date(),
      }
    ]);
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    const botLoadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, botLoadingMessage]);
    setInput("");
    
    const promptPrefix = getPromptPrefix(responseType, language);
    const messageHistory = messages
      .filter(m => !m.isLoading)
      .map(m => `${m.role === 'user' ? 'Customer' : 'Support'}: ${m.content}`)
      .join('\n\n');
    
    const prompt = `${promptPrefix}\n\nConversation history:\n${messageHistory}\n\nCustomer: ${input}\n\nSupport:`;
    
    let streamingContent = "";
    
    await streamInstruction(
      {
        prompt,
        framework: "PROMPT", // Using PROMPT framework for this example
        systemInstruction: "You are a helpful, empathetic customer support AI assistant. Keep your answers concise and helpful.",
        language: language !== "english" ? language : undefined,
        temperature: responseType === "empathetic" ? 0.7 : 0.3,
      },
      {
        onStart: () => {
          // Already showing loading state
        },
        onUpdate: (chunk) => {
          streamingContent += chunk;
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            if (updatedMessages[lastIndex].isLoading) {
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: streamingContent,
              };
            }
            return updatedMessages;
          });
        },
        onComplete: (fullText) => {
          // Analyze sentiment for better UI feedback
          const sentiment = analyzeSentiment(input);
          
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              id: Date.now().toString(),
              content: fullText,
              role: "assistant",
              timestamp: new Date(),
              sentiment: sentiment
            };
            return updatedMessages;
          });
        },
        onError: (error) => {
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              id: Date.now().toString(),
              content: "Sorry, I encountered an error while generating a response. Please try again.",
              role: "assistant",
              timestamp: new Date()
            };
            return updatedMessages;
          });
          
          toast({
            title: "Response Error",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };
  
  const getPromptPrefix = (type: string, lang: string) => {
    let prefix = "Respond to the customer query in a helpful way";
    
    if (type === "empathetic") {
      prefix = "Respond with empathy and understanding to the customer's problem. Show that you care about their issue and want to help resolve it.";
    } else if (type === "technical") {
      prefix = "Provide a detailed technical answer that accurately addresses the customer's question. Include relevant information and steps if applicable.";
    } else if (type === "escalation") {
      prefix = "Determine if this query needs escalation. If it's a complex issue that requires human intervention, acknowledge this and explain the escalation process. Otherwise, provide a helpful answer.";
    }
    
    if (lang !== "english") {
      prefix += ` Respond in ${lang}.`;
    }
    
    return prefix;
  };
  
  // Simple sentiment analysis (would be more sophisticated in a real app)
  const analyzeSentiment = (text: string): 'neutral' | 'positive' | 'negative' => {
    const lowerText = text.toLowerCase();
    const negativeWords = ["angry", "upset", "disappointed", "terrible", "awful", "bad", "worst", "horrible", "issue", "problem", "broken"];
    const positiveWords = ["thanks", "thank", "great", "good", "excellent", "awesome", "love", "appreciate", "helpful", "perfect"];
    
    const negativeScore = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveScore = positiveWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Customer Support Chat
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={responseType} onValueChange={setResponseType}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Response Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="escalation">Escalation Logic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : message.isLoading 
                        ? "bg-gray-100 text-gray-500" 
                        : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === "user" ? (
                      <>
                        <span className="font-medium">You</span>
                        <User className="h-3 w-3 ml-1" />
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Support AI</span>
                        <Bot className="h-3 w-3 ml-1" />
                        {message.sentiment === 'negative' && (
                          <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                        )}
                      </>
                    )}
                    <span className="text-xs ml-2 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.isLoading ? (
                    <div className="flex items-center">
                      <span>{message.content}</span>
                      <div className="ml-1 flex space-x-1">
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            disabled={isStreaming}
            className="flex-grow"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isStreaming || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomerSupportChat;
