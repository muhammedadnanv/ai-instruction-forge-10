
// PromptOps service for managing and serving prompts via API endpoints

import securityService from "./securityService";

export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  framework: string;
  version: number;
  environment: 'development' | 'staging' | 'production';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  accessKey?: string;
  usageCount: number;
  rateLimit: number | null; // null means no rate limit
}

export interface ApiEndpoint {
  id: string;
  promptId: string;
  path: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  rateLimit: number | null;
  environment: 'development' | 'staging' | 'production';
  createdAt: string;
}

export interface ApiUsage {
  id: string;
  endpointId: string;
  timestamp: string;
  userId: string | null;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
}

class PromptOpsService {
  private prompts: Prompt[] = [];
  private endpoints: ApiEndpoint[] = [];
  private apiUsage: ApiUsage[] = [];
  private currentEnvironment: 'development' | 'staging' | 'production' = 'development';
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage() {
    try {
      const promptsData = localStorage.getItem('prompts_data');
      if (promptsData) {
        this.prompts = JSON.parse(promptsData);
      }
      
      const endpointsData = localStorage.getItem('api_endpoints');
      if (endpointsData) {
        this.endpoints = JSON.parse(endpointsData);
      }
      
      const apiUsageData = localStorage.getItem('api_usage');
      if (apiUsageData) {
        this.apiUsage = JSON.parse(apiUsageData);
      }
      
      const env = localStorage.getItem('current_environment');
      if (env) {
        this.currentEnvironment = env as 'development' | 'staging' | 'production';
      }
    } catch (error) {
      console.error('Failed to load PromptOps data from storage:', error);
    }
  }
  
  private saveToStorage() {
    localStorage.setItem('prompts_data', JSON.stringify(this.prompts));
    localStorage.setItem('api_endpoints', JSON.stringify(this.endpoints));
    localStorage.setItem('api_usage', JSON.stringify(this.apiUsage));
    localStorage.setItem('current_environment', this.currentEnvironment);
  }
  
