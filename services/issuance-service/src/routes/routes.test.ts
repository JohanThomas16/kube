import request from 'supertest';
import express from 'express';
import { createRoutes } from './index';
import { createTestDatabase } from '../test/setup';
import { CredentialDatabase } from '../database';

describe('Issuance Service Routes', () => {
  let app: express.Application;
  let database: CredentialDatabase;

  beforeEach(() => {
    database = createTestDatabase();
    app = express();
    app.use(express.json());
    app.use('/', createRoutes(database));
    
    // Set test worker ID
    process.env.WORKER_ID = 'worker-test-123';
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
        workerId: 'worker-test-123'
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
        workerId: 'worker-test-123'
      });
    });
  });

  describe('POST /issue', () => {
    it('should issue a new credential successfully', async () => {
      const credential = { name: 'John Doe', role: 'Developer', department: 'Engineering' };

      const response = await request(app)
        .post('/issue')
        .send(credential);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: 'issued',
        workerId: 'worker-test-123',
        issuedAt: expect.any(String),
        message: 'credential issued by worker-test-123'
      });

      // Verify timestamp is valid
      expect(new Date(response.body.issuedAt).toISOString()).toBe(response.body.issuedAt);
    });

    it('should return already_issued for duplicate credentials', async () => {
      const credential = { name: 'Jane Smith', role: 'Manager' };

      // Issue credential first time
      const firstResponse = await request(app)
        .post('/issue')
        .send(credential);

      expect(firstResponse.status).toBe(201);
      expect(firstResponse.body.status).toBe('issued');

      // Try to issue same credential again
      const secondResponse = await request(app)
        .post('/issue')
        .send(credential);

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body).toMatchObject({
        status: 'already_issued',
        workerId: 'worker-test-123',
        issuedAt: firstResponse.body.issuedAt,
        message: 'credential already issued by worker-test-123'
      });
    });

    it('should handle credentials with different property order as same', async () => {
      const credential1 = { name: 'Alice', role: 'Designer', id: 123 };
      const credential2 = { role: 'Designer', id: 123, name: 'Alice' };

      // Issue first credential
      const firstResponse = await request(app)
        .post('/issue')
        .send(credential1);

      expect(firstResponse.status).toBe(201);

      // Issue second credential with different property order
      const secondResponse = await request(app)
        .post('/issue')
        .send(credential2);

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.status).toBe('already_issued');
    });

    it('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/issue')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: expect.any(String)
      });
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/issue')
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Request body must be a valid JSON object'
      });
    });

    it('should return 400 for null request body', async () => {
      const response = await request(app)
        .post('/issue')
        .send(null);

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Request body must be a valid JSON object'
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
        workerId: 'worker-test-123'
      });
    });

    it('should return all issued credentials', async () => {
      const credentials = [
        { name: 'User 1', role: 'Role 1' },
        { name: 'User 2', role: 'Role 2' }
      ];

      // Issue credentials
      for (const cred of credentials) {
        await request(app).post('/issue').send(cred);
      }

      const response = await request(app).get('/credentials');

      expect(response.status).toBe(200);
      expect(response.body.credentials).toHaveLength(2);
      expect(response.body.count).toBe(2);
      expect(response.body.workerId).toBe('worker-test-123');
    });
  });
});
