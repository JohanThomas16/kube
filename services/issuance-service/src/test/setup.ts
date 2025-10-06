import { CredentialDatabase } from '../database';
import fs from 'fs';
import path from 'path';

// Clean up test databases after each test
afterEach(() => {
  // Clean up any test database files
  const testDbPattern = /test-.*\.db$/;
  const currentDir = process.cwd();
  
  try {
    const files = fs.readdirSync(currentDir);
    files.forEach(file => {
      if (testDbPattern.test(file)) {
        const filePath = path.join(currentDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Helper function to create test database
export function createTestDatabase(): CredentialDatabase {
  const testDbPath = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.db`;
  return new CredentialDatabase(testDbPath);
}
