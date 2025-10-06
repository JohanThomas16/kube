export interface Credential {
  id?: number;
  content: string;
  workerId: string;
  issuedAt: string;
}

export interface VerificationRequest {
  [key: string]: unknown;
}

export interface VerificationResponse {
  valid: boolean;
  workerId?: string;
  issuedAt?: string;
  message?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface HealthResponse {
  status: 'healthy';
  timestamp: string;
  workerId: string;
}
