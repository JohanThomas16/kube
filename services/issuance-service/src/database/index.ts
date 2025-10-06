import { Credential } from '../types';

export class CredentialDatabase {
  private credentials: Map<string, Credential> = new Map();
  private nextId = 1;

  constructor(_dbPath?: string) {
    // In-memory database for demonstration
    console.log('🗄️  Using in-memory database for demonstration');
  }

  public insertCredential(content: string, workerId: string): Credential {
    const issuedAt = new Date().toISOString();

    // Check if credential already exists
    const existing = this.credentials.get(content);
    if (existing) {
      return existing;
    }

    // Create new credential
    const credential: Credential = {
      id: this.nextId++,
      content,
      workerId,
      issuedAt
    };

    this.credentials.set(content, credential);
    return credential;
  }

  public getCredentialByContent(content: string): Credential | null {
    return this.credentials.get(content) || null;
  }

  public getAllCredentials(): Credential[] {
    return Array.from(this.credentials.values())
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  public close(): void {
    // No cleanup needed for in-memory storage
  }

  public getDatabase(): any {
    return this.credentials;
  }
}
