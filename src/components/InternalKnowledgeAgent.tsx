
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGemini } from "@/hooks/use-gemini";
import { Book, Search, LinkIcon, InfoIcon, MessageSquare } from "lucide-react";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'policy' | 'procedure' | 'training' | 'faq' | 'reference';
  department: string;
  tags: string[];
}

interface KnowledgeAgentProps {
  knowledgeBase?: KnowledgeItem[];
}

const demoKnowledgeBase: KnowledgeItem[] = [
  {
    id: "pol-001",
    title: "Remote Work Policy",
    content: "Employees are permitted to work remotely up to 3 days per week with manager approval. Remote work arrangements must be documented and approved by HR. Equipment for remote work is provided by the company and must be returned upon employment termination. Security protocols must be followed at all times when accessing company systems remotely.",
    type: "policy",
    department: "HR",
    tags: ["remote work", "wfh", "telecommuting", "hybrid work"]
  },
  {
    id: "proc-002",
    title: "Expense Reimbursement Procedure",
    content: "Submit expense reports within 30 days of incurring the expense. All expenses must have receipts attached. Expenses over $500 require pre-approval. Use the company expense portal to submit claims. Reimbursements are processed within 2 pay cycles after approval.",
    type: "procedure",
    department: "Finance",
    tags: ["expenses", "reimbursement", "claims", "receipts"]
  },
  {
    id: "train-003",
    title: "Cybersecurity Training",
    content: "All employees must complete annual cybersecurity training. Topics covered include password management, phishing awareness, secure remote access, data protection, and incident reporting procedures. The training includes a mandatory quiz requiring a passing grade of 80% or higher.",
    type: "training",
    department: "IT",
    tags: ["security", "compliance", "phishing", "data protection"]
  },
  {
    id: "faq-004",
    title: "Benefits FAQ",
    content: "Health insurance coverage begins on the first day of employment. The 401(k) plan allows contributions after 90 days, with company matching up to 4%. Dental and vision plans are optional add-ons. Wellness program benefits include gym discounts and quarterly health initiatives. Contact benefits@company.com for specific questions.",
    type: "faq",
    department: "HR",
    tags: ["benefits", "insurance", "retirement", "wellness"]
  },
  {
    id: "ref-005",
    title: "Product Launch Checklist",
    content: "Complete the following before launch: market research validation, competitive analysis, pricing strategy, marketing materials, sales training, customer support documentation, legal review, website updates, and announcement schedule. All departments must sign off in the product management system before proceeding with launch.",
    type: "reference",
    department: "Product",
    tags: ["launch", "product", "checklist", "go-to-market"]
  }
];

