/**
 * 2FA Types - Frontend preparation
 * NOT YET IMPLEMENTED - Types for future use
 */

export interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}
