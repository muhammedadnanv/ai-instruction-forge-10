
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Play, ArrowRight, Trash2, Move, FileText, Settings, PlusCircle } from "lucide-react";

interface WorkflowNode {
  id: string;
  type: "input" | "prompt" | "output" | "condition" | "data";
  title: string;
  content: string;
  x: number;
  y: number;
  connections: string[];
}

const VisualWorkflowBuilder = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: "node-1",
      type: "input",
      title: "Input",
      content: "User query",
      x: 100,
      y: 100,
      connections: ["node-2"]
    },
    {
      id: "node-2",
      type: "prompt",
      title: "Main Prompt",
      content: "Analyze the following query: {{input}}",
      x: 300,
      y: 100,
      connections: ["node-3"]
    },
    {
      id: "node-3",
      type: "output",
      title: "Response",
      content: "",
      x: 500,
      y: 100,
      connections: []
    }
  ]);
  
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [selectedNode, setSelectedNode] = useState<string | null>("node-1");
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  
  const { toast } = useToast();

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };
  
  const handleDragStart = (nodeId: string, e: React.MouseEvent) => {
    setDraggingNode(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y
      });
    }
    e.stopPropagation();
  };
  
  const handleDrag = (e: React.MouseEvent) => {
    if (draggingNode) {
      const updatedNodes = nodes.map(node => {
        if (node.id === draggingNode) {
          return {
            ...node,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          };
        }
        return node;
      });
      setNodes(updatedNodes);
      e.preventDefault();
    }
  };
  
  const handleDragEnd = () => {
    setDraggingNode(null);
  };
  
  const updateNodeContent = (content: string) => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode) {
        return {
          ...node,
          content
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
  };
  
  const updateNodeTitle = (title: string) => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode) {
        return {
          ...node,
          title
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
  };
  
  const addNode = (type: WorkflowNode["type"]) => {
    const newNodeId = `node-${nodes.length + 1}`;
    
    let title = "New Node";
    let content = "";
    
    switch (type) {
      case "input":
        title = "Input";
        content = "User query";
        break;
      case "prompt":
        title = "Prompt";
        content = "Write your prompt here...";
        break;
      case "output":
        title = "Output";
        content = "";
        break;
      case "condition":
        title = "Condition";
        content = "if {{input}} contains 'hello' then node-3 else node-4";
        break;
      case "data":
        title = "Data";
        content = '{"key": "value"}';
        break;
    }
    
    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? lastNode.x + 200 : 100;
    const newY = lastNode ? lastNode.y : 100;
    
    const newNode: WorkflowNode = {
      id: newNodeId,
      type,
      title,
      content,
      x: newX,
      y: newY,
      connections: []
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNode(newNodeId);
    
    toast({
      title: "Node Added",
      description: `Added new ${type} node`
    });
  };
  
  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    
    // Don't delete if we only have one node
    if (nodes.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Workflow must have at least one node",
        variant: "destructive"
      });
      return;
    }
    
    // Remove node and any connections to it
    const updatedNodes = nodes
      .filter(node => node.id !== selectedNode)
      .map(node => ({
        ...node,
        connections: node.connections.filter(conn => conn !== selectedNode)
      }));
    
    setNodes(updatedNodes);
    setSelectedNode(updatedNodes[0].id);
    
    toast({
      title: "Node Deleted",
      description: "Node has been removed from the workflow"
    });
  };
  
  const runWorkflow = () => {
    setIsRunning(true);
    
    // Simulate workflow execution
    setTimeout(() => {
      // Update output nodes with mock responses
      const updatedNodes = nodes.map(node => {
        if (node.type === "output") {
          return {
            ...node,
            content: "This is a simulated response based on the workflow input and prompts."
          };
        }
        return node;
      });
      
      setNodes(updatedNodes);
      setIsRunning(false);
      
      toast({
        title: "Workflow Complete",
        description: "Workflow has been executed successfully"
      });
    }, 1500);
  };
  
  const saveWorkflow = () => {
    const savedWorkflows = JSON.parse(localStorage.getItem("savedWorkflows") || "[]");
    const timestamp = new Date().toISOString();
    
    const newWorkflow = {
      id: `workflow-${timestamp}`,
      name: workflowName,
      nodes,
      createdAt: timestamp
    };
    
    savedWorkflows.push(newWorkflow);
    localStorage.setItem("savedWorkflows", JSON.stringify(savedWorkflows));
    
    toast({
      title: "Workflow Saved",
      description: `"${workflowName}" has been saved successfully`
    });
  };
  
  const currentNode = selectedNode ? nodes.find(node => node.id === selectedNode) : null;

  const connectNodes = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === fromId) {
        // Check if connection already exists
        if (!node.connections.includes(toId)) {
          return {
            ...node,
            connections: [...node.connections, toId]
          };
        }
      }
      return node;
    });
    
    setNodes(updatedNodes);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="text-lg font-medium max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={saveWorkflow}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={runWorkflow}
            disabled={isRunning}
            className="flex items-center gap-1"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run Workflow"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="border border-gray-200 h-[500px] overflow-hidden">
            <CardContent className="p-4 h-full">
              <div 
                className="relative h-full bg-slate-50 rounded-md overflow-hidden"
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                {nodes.map(node => (
                  <div 
                    key={node.id}
                    className={`absolute p-3 rounded-md shadow-md w-48 cursor-pointer ${
                      node.id === selectedNode ? 'ring-2 ring-blue-500' : ''
                    } ${
                      {
                        'input': 'bg-green-50 border border-green-200',
                        'prompt': 'bg-blue-50 border border-blue-200',
                        'output': 'bg-purple-50 border border-purple-200',
                        'condition': 'bg-yellow-50 border border-yellow-200',
                        'data': 'bg-gray-50 border border-gray-200'
                      }[node.type]
                    }`}
                    style={{ 
                      left: `${node.x}px`, 
                      top: `${node.y}px` 
                    }}
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div 
                        className="cursor-move flex items-center"
                        onMouseDown={(e) => handleDragStart(node.id, e)}
                      >
                        <Move className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">{node.title}</span>
                      </div>
                      <div className="text-xs text-gray-500">{node.type}</div>
                    </div>
                    <div className="text-xs text-gray-600 truncate">{node.content}</div>
                    
                    {/* Connection arrow */}
                    {node.connections.map(connectionId => {
                      const targetNode = nodes.find(n => n.id === connectionId);
                      if (!targetNode) return null;
                      
                      // Calculate arrow coordinates
                      const startX = node.x + 190; // right side of node
                      const startY = node.y + 24; // middle height
                      const endX = targetNode.x;
                      const endY = targetNode.y + 24;
                      
                      // Simple straight line arrow
                      return (
                        <svg 
                          key={`${node.id}-${connectionId}`}
                          className="absolute top-0 left-0 pointer-events-none"
                          style={{ width: '100%', height: '100%' }}
                        >
                          <line
                            x1={startX}
                            y1={startY}
                            x2={endX}
                            y2={endY}
                            stroke="#94a3b8"
                            strokeWidth="2"
                            strokeDasharray="4"
                          />
                          <polygon 
                            points={`${endX},${endY} ${endX-8},${endY-4} ${endX-8},${endY+4}`}
                            fill="#94a3b8" 
                          />
                        </svg>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Add Node</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNode("input")}
                    className="h-8 text-xs bg-green-50 hover:bg-green-100"
                  >
                    Input
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNode("prompt")}
                    className="h-8 text-xs bg-blue-50 hover:bg-blue-100"
                  >
                    Prompt
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNode("output")}
                    className="h-8 text-xs bg-purple-50 hover:bg-purple-100"
                  >
                    Output
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNode("condition")}
                    className="h-8 text-xs bg-yellow-50 hover:bg-yellow-100"
                  >
                    Condition
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addNode("data")}
                    className="h-8 text-xs bg-gray-50 hover:bg-gray-100"
                  >
                    Data
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {currentNode && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Node Properties</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={deleteSelectedNode}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">Title</label>
                      <Input
                        value={currentNode.title}
                        onChange={(e) => updateNodeTitle(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium block mb-1">Content</label>
                      <Textarea
                        value={currentNode.content}
                        onChange={(e) => updateNodeContent(e.target.value)}
                        className="h-40 text-sm"
                        placeholder="Enter node content..."
                      />
                    </div>
                    
                    {currentNode.type !== 'output' && (
                      <div>
                        <label className="text-sm font-medium block mb-1">Connect To</label>
                        <ScrollArea className="h-[100px]">
                          <div className="space-y-2">
                            {nodes
                              .filter(node => node.id !== currentNode.id)
                              .map(node => (
                                <div 
                                  key={node.id}
                                  className="flex items-center"
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => connectNodes(currentNode.id, node.id)}
                                    className="text-xs justify-start w-full h-7"
                                  >
                                    {currentNode.connections.includes(node.id) ? (
                                      <ArrowRight className="h-3 w-3 mr-1 text-green-500" />
                                    ) : (
                                      <Plus className="h-3 w-3 mr-1" />
                                    )}
                                    {node.title} ({node.type})
                                  </Button>
                                </div>
                              ))
                            }
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualWorkflowBuilder;