const InternalKnowledgeAgent = ({ knowledgeBase = demoKnowledgeBase }: KnowledgeAgentProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [aiResponse, setAiResponse] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<KnowledgeItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { streamInstruction, isStreaming } = useGemini();
  
  // Handle search across knowledge base
  const handleSearch = () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Simple search implementation - in a real system this would be more sophisticated
    const results = knowledgeBase.filter(item => {
      const searchTerms = query.toLowerCase().split(" ");
      const itemText = `${item.title} ${item.content} ${item.tags.join(" ")} ${item.department}`.toLowerCase();
      
      return searchTerms.some(term => itemText.includes(term));
    });
    
    setSearchResults(results);
    setActiveTab("search");
  };
  
  // Handle AI query using Gemini
  const askAI = async () => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    setStreamingContent("");
    setAiResponse("");
    
    // Prepare context from selected documents or search results
    const relevantDocs = selectedDocuments.length > 0 ? selectedDocuments : searchResults.slice(0, 3);
    
    const context = relevantDocs.map(doc => (
      `Document: ${doc.title} (${doc.type} - ${doc.department})
Content: ${doc.content}
Tags: ${doc.tags.join(", ")}`
    )).join("\n\n");
    
    // Build prompt for the AI
    const prompt = `
Based on the following company knowledge base documents:

${context}

Answer this question from an employee: "${query}"

If the documents don't contain enough information to answer fully, acknowledge this and suggest where the employee might find more information.
`;

    await streamInstruction(
      {
        prompt,
        framework: "ReACT", // Using ReACT framework for reasoning and action
        systemInstruction: "You are an internal knowledge assistant for a company. Your job is to help employees find information from company documents and policies. Be concise, accurate, and helpful.",
      },
      {
        onStart: () => {
          // Already showing processing state
        },
        onUpdate: (chunk) => {
          setStreamingContent(prev => prev + chunk);
        },
        onComplete: (fullText) => {
          setAiResponse(fullText);
          setStreamingContent("");
          setIsProcessing(false);
          setActiveTab("answer");
        },
        onError: (error) => {
          setAiResponse("I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.");
          setStreamingContent("");
          setIsProcessing(false);
          setActiveTab("answer");
        }
      }
    );
  };
  
  // Toggle document selection for AI context
  const toggleDocumentSelection = (doc: KnowledgeItem) => {
    setSelectedDocuments(prev => {
      const isSelected = prev.some(item => item.id === doc.id);
      if (isSelected) {
        return prev.filter(item => item.id !== doc.id);
      } else {
        return [...prev, doc];
      }
    });
  };
  
  const isDocumentSelected = (id: string) => {
    return selectedDocuments.some(doc => doc.id === id);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book className="mr-2 h-5 w-5" />
          Internal Knowledge Agent
        </CardTitle>
        <CardDescription>
          Ask questions about company policies, procedures, and documentation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex space-x-2 mb-4">
          <Input
            ref={inputRef}
            placeholder="Search knowledge base or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="flex-grow"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          <Button onClick={askAI} disabled={isProcessing || isStreaming}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Ask AI
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="search">Search Results</TabsTrigger>
            <TabsTrigger value="answer">AI Answer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            <ScrollArea className="h-[400px]">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((item) => (
                    <Card key={item.id} className={`p-4 ${isDocumentSelected(item.id) ? 'border-blue-500 border-2' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <div className="flex items-center text-sm text-gray-500 space-x-2 mb-2">
                            <Badge variant="outline">{item.type}</Badge>
                            <span>•</span>
                            <span>{item.department}</span>
                          </div>
                          <p className="text-sm">{item.content}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDocumentSelection(item)}
                          className="ml-2"
                        >
                          {isDocumentSelected(item.id) ? "Deselect" : "Select"}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : query ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <InfoIcon className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-gray-500">No results found. Try different search terms.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Search className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-gray-500">Enter a search term to find relevant documents</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="answer">
            <Card className="border p-4 h-[400px] overflow-auto">
              {isProcessing || isStreaming ? (
                <div>
                  <div className="animate-pulse flex space-x-2 items-center mb-4">
                    <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
                    <div className="h-4 w-4 bg-blue-400 rounded-full animation-delay-150"></div>
                    <div className="h-4 w-4 bg-blue-400 rounded-full animation-delay-300"></div>
                    <div className="ml-2 text-sm font-medium">Processing your question...</div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">
                    {streamingContent}
                    <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse"></span>
                  </div>
                </div>
              ) : aiResponse ? (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-2 mt-1 text-blue-500" />
                    <div>
                      <p className="font-semibold text-sm">Your question:</p>
                      <p className="text-gray-800">{query}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Book className="h-5 w-5 mr-2 mt-1 text-blue-500" />
                    <div>
                      <p className="font-semibold text-sm">Knowledge agent response:</p>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap">{aiResponse}</div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedDocuments.length > 0 && (
                    <div className="flex items-start pt-2 border-t">
                      <LinkIcon className="h-5 w-5 mr-2 mt-1 text-blue-500" />
                      <div>
                        <p className="font-semibold text-sm">Referenced documents:</p>
                        <ul className="list-disc pl-5 text-sm">
                          {selectedDocuments.map(doc => (
                            <li key={doc.id}>{doc.title} ({doc.department})</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-gray-500">Ask a question about company policies and documents</p>
                  <p className="text-sm text-gray-400 mt-2">
                    You can select specific documents from search results for more targeted answers
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InternalKnowledgeAgent;
