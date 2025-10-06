import { CredentialDatabase } from './index';
import { createTestDatabase } from '../test/setup';

describe('CredentialDatabase', () => {
  let database: CredentialDatabase;

  beforeEach(() => {
    database = createTestDatabase();
  });

  afterEach(() => {
    database.close();
  });

  describe('insertCredential', () => {
    it('should insert a new credential successfully', () => {
      const content = JSON.stringify({ name: 'John Doe', role: 'Developer' });
      const workerId = 'worker-test-1';

      const result = database.insertCredential(content, workerId);

      expect(result).toMatchObject({
        id: expect.any(Number),
        content,
        workerId,
        issuedAt: expect.any(String)
      });

      // Verify timestamp is valid ISO string
      expect(new Date(result.issuedAt).toISOString()).toBe(result.issuedAt);
    });

    it('should return existing credential when inserting duplicate content', () => {
      const content = JSON.stringify({ name: 'Jane Doe', role: 'Manager' });
      const workerId1 = 'worker-test-1';
      const workerId2 = 'worker-test-2';

      // Insert first credential
      const first = database.insertCredential(content, workerId1);

      // Try to insert duplicate
      const second = database.insertCredential(content, workerId2);

      // Should return the original credential
      expect(second).toEqual(first);
      expect(second.workerId).toBe(workerId1);
    });
  });

  describe('getCredentialByContent', () => {
    it('should return credential when it exists', () => {
      const content = JSON.stringify({ name: 'Alice Smith', role: 'Designer' });
      const workerId = 'worker-test-3';

      database.insertCredential(content, workerId);
      const result = database.getCredentialByContent(content);

      expect(result).toMatchObject({
        content,
        workerId,
        issuedAt: expect.any(String)
      });
    });

    it('should return null when credential does not exist', () => {
      const content = JSON.stringify({ name: 'Non Existent', role: 'Ghost' });
      const result = database.getCredentialByContent(content);

      expect(result).toBeNull();
    });
  });

  describe('getAllCredentials', () => {
    it('should return empty array when no credentials exist', () => {
      const result = database.getAllCredentials();
      expect(result).toEqual([]);
    });

    it('should return all credentials ordered by issuedAt DESC', () => {
      const credentials = [
        { content: JSON.stringify({ name: 'First', role: 'A' }), workerId: 'worker-1' },
        { content: JSON.stringify({ name: 'Second', role: 'B' }), workerId: 'worker-2' },
        { content: JSON.stringify({ name: 'Third', role: 'C' }), workerId: 'worker-3' }
      ];

      // Insert credentials with small delays to ensure different timestamps
      credentials.forEach((cred, index) => {
        setTimeout(() => {
          database.insertCredential(cred.content, cred.workerId);
        }, index * 10);
      });

      // Wait for all insertions
      setTimeout(() => {
        const result = database.getAllCredentials();
        expect(result).toHaveLength(3);
        
        // Should be ordered by issuedAt DESC (most recent first)
        for (let i = 0; i < result.length - 1; i++) {
          expect(new Date(result[i]!.issuedAt).getTime())
            .toBeGreaterThanOrEqual(new Date(result[i + 1]!.issuedAt).getTime());
        }
      }, 100);
    });
  });
});
