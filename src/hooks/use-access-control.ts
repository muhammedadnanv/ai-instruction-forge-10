
import { useState, useEffect, useCallback } from 'react';
import accessCodeService from '@/services/accessCodeService';
import { useToast } from '@/hooks/use-toast';

export function useAccessControl() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAccessCode, setUserAccessCode] = useState<string | null>(null);
  const { toast } = useToast();

  // Check access status on mount
  useEffect(() => {
    checkAccessStatus();
  }, []);

  const checkAccessStatus = useCallback(() => {
    try {
      const hasValidAccess = accessCodeService.hasValidAccess();
      const accessCode = accessCodeService.getUserAccessCode();
      
      setHasAccess(hasValidAccess);
      setUserAccessCode(accessCode);
    } catch (error) {
      console.error("Error checking access status:", error);
      setHasAccess(false);
      setUserAccessCode(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateCode = useCallback(async (code: string) => {
    try {
      const isValid = accessCodeService.validateAccessCode(code);
      
      if (isValid) {
        setHasAccess(true);
        setUserAccessCode(code);
        
        toast({
          title: "Access Granted",
          description: "Welcome! You now have access to the platform.",
        });
        
        return true;
      } else {
        toast({
          title: "Invalid Code",
          description: "The access code you entered is invalid or expired.",
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      console.error("Error validating code:", error);
      toast({
        title: "Validation Error",
        description: "Failed to validate access code. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [toast]);

  const grantAccess = useCallback((paymentId: string, email?: string) => {
    try {
      const accessCode = accessCodeService.storeAccessCode(paymentId, email);
      setHasAccess(true);
      setUserAccessCode(accessCode);
      
      return accessCode;
    } catch (error) {
      console.error("Error granting access:", error);
      return null;
    }
  }, []);

  const revokeAccess = useCallback(() => {
    try {
      accessCodeService.clearAccess();
      setHasAccess(false);
      setUserAccessCode(null);
      
      toast({
        title: "Access Revoked",
        description: "You have been logged out.",
      });
    } catch (error) {
      console.error("Error revoking access:", error);
    }
  }, [toast]);

  return {
    hasAccess,
    isLoading,
    userAccessCode,
    validateCode,
    grantAccess,
    revokeAccess,
    checkAccessStatus,
  };
}
