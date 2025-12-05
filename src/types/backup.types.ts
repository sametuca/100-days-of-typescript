export interface BackupConfig {
  dbPath: string;
  backupDir: string;
  maxBackups: number;
  schedule?: string;
  compression: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  size: number;
  compressed: boolean;
  checksum: string;
}

export interface BackupStatus {
  totalBackups: number;
  latestBackup: BackupMetadata | null;
  scheduledBackupsActive: boolean;
}

export interface BackupResponse {
  success: boolean;
  message?: string;
  data?: BackupMetadata | BackupMetadata[] | BackupStatus;
  error?: string;
}

export interface BackupVerificationResult {
  backupId: string;
  isValid: boolean;
  message: string;
}