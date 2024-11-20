# Writing Challenge Feature Documentation

> **Important Note**: This documentation serves as a comprehensive reference for the entire writing challenge feature. It must be kept up-to-date and checked whenever making changes to ensure we don't break existing functionality. Use this as a checklist when modifying any related components.

## Overview
The writing challenge feature is a complex system that allows users to practice writing in different formats while receiving AI-powered feedback. The system consists of three main components working in tandem:

1. `index.tsx` - The main orchestrator component
2. `LeftColumn.tsx` - The challenge management and feedback display component
3. `useAIFeedback.ts` - Centralized feedback state management

## Component Architecture

### 1. index.tsx (Main Component)

#### Key States
- `selectedChallenge`: Current active challenge
- `inputMessage`: User's writing content
- `feedback`: AI feedback content (managed by useAIFeedback)
- `showFeedbackState`: Controls feedback window visibility
- `manuallyClosedFeedbackState`: Tracks if user manually closed feedback
- `mode`: Practice or exam mode
- `isTimeUp`: Timer completion state

#### Important Functions

##### `handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>)`
- Purpose: Manages text input and triggers feedback
- Key responsibilities:
  - Updates input message with sanitized text
  - Shows feedback window on first typing
  - Preserves previous text for comparison
  - Handles paragraph separation and tracking
  - Auto-adjusts textarea height
  - Triggers feedback only on actual content changes

##### `handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>)`
- Purpose: Manages keyboard interactions for better writing experience
- Key features:
  - Creates new paragraphs with double newlines on Enter
  - Preserves cursor position after paragraph creation
  - Prevents default Enter behavior for better control

##### `handleStartChallenge(challenge: Challenge)`
- Purpose: Initializes new challenge
- Actions:
  - Resets timer
  - Clears input and feedback
  - Resets feedback states

##### `handleStopChallenge()`
- Purpose: Cleans up challenge state
- Actions:
  - Resets timer
  - Clears challenge selection
  - Resets feedback states

##### `handleGradeChallenge()`
- Purpose: Securely saves challenge results with comprehensive validation
- Key responsibilities:
  - Verifies user authentication
  - Validates content security
  - Implements rate limiting
  - Records detailed metrics
  - Maintains audit logs
- Implementation:
  ```typescript
  interface ChallengeResult {
    challenge_id: string;
    user_id: string;
    content: string;
    word_count: number;
    time_taken: number;
    mode: 'practice' | 'exam';
    completed: boolean;
    feedback_count: number;
    created_at: string;
    metrics: {
      grammar_score: number;
      vocabulary_diversity: number;
      average_sentence_length: number;
      readability_score: number;
      topic_relevance: number;
      improvement_rate: number;
    };
    submission_metadata: {
      client_timestamp: string;
      client_timezone: string;
      submission_source: string;
      user_agent: string;
      session_id: string;
    };
  }
  ```

##### Security Features
1. **Content Validation**
   ```typescript
   const validateSubmission = (content: string): boolean => {
     // Basic content validation
     if (!content.trim()) return false;
     
     // Check for suspicious patterns
     const suspiciousPatterns = [
       /<script/i,
       /javascript:/i,
       /data:/i,
       /vbscript:/i,
       /onload=/i,
       /onerror=/i
     ];
     
     return !suspiciousPatterns.some(pattern => pattern.test(content));
   };
   ```

2. **Rate Limiting**
   - Implements cooldown period between submissions
   - Prevents rapid-fire submissions
   - Configurable timeout duration

