
/**
 * Access Code Service
 * Manages access code generation, validation, and storage
 */

export interface AccessCode {
  code: string;
  userId?: string;
  email?: string;
  generatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  paymentId?: string;
}

// Access code storage keys
const STORAGE_KEYS = {
  ACCESS_CODES: 'access_codes',
  USER_ACCESS_CODE: 'user_access_code',
  CODE_VERIFIED: 'code_verified'
};

class AccessCodeService {
  /**
   * Generate a unique access code
   */
  generateAccessCode(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `AC-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Store access code after successful payment
   */
  storeAccessCode(paymentId: string, email?: string, userId?: string): string {
    const code = this.generateAccessCode();
    const accessCode: AccessCode = {
      code,
      userId,
      email,
      generatedAt: new Date().toISOString(),
      isActive: true,
      paymentId
    };

    // Store in localStorage (in production, this would be stored securely on backend)
    const existingCodes = this.getAllAccessCodes();
    existingCodes.push(accessCode);
    localStorage.setItem(STORAGE_KEYS.ACCESS_CODES, JSON.stringify(existingCodes));

    // Store user's current access code
    localStorage.setItem(STORAGE_KEYS.USER_ACCESS_CODE, code);
    localStorage.setItem(STORAGE_KEYS.CODE_VERIFIED, 'true');

    return code;
  }

  /**
   * Validate access code
   */
  validateAccessCode(code: string): boolean {
    const accessCodes = this.getAllAccessCodes();
    const accessCode = accessCodes.find(ac => ac.code === code && ac.isActive);
    
    if (accessCode) {
      // Store as verified
      localStorage.setItem(STORAGE_KEYS.USER_ACCESS_CODE, code);
      localStorage.setItem(STORAGE_KEYS.CODE_VERIFIED, 'true');
      return true;
    }
    
    return false;
  }

  /**
   * Check if user has valid access
   */
  hasValidAccess(): boolean {
    const isVerified = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIED) === 'true';
    const userCode = localStorage.getItem(STORAGE_KEYS.USER_ACCESS_CODE);
    
    if (!isVerified || !userCode) {
      return false;
    }

    // Validate the stored code is still active
    const accessCodes = this.getAllAccessCodes();
    const accessCode = accessCodes.find(ac => ac.code === userCode && ac.isActive);
    
    return !!accessCode;
  }

  /**
   * Get user's current access code
   */
  getUserAccessCode(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ACCESS_CODE);
  }

  /**
   * Get all access codes (for admin purposes)
   */
  private getAllAccessCodes(): AccessCode[] {
    try {
      const codes = localStorage.getItem(STORAGE_KEYS.ACCESS_CODES);
      return codes ? JSON.parse(codes) : [];
    } catch {
      return [];
    }
  }

  /**
   * Deactivate access code
   */
  deactivateAccessCode(code: string): boolean {
    const accessCodes = this.getAllAccessCodes();
    const codeIndex = accessCodes.findIndex(ac => ac.code === code);
    
    if (codeIndex !== -1) {
      accessCodes[codeIndex].isActive = false;
      localStorage.setItem(STORAGE_KEYS.ACCESS_CODES, JSON.stringify(accessCodes));
      return true;
    }
    
    return false;
  }

  /**
   * Clear access (logout)
   */
  clearAccess(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_ACCESS_CODE);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIED);
  }

  /**
   * Clear all data (for testing)
   */
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
const accessCodeService = new AccessCodeService();
export default accessCodeService;
