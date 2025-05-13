
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, User, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import securityService, { User as SecurityUser, AuditLog } from "@/services/securityService";

const SecuritySettings = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<SecurityUser | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  useEffect(() => {
    // Load current security state
    const user = securityService.getCurrentUser();
    setCurrentUser(user);
    refreshLogs();
  }, []);
  
  const refreshLogs = () => {
    const logs = securityService.getAuditLogs();
    setAuditLogs(logs);
  };
  
  const handleRoleChange = (role: string) => {
    const validRole = role as 'admin' | 'developer' | 'viewer';
    const newUser = securityService.createMockUser(validRole);
    securityService.setCurrentUser(newUser);
    setCurrentUser(newUser);
    
    toast({
      title: "Role Changed",
      description: `You're now acting as ${newUser.name}`,
    });
    
    // Log this action
    securityService.logAction(
      "role_change", 
      "user", 
      newUser.id, 
      { newRole: validRole }
    );
    
    refreshLogs();
  };
  
  const getPermissionBadgeVariant = (permission: string) => {
    if (permission.startsWith('create:')) return 'default';
    if (permission.startsWith('read:')) return 'secondary';
    if (permission.startsWith('update:')) return 'outline';
    if (permission.startsWith('delete:')) return 'destructive';
    if (permission.startsWith('deploy:')) return 'warning';
    return 'outline';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> Security & Access Control
        </CardTitle>
        <CardDescription>
          Manage role-based access control and view audit logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="roles">
          <TabsList className="mb-4">
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Current Role</h3>
                <div className="flex gap-4 items-center">
                  <Select 
                    value={currentUser?.role || 'viewer'} 
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">View Permissions</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Role Permissions</DialogTitle>
                        <DialogDescription>
                          Permissions for {currentUser?.role || 'selected'} role
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="flex flex-wrap gap-2 py-4">
                        {currentUser?.permissions.map((permission) => (
                          <Badge 
                            key={permission} 
                            variant={getPermissionBadgeVariant(permission) as any}
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" type="button">
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-sm font-medium mb-2">Role Access Overview</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Developer</TableHead>
                      <TableHead>Viewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Create Prompts</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>❌</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Read Prompts</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>✅</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Update Prompts</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>❌</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Delete Prompts</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>❌</TableCell>
                      <TableCell>❌</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Deploy Prompts</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>❌</TableCell>
                      <TableCell>❌</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>View Logs</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>✅</TableCell>
                      <TableCell>❌</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Recent Activity</h3>
                <Button variant="outline" size="sm" onClick={refreshLogs}>
                  Refresh Logs
                </Button>
              </div>
              
              <ScrollArea className="h-[300px]">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-8 w-8 opacity-50 mb-2" />
                    <p>No audit logs yet</p>
                    <p className="text-xs">Activity will be recorded here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-gray-500" />
                              <span>User {log.userId.substring(0, 8)}...</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.resourceType}:{log.resourceId.substring(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          securityService.clearAllData();
          setCurrentUser(null);
          setAuditLogs([]);
          toast({
            title: "Security Data Cleared",
            description: "All role and audit data has been reset",
          });
        }}>
          Reset Data
        </Button>
        
        <Button onClick={() => {
          const action = "view_security_settings";
          const resourceType = "security";
          const resourceId = "settings";
          securityService.logAction(action, resourceType, resourceId);
          refreshLogs();
          toast({
            title: "Action Logged",
            description: "Security settings view has been recorded",
          });
        }}>
          Log Current View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SecuritySettings;