3. **Input Sanitization**
   - Removes potentially harmful content
   - Preserves legitimate formatting
   - Maintains content integrity

   #### Text Processing and Security

   ##### Input Sanitization (`utils/security.ts`)
   - Purpose: Ensures text input is safe while preserving formatting
   - Key features:
     - Removes potentially harmful HTML and attributes
     - Preserves newlines for paragraph structure
     - Normalizes other whitespace (spaces, tabs) for consistency
     - Uses DOMPurify for base sanitization

   #### Writing Experience Improvements
   - Proper paragraph separation with double newlines
   - Cursor position preservation after paragraph creation
   - Dynamic textarea height adjustment
   - Whitespace normalization that preserves formatting
   - Improved feedback triggering based on actual content changes

   ## Textarea Handling and Cursor Management

   ### Cursor Position After Paragraph Break

   The system implements a custom paragraph break handling mechanism that maintains proper cursor position:

   1. **Textarea Reference**
   ```typescript
   const textareaRef = useRef<HTMLTextAreaElement>(null);

   <textarea
     ref={textareaRef}
     value={inputMessage}
     onChange={handleTextChange}
     onKeyDown={handleKeyDown}
     // ...
   />
   ```
   - Maintains stable reference to textarea element
   - Enables safe cursor position manipulation
   - Prevents null reference errors

   2. **Enter Key Handling**
   ```typescript
   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       const cursorPosition = e.currentTarget.selectionStart;
       const textarea = e.currentTarget;
       
       // Insert double newline
       const newValue = inputMessage.slice(0, cursorPosition) + '\n\n' + 
         inputMessage.slice(cursorPosition);
       setInputMessage(newValue);
       
       // Safe cursor positioning
       setTimeout(() => {
         if (textarea) {
           textarea.selectionStart = cursorPosition + 2;
           textarea.selectionEnd = cursorPosition + 2;
         }
       }, 0);
     }
   };
   ```

   3. **Key Features**
   - Prevents default Enter behavior
   - Inserts double newline for paragraph breaks
   - Maintains cursor position after state update
   - Handles edge cases safely with null checks

   4. **Implementation Details**
   - Uses React's `useRef` hook for stable references
   - Stores textarea reference during event handling
   - Defers cursor position update to next tick
   - Prevents race conditions with React's state updates

   5. **Best Practices**
   - Always check for null before accessing textarea
   - Store event target reference before async operations
   - Use setTimeout to handle post-state-update operations
   - Keep cursor position relative to edit point

   6. **Error Prevention**
   - Prevents "Cannot set properties of null" errors
   - Handles race conditions between state updates
   - Maintains textarea reference across renders
   - Gracefully handles edge cases

   ### Usage Guidelines

   1. **Creating New Paragraphs**
   - Press Enter without holding Shift
   - Double newline is automatically inserted
   - Cursor moves to start of new paragraph
   - Previous paragraph remains unchanged

   2. **Shift + Enter Behavior**
   - Default textarea behavior
   - Single line break within paragraph
   - No custom cursor handling needed
   - Useful for formatting within paragraphs

   3. **State Management**
   - Input state updates immediately
   - Cursor position updates after state
   - Prevents focus and selection issues
   - Maintains consistent user experience

   4. **Edge Cases Handled**
   - Rapid typing during state updates
   - Multiple paragraph breaks in succession
   - Component unmounting during updates
   - Focus loss and recovery

   ## Component Architecture

   ### 2. LeftColumn.tsx (Challenge Management)

   #### Props Interface
   ```typescript
   interface LeftColumnProps {
     challenge: Challenge | null;
     outputCode: string;
     onStartChallenge: (challenge: Challenge) => void;
     onStopChallenge: () => void;
     onGenerateFeedback: (paragraph: string) => Promise<string>;
     isGeneratingFeedback: boolean;
     isTimeUp: boolean;
     mode: 'practice' | 'exam';
     timeElapsed: number;
     timeAllocation?: number;
     inputMessage: string;
     showFeedback: boolean;
     manuallyClosedFeedback: boolean;
     setManuallyClosedFeedback: (value: boolean) => void;
     setShowFeedback: (value: boolean) => void;
   }
   ```

   #### Key Components

   ##### ChallengeCard
   - Purpose: Displays individual challenge information
   - Props:
     ```typescript
     interface ChallengeCardProps {
       challenge: Challenge;
       onStart: (challenge: Challenge) => void;
     }
     ```
   - Features:
     - Displays challenge title and instructions
     - Shows difficulty level badge
     - Shows time allocation
     - Handles challenge start action

   ##### InfoCard
   - Purpose: Displays informational content
   - Props:
     ```typescript
     interface InfoCardProps {
       title: string;
       content?: string | ReactNode;
       value?: string | number;
       icon?: IconComponent;
       colorScheme?: 'blue' | 'purple' | 'emerald' | 'amber';
     }
     ```
   - Usage: Displays time allocation, word count, etc.

   ##### FocusCard
   - Purpose: Highlights important content
   - Props:
     ```typescript
     interface FocusCardProps {
       title: string;
       content?: string | ReactNode;
       items?: string[];
       highlight?: boolean;
       icon?: IconComponent;
       colorScheme?: 'emerald' | 'amber';
     }
     ```
   - Usage: Displays grammar focus points and vocabulary themes

   ##### FooterStats
   - Purpose: Shows challenge statistics
   - Props:
     ```typescript
     interface FooterStatsProps {
       timeAllocation?: number;
       difficultyLevel?: string;
       completionRate?: number;
       attempts?: number;
       stats?: Stats;
       className?: string;
     }
     ```
   - Features:
     - Shows time allocation
     - Displays difficulty level badge
     - Shows completion rate (if available)
     - Shows attempt count (if available)

   ### 3. useChallenge Hook

   #### Purpose
   Manages challenge data fetching and state

   #### Features
   - Fetches challenges from Supabase
   - Handles challenge filtering by difficulty level
   - Manages challenge search functionality
   - Ensures proper challenge data structure with required fields
   - Handles authentication state

   #### Implementation Details
   ```typescript
   const useChallenge = (
     onStartChallenge: (challenge: Challenge) => void,
     onStopChallenge: () => void,
   ) => {
     // State management for challenges
     // Pagination handling
     // Search and filtering
     // Data fetching with proper error handling
     // Authentication checks
   }
   ```

   ## Type Definitions

   ### Challenge Interface
   ```typescript
   interface Challenge {
     id: string;
     title: string;
     description?: string;
     instructions: string;
     difficulty_level: string;
     time_allocation: number;
     word_count?: number;
     grammar_focus?: string[];
     vocabulary_themes?: string[];
     example_response?: string;
     targetLanguage?: string;
     created_at?: string;
     created_by: string;
   }
   ```

   ## Type System and Imports

   ### Case Sensitivity in Imports
   - The project uses case-sensitive imports for consistency
   - Always use lowercase for the `challenge` type import:
     ```typescript
     import { Challenge } from "@/types/challenge"; // Correct
     import { Challenge } from "@/types/Challenge"; // Incorrect
     ```

   ### Type Handling Best Practices
   1. **Optional Props with Default Values**
      - When a prop might be undefined, make it optional in the interface and provide a default value:
        ```typescript
        interface Props {
          value?: string;
        }
        
        function Component({ value = "default" }: Props) {
          // ...
        }
        ```

   2. **Challenge Type**
      - Always import from `@/types/challenge` (lowercase)
      - Used consistently across components for type safety
      - Provides structure for challenge-related data

   3. **Common Type Issues and Solutions**
   1. **Accordion Value Type**
      - Issue: Type 'string | undefined' not assignable to 'string'
      - Solution: Make the prop optional and provide a default value
        ```typescript
        accordionValue?: string;
        accordionValue = "instructions";
        ```

   2. **Import Case Sensitivity**
      - Issue: File name differs only in casing
      - Solution: Always use lowercase for challenge imports
      - Affects: All components using Challenge type

   ## Best Practices

   1. **Type Safety**
      - Always use proper type definitions
      - Avoid type assertions unless absolutely necessary
      - Keep interfaces up-to-date with database schema

   2. **Component Props**
      - Use descriptive prop names that reflect purpose
      - Make props optional when appropriate
      - Provide default values for optional props

   3. **State Management**
      - Use appropriate state management hooks
      - Handle loading and error states
      - Implement proper cleanup in useEffect

   4. **Error Handling**
      - Implement proper error boundaries
      - Show user-friendly error messages
      - Log errors for debugging

   5. **Performance**
      - Implement proper pagination
      - Use memoization where appropriate
      - Optimize re-renders

   ## Common Issues and Solutions

   1. **Challenge Type Mismatches**
      - Ensure all required fields are present
      - Use the proper Challenge type from @/types/challenge
      - Handle optional fields appropriately

   2. **Component Prop Changes**
      - Update all component instances when changing prop interfaces
      - Maintain backward compatibility when possible
      - Document breaking changes

   3. **Authentication Issues**
      - Always check user authentication state
      - Handle unauthenticated states gracefully
      - Provide clear user feedback

   ## Components

   ### Card Components
   ⚠️ **Migration Notice**: Card components have been moved to `/components/card` for better reusability.
   Please refer to the [Card Components Documentation](/components/card/DOCUMENTATION.md) for details.

   Import cards from the new location:
   ```typescript
   import { GradientCard, InfoCard, DifficultyBadge } from '@/components/card';
   ```

   ### Test Interface Components
   {{ ... }}

   ## Writing Challenge Components

   ### Accordion Components

   1. **InstructionsAccordion**
      - Displays challenge instructions and criteria
      - Shows time allocation and word count
      - Lists grammar focus points and vocabulary themes
      - Includes difficulty level and format information
      - Supports dark mode and responsive layout

   2. **EvaluationAccordion**
      - Shows writing performance evaluation after challenge completion
      - Displays comprehensive metrics:
        - Performance score and grade
        - Time spent and word count
        - Total challenges completed
        - Average performance
        - Strongest skills and areas for improvement
        - Recent improvement trends
        - Personalized feedback
      - Integrates with the following database tables:
        - `challenge_attempts`
        - `skill_metrics`
        - `performance_metrics`
        - `user_progress`

   ### Metrics and Evaluation

   1. **Performance Metrics**
      - Word count and paragraph structure
      - Time management
      - Overall performance score
      - Detailed feedback

   2. **Skill Analysis**
      - Category-based skill tracking
      - Proficiency level measurements
      - Improvement rate calculations
      - Trend analysis

   3. **Progress Tracking**
      - Total challenges completed
      - Cumulative words written
      - Time investment
      - Skill progression
      - Topic preferences

   ### Implementation Notes

   1. **State Management**
      - Accordion state handling
      - Metrics data fetching
      - Progress calculations

   2. **UI/UX Considerations**
      - Consistent styling with instructions
      - Clear performance visualization
      - Responsive layout
      - Dark mode support

   3. **Performance**
      - Optimized rendering
      - Efficient data updates
      - Smooth animations

   ## Toast Notifications

   ### Evaluation Loading Toast
   The system shows a loading toast when evaluating the user's writing. This toast:
   - Is dismissible by the user at any time
   - Automatically dismisses when evaluation is complete
   - Shows a helpful message about the evaluation process
   - Prevents multiple toasts from stacking up

   Implementation details:
   ```typescript
   useEffect(() => {
     if (evaluationLoading) {
       const toastId = toast.loading('Evaluating your writing...', {
         description: 'This may take a few moments',
         dismissible: true,
       });

       // Cleanup when loading is done
       return () => {
         toast.dismiss(toastId);
       };
     }
   }, [evaluationLoading]);
   ```

   Best Practices:
   - Always store toast IDs when showing loading states
   - Clean up toasts in useEffect cleanup functions
   - Make loading toasts dismissible
   - Provide clear progress information to users

   ## Reusable Components

   ### Card Components (`/components/card/`)
   A collection of reusable card components designed for consistent UI presentation across the test interface.

   #### Available Cards
   1. `GradientCard`
      - Purpose: Base card with gradient background
      - Usage: Foundation for other card components
      - Props: `className`, `children`

   2. `InstructionsCard`
      - Purpose: Displays test instructions
      - Usage: Shows challenge requirements and guidelines
      - Props: `instructions`, `className`

   3. `InfoCard`
      - Purpose: Displays informational content
      - Usage: Shows tips, hints, or additional information
      - Props: `title`, `content`, `className`

   4. `FocusCard`
      - Purpose: Highlights important content
      - Usage: Drawing attention to specific information
      - Props: `title`, `content`, `highlight`

   5. `DifficultyBadge`
      - Purpose: Visual indicator of difficulty level
      - Usage: Shows test or challenge difficulty
      - Props: `difficulty`, `size`

   6. `FooterStats`
      - Purpose: Displays statistics in card footer
      - Usage: Shows completion rates, scores, etc.
      - Props: `stats`, `className`

   #### Shared Types (`types.ts`)
   ```typescript
   // Common interfaces used across card components
   interface CardBase {
     className?: string;
     children?: React.ReactNode;
   }

   interface Stats {
     // Add the actual stats interface
   }
   ```

   #### Usage Guidelines
   1. Import cards from the barrel file:
      ```typescript
      import { GradientCard, InfoCard, FocusCard } from './components/card';
      ```

   2. Maintain consistency:
      - Use appropriate card for content type
      - Follow existing styling patterns
      - Extend base types when adding props

   3. When to use each card:
      - `GradientCard`: Base container needing visual emphasis
      - `InstructionsCard`: Primary test instructions
      - `InfoCard`: Secondary information
      - `FocusCard`: Important notices or highlights
      - `DifficultyBadge`: Difficulty indicators
      - `FooterStats`: Statistical information

   4. Customization:
      - All cards accept className for styling overrides
      - Maintain responsive design
      - Follow accessibility guidelines

   #### Development Guidelines
   When modifying or adding card components:
   - [ ] Update types in `types.ts`
   - [ ] Export new components in `index.ts`
   - [ ] Add props documentation
   - [ ] Update this section with usage examples
   - [ ] Test responsive behavior
   - [ ] Verify accessibility

   ## Writing Challenge Evaluation System

   ### Overview
   The writing challenge evaluation system provides AI-powered analysis of user submissions, offering detailed metrics and feedback. The system is designed to be modular, extensible, and user-friendly.

   ### Components and Files

   #### 1. API Route (`/app/api/challenge-evaluation/route.ts`)
   - **Purpose**: Handles evaluation requests and AI integration
   - **Key Features**:
     - AI-powered writing evaluation
     - JSON response parsing with error handling
     - Retry logic for AI requests
     - Rate limiting protection
   - **Response Format**:
   ```typescript
   interface EvaluationResponse {
     performanceMetrics: {
       wordCount: number;
       paragraphCount: number;
       timeSpent: number;
       performanceScore: number;
       improvedEssay: string;
       metrics: {
         grammar: number;
         vocabulary: number;
         fluency: number;
         overall: number;
       }
     };
     skillMetrics: {
       writingComplexity: number;
       accuracy: number;
       coherence: number;
       style: number;
     }
   }
   ```

   #### 2. State Management (`/hooks/useEvaluationState.ts`)
   - **Purpose**: Manages evaluation state and UI updates
   - **Key Features**:
     - Handles loading states
     - Error management
     - Metrics state updates
     - Automatic evaluation triggers
   - **Usage**:
   ```typescript
   const {
     showEvaluation,
     performanceMetrics,
     skillMetrics,
     isLoading,
     error
   } = useEvaluationState(challenge, isTimeUp, content);
   ```

   #### 3. UI Components

   ##### EvaluationAccordion (`/components/dashboard/test/components/EvaluationAccordion.tsx`)
   - **Purpose**: Displays evaluation results
   - **Sections**:
     - Performance Analysis
     - Improved Essay
     - Metrics Display
     - Time Statistics
   - **Features**:
     - Collapsible sections
     - Visual metrics representation
     - Responsive layout

   ##### LeftColumn (`/components/dashboard/test/LeftColumn.tsx`)
   - **Purpose**: Main container for evaluation UI
   - **Features**:
     - Evaluation trigger management
     - Toast notifications
     - Loading states
     - Error handling

   #### 4. Dashboard Integration (`/components/dashboard/test/index.tsx`)
   - **Purpose**: Integrates evaluation into main dashboard
   - **Features**:
     - User session management
     - Challenge state coordination
     - Timer integration
     - Feedback system coordination

   ### Metrics System

   #### Performance Metrics
   - **Grammar**: Language correctness (0-100)
   - **Vocabulary**: Word choice and variety (0-100)
   - **Fluency**: Flow and naturalness (0-100)
   - **Overall**: Combined performance score (0-100)

   #### Skill Metrics
   - **Writing Complexity**: Sentence structure and sophistication
   - **Accuracy**: Content precision and correctness
   - **Coherence**: Logical flow and organization
   - **Style**: Writing style and tone

   ### Error Handling
   1. **API Errors**:
      - Rate limiting protection
      - Retry mechanism for transient errors
      - User-friendly error messages
      - Detailed error logging

   2. **UI Error States**:
      - Loading indicators
      - Error message display
      - Fallback content
      - Recovery mechanisms

   ### Future Improvements
   1. **Metrics Customization**:
      - Configurable scoring weights
      - Custom metric definitions
      - Domain-specific evaluations

   2. **UI Enhancements**:
      - Advanced visualization options
      - Detailed feedback breakdown
      - Historical comparison
      - Progress tracking

   3. **Performance Optimization**:
      - Caching strategies
      - Batch processing
      - Response optimization

   ### Security Considerations
   1. Input sanitization
   2. Rate limiting
   3. Error message obfuscation
   4. API key protection

   ### Related Files
   - `/utils/ai.ts`: AI request utilities
   - `/types/challenge.ts`: Type definitions
   - `/components/card/MetricsCard.tsx`: Metrics display component
   - `/hooks/useFeedbackManager.ts`: Feedback management

   ## Important Notes

   ### Feedback State Management
   - Centralized in useAIFeedback hook
   - Local state in LeftColumn for UI responsiveness
   - Clear synchronization between components
   - Rate limiting at API level

   ### Feedback Window Behavior
   - Shows automatically on first typing
   - Stays closed if manually closed by user
   - Can be reopened via sparkle button
   - Resets state on new challenge
   - Maintains position while dragging

   ### Challenge State Management
   - Challenge object is extended with inputMessage
   - State is cleaned up on challenge completion
   - Timer state affects input availability
   - Proper cleanup on component unmount

   ### Error Handling
   - Improved rate limit error messages
   - Better error state management
   - Clear user feedback via toasts
   - Comprehensive error logging
   - Graceful degradation on API failures

   ### Authentication and Security

   #### Challenge Results Security
   1. **Pre-submission Validation**
      - Content security checks
      - Rate limiting enforcement
      - Authentication verification
      - Access permission checks

   2. **Data Security**
      - Input sanitization
      - Metadata tracking
      - Session monitoring
      - Audit logging

   3. **Error Management**
      - Granular error types
      - User-friendly messages
      - Error logging
      - Recovery procedures

   4. **Performance Monitoring**
      - Submission metrics
      - Error rates
      - Response times
      - User patterns

   #### Database Security
   1. **Access Control**
      - Row-level security
      - User permissions
      - Challenge ownership
      - Result isolation

   2. **Data Integrity**
      - Transaction safety
      - Constraint enforcement
      - Version control
      - Backup procedures

   3. **Monitoring**
      - Activity logs
      - Error tracking
      - Performance metrics
      - Security alerts

   ## Evaluation Mechanism

   ### Overview
   The evaluation mechanism is a comprehensive system that provides AI-powered assessment of user's writing submissions. It consists of several interconnected components that work together to provide real-time feedback and performance metrics.

   ### Components

   #### 1. useEvaluationState Hook
   - **Purpose**: Manages the evaluation state and API communication
   - **Location**: `hooks/useEvaluationState.ts`
   - **Key Features**:
     - Maintains evaluation state (performance metrics, skill metrics, user progress)
     - Handles API communication with error handling
     - Provides loading and error states
     - Manages evaluation visibility

   #### 2. EvaluationAccordion Component
   - **Location**: `components/dashboard/test/components/EvaluationAccordion.tsx`
   - **Features**:
     - Displays evaluation results in an expandable accordion
     - Shows improved essay suggestions
     - Provides exit challenge functionality
     - Matches layout with InstructionsAccordion for consistency

   ### API Integration

   #### Challenge Evaluation API
   - **Endpoint**: `/api/challenge-evaluation`
   - **Location**: `app/api/challenge-evaluation/route.ts`
   - **Request Format**:
     ```typescript
     {
       challengeId: string;
       content: string;
       timeSpent: number;
     }
     ```
   - **Response Format**:
     ```typescript
     {
       performanceMetrics: {
         wordCount: number;
         paragraphCount: number;
         timeSpent: number;
         performanceScore: number;
         feedback: string;
       };
       skillMetrics: {
         grammar: number;
         vocabulary: number;
         structure: number;
         creativity: number;
         clarity: number;
       };
       userProgress: {
         totalChallenges: number;
         totalWords: number;
         averageScore: number;
         skillImprovements: Array<{
           skill: string;
           improvement: number;
         }>;
       };
     }
     ```

   ### Integration Flow

   1. **Trigger Points**:
      - When time is up (`isTimeUp` becomes true)
      - When user manually requests evaluation
      - When challenge is completed

   2. **Data Flow**:
     ```
     User Submission → useEvaluationState → API → AI Processing → Response → UI Update
     ```

   3. **Error Handling**:
     - Rate limiting with friendly messages
     - Network error recovery
     - Invalid response handling
     - Empty content validation

   ### AI Integration

   #### makeAIRequest Utility
   - **Location**: `utils/ai.ts`
   - **Features**:
     - Handles API communication with OpenAI/SambaNova
     - Provides user-friendly error messages
     - Implements rate limiting
     - Manages API key validation

   ### Usage in LeftColumn

   The LeftColumn component (`components/dashboard/test/LeftColumn.tsx`) integrates the evaluation mechanism through:

   1. **State Management**:
     ```typescript
     const {
       showEvaluation,
       performanceMetrics,
       isLoading,
       error
     } = useEvaluationState(challenge, isTimeUp, content);
     ```

   2. **UI Integration**:
     - Renders EvaluationAccordion when evaluation is available
     - Shows loading states during evaluation
     - Displays error messages when needed
     - Manages visibility of evaluation results

   ### Best Practices

   1. **Error Handling**:
     - Always provide user-friendly error messages
     - Log technical details for debugging
     - Implement proper rate limiting
     - Handle network issues gracefully

   2. **Performance**:
     - Minimize unnecessary API calls
     - Cache results when appropriate
     - Implement proper loading states
     - Handle large responses efficiently

   3. **User Experience**:
     - Show clear loading indicators
     - Provide helpful error messages
     - Maintain consistent UI during evaluation
     - Allow easy navigation between instructions and evaluation

   4. **Security**:
     - Validate all inputs
     - Sanitize user content
     - Protect API keys
     - Implement proper rate limiting

   ### Known Limitations

   1. **Rate Limiting**:
     - AI service has request limits
     - Implement proper queuing if needed
     - Consider fallback options

   2. **Response Time**:
     - AI processing can take time
     - Show appropriate loading states
     - Consider partial results display

   3. **Content Size**:
     - Large submissions may need chunking
     - Consider implementing progress indicators
     - Handle timeout scenarios

   ### Future Improvements

   1. **Metrics Enhancement**:
     - Add more detailed writing metrics
     - Implement historical comparison
     - Add peer comparison features

   2. **UI Improvements**:
     - Add visual metrics representation
     - Implement progress tracking
     - Add export functionality

   3. **Performance Optimization**:
     - Implement response caching
     - Add offline support
     - Optimize large content handling

   ## Future Considerations
   1. Add feedback history
   2. Implement feedback caching
   3. Add offline support
   4. Enhance error recovery
   5. Add feedback analytics

   ## Breaking Changes Checklist
   When modifying this feature, check the following:

   1. State Management
      - [ ] Feedback state flow remains intact
      - [ ] Challenge state properly updates
      - [ ] Local states sync correctly

   2. User Experience
      - [ ] Feedback window behavior
      - [ ] Challenge flow remains smooth
      - [ ] Error messages are helpful

   3. Performance
      - [ ] Rate limiting works
      - [ ] No memory leaks
      - [ ] Proper cleanup

   4. Error Handling
      - [ ] All error states handled
      - [ ] User notifications work
      - [ ] Error logging
      - [ ] Recovery procedures

   5. Components
      - [ ] DraggableWindow functions
      - [ ] ChallengeCard displays correctly
      - [ ] All props passed correctly

   This documentation should be reviewed and updated whenever making changes to ensure system integrity.
