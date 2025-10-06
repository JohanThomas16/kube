import { Router, Request, Response } from 'express';
import { CredentialDatabase } from '../database';
import { VerificationRequest, VerificationResponse, ErrorResponse, HealthResponse } from '../types';

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

  // Verify credential endpoint
  router.post('/verify', async (req: Request<{}, VerificationResponse | ErrorResponse, VerificationRequest>, res: Response<VerificationResponse | ErrorResponse>) => {
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Request body must be a valid JSON object'
        });
      }

      // Convert credential to canonical JSON string for consistent lookup
      const credentialContent = JSON.stringify(req.body, Object.keys(req.body).sort());

      // Look up credential in database
      let existingCredential = database.getCredentialByContent(credentialContent);

      // If not found locally, try to check with issuance service
      if (!existingCredential) {
        try {
          const issuanceUrl = 'http://localhost:3001';
          const response = await fetch(`${issuanceUrl}/issue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
          });

          if (response.ok) {
            const issuanceResult = await response.json() as any;
            // If it was already issued, sync it to our database
            if (issuanceResult.status === 'already_issued') {
              database.insertCredential(credentialContent, issuanceResult.workerId);
              existingCredential = database.getCredentialByContent(credentialContent);
            }
          }
        } catch (fetchError) {
          console.log('Could not sync with issuance service:', fetchError);
          // Continue with local verification only
        }
      }

      if (existingCredential) {
        return res.status(200).json({
          valid: true,
          workerId: existingCredential.workerId,
          issuedAt: existingCredential.issuedAt,
          message: `credential verified - originally issued by ${existingCredential.workerId}`
        });
      } else {
        return res.status(404).json({
          valid: false,
          message: 'credential not found or not issued'
        });
      }

    } catch (error: unknown) {
      console.error('Error processing credential verification:', error);
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while verifying the credential'
      });
    }
  });

  // Sync credential from issuance service (for demo purposes)
  router.post('/sync', (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Request body must contain credential data'
        });
      }

      const { content, workerId: issuerWorkerId, issuedAt } = req.body as { content: string; workerId: string; issuedAt: string };

      if (!content || !issuerWorkerId || !issuedAt) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: content, workerId, issuedAt'
        });
      }

      // Insert credential for verification purposes
      database.insertCredential(content, issuerWorkerId);

      return res.status(200).json({
        message: 'Credential synced successfully',
        workerId
      });

    } catch (error: unknown) {
      console.error('Error syncing credential:', error);
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while syncing the credential'
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
