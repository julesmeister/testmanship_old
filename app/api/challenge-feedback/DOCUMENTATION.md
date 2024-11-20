# Challenge Feedback API Documentation

This document provides comprehensive documentation for the Challenge Feedback API endpoint, including request/response formats, error handling, and integration details.

## API Endpoint

`POST /api/challenge-feedback`

### Purpose
Provides AI-powered feedback for writing challenges, analyzing user submissions and providing constructive feedback.

## Request Format

```typescript
interface FeedbackRequest {
  content: string;          // The user's writing submission
  challengeId: string;      // ID of the challenge being attempted
  difficulty: string;       // Challenge difficulty level
  userId?: string;         // Optional user ID for tracking
  language?: string;       // Target language for feedback
  feedbackType: 'detailed' | 'quick' | 'grammar'; // Type of feedback requested
}
```

## Response Format

```typescript
interface FeedbackResponse {
  feedback: {
    overall: string;       // Overall feedback summary
    grammar: string[];     // List of grammar corrections
    style: string[];       // Style improvement suggestions
    structure: string[];   // Structural feedback
    score?: number;        // Optional numerical score
  };
  metadata: {
    processingTime: number;
    modelVersion: string;
    timestamp: string;
  };
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Error Codes
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_INPUT`: Malformed request
- `PROCESSING_ERROR`: AI processing failed
- `UNAUTHORIZED`: Authentication failed
- `CHALLENGE_NOT_FOUND`: Invalid challenge ID

## Integration Guidelines

### Authentication
- Requires valid API key in headers
- Rate limits apply per API key
- User authentication required for personalized feedback

### Best Practices
1. Implement retry logic for rate limits
2. Cache feedback results when possible
3. Handle errors gracefully
4. Validate input before sending
5. Include proper error handling

## Rate Limiting

- 10 requests per minute per user
- 100 requests per hour per API key
- Exponential backoff recommended

## Development Guidelines

When modifying this API endpoint:

1. Code Changes
   - [ ] Update request/response types
   - [ ] Update error handling
   - [ ] Update rate limiting logic
   - [ ] Test all error scenarios

2. Documentation Updates
   - [ ] Update request/response examples
   - [ ] Update error codes
   - [ ] Update rate limits
   - [ ] Add new features

3. Testing Requirements
   - [ ] Unit tests for new features
   - [ ] Integration tests
   - [ ] Rate limit tests
   - [ ] Error handling tests

## Related Components
- `/components/dashboard/test` - Main test interface
- `/utils/ai` - AI integration utilities
- `/types/feedback` - Shared type definitions

## Security Considerations
1. Input sanitization
2. Rate limiting
3. Authentication
4. Data privacy
5. Error message security

## Monitoring
- Monitor rate limit hits
- Track error rates
- Log processing times
- Monitor AI service health

## Future Considerations
1. Enhanced feedback types
2. Multi-language support
3. Feedback history
4. User preferences
5. Performance optimizations
