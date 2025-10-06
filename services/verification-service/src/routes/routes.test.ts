import request from 'supertest';
import express from 'express';
import { createRoutes } from './index';
import { createTestDatabase } from '../test/setup';
import { CredentialDatabase } from '../database';

describe('Verification Service Routes', () => {
  let app: express.Application;
  let database: CredentialDatabase;

  beforeEach(() => {
    database = createTestDatabase();
    app = express();
    app.use(express.json());
    app.use('/', createRoutes(database));
    
    // Set test worker ID
    process.env.WORKER_ID = 'worker-verify-123';
  });

  afterEach(() => {
    database.close();
    delete process.env.WORKER_ID;
  });

  describe('GET /', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        workerId: 'worker-verify-123'
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        workerId: 'worker-verify-123'
      });
    });
  });

  describe('POST /verify', () => {
    it('should return valid=true for existing credential', async () => {
      const credential = { name: 'John Doe', role: 'Developer', department: 'Engineering' };
      const credentialContent = JSON.stringify(credential, Object.keys(credential).sort());
      const issuerWorkerId = 'worker-issuer-456';
      const issuedAt = new Date().toISOString();

      // Insert credential into database (simulating issuance)
      database.insertCredential(credentialContent, issuerWorkerId);

      const response = await request(app)
        .post('/verify')
        .send(credential);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        valid: true,
        workerId: issuerWorkerId,
        issuedAt: expect.any(String),
        message: `credential verified - originally issued by ${issuerWorkerId}`
      });
    });

    it('should return valid=false for non-existent credential', async () => {
      const credential = { name: 'Jane Smith', role: 'Manager' };

      const response = await request(app)
        .post('/verify')
        .send(credential);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        valid: false,
        message: 'credential not found or not issued'
      });
    });

    it('should handle credentials with different property order as same', async () => {
      const credential1 = { name: 'Alice', role: 'Designer', id: 123 };
      const credential2 = { role: 'Designer', id: 123, name: 'Alice' };
      const issuerWorkerId = 'worker-issuer-789';

      // Insert first credential
      const credentialContent = JSON.stringify(credential1, Object.keys(credential1).sort());
      database.insertCredential(credentialContent, issuerWorkerId);

      // Verify second credential with different property order
      const response = await request(app)
        .post('/verify')
        .send(credential2);

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.workerId).toBe(issuerWorkerId);
    });

    it('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/verify')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: expect.any(String)
      });
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/verify')
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Request body must be a valid JSON object'
      });
    });

    it('should return 400 for null request body', async () => {
      const response = await request(app)
        .post('/verify')
        .send(null);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Request body must be a valid JSON object'
      });
    });
  });

  describe('POST /sync', () => {
    it('should sync credential successfully', async () => {
      const syncData = {
        content: JSON.stringify({ name: 'Test User', role: 'Tester' }),
        workerId: 'worker-issuer-sync',
        issuedAt: new Date().toISOString()
      };

      const response = await request(app)
        .post('/sync')
        .send(syncData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Credential synced successfully',
        workerId: 'worker-verify-123'
      });

      // Verify the credential was synced
      const verifyResponse = await request(app)
        .post('/verify')
        .send(JSON.parse(syncData.content));

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.valid).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/sync')
        .send({ content: 'test' }); // missing workerId and issuedAt

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Missing required fields: content, workerId, issuedAt'
      });
    });
  });

  describe('GET /credentials', () => {
    it('should return empty list when no credentials exist', async () => {
      const response = await request(app).get('/credentials');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        credentials: [],
        count: 0,
        workerId: 'worker-verify-123'
      });
    });

    it('should return all synced credentials', async () => {
      const credentials = [
        { name: 'User 1', role: 'Role 1' },
        { name: 'User 2', role: 'Role 2' }
      ];

      // Sync credentials
      for (const cred of credentials) {
        const syncData = {
          content: JSON.stringify(cred),
          workerId: 'worker-issuer-test',
          issuedAt: new Date().toISOString()
        };
        await request(app).post('/sync').send(syncData);
      }

      const response = await request(app).get('/credentials');

      expect(response.status).toBe(200);
      expect(response.body.credentials).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.workerId).toBe('worker-verify-123');
    });
  });
});