  // Get current environment
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }
  
  // Set current environment
  setCurrentEnvironment(env: 'development' | 'staging' | 'production') {
    this.currentEnvironment = env;
    this.saveToStorage();
    
    // Log the action
    securityService.logAction(
      'environment_change',
      'environment',
      env,
      { previousEnvironment: this.currentEnvironment }
    );
    
    return this.currentEnvironment;
  }
  
  // Create a new prompt
  createPrompt(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount' | 'createdBy'>): Prompt {
    // Check if the user has permission to create prompts
    if (!securityService.hasPermission('create:prompt')) {
      throw new Error('Permission denied: You do not have permission to create prompts');
    }
    
    const currentUser = securityService.getCurrentUser();
    
    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser ? currentUser.id : 'anonymous',
      usageCount: 0,
      ...promptData
    };
    
    this.prompts.push(newPrompt);
    this.saveToStorage();
    
    // Log the action
    securityService.logAction(
      'create_prompt',
      'prompt',
      newPrompt.id,
      { promptName: newPrompt.name, environment: newPrompt.environment }
    );
    
    return newPrompt;
  }
  
  // Get all prompts (filtered by environment if specified)
  getPrompts(environment?: 'development' | 'staging' | 'production'): Prompt[] {
    // Check if the user has permission to read prompts
    if (!securityService.hasPermission('read:prompt')) {
      throw new Error('Permission denied: You do not have permission to read prompts');
    }
    
    if (environment) {
      return this.prompts.filter(prompt => prompt.environment === environment);
    }
    
    return [...this.prompts];
  }
  
  // Get a specific prompt by ID
  getPromptById(promptId: string): Prompt | undefined {
    // Check if the user has permission to read prompts
    if (!securityService.hasPermission('read:prompt')) {
      throw new Error('Permission denied: You do not have permission to read prompts');
    }
    
    return this.prompts.find(prompt => prompt.id === promptId);
  }
  
  // Update an existing prompt
  updatePrompt(promptId: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'version' | 'createdBy'>>): Prompt {
    // Check if the user has permission to update prompts
    if (!securityService.hasPermission('update:prompt')) {
      throw new Error('Permission denied: You do not have permission to update prompts');
    }
    
    const promptIndex = this.prompts.findIndex(p => p.id === promptId);
    if (promptIndex === -1) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    
    const oldPrompt = { ...this.prompts[promptIndex] };
    
    // Update the prompt
    this.prompts[promptIndex] = {
      ...this.prompts[promptIndex],
      ...updates,
      version: this.prompts[promptIndex].version + 1,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    
    // Log the action
    securityService.logAction(
      'update_prompt',
      'prompt',
      promptId,
      { 
        promptName: this.prompts[promptIndex].name, 
        environment: this.prompts[promptIndex].environment,
        oldVersion: oldPrompt.version,
        newVersion: this.prompts[promptIndex].version
      }
    );
    
    return this.prompts[promptIndex];
  }
  
  // Delete a prompt
  deletePrompt(promptId: string): boolean {
    // Check if the user has permission to delete prompts
    if (!securityService.hasPermission('delete:prompt')) {
      throw new Error('Permission denied: You do not have permission to delete prompts');
    }
    
    const promptIndex = this.prompts.findIndex(p => p.id === promptId);
    if (promptIndex === -1) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    
    const deletedPrompt = this.prompts[promptIndex];
    this.prompts.splice(promptIndex, 1);
    
    // Also delete related endpoints
    this.endpoints = this.endpoints.filter(endpoint => endpoint.promptId !== promptId);
    
    this.saveToStorage();
    
    // Log the action
    securityService.logAction(
      'delete_prompt',
      'prompt',
      promptId,
      { promptName: deletedPrompt.name, environment: deletedPrompt.environment }
    );
    
    return true;
  }
  
  // Create API endpoint for a prompt
  createEndpoint(promptId: string, endpointData: Omit<ApiEndpoint, 'id' | 'promptId' | 'createdAt'>): ApiEndpoint {
    // Check if the user has permission to deploy prompts
    if (!securityService.hasPermission('deploy:prompt')) {
      throw new Error('Permission denied: You do not have permission to create API endpoints');
    }
    
    // Check if prompt exists
    const prompt = this.getPromptById(promptId);
    if (!prompt) {
      throw new Error(`Prompt with ID ${promptId} not found`);
    }
    
    // Check if path already exists
    const existingEndpoint = this.endpoints.find(e => 
      e.path === endpointData.path && 
      e.method === endpointData.method &&
      e.environment === endpointData.environment
    );
    
    if (existingEndpoint) {
      throw new Error(`Endpoint with path ${endpointData.path} and method ${endpointData.method} already exists in ${endpointData.environment} environment`);
    }
    
    const newEndpoint: ApiEndpoint = {
      id: `endpoint-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      promptId,
      createdAt: new Date().toISOString(),
      ...endpointData
    };
    
    this.endpoints.push(newEndpoint);
    this.saveToStorage();
    
    // Log the action
    securityService.logAction(
      'create_endpoint',
      'endpoint',
      newEndpoint.id,
      { 
        path: newEndpoint.path, 
        method: newEndpoint.method,
        promptId,
        environment: newEndpoint.environment
      }
    );
    
    return newEndpoint;
  }
  
  // Get all endpoints for a specific environment
  getEndpoints(environment?: 'development' | 'staging' | 'production'): ApiEndpoint[] {
    // Check if the user has permission to read endpoints
    if (!securityService.hasPermission('read:prompt')) {
      throw new Error('Permission denied: You do not have permission to read API endpoints');
    }
    
    if (environment) {
      return this.endpoints.filter(endpoint => endpoint.environment === environment);
    }
    
    return [...this.endpoints];
  }
  
  // Get all endpoints for a specific prompt
  getEndpointsByPromptId(promptId: string): ApiEndpoint[] {
    // Check if the user has permission to read endpoints
    if (!securityService.hasPermission('read:prompt')) {
      throw new Error('Permission denied: You do not have permission to read API endpoints');
    }
    
    return this.endpoints.filter(endpoint => endpoint.promptId === promptId);
  }
  
  // Delete an endpoint
  deleteEndpoint(endpointId: string): boolean {
    // Check if the user has permission to delete endpoints
    if (!securityService.hasPermission('deploy:prompt')) {
      throw new Error('Permission denied: You do not have permission to delete API endpoints');
    }
    
    const endpointIndex = this.endpoints.findIndex(e => e.id === endpointId);
    if (endpointIndex === -1) {
      throw new Error(`Endpoint with ID ${endpointId} not found`);
    }
    
    const deletedEndpoint = this.endpoints[endpointIndex];
    this.endpoints.splice(endpointIndex, 1);
    
    this.saveToStorage();
    
    // Log the action
    securityService.logAction(
      'delete_endpoint',
      'endpoint',
      endpointId,
      { 
        path: deletedEndpoint.path, 
        method: deletedEndpoint.method,
        promptId: deletedEndpoint.promptId,
        environment: deletedEndpoint.environment
      }
    );
    
    return true;
  }
  
  // Simulate an API call to an endpoint
  callEndpoint(path: string, method: 'GET' | 'POST', body?: any, apiKey?: string): { statusCode: number, data?: any, error?: string } {
    // Find the endpoint
    const endpoint = this.endpoints.find(e => 
      e.path === path && 
      e.method === method &&
      e.environment === this.currentEnvironment
    );
    
    if (!endpoint) {
      return { statusCode: 404, error: `Endpoint ${method} ${path} not found in ${this.currentEnvironment} environment` };
    }
    
    // Find the prompt
    const prompt = this.getPromptById(endpoint.promptId);
    if (!prompt) {
      return { statusCode: 500, error: `Prompt not found for endpoint` };
    }
    
    // Check if the prompt is active
    if (!prompt.isActive) {
      return { statusCode: 403, error: `This prompt is inactive` };
    }
    
    // Check authentication if required
    if (endpoint.requiresAuth) {
      if (!apiKey || prompt.accessKey !== apiKey) {
        return { statusCode: 401, error: 'Unauthorized: Invalid or missing API key' };
      }
    }
    
    // Check rate limiting
    if (endpoint.rateLimit) {
      const recentCalls = this.apiUsage
        .filter(usage => usage.endpointId === endpoint.id)
        .filter(usage => {
          const callTime = new Date(usage.timestamp).getTime();
          const now = Date.now();
          // Check calls within the last hour
          return (now - callTime) < 3600000;
        });
      
      if (recentCalls.length >= endpoint.rateLimit) {
        return { statusCode: 429, error: 'Too many requests: Rate limit exceeded' };
      }
    }
    
    // Record the API call
    const apiCall: ApiUsage = {
      id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      endpointId: endpoint.id,
      timestamp: new Date().toISOString(),
      userId: null, // In a real system, this would be the authenticated user
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 100) + 50, // Simulated response time between 50-150ms
      ipAddress: '127.0.0.1' // In a real system, this would be the client IP
    };
    
    this.apiUsage.push(apiCall);
    
    // Update usage count for the prompt
    const promptIndex = this.prompts.findIndex(p => p.id === prompt.id);
    if (promptIndex !== -1) {
      this.prompts[promptIndex].usageCount += 1;
    }
    
    this.saveToStorage();
    
    // Log the action for auditing
    securityService.logAction(
      'api_call',
      'endpoint',
      endpoint.id,
      { 
        path: endpoint.path, 
        method: endpoint.method,
        statusCode: 200,
        responseTime: apiCall.responseTime
      }
    );
    
    // Return the prompt content as the response
    return {
      statusCode: 200,
      data: {
        id: prompt.id,
        name: prompt.name,
        content: prompt.content,
        framework: prompt.framework,
        version: prompt.version
      }
    };
  }
  
  // Get API usage statistics
  getApiUsageStats(filters: { promptId?: string, endpointId?: string, startDate?: string, endDate?: string } = {}) {
    // Check if the user has permission to view logs
    if (!securityService.hasPermission('read:logs')) {
      throw new Error('Permission denied: You do not have permission to view API usage statistics');
    }
    
    let filteredUsage = [...this.apiUsage];
    
    if (filters.endpointId) {
      filteredUsage = filteredUsage.filter(usage => usage.endpointId === filters.endpointId);
    }
    
    if (filters.promptId) {
      const endpointIds = this.endpoints
        .filter(endpoint => endpoint.promptId === filters.promptId)
        .map(endpoint => endpoint.id);
      
      filteredUsage = filteredUsage.filter(usage => endpointIds.includes(usage.endpointId));
    }
    
    if (filters.startDate) {
      const startTimestamp = new Date(filters.startDate).getTime();
      filteredUsage = filteredUsage.filter(usage => new Date(usage.timestamp).getTime() >= startTimestamp);
    }
    
    if (filters.endDate) {
      const endTimestamp = new Date(filters.endDate).getTime();
      filteredUsage = filteredUsage.filter(usage => new Date(usage.timestamp).getTime() <= endTimestamp);
    }
    
    // Group by day
    const usageByDay = filteredUsage.reduce((acc, usage) => {
      const date = new Date(usage.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate total calls, average response time, etc.
    const totalCalls = filteredUsage.length;
    const avgResponseTime = totalCalls > 0
      ? filteredUsage.reduce((sum, usage) => sum + usage.responseTime, 0) / totalCalls
      : 0;
    
    const errorCalls = filteredUsage.filter(usage => usage.statusCode >= 400).length;
    
    return {
      totalCalls,
      avgResponseTime,
      errorRate: totalCalls > 0 ? errorCalls / totalCalls : 0,
      usageByDay,
      recentCalls: filteredUsage.slice(-10) // Last 10 calls
    };
  }
  
  // Generate a mock API key for demo purposes
  generateApiKey(): string {
    return `po_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }
  
  // Reset all data (for demo purposes)
  resetAllData() {
    this.prompts = [];
    this.endpoints = [];
    this.apiUsage = [];
    this.currentEnvironment = 'development';
    this.saveToStorage();
  }
}

const promptOpsService = new PromptOpsService();
export default promptOpsService;
