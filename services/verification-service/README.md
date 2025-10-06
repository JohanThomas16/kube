# Verification Service

The credential verification microservice for the Kube Credential system.

## Overview

This service handles the verification of previously issued credentials. It maintains its own database of credentials for independent operation and can verify credentials by matching their canonical JSON representation.

## Features

- **Credential Verification**: Validates if credentials have been previously issued
- **Worker Identification**: Returns original issuer information
- **Independent Database**: Maintains separate credential store for scalability
- **Sync Capability**: Can sync credentials from issuance service
- **Comprehensive Testing**: Full test coverage with Jest and Supertest

## API Endpoints

### POST /verify
Verifies if a credential has been previously issued.

**Request:**
```json
{
  "name": "John Doe",
  "role": "Developer",
  "department": "Engineering"
}
```

**Response (200 - Valid credential):**
```json
{
  "valid": true,
  "workerId": "worker-abc123",
  "issuedAt": "2023-12-07T10:30:00.000Z",
  "message": "credential verified - originally issued by worker-abc123"
}
```

**Response (404 - Invalid credential):**
```json
{
  "valid": false,
  "message": "credential not found or not issued"
}
```

### POST /sync
Syncs a credential from the issuance service (internal use).

**Request:**
```json
{
  "content": "{\"name\":\"John Doe\",\"role\":\"Developer\"}",
  "workerId": "worker-abc123",
  "issuedAt": "2023-12-07T10:30:00.000Z"
}
```

### GET /health
Returns service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "workerId": "worker-verify-123"
}
```

## Database Schema

```sql
CREATE TABLE credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL UNIQUE,
  workerId TEXT NOT NULL,
  issuedAt TEXT NOT NULL
);
```

## Environment Variables

- `PORT` - Server port (default: 3002)
- `WORKER_ID` - Unique worker identifier
- `FRONTEND_URL` - Frontend URL for CORS configuration
- `DATABASE_PATH` - SQLite database file path

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Docker

```bash
# Build image
docker build -t kube-credential/verification-service .

# Run container
docker run -p 3002:3002 kube-credential/verification-service
```

## Testing

The service includes comprehensive tests covering:
- Credential verification (valid and invalid)
- Input validation and error handling
- Database operations
- Sync functionality
- Health check endpoints
- CORS functionality

Run tests with:
```bash
npm test
npm run test:coverage
```

## Integration Notes

- **Property Order Independence**: Credentials with different property orders are treated as identical
- **Canonical JSON**: All JSON is normalized by sorting keys alphabetically
- **Database Independence**: Maintains separate database from issuance service for scalability
