# Kube Credential Frontend

React TypeScript frontend for the Kube Credential system.

## Overview

A modern, responsive web application built with React, TypeScript, and Vite. Provides intuitive interfaces for credential issuance and verification with real-time feedback and comprehensive error handling.

## Features

- **Two Main Pages**: Separate interfaces for credential issuance and verification
- **JSON Editor**: Syntax highlighting, validation, and formatting
- **Real-time Feedback**: Loading states, success/error messages
- **Responsive Design**: Works on desktop and mobile devices
- **Environment Configuration**: Configurable API endpoints
- **Error Handling**: Comprehensive error display and recovery

## Pages

### Issuance Page (`/issue`)
- JSON credential input with validation
- Real-time syntax checking
- Format JSON button for pretty-printing
- Success feedback with worker ID and timestamp
- Duplicate detection messaging

### Verification Page (`/verify`)
- JSON credential input for verification
- Validation results with original issuance details
- Clear success/failure indicators
- Worker ID and timestamp display for valid credentials

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Full type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_ISSUANCE_API_URL=http://localhost:3001
VITE_VERIFICATION_API_URL=http://localhost:3002
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Docker

```bash
# Build image
docker build -t kube-credential/frontend .

# Run container
docker run -p 3000:80 kube-credential/frontend
```

## API Integration

The frontend communicates with two backend services:

- **Issuance Service**: POST requests to `/issue` endpoint
- **Verification Service**: POST requests to `/verify` endpoint

All API calls include:
- Proper error handling
- Loading states
- CORS support
- JSON content type headers

## Component Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main layout with navigation
│   ├── JsonEditor.tsx      # JSON input with validation
│   ├── LoadingSpinner.tsx  # Loading indicator
│   └── Alert.tsx           # Success/error messages
├── pages/
│   ├── IssuancePage.tsx    # Credential issuance interface
│   └── VerificationPage.tsx # Credential verification interface
├── services/
│   └── api.ts              # API service layer
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main app component
└── main.tsx                # Application entry point
```

## Styling

Uses Tailwind CSS for styling with:
- Responsive design patterns
- Consistent color scheme
- Accessible form controls
- Loading and error states
- Mobile-first approach

## Error Handling

Comprehensive error handling includes:
- Network connectivity issues
- API server errors
- Invalid JSON input
- Validation failures
- User-friendly error messages

## Production Deployment

### Static Hosting (S3/CloudFront)

1. Build the application:
```bash
npm run build
```

2. Deploy to S3:
```bash
aws s3 sync dist/ s3://your-bucket-name
```

3. Configure CloudFront distribution

### Container Deployment

The included Dockerfile creates a production-ready container with:
- Multi-stage build for optimization
- Nginx for static file serving
- Gzip compression
- Security headers
- Health check endpoint

## Configuration

### Build-time Configuration
API URLs are configured at build time using environment variables:

```bash
# For production build
VITE_ISSUANCE_API_URL=https://api.example.com/issue \
VITE_VERIFICATION_API_URL=https://api.example.com/verify \
npm run build
```

### Runtime Configuration
For dynamic configuration, consider using a configuration service or runtime environment injection.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Code splitting with React.lazy
- Optimized bundle size
- Efficient re-renders with React hooks
- Minimal dependencies
- Gzip compression in production
