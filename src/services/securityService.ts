// Security service for role-based access control and auditing

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer';
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details: Record<string, any>;
}

class SecurityService {
  private currentUser: User | null = null;
  private auditLogs: AuditLog[] = [];
  
  constructor() {
    // Try to load user from localStorage
    this.loadUserFromStorage();
    this.loadAuditLogsFromStorage();
  }
  
  private loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('current_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  }
  
  private loadAuditLogsFromStorage() {
    try {
      const logsData = localStorage.getItem('audit_logs');
      if (logsData) {
        this.auditLogs = JSON.parse(logsData);
      }
    } catch (error) {
      console.error('Failed to load audit logs from storage:', error);
    }
  }
  
  saveToStorage() {
    if (this.currentUser) {
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));
    }
    localStorage.setItem('audit_logs', JSON.stringify(this.auditLogs));
  }
  
  setCurrentUser(user: User) {
    this.currentUser = user;
    this.saveToStorage();
  }
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    
    // Admins have all permissions
    if (this.currentUser.role === 'admin') return true;
    
    return this.currentUser.permissions.includes(permission);
  }
  
  logAction(action: string, resourceType: string, resourceId: string, details: Record<string, any> = {}) {
    if (!this.currentUser) {
      console.warn('Attempted to log action without a current user');
      return;
    }
    
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentUser.id,
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.auditLogs.unshift(log); // Add to beginning for chronological order
    
    // Keep logs to a reasonable size in localStorage
    if (this.auditLogs.length > 100) {
      this.auditLogs = this.auditLogs.slice(0, 100);
    }
    
    this.saveToStorage();
    return log;
  }
  
  getAuditLogs(filters: Partial<{
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    startDate: string;
    endDate: string;
  }> = {}): AuditLog[] {
    return this.auditLogs.filter(log => {
      let match = true;
      
      if (filters.userId && log.userId !== filters.userId) match = false;
      if (filters.action && log.action !== filters.action) match = false;
      if (filters.resourceType && log.resourceType !== filters.resourceType) match = false;
      if (filters.resourceId && log.resourceId !== filters.resourceId) match = false;
      
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) match = false;
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) match = false;
      
      return match;
    });
  }
  
  // For demo purposes - create a mock user
  createMockUser(role: 'admin' | 'developer' | 'viewer'): User {
    const permissions = {
      admin: ['create:prompt', 'read:prompt', 'update:prompt', 'delete:prompt', 'deploy:prompt', 'read:logs'],
      developer: ['create:prompt', 'read:prompt', 'update:prompt', 'read:logs'],
      viewer: ['read:prompt']
    };
    
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      role,
      permissions: permissions[role]
    };
    
    return user;
  }
  
  clearAllData() {
    this.currentUser = null;
    this.auditLogs = [];
    localStorage.removeItem('current_user');
    localStorage.removeItem('audit_logs');
  }
}

// Create and export singleton instance
const securityService = new SecurityService();
export default securityService;
