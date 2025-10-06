export interface Credential {
  id?: number;
  content: string;
  workerId: string;
  issuedAt: string;
}

export interface IssuanceRequest {
  [key: string]: unknown;
}

export interface IssuanceResponse {
  status: 'issued' | 'already_issued';
  workerId: string;
  issuedAt: string;
  message: string;
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
