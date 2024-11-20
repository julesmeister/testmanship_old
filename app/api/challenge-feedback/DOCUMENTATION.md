# Challenge Feedback API Documentation

## Overview
The Challenge Feedback API endpoint provides AI-powered language learning feedback for writing exercises. It analyzes text submissions against specific challenge requirements and provides structured feedback in the target language.

## Endpoint
```
POST /api/challenge-feedback
```

## Request Format

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body Parameters
```typescript
{
  essayContent: string;    // The text to analyze
  challenge: {            // The complete challenge object
    id: string;
    title: string;
    instructions: string;
    // ... other challenge properties
  };
  targetLanguage: string; // Language code (e.g., 'EN', 'ES', 'FR')
}
```

## Response Format

### Success Response (200 OK)
```json
{
  "feedback": string  // Formatted feedback with ✓, ✗, and ! markers
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```
or
```json
{
  "error": "Essay content cannot be empty"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Error generating feedback"
}
```

## Feedback Format
The API returns feedback in a structured format with exactly three lines:

1. **Correct Usage (✓)**
   - Identifies correct language usage or alignment with challenge instructions
   - If text is not in target language, marks as incorrect

2. **Error Point (✗)**
   - Identifies specific errors or areas for improvement
   - If text is not in target language, points this out

3. **Suggestion (!)**
   - Provides translation if text is not in target language
   - Otherwise suggests improvements based on challenge context

Example:
```
✓ [point] Correct use of past tense in describing events
✗ [point] Subject-verb agreement needs correction in second sentence
! [suggestion] Consider using more formal vocabulary for academic context
```

## Language Processing Rules

1. **Language Verification**
   - First checks if text is in target language
   - Adapts feedback based on language correctness

2. **Challenge Context**
   - Incorporates challenge title and instructions
   - Evaluates text against specific challenge requirements

3. **Feedback Guidelines**
   - Direct statements without explanations
   - No questions or hypotheticals
   - One clear point per feedback line
   - All three markers (✓, ✗, !) used exactly once

## Implementation Details

### Key Components
1. **Input Validation**
   - Checks for required fields (essayContent, challenge, targetLanguage)
   - Validates essay content is not empty
   - Logs request details for debugging

2. **Language Processing**
   - Uses `getLanguageName` utility for language resolution
   - Maintains consistent language context throughout analysis

3. **AI Integration**
   - Utilizes AI model for feedback generation
   - Structured prompt ensures consistent output format

### Error Handling
- Validates all required fields
- Handles empty content cases
- Provides specific error messages
- Includes debug logging in development

## Usage Example

```typescript
const response = await fetch('/api/challenge-feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    essayContent: "Your essay text here",
    challenge: {
      id: "challenge-123",
      title: "Business Email Writing",
      instructions: "Write a formal business email..."
    },
    targetLanguage: "EN"
  })
});

const data = await response.json();
console.log(data.feedback);
```

## Security Considerations
1. Input sanitization performed on essay content
2. Rate limiting recommended for production use
3. Error messages designed to avoid information leakage
4. Logging sanitized to prevent sensitive data exposure

## Performance Notes
- Typical response time: 2-5 seconds
- Handles concurrent requests
- Scales based on AI service capacity
- Implements proper error handling for timeouts
