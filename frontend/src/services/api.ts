import { IssuanceResponse, VerificationResponse, ErrorResponse } from '../types';

const ISSUANCE_API_URL = import.meta.env.VITE_ISSUANCE_API_URL || 'http://localhost:3001';
const VERIFICATION_API_URL = import.meta.env.VITE_VERIFICATION_API_URL || 'http://localhost:3002';

class ApiError extends Error {
  constructor(public status: number, public response: ErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(url: string, options: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data as ErrorResponse);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(0, {
      error: 'Network Error',
      message: error instanceof Error ? error.message : 'Failed to connect to server'
    });
  }
}

export const apiService = {
  async issueCredential(credential: Record<string, unknown>): Promise<IssuanceResponse> {
    return makeRequest<IssuanceResponse>(`${ISSUANCE_API_URL}/issue`, {
      method: 'POST',
      body: JSON.stringify(credential),
    });
  },

  async verifyCredential(credential: Record<string, unknown>): Promise<VerificationResponse> {
    return makeRequest<VerificationResponse>(`${VERIFICATION_API_URL}/verify`, {
      method: 'POST',
      body: JSON.stringify(credential),
    });
  },

  async healthCheck(service: 'issuance' | 'verification'): Promise<{ status: string; workerId: string; timestamp: string }> {
    const url = service === 'issuance' ? `${ISSUANCE_API_URL}/health` : `${VERIFICATION_API_URL}/health`;
    return makeRequest(url, { method: 'GET' });
  }
};
