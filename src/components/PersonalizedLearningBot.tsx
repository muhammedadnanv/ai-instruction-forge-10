
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGemini } from "@/hooks/use-gemini";
import { GraduationCap, MessageSquare, User, BookOpen, BarChart, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  type?: 'quiz' | 'explanation' | 'feedback' | 'guidance' | 'standard';
}

interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface LearningProgress {
  correctAnswers: number;
  totalQuestions: number;
  strengths: string[];
  areasToImprove: string[];
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface PersonalizedLearningBotProps {
  topic?: string;
}

const PersonalizedLearningBot = ({ topic = "Machine Learning" }: PersonalizedLearningBotProps) => {
  const [messages, setMessages] = useState<LearningMessage[]>([]);
  const [input, setInput] = useState("");
  const [learningStyle, setLearningStyle] = useState("interactive");
  const [difficulty, setDifficulty] = useState("beginner");
  const [activeTab, setActiveTab] = useState("chat");
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [progress, setProgress] = useState<LearningProgress>({
    correctAnswers: 0,
    totalQuestions: 0,
    strengths: [],
    areasToImprove: [topic],
    knowledgeLevel: 'beginner'
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { streamInstruction, isStreaming } = useGemini();
  
  // Initialize with welcome message
  useEffect(() => {
    const initialMessage = `Welcome to your personalized learning experience on ${topic}! I'll adapt to your learning style and knowledge level. What would you like to learn today?`;
    setMessages([
      {
        id: Date.now().toString(),
        content: initialMessage,
        role: "assistant",
        timestamp: new Date(),
        type: 'standard'
      }
    ]);
  }, [topic]);
  
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
    
    const userMessage: LearningMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date()
    };
    
    const botLoadingMessage: LearningMessage = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, userMessage, botLoadingMessage]);
    setInput("");
    
    // Build the learning context
    const conversationHistory = messages
      .filter(m => !m.isLoading)
      .slice(-6) // Keep context manageable
      .map(m => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.content}`)
      .join('\n\n');
    
    // Build the prompt based on learning style and difficulty
    const promptPrefix = getLearningPrompt(learningStyle, difficulty);
    const prompt = `${promptPrefix}\n\nTopic: ${topic}\n\nProgress: ${progress.knowledgeLevel} level, answered ${progress.correctAnswers} of ${progress.totalQuestions} questions correctly.\n\nConversation history:\n${conversationHistory}\n\nLearner: ${input}\n\nTutor:`;
    
    let streamingContent = "";
    let messageType: LearningMessage['type'] = 'standard';
    
    if (input.toLowerCase().includes('quiz') || input.toLowerCase().includes('test') || input.toLowerCase().includes('question')) {
      messageType = 'quiz';
    } else if (input.toLowerCase().includes('explain') || input.toLowerCase().includes('how')) {
      messageType = 'explanation';
    } else if (input.toLowerCase().includes('feedback') || input.toLowerCase().includes('how am i doing')) {
      messageType = 'feedback';
    }
    
    await streamInstruction(
      {
        prompt,
        framework: "PEEL", // Using PEEL framework for educational content
        systemInstruction: `You are a personalized AI tutor specialized in ${topic}. Adapt your teaching approach to ${learningStyle} style at ${difficulty} level. Your goal is to help the learner master concepts through ${learningStyle === 'interactive' ? 'questions, examples, and feedback' : learningStyle === 'visual' ? 'descriptive scenarios and metaphors' : 'clear, structured explanations'}.`,
        temperature: 0.4
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
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              id: Date.now().toString(),
              content: fullText,
              role: "assistant",
              timestamp: new Date(),
              type: messageType
            };
            return updatedMessages;
          });
          
          // If this was a quiz request, try to extract a quiz question
          if (messageType === 'quiz') {
            extractQuizQuestion(fullText);
          }
          
          // Update progress based on interaction
          updateProgress(input, fullText);
        },
        onError: (error) => {
          setMessages(prev => {
            const lastIndex = prev.length - 1;
            const updatedMessages = [...prev];
            updatedMessages[lastIndex] = {
              id: Date.now().toString(),
              content: "I'm sorry, I encountered an error. Let's try a different approach.",
              role: "assistant",
              timestamp: new Date()
            };
            return updatedMessages;
          });
        }
      }
    );
  };
  
  const generateQuiz = async () => {
    setQuizActive(true);
    
    const botMessage: LearningMessage = {
      id: Date.now().toString(),
      content: `Preparing a ${difficulty} level quiz on ${topic}...`,
      role: "assistant",
      timestamp: new Date(),
      type: 'standard'
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    // Generate a quiz with multiple questions
    const prompt = `
Create a quiz about ${topic} at ${difficulty} level. 
Generate 5 multiple-choice questions with 4 options each.
Format your response as a valid JSON array of objects with these properties:
- question: the question text
- options: array of 4 possible answers
- correctAnswer: the correct option
- explanation: brief explanation of why the answer is correct

Ensure the JSON is valid and properly formatted.`;

    try {
      const response = await streamInstruction(
        {
          prompt,
          framework: "CRISP",
          jsonMode: true,
          temperature: 0.3
        },
        {
          onComplete: (fullText) => {
            try {
              // Try to extract JSON
              const jsonStart = fullText.indexOf('[');
              const jsonEnd = fullText.lastIndexOf(']') + 1;
              
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                const jsonString = fullText.substring(jsonStart, jsonEnd);
                const questions = JSON.parse(jsonString);
                
                if (Array.isArray(questions) && questions.length > 0) {
                  setQuizQuestions(questions);
                  setCurrentQuestion(questions[0]);
                  
                  const quizIntroMessage: LearningMessage = {
                    id: (Date.now() + 1).toString(),
                    content: `Let's test your knowledge of ${topic} with a ${difficulty} level quiz! I've prepared ${questions.length} questions for you. Let's start with the first one:`,
                    role: "assistant",
                    timestamp: new Date(),
                    type: 'quiz'
                  };
                  
                  setMessages(prev => [...prev, quizIntroMessage]);
                  displayQuestion(questions[0]);
                }
              } else {
                throw new Error("No valid JSON found");
              }
            } catch (error) {
              console.error("Failed to parse quiz questions:", error);
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: "I had trouble generating the quiz. Let's try a different approach to help you learn.",
                role: "assistant",
                timestamp: new Date()
              }]);
              setQuizActive(false);
            }
          },
          onError: (error) => {
            console.error("Error generating quiz:", error);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              content: "I encountered an error while creating your quiz. Let's try a regular learning session instead.",
              role: "assistant",
              timestamp: new Date()
            }]);
            setQuizActive(false);
          }
        }
      );
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      setQuizActive(false);
    }
  };
  
  const displayQuestion = (question: QuizQuestion) => {
    const questionMessage: LearningMessage = {
      id: Date.now().toString(),
      content: `**Question**: ${question.question}\n\n${(question.options || []).map((option, i) => `${['A', 'B', 'C', 'D'][i]}. ${option}`).join('\n')}`,
      role: "assistant",
      timestamp: new Date(),
      type: 'quiz'
    };
    
    setMessages(prev => [...prev, questionMessage]);
    setSelectedOption(null);
  };
  
  const handleAnswerSubmission = (answer: string) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    const optionIndex = (currentQuestion.options || []).findIndex(opt => opt === answer);
    const optionLetter = ['A', 'B', 'C', 'D'][optionIndex];
    
    // User answer message
    const userAnswerMessage: LearningMessage = {
      id: Date.now().toString(),
      content: `${optionLetter}. ${answer}`,
      role: "user",
      timestamp: new Date()
    };
    
    // Feedback message
    const feedbackMessage: LearningMessage = {
      id: (Date.now() + 1).toString(),
      content: `${isCorrect ? '✅ Correct!' : '❌ Not quite.'} ${currentQuestion.explanation || ''}`,
      role: "assistant",
      timestamp: new Date(),
      type: 'feedback'
    };
    
    setMessages(prev => [...prev, userAnswerMessage, feedbackMessage]);
    
    // Update progress
    setProgress(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalQuestions: prev.totalQuestions + 1,
      strengths: isCorrect 
        ? [...prev.strengths, extractTopic(currentQuestion.question)]
        : prev.strengths,
      areasToImprove: !isCorrect
        ? [...prev.areasToImprove, extractTopic(currentQuestion.question)]
        : prev.areasToImprove
    }));
    
    // Move to next question or end quiz
    const currentIndex = quizQuestions.findIndex(q => q.question === currentQuestion.question);
    if (currentIndex < quizQuestions.length - 1) {
      const nextQuestion = quizQuestions[currentIndex + 1];
      
      // Add a transition message
      const transitionMessage: LearningMessage = {
        id: (Date.now() + 2).toString(),
        content: "Moving to the next question:",
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, transitionMessage]);
      setCurrentQuestion(nextQuestion);
      displayQuestion(nextQuestion);
    } else {
      // Quiz completed
      const scorePercent = Math.round((progress.correctAnswers / (quizQuestions.length)) * 100);
      const quizCompletionMessage: LearningMessage = {
        id: (Date.now() + 2).toString(),
        content: `🎉 Quiz completed! You scored ${progress.correctAnswers}/${quizQuestions.length} (${scorePercent}%).${scorePercent >= 80 ? ' Excellent job!' : scorePercent >= 60 ? ' Good effort!' : ' Keep practicing, you\'ll get better!'}`,
        role: "assistant",
        timestamp: new Date(),
        type: 'feedback'
      };
      
      setMessages(prev => [...prev, quizCompletionMessage]);
      setQuizActive(false);
      setCurrentQuestion(null);
      
      // Update the knowledge level based on quiz performance
      if (scorePercent >= 80 && difficulty === 'beginner') {
        setDifficulty('intermediate');
        setProgress(prev => ({ ...prev, knowledgeLevel: 'intermediate' }));
        
        const levelUpMessage: LearningMessage = {
          id: (Date.now() + 3).toString(),
          content: "Based on your performance, I've increased the difficulty to intermediate. Let's challenge you a bit more!",
          role: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, levelUpMessage]);
      } else if (scorePercent >= 80 && difficulty === 'intermediate') {
        setDifficulty('advanced');
        setProgress(prev => ({ ...prev, knowledgeLevel: 'advanced' }));
        
        const levelUpMessage: LearningMessage = {
          id: (Date.now() + 3).toString(),
          content: "You're doing great! I've increased the difficulty to advanced to match your expertise.",
          role: "assistant",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, levelUpMessage]);
      }
    }
  };
  
  const extractTopic = (text: string): string => {
    // Simple extraction of likely topic from question text
    const words = text.replace(/[.,?!;:()"']/g, '').split(' ');
    const stopWords = ['what', 'when', 'where', 'which', 'how', 'why', 'is', 'are', 'the', 'a', 'an'];
    const topicWords = words.filter(word => !stopWords.includes(word.toLowerCase()) && word.length > 3);
    return topicWords[0] || topic;
  };
  
  const updateProgress = (userQuery: string, aiResponse: string) => {
    // This is a simplified version - in a real app, this would use more sophisticated analysis
    const combinedText = `${userQuery} ${aiResponse}`.toLowerCase();
    
    // Check for understanding signals
    const positiveSignals = ['i understand', 'makes sense', 'got it', 'i see'];
    const negativeSignals = ['confused', 'don\'t understand', 'not clear', 'lost'];
    
    const showsUnderstanding = positiveSignals.some(signal => combinedText.includes(signal));
    const showsConfusion = negativeSignals.some(signal => combinedText.includes(signal));
    
    if (showsUnderstanding) {
      // Extract likely topic of understanding
      const sentences = aiResponse.split('. ');
      const relevantSentence = sentences.find(s => 
        positiveSignals.some(signal => userQuery.toLowerCase().includes(signal))
      ) || sentences[0];
      const topic = extractTopic(relevantSentence);
      
      setProgress(prev => ({
        ...prev,
        strengths: [...new Set([...prev.strengths, topic])]
      }));
    }
    
    if (showsConfusion) {
      // Extract likely topic of confusion
      const topic = extractTopic(userQuery);
      
      setProgress(prev => ({
        ...prev,
        areasToImprove: [...new Set([...prev.areasToImprove, topic])]
      }));
    }
  };
  
  const extractQuizQuestion = (text: string) => {
    // Attempt to extract a question and options from text
    // This is a simplified version - in a real app you would use a more robust parser
    
    // Check if there's a question mark
    const questionMarkIndex = text.indexOf('?');
    if (questionMarkIndex < 0) return;
    
    // Look for patterns like "A.", "B.", etc. after the question mark
    const afterQuestion = text.substring(questionMarkIndex + 1);
    const optionsMatch = afterQuestion.match(/[A-D]\.\s+[^\n]+/g);
    
    if (optionsMatch && optionsMatch.length >= 2) {
      const question = text.substring(0, questionMarkIndex + 1).trim();
      const options = optionsMatch.map(opt => opt.replace(/^[A-D]\.\s+/, '').trim());
      
      // We don't know the correct answer here, but we can present this as a quiz question
      setCurrentQuestion({
        question,
        options
      });
      
      setQuizActive(true);
    }
  };
  
  const getLearningPrompt = (style: string, level: string): string => {
    const stylePrompts = {
      'interactive': 'Use the Socratic method with questions to guide understanding. Include practice problems.',
      'visual': 'Use metaphors, analogies, and descriptive scenarios that create mental images.',
      'structured': 'Provide clear, organized explanations with numbered steps and bullet points.'
    };
    
    const levelPrompts = {
      'beginner': 'Avoid jargon, use simple language, and explain fundamental concepts.',
      'intermediate': 'Build on fundamentals with more technical terminology and moderately complex concepts.',
      'advanced': 'Discuss advanced topics with field-specific terminology and nuanced explanations.'
    };
    
    return `${stylePrompts[style as keyof typeof stylePrompts]} ${levelPrompts[level as keyof typeof levelPrompts]}`;
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5" />
            {topic} Learning Assistant
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={learningStyle} onValueChange={setLearningStyle}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Learning Style" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interactive">Interactive</SelectItem>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="structured">Structured</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Difficulty" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Personalized learning tailored to your style, pace, and knowledge level
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6 my-2 grid grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900",
                      message.type === 'quiz' && "border-l-4 border-amber-500",
                      message.type === 'explanation' && "border-l-4 border-blue-500",
                      message.type === 'feedback' && "border-l-4 border-green-500"
                    )}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === "user" ? (
                        <>
                          <span className="font-medium">You</span>
                          <User className="h-3 w-3 ml-1" />
                        </>
                      ) : (
                        <>
                          <span className="font-medium">Tutor</span>
                          <GraduationCap className="h-3 w-3 ml-1" />
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
                      <div 
                        className="whitespace-pre-wrap prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br />') 
                        }}
                      />
                    )}
                    
                    {/* Show answer options if this is a quiz question and we have a current question */}
                    {message.type === 'quiz' && currentQuestion && message.role === 'assistant' && 
                     message.content.includes(currentQuestion.question) && (
                      <div className="mt-4 space-y-2">
                        {(currentQuestion.options || []).map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedOption === option ? "default" : "outline"}
                            className="w-full justify-start text-left"
                            onClick={() => {
                              setSelectedOption(option);
                              handleAnswerSubmission(option);
                            }}
                          >
                            <span className="mr-2">{['A', 'B', 'C', 'D'][index]}.</span> {option}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <CardFooter className="border-t p-3">
            <div className="flex w-full items-center space-x-2">
              {!quizActive ? (
                <>
                  <Input
                    placeholder="Ask anything about the topic..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={isStreaming}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isStreaming || !input.trim()}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={generateQuiz}
                    disabled={isStreaming}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Take Quiz
                  </Button>
                </>
              ) : (
                <div className="w-full text-center p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-700">Quiz in progress - answer the questions above</p>
                </div>
              )}
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="progress" className="flex-1 p-4">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-blue-800 mb-2">Learning Progress</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="text-sm text-gray-500 mb-1">Knowledge Level</div>
                  <div className="font-medium capitalize">{progress.knowledgeLevel}</div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <div className="text-sm text-gray-500 mb-1">Quiz Performance</div>
                  <div className="font-medium">
                    {progress.totalQuestions > 0 ? 
                      `${progress.correctAnswers}/${progress.totalQuestions} correct (${Math.round((progress.correctAnswers / progress.totalQuestions) * 100)}%)` : 
                      "No quizzes taken yet"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.strengths.length > 0 ? (
                    <ul className="space-y-1">
                      {Array.from(new Set(progress.strengths)).map((strength, i) => (
                        <li key={i} className="flex items-center text-green-700">
                          <ArrowRight className="h-3 w-3 mr-2" />
                          <span className="capitalize">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Complete quizzes to identify strengths</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  {progress.areasToImprove.length > 0 ? (
                    <ul className="space-y-1">
                      {Array.from(new Set(progress.areasToImprove)).map((area, i) => (
                        <li key={i} className="flex items-center text-amber-700">
                          <ArrowRight className="h-3 w-3 mr-2" />
                          <span className="capitalize">{area}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Complete quizzes to identify areas for improvement</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Suggested Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-2">
                    <BookOpen className="h-4 w-4 text-blue-700" />
                  </div>
                  <p className="text-sm">Practice {progress.areasToImprove[0]} concepts with interactive exercises</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-2">
                    <BarChart className="h-4 w-4 text-blue-700" />
                  </div>
                  <p className="text-sm">Take a quiz to test your understanding of recent topics</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 p-1 rounded mr-2">
                    <Target className="h-4 w-4 text-blue-700" />
                  </div>
                  <p className="text-sm">{progress.knowledgeLevel === 'beginner' ? 'Master foundational concepts before advancing' : progress.knowledgeLevel === 'intermediate' ? 'Explore advanced applications of your knowledge' : 'Teach concepts to others to solidify understanding'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PersonalizedLearningBot;
