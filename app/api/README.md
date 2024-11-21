# API Documentation

This document provides a comprehensive overview of the API endpoints available in the Testmanship application, including debugging information and common issues.

## Table of Contents
1. [API Overview](#api-overview)
2. [Endpoints](#endpoints)
3. [Error Handling](#error-handling)
4. [Authentication](#authentication)
5. [Rate Limiting](#rate-limiting)
6. [Debugging Guide](#debugging-guide)
7. [Best Practices](#best-practices)
8. [Common Issues](#common-issues)

## API Overview

The Testmanship API is built using Next.js API routes and integrates with:
- Supabase for data storage and authentication
- OpenAI for AI-powered evaluations and suggestions
- Custom middleware for rate limiting and authentication

## Endpoints

### 1. Challenge Evaluation (`/api/challenge-evaluation`)

Evaluates writing challenges and provides detailed feedback metrics.

**Method:** POST

**Request Body:**
```typescript
{
  text: string;          // The writing challenge text to evaluate
  timeSpent: number;     // Time spent on the challenge in seconds
  targetLanguage?: string; // Optional target language code
}
```

**Response:**
```typescript
{
  performanceMetrics: {
    wordCount: number;
    paragraphCount: number;
    timeSpent: number;
    performanceScore: number;
    improvedEssay: string;
    metrics: {
      grammar: number;      // 0-100
      vocabulary: number;   // 0-100
      fluency: number;     // 0-100
      overall: number;     // 0-100
    }
  },
  skillMetrics: {
    writingComplexity: number;  // 0-100
    accuracy: number;           // 0-100
    coherence: number;          // 0-100
    style: number;             // 0-100
  },
  insights: {
    strengths: string[];       // 2-3 specific strengths
    weaknesses: string[];      // 2-3 areas for improvement
    tips: string[];           // 2-3 actionable improvement tips
  }
}
```

**Common Issues:**
- Error: "AI request failed" - Check OpenAI API key and quota
- Error: "Invalid input" - Ensure text is not empty and under 4000 tokens
- Performance: Slow response times - Monitor AI service latency

### 2. Challenge Feedback (`/api/challenge-feedback`)

Handles user feedback for writing challenges.

**Method:** POST

**Request Body:**
```typescript
{
  essayContent: string;     // The essay content
  challenge: {
    id: string;
    title: string;
    prompt: string;
  };
  targetLanguage: string;   // Language code
}
```

**Response:**
```typescript
{
  feedback: {
    suggestions: string[];
    improvements: {
      grammar: string[];
      vocabulary: string[];
      structure: string[];
    };
    score: number;
  }
}
```

**Common Issues:**
- Error: "Missing required fields" - Check all required fields are present
- Error: "Invalid language code" - Verify language code format

### 3. Challenge Suggestions (`/api/challenge-suggestions`)

Provides suggestions for writing challenges.

**Method:** POST

**Request Body:**
```typescript
{
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  format: string;
  timeAllocation: number;
  topics?: string[];
  usedTitles?: string[];
  title?: string;
}
```

**Response:**
```typescript
{
  suggestions: Array<{
    title: string;
    prompt: string;
    wordCountRange: {
      min: number;
      max: number;
    };
    timeEstimate: number;
    difficulty: string;
  }>;
}
```

**Common Issues:**
- Error: "Invalid difficulty level" - Check difficulty enum values
- Error: "Too many topics" - Limit topics array to 5 items

### 4. Test Suggestions (`/api/test-suggestions`)

Generates test-related suggestions and guidance.

**Method:** POST

**Request Body:**
```typescript
{
  context: string;
  testType: string;
  complexity: string;
}
```

### 5. Webhooks (`/api/webhooks`)

Handles incoming webhook events for third-party integrations.

**Method:** POST

**Security:**
- Requires webhook signature verification
- IP whitelist validation

## Error Handling

All API endpoints follow a consistent error response format:

```typescript
{
  error: {
    message: string;    // Human-readable error message
    code: string;       // Error code for programmatic handling
    details?: any;      // Additional error context
    timestamp: string;  // ISO timestamp
    requestId?: string; // Request tracking ID
  }
}
```

**Error Codes:**
- AUTH_001: Authentication failed
- AUTH_002: Invalid token
- RATE_001: Rate limit exceeded
- VAL_001: Validation error
- AI_001: AI service error
- DB_001: Database error

## Authentication

API endpoints require authentication using a valid session token.

**Headers:**
```
Authorization: Bearer <token>
Testmanship-Client-Version: <version>
```

**Token Validation:**
1. Token format validation
2. Signature verification
3. Expiration check
4. Permission validation

## Rate Limiting

Rate limits are enforced per user and per IP address:

**Default Limits:**
- 100 requests per minute per user
- 1000 requests per hour per user
- 50 concurrent requests per user

**Headers:**
```
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <timestamp>
```

## Debugging Guide

### Logging Levels
- DEBUG: Detailed debugging information
- INFO: General operational information
- WARN: Warning messages for potentially harmful situations
- ERROR: Error messages for serious problems

### Debug Headers
Include debug headers for detailed information:
```
X-Debug-Mode: true
X-Trace-ID: <trace-id>
```

### Common Debugging Steps
1. Check request payload format
2. Verify authentication headers
3. Monitor rate limit headers
4. Review server logs
5. Check AI service status
6. Verify database connectivity

### Monitoring Endpoints
- `/api/_health`: Health check endpoint
- `/api/_metrics`: Performance metrics (authenticated)

## Best Practices

1. Error Handling
   - Implement proper error boundaries
   - Use typed error responses
   - Include error tracking

2. Performance
   - Cache frequent requests
   - Implement request debouncing
   - Use appropriate timeout values

3. Security
   - Validate all inputs
   - Implement CORS properly
   - Use proper Content Security Policy

4. Development
   - Follow TypeScript best practices
   - Document API changes
   - Write comprehensive tests

## Common Issues

### 1. Authentication Issues
- Token expired
- Invalid token format
- Missing headers
- Incorrect permissions

### 2. Rate Limiting
- Too many requests
- Concurrent request limit
- IP-based restrictions

### 3. Performance
- Slow AI responses
- Database connection issues
- Memory limitations

### 4. Data Validation
- Invalid input formats
- Missing required fields
- Incorrect data types

### 5. Integration Issues
- OpenAI API failures
- Database connectivity
- Third-party service outages

## Maintenance

### Regular Tasks
1. Monitor error rates
2. Review performance metrics
3. Update dependencies
4. Backup configurations
5. Rotate API keys

### Emergency Procedures
1. API service degradation steps
2. Rollback procedures
3. Emergency contacts
4. Incident response plan
