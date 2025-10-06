# Issuance Service

The credential issuance microservice for the Kube Credential system.

## Overview

This service handles the creation and storage of credentials. It provides idempotent credential issuance, ensuring that duplicate credentials return the original issuance details rather than creating duplicates.

## Features

- **Idempotent Operations**: Duplicate credentials return original worker ID and timestamp
- **Worker Identification**: Each response includes the worker ID that processed the request
- **SQLite Storage**: Fast, reliable local storage with unique constraints
- **Comprehensive Testing**: Full test coverage with Jest and Supertest
- **Health Monitoring**: Built-in health check endpoints

## API Endpoints

### POST /issue
Issues a new credential or returns existing credential details.

**Request:**
```json
{
  "name": "John Doe",
  "role": "Developer",
  "department": "Engineering"
}
```

**Response (201 - New credential):**
```json
{
  "status": "issued",
  "workerId": "worker-abc123",
  "issuedAt": "2023-12-07T10:30:00.000Z",
  "message": "credential issued by worker-abc123"
}
```

**Response (200 - Existing credential):**
```json
{
  "status": "already_issued",
  "workerId": "worker-xyz789",
  "issuedAt": "2023-12-06T15:20:00.000Z",
  "message": "credential already issued by worker-xyz789"
}
```

### GET /health
Returns service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "workerId": "worker-abc123"
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

- `PORT` - Server port (default: 3001)
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
docker build -t kube-credential/issuance-service .

# Run container
docker run -p 3001:3001 kube-credential/issuance-service
```

## Testing

The service includes comprehensive tests covering:
- Credential issuance (new and duplicate)
- Input validation and error handling
- Database operations
- Health check endpoints
- CORS functionality

Run tests with:
```bash
npm test
npm run test:coverage
```
