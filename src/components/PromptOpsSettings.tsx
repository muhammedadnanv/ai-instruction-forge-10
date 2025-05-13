
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Code, 
  Play, 
  Server, 
  Settings, 
  Plus, 
  ArrowRight, 
  Layers, 
  Activity, 
  Link, 
  Globe,
  Trash,
  RefreshCw,
  Check,
  X,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import promptOpsService, { Prompt, ApiEndpoint } from "@/services/promptOpsService";

const PromptOpsSettings = () => {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [currentEnvironment, setCurrentEnvironment] = useState<'development' | 'staging' | 'production'>('development');
  const [addPromptDialogOpen, setAddPromptDialogOpen] = useState(false);
  const [addEndpointDialogOpen, setAddEndpointDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [testEndpointDialogOpen, setTestEndpointDialogOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [usageData, setUsageData] = useState<any>(null);
  
  // New prompt form state
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    description: '',
    content: '',
    framework: 'openai',
    environment: 'development' as 'development' | 'staging' | 'production',
    isActive: true,
    rateLimit: null as number | null,
    accessKey: ''
  });
  
  // New endpoint form state
  const [newEndpoint, setNewEndpoint] = useState({
    path: '',
    method: 'POST' as 'GET' | 'POST',
    requiresAuth: true,
    rateLimit: null as number | null,
    environment: 'development' as 'development' | 'staging' | 'production'
  });
  
  // Test endpoint state
  const [testApiKey, setTestApiKey] = useState('');
  const [testBody, setTestBody] = useState('{}');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Load data when environment changes
  useEffect(() => {
    loadData();
  }, [currentEnvironment]);
  
  const loadData = () => {
    try {
      const env = promptOpsService.getCurrentEnvironment();
      setCurrentEnvironment(env);
      
      const fetchedPrompts = promptOpsService.getPrompts(currentEnvironment);
      setPrompts(fetchedPrompts);
      
      const fetchedEndpoints = promptOpsService.getEndpoints(currentEnvironment);
      setEndpoints(fetchedEndpoints);
      
      // Get usage stats
      if (fetchedPrompts.length > 0) {
        const stats = promptOpsService.getApiUsageStats();
        
        // Format for chart
        const chartData = Object.keys(stats.usageByDay).map(date => ({
          date,
          calls: stats.usageByDay[date]
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        setUsageData({
          stats,
          chartData
        });
      }
    } catch (error) {
      console.error('Failed to load PromptOps data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive"
      });
    }
  };
  
  const handleEnvironmentChange = (env: 'development' | 'staging' | 'production') => {
    try {
      promptOpsService.setCurrentEnvironment(env);
      setCurrentEnvironment(env);
      toast({
        title: "Environment Changed",
        description: `Switched to ${env} environment`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change environment",
        variant: "destructive"
      });
    }
  };
  
  const handleAddPrompt = () => {
    try {
      const prompt = promptOpsService.createPrompt({
        name: newPrompt.name,
        description: newPrompt.description,
        content: newPrompt.content,
        framework: newPrompt.framework,
        environment: newPrompt.environment,
        isActive: newPrompt.isActive,
        rateLimit: newPrompt.rateLimit,
        accessKey: newPrompt.accessKey || promptOpsService.generateApiKey()
      });
      
      setPrompts([...prompts, prompt]);
      setAddPromptDialogOpen(false);
      resetNewPromptForm();
      
      toast({
        title: "Prompt Created",
        description: `"${prompt.name}" has been added to ${prompt.environment} environment`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create prompt",
        variant: "destructive"
      });
    }
  };
  
  const resetNewPromptForm = () => {
    setNewPrompt({
      name: '',
      description: '',
      content: '',
      framework: 'openai',
      environment: currentEnvironment,
      isActive: true,
      rateLimit: null,
      accessKey: ''
    });
  };
  
  const handleDeletePrompt = (promptId: string) => {
    try {
      promptOpsService.deletePrompt(promptId);
      setPrompts(prompts.filter(p => p.id !== promptId));
      toast({
        title: "Prompt Deleted",
        description: "The prompt has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete prompt",
        variant: "destructive"
      });
    }
  };
  
  const handleTogglePromptActive = (prompt: Prompt) => {
    try {
      const updatedPrompt = promptOpsService.updatePrompt(prompt.id, {
        isActive: !prompt.isActive
      });
      
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
      
      toast({
        title: updatedPrompt.isActive ? "Prompt Activated" : "Prompt Deactivated",
        description: `"${updatedPrompt.name}" is now ${updatedPrompt.isActive ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update prompt",
        variant: "destructive"
      });
    }
  };
  
  const handleAddEndpoint = () => {
    if (!selectedPrompt) return;
    
    try {
      const endpoint = promptOpsService.createEndpoint(selectedPrompt.id, {
        path: newEndpoint.path,
        method: newEndpoint.method,
        requiresAuth: newEndpoint.requiresAuth,
        rateLimit: newEndpoint.rateLimit,
        environment: newEndpoint.environment
      });
      
      setEndpoints([...endpoints, endpoint]);
      setAddEndpointDialogOpen(false);
      resetNewEndpointForm();
      
      toast({
        title: "API Endpoint Created",
        description: `${endpoint.method} ${endpoint.path} is now available`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create endpoint",
        variant: "destructive"
      });
    }
  };
  
  const resetNewEndpointForm = () => {
    setNewEndpoint({
      path: '',
      method: 'POST',
      requiresAuth: true,
      rateLimit: null,
      environment: currentEnvironment
    });
  };
  
  const handleDeleteEndpoint = (endpointId: string) => {
    try {
      promptOpsService.deleteEndpoint(endpointId);
      setEndpoints(endpoints.filter(e => e.id !== endpointId));
      toast({
        title: "Endpoint Deleted",
        description: "The API endpoint has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete endpoint",
        variant: "destructive"
      });
    }
  };
  
  const handleOpenTestEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setTestApiKey('');
    setTestBody('{}');
    setTestResponse(null);
    setTestEndpointDialogOpen(true);
  };
  
  const handleTestEndpoint = () => {
    if (!selectedEndpoint) return;
    
    setTestLoading(true);
    
    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(testBody);
      } catch (e) {
        // If parsing fails, use empty object
        console.error('Invalid JSON in test body', e);
      }
      
      const response = promptOpsService.callEndpoint(
        selectedEndpoint.path,
        selectedEndpoint.method,
        parsedBody,
        testApiKey
      );
      
      setTestResponse(response);
      
      if (response.statusCode >= 400) {
        toast({
          title: `Error ${response.statusCode}`,
          description: response.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "API Call Successful",
          description: `Received status ${response.statusCode}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test endpoint",
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const getPromptById = (promptId: string): Prompt | undefined => {
    return prompts.find(p => p.id === promptId);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" /> PromptOps & API Integration
        </CardTitle>
        <CardDescription>
          Manage prompts, API endpoints, and monitor usage across environments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant={currentEnvironment === 'development' ? 'default' : 'outline'}
                className={currentEnvironment === 'development' ? 'bg-blue-500' : ''}
              >
                Development
              </Badge>
              <Badge variant={currentEnvironment === 'staging' ? 'default' : 'outline'}
                className={currentEnvironment === 'staging' ? 'bg-yellow-500' : ''}
              >
                Staging
              </Badge>
              <Badge variant={currentEnvironment === 'production' ? 'default' : 'outline'}
                className={currentEnvironment === 'production' ? 'bg-green-500' : ''}
              >
                Production
              </Badge>
            </div>
            <Select value={currentEnvironment} onValueChange={(value) => handleEnvironmentChange(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setAddPromptDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} /> Add Prompt
          </Button>
        </div>
        
        <Tabs defaultValue="prompts">
          <TabsList className="mb-4">
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <Layers size={16} /> Prompts
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Globe size={16} /> API Endpoints
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity size={16} /> Usage Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompts">
            {prompts.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Code className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium">No prompts available</h3>
                <p className="mt-2 max-w-md mx-auto">
                  Create prompts to deploy them as API endpoints in various environments.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {prompts.map((prompt) => (
                    <Card key={prompt.id} className={`border ${prompt.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{prompt.name}</CardTitle>
                            <Badge 
                              variant={prompt.isActive ? "default" : "outline"}
                              className={prompt.isActive ? 'bg-green-500' : 'text-gray-500'}
                            >
                              {prompt.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleTogglePromptActive(prompt)}
                            >
                              {prompt.isActive ? <X size={16} /> : <Check size={16} />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeletePrompt(prompt.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-sm">
                          {prompt.description || 'No description provided'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex justify-between">
                            <span>Framework:</span>
                            <span className="font-medium">{prompt.framework}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Version:</span>
                            <span className="font-medium">{prompt.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Usage Count:</span>
                            <span className="font-medium">{prompt.usageCount}</span>
                          </div>
                          {prompt.rateLimit && (
                            <div className="flex justify-between">
                              <span>Rate Limit:</span>
                              <span className="font-medium">{prompt.rateLimit} per hour</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>API Key:</span>
                            <span className="font-medium font-mono">
                              {prompt.accessKey ? `${prompt.accessKey.substring(0, 8)}...` : 'None'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => {
                              setSelectedPrompt(prompt);
                              setAddEndpointDialogOpen(true);
                              setNewEndpoint({
                                ...newEndpoint,
                                environment: prompt.environment
                              });
                            }}
                          >
                            <Link size={14} className="mr-2" /> Create Endpoint
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="endpoints">
            {endpoints.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium">No API endpoints available</h3>
                <p className="mt-2 max-w-md mx-auto">
                  Create endpoints for your prompts to make them accessible via API calls.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Method</TableHead>
                        <TableHead>Path</TableHead>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Auth</TableHead>
                        <TableHead>Rate Limit</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {endpoints.map((endpoint) => {
                        const prompt = getPromptById(endpoint.promptId);
                        return (
                          <TableRow key={endpoint.id}>
                            <TableCell>
                              <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                                {endpoint.method}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {endpoint.path}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{prompt?.name || 'Unknown'}</span>
                              {!prompt?.isActive && (
                                <Badge variant="outline" className="ml-2 text-yellow-500">
                                  Inactive
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {endpoint.requiresAuth ? (
                                <Badge variant="outline" className="border-green-200 text-green-700">
                                  Required
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                                  Public
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {endpoint.rateLimit ? `${endpoint.rateLimit}/hr` : 'None'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleOpenTestEndpoint(endpoint)}
                                >
                                  <Play size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteEndpoint(endpoint.id)}
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            {!usageData ? (
              <div className="text-center py-16 text-gray-500">
                <LineChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium">No usage data available</h3>
                <p className="mt-2 max-w-md mx-auto">
                  API usage statistics will appear here once your endpoints receive traffic.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Total API Calls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{usageData.stats.totalCalls}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Avg Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Math.round(usageData.stats.avgResponseTime)}ms</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(usageData.stats.errorRate * 100).toFixed(1)}%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">API Usage Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageData.chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={usageData.chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="calls" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No timeline data available yet
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent API Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageData.stats.recentCalls.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Response Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usageData.stats.recentCalls.map((call: any) => {
                            const endpoint = endpoints.find(e => e.id === call.endpointId);
                            return (
                              <TableRow key={call.id}>
                                <TableCell>
                                  {new Date(call.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  {endpoint ? `${endpoint.method} ${endpoint.path}` : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={call.statusCode < 400 ? 'default' : 'destructive'}>
                                    {call.statusCode}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {call.responseTime}ms
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No recent API calls recorded
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            promptOpsService.resetAllData();
            setPrompts([]);
            setEndpoints([]);
            setUsageData(null);
            toast({
              title: "Data Reset",
              description: "All PromptOps data has been cleared",
            });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Reset Data
        </Button>
        
        <Button onClick={loadData}>
          Refresh Data
        </Button>
      </CardFooter>
      
      {/* Add Prompt Dialog */}
      <Dialog open={addPromptDialogOpen} onOpenChange={setAddPromptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>
              Create a new prompt to be served via API endpoints
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newPrompt.name}
                onChange={(e) => setNewPrompt({...newPrompt, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newPrompt.description}
                onChange={(e) => setNewPrompt({...newPrompt, description: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Prompt
              </Label>
              <Input
                id="content"
                value={newPrompt.content}
                onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="framework" className="text-right">
                Framework
              </Label>
              <Select
                value={newPrompt.framework}
                onValueChange={(value) => setNewPrompt({...newPrompt, framework: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="environment" className="text-right">
                Environment
              </Label>
              <Select
                value={newPrompt.environment}
                onValueChange={(value) => setNewPrompt({
                  ...newPrompt, 
                  environment: value as 'development' | 'staging' | 'production'
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isActive"
                  checked={newPrompt.isActive}
                  onCheckedChange={(checked) => setNewPrompt({...newPrompt, isActive: checked})}
                />
                <Label htmlFor="isActive">{newPrompt.isActive ? 'Yes' : 'No'}</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rateLimit" className="text-right">
                Rate Limit
              </Label>
              <Input
                id="rateLimit"
                type="number"
                placeholder="Requests per hour (optional)"
                value={newPrompt.rateLimit !== null ? newPrompt.rateLimit : ''}
                onChange={(e) => setNewPrompt({
                  ...newPrompt, 
                  rateLimit: e.target.value ? parseInt(e.target.value) : null
                })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPromptDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPrompt} 
              disabled={!newPrompt.name || !newPrompt.content}
            >
              Create Prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Endpoint Dialog */}
      <Dialog open={addEndpointDialogOpen} onOpenChange={setAddEndpointDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Endpoint</DialogTitle>
            <DialogDescription>
              {selectedPrompt && (
                <>Create an endpoint for <strong>{selectedPrompt.name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="path" className="text-right">
                Path
              </Label>
              <Input
                id="path"
                value={newEndpoint.path}
                onChange={(e) => setNewEndpoint({...newEndpoint, path: e.target.value})}
                placeholder="/api/prompts/custom"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Method
              </Label>
              <Select
                value={newEndpoint.method}
                onValueChange={(value) => setNewEndpoint({
                  ...newEndpoint, 
                  method: value as 'GET' | 'POST'
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requiresAuth" className="text-right">
                Auth Required
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="requiresAuth"
                  checked={newEndpoint.requiresAuth}
                  onCheckedChange={(checked) => setNewEndpoint({...newEndpoint, requiresAuth: checked})}
                />
                <Label htmlFor="requiresAuth">{newEndpoint.requiresAuth ? 'Yes' : 'No'}</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpointRateLimit" className="text-right">
                Rate Limit
              </Label>
              <Input
                id="endpointRateLimit"
                type="number"
                placeholder="Requests per hour (optional)"
                value={newEndpoint.rateLimit !== null ? newEndpoint.rateLimit : ''}
                onChange={(e) => setNewEndpoint({
                  ...newEndpoint, 
                  rateLimit: e.target.value ? parseInt(e.target.value) : null
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpointEnvironment" className="text-right">
                Environment
              </Label>
              <Select
                value={newEndpoint.environment}
                onValueChange={(value) => setNewEndpoint({
                  ...newEndpoint, 
                  environment: value as 'development' | 'staging' | 'production'
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEndpointDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEndpoint} 
              disabled={!newEndpoint.path}
            >
              Create Endpoint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Test Endpoint Dialog */}
      <Dialog open={testEndpointDialogOpen} onOpenChange={setTestEndpointDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play size={16} /> Test API Endpoint
            </DialogTitle>
            <DialogDescription>
              {selectedEndpoint && (
                <div className="font-mono text-xs mt-1">
                  {selectedEndpoint.method} {selectedEndpoint.path}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedEndpoint?.requiresAuth && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apiKey" className="text-right">
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  placeholder="API Key"
                  className="col-span-3 font-mono"
                />
              </div>
            )}
            
            {selectedEndpoint?.method === 'POST' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requestBody" className="text-right">
                  Body (JSON)
                </Label>
                <Input
                  id="requestBody"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder="{}"
                  className="col-span-3 font-mono"
                />
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-medium">Response</Label>
              <Badge variant={testResponse?.statusCode < 400 ? 'default' : 'destructive'}>
                {testResponse ? `Status: ${testResponse.statusCode}` : 'Not sent'}
              </Badge>
            </div>
            <div className="bg-gray-100 p-3 rounded-md font-mono text-xs h-32 overflow-auto">
              {testResponse ? (
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              ) : (
                <span className="text-gray-500">Click "Send Request" to test the endpoint</span>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestEndpointDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={handleTestEndpoint}
              disabled={testLoading || (selectedEndpoint?.requiresAuth && !testApiKey)}
            >
              {testLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PromptOpsSettings;
