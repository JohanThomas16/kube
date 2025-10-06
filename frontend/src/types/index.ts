export interface IssuanceResponse {
  status: 'issued' | 'already_issued';
  workerId: string;
  issuedAt: string;
  message: string;
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

export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
  loading: boolean;
}
