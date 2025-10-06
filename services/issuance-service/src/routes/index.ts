import { Router, Request, Response } from 'express';
import { CredentialDatabase } from '../database';
import { IssuanceRequest, IssuanceResponse, ErrorResponse, HealthResponse } from '../types';

export function createRoutes(database: CredentialDatabase): Router {
  const router = Router();
  const workerId = process.env['WORKER_ID'] || `worker-${Math.random().toString(36).substr(2, 9)}`;

  // Health check endpoint
  router.get('/', (_req: Request, res: Response<HealthResponse>) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      workerId
    });
  });

  router.get('/health', (_req: Request, res: Response<HealthResponse>) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      workerId
    });
  });

  // Issue credential endpoint
  router.post('/issue', (req: Request<{}, IssuanceResponse | ErrorResponse, IssuanceRequest>, res: Response<IssuanceResponse | ErrorResponse>) => {
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Request body must be a valid JSON object'
        });
      }

      // Convert credential to canonical JSON string for consistent storage
      const credentialContent = JSON.stringify(req.body, Object.keys(req.body).sort());

      // Check if credential already exists
      const existingCredential = database.getCredentialByContent(credentialContent);
      
      if (existingCredential) {
        return res.status(200).json({
          status: 'already_issued',
          workerId: existingCredential.workerId,
          issuedAt: existingCredential.issuedAt,
          message: `credential already issued by ${existingCredential.workerId}`
        });
      }

      // Insert new credential
      const newCredential = database.insertCredential(credentialContent, workerId);

      return res.status(201).json({
        status: 'issued',
        workerId: newCredential.workerId,
        issuedAt: newCredential.issuedAt,
        message: `credential issued by ${newCredential.workerId}`
      });

    } catch (error: unknown) {
      console.error('Error processing credential issuance:', error);
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing the credential'
      });
    }
  });

  // Get all credentials (for debugging/admin purposes)
  router.get('/credentials', (_req: Request, res: Response) => {
    try {
      const credentials = database.getAllCredentials();
      res.json({
        credentials,
        count: credentials.length,
        workerId
      });
    } catch (error: unknown) {
      console.error('Error retrieving credentials:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while retrieving credentials'
      });
    }
  });

  return router;
}
