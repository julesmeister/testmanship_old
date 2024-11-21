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

   ### Component Interactions

   ### AI Suggestions System Architecture

   The AI suggestions system consists of four main components working together:

   #### 1. Test Component (`components/dashboard/test/index.tsx`)
   The main orchestrator that:
   - Initializes the suggestion system
   - Manages user input and suggestion state
   - Handles error display through toasts
   ```typescript
   const Test = () => {
     const {
       isActive,
       isRateLimited,
       isDailyLimitReached,
       start: startSuggestions,
       stop: stopSuggestions
     } = useTestAISuggestions({
       challenge: selectedChallenge,
       content: inputMessage,
       enabled: !!selectedChallenge && !manuallyClosedFeedbackState && !isTimeUp,
       onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
       onError: (error) => toast(error)
     });
     // ...
   };
   ```

   #### 2. LeftColumn Component (`components/dashboard/test/LeftColumn.tsx`)
   Responsible for:
   - Displaying current suggestions
   - Showing suggestion status
   - Managing suggestion visibility
   ```typescript
   interface LeftColumnProps {
     currentSuggestion?: string;
     isRateLimited?: boolean;
     isDailyLimitReached?: boolean;
   }

   const LeftColumn: React.FC<LeftColumnProps> = ({
     currentSuggestion,
     isRateLimited,
     isDailyLimitReached
   }) => {
     // Renders suggestions and status
   };
   ```

   #### 3. useTestAISuggestions Hook (`hooks/useTestAISuggestions.ts`)
   The core suggestion management system that:
   - Handles debouncing and API calls
   - Manages rate limiting states
   - Provides suggestion lifecycle methods
   ```typescript
   const useTestAISuggestions = ({
     challenge,
     content,
     enabled,
     onSuggestion,
     onError
   }) => {
     // Manages suggestion generation and state
   };
   ```

   #### 4. Test Suggestions API (`app/api/test-suggestions/route.ts`)
   The backend API that:
   - Processes suggestion requests
   - Implements rate limiting
   - Generates AI responses
   ```typescript
   export async function POST(req: Request) {
     // Handles suggestion generation
     // Implements rate limiting
     // Returns AI-generated suggestions
   }
   ```

   ### Data Flow

   1. **User Input → Test Component**
     ```
     User types → Debounced input → useTestAISuggestions hook
     ```

   2. **Hook → API**
     ```
     Hook prepares request → API validates → AI generates → Response returned
     ```

   3. **API → UI**
     ```
     Hook processes response → Test updates state → LeftColumn displays suggestion
     ```

   ### State Management

   1. **Test Component States**
     - `currentSuggestion`: Latest AI suggestion
     - `inputMessage`: Current user input
     - `selectedChallenge`: Active challenge

   2. **Hook States**
     - `isActive`: Suggestion system status
     - `isRateLimited`: Temporary rate limit
     - `isDailyLimitReached`: Daily limit status

   3. **API States**
     - Rate limit tracking
     - Request validation
     - Error states

   ### Error Handling Flow

   1. **API Layer**
     ```typescript
     // app/api/test-suggestions/route.ts
     if (isRateLimited) {
       return new Response(
         JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
         { status: 429 }
       );
     }
     ```

   2. **Hook Layer**
     ```typescript
     // hooks/useTestAISuggestions.ts
     if (response.status === 429) {
       const isDaily = responseData.error?.message?.includes('free-models-per-day');
       // Handle rate limits with friendly messages
     }
     ```

   3. **UI Layer**
     ```typescript
     // components/dashboard/test/index.tsx
     onError: (error) => toast(error)
     ```

   ### Integration Points

   1. **Test → Hook Integration**
     - Initializes hook with challenge and content
     - Receives suggestions and errors
     - Controls suggestion lifecycle

   2. **Hook → API Integration**
     - Manages API requests and responses
     - Handles rate limiting and errors
     - Processes suggestions

   3. **Test → LeftColumn Integration**
     - Passes current suggestion state
     - Updates suggestion display
     - Shows rate limit status

   ### Best Practices for Modifications

   1. **Adding New Features**
     - Update all affected components
     - Maintain error handling chain
     - Consider rate limiting impact

   2. **Modifying Rate Limits**
     - Update API rate limit logic
     - Adjust hook error handling
     - Update UI feedback

   3. **Changing Suggestion Logic**
     - Modify API generation
     - Update hook processing
     - Adjust UI display

   ## Writing Experience Improvements
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

   ### Card Components (`@/components/card/`)

   ### Component Overview

   #### 1. InfoCard
   - **Purpose**: Display single value information with an icon and title
   - **Props**:
     - `title`: string - Card header
     - `value`: string | number - Single value to display
     - `icon`: IconType - React icon component
     - `colorScheme`: 'blue' | 'purple' - Color theme
   - **Usage**: Best for displaying single metrics or status information

   #### 2. FocusCard
   - **Purpose**: Display a list of items with bullet points
   - **Props**:
     - `title`: string - Card header
     - `items`: string[] - Array of text items to display
     - `icon`: IconType - React icon component
     - `colorScheme`: 'emerald' | 'amber' - Color theme
   - **Usage**: Best for displaying lists like strengths, improvements, or tips

   #### 3. MetricsCard
   - **Purpose**: Display multiple metric items with labels and values
   - **Props**:
     - `title`: string - Card header
     - `items`: MetricItem[] - Array of {label: string, value: number}
     - `icon`: IconType (optional) - Default is HiChartBar
   - **Usage**: Best for displaying performance metrics or scoring

   #### 4. InstructionsCard
   - **Purpose**: Display challenge instructions with rich formatting
   - **Props**:
     - `title`: string - Card header
     - `content`: string - Instruction content
     - `icon`: IconComponent (optional)
   - **Usage**: Best for displaying formatted instructions or guidelines

   ### Usage Guidelines

   1. **Choosing the Right Card**:
     - Use `InfoCard` for single value displays (e.g., total score)
     - Use `FocusCard` for lists with bullet points (e.g., feedback items)
     - Use `MetricsCard` for multiple related metrics (e.g., performance scores)
     - Use `InstructionsCard` for formatted text content (e.g., challenge instructions)

   2. **Color Schemes**:
     - InfoCard: blue (default), purple (highlight)
     - FocusCard: emerald (success), amber (warning)
     - MetricsCard: uses neutral zinc colors
     - InstructionsCard: uses neutral zinc colors

   3. **Best Practices**:
     - Keep content concise and focused
     - Use consistent icons within the same section
     - Match color schemes to content meaning
     - Ensure proper spacing between cards

   6. **Error Prevention**
   - Prevents "Cannot set properties of null" errors
   - Handles race conditions between state updates
   - Maintains textarea reference across renders
   - Gracefully handles edge cases

   ### Critical Component Interactions

   #### State Management Flow

   1. **Challenge Selection & Instructions**
     ```typescript
     // LeftColumn.tsx
     const [accordionValue, setAccordionValue] = useState<string>("instructions");
     
     useEffect(() => {
       // Reset accordion when challenge changes
       if (challenge) {
         setAccordionValue("instructions");
       }
     }, [challenge]);
     ```
     - Accordion state must be initialized to "instructions"
     - State resets when challenge changes to ensure visibility
     - Never remove the useEffect or the initial state

   2. **Evaluation Metrics Flow**
     ```typescript
     // Real-time metrics calculation
     const initialPerformanceMetrics = {
       wordCount: inputMessage ? inputMessage.split(/\s+/).filter(word => word.length > 0).length : 0,
       paragraphCount: inputMessage ? inputMessage.split(/\n\s*\n/).filter(para => para.trim().length > 0).length : 0,
       timeSpent: timeElapsed || 0,
       // ... other metrics
     };

     // Combine with API evaluation results
     const performanceMetrics = {
       ...evaluatedPerformanceMetrics,  // From API
       wordCount: initialPerformanceMetrics.wordCount,  // Real-time
       paragraphCount: initialPerformanceMetrics.paragraphCount,  // Real-time
       timeSpent: initialPerformanceMetrics.timeSpent,  // Real-time
     };
     ```
     - Real-time metrics must override API metrics for counts
     - Never remove the real-time calculation
     - Always merge in this order to preserve real-time updates

   3. **Component Visibility Logic**
     ```typescript
     // Challenge Selection
     {(!challenge || (showChallenges && !showEvaluation)) && (
       <ChallengeSelection />
     )}

     // Instructions
     {challenge && !showChallenges && !showEvaluation && (
       <InstructionsAccordion />
     )}

     // Evaluation
     {showEvaluation && challenge && (
       <EvaluationAccordion />
     )}
     ```
     - Conditions are mutually exclusive
     - Order matters for proper UI flow
     - Never modify without checking all three conditions

   #### API Integration Points

   1. **Challenge Evaluation**
     ```typescript
     // useEvaluationState.ts
     const evaluateChallenge = async () => {
       if (!challenge || !content || !isTimeUp) {
         setState(prev => ({ ...prev, showEvaluation: false }));
         return;
       }
       // ... API call and state update
     };
     ```
     - Requires all three conditions to be true
     - State updates must preserve existing metrics
     - Error handling is critical for UX

   2. **Real-time Feedback**
     ```typescript
     // index.tsx
     const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
       const newText = e.target.value;
       setInputMessage(newText);
       // ... feedback generation logic
     };
     ```
     - Debounce feedback requests
     - Preserve cursor position
     - Handle loading states

   ### Component Dependencies

   #### LeftColumn.tsx Dependencies
   - `useEvaluationState`: Manages evaluation lifecycle
   - `useChallenge`: Handles challenge selection and state
   - `Challenge` type: Must match API contract
   - UI components: Must maintain consistent styling

   #### index.tsx Dependencies
   - `LeftColumn`: Main UI container
   - `Timer`: Challenge time tracking
   - `useAIFeedback`: Feedback state management
   - Event handlers: Must preserve proper order

   ### Breaking Changes Prevention

   1. **State Updates**
     - Always use functional updates for dependent states
     - Maintain proper update order
     - Check all dependent components

   2. **Component Props**
     - Never remove required props
     - Always provide fallbacks for optional props
     - Document prop changes in this file

   3. **API Contracts**
     - Maintain type consistency
     - Version API changes
     - Update types in sync

   4. **UI Components**
     - Preserve component hierarchy
     - Maintain consistent styling
     - Test all view states

   ### Testing Checklist

   Before making changes:
   1. [ ] Check all state dependencies
   2. [ ] Verify component visibility logic
   3. [ ] Test accordion behavior
   4. [ ] Validate metrics calculation
   5. [ ] Check API integration
   6. [ ] Test error handling
   7. [ ] Verify UI consistency

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
     {
       performanceMetrics: {
         wordCount: number;
         paragraphCount: number;
         timeSpent: number;
         performanceScore: number;
         feedback: string;
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

   ### Integration Points

   1. **Frontend Components**
     - `EvaluationAccordion`: Displays evaluation results
     - `FocusCard`: Shows strengths, weaknesses, and tips
     - `MetricsCard`: Visualizes performance metrics

   2. **State Management**
     - `useEvaluationState`: Manages evaluation data
     - Handles loading and error states
     - Updates UI based on response

   3. **Data Flow**
     ```
     User Submission → API Request → AI Processing → 
     Validation → Response Formatting → State Update → UI Render
     ```

   ### Best Practices

   1. **Error Handling**
     - Always validate API responses
     - Provide clear error messages
     - Implement retry mechanisms
     - Log validation failures

   2. **Performance**
     - Cache evaluation results
     - Implement rate limiting
     - Optimize response size

   3. **Security**
     - Sanitize user input
     - Validate request origins
     - Protect sensitive data

   ### Testing Checklist

   - [ ] Input validation
     - [ ] Empty content handling
     - [ ] Invalid challenge ID
     - [ ] Malformed requests

   - [ ] Response validation
     - [ ] Array structure
     - [ ] Data completeness
     - [ ] Type checking

   - [ ] Error handling
     - [ ] Rate limit responses
     - [ ] Parsing failures
     - [ ] Network errors

   - [ ] Integration
     - [ ] Frontend updates
     - [ ] State management
     - [ ] UI rendering

   ### Known Issues and Solutions

   1. **Empty Insight Arrays**
     - Issue: FocusCards appearing blank
     - Solution: Added strict array validation
     - Prevention: Validate response structure

   2. **Invalid Metrics**
     - Issue: Scores outside 0-1 range
     - Solution: Value normalization
     - Prevention: Range validation

   3. **Response Format**
     - Issue: Inconsistent AI responses
     - Solution: JSON extraction utility
     - Prevention: Structured prompts

   ### Maintenance Notes

   1. **Regular Checks**
     - Monitor error rates
     - Review AI response quality
     - Update validation rules

   2. **Updates Required**
     - Document API changes
     - Test new validations
     - Update error messages

   3. **Performance Monitoring**
     - Track response times
     - Monitor rate limits
     - Log validation failures

   ## AI Suggestions System

   ### Overview
   The AI suggestions system provides real-time writing assistance through the `useTestAISuggestions` hook. This system is designed to offer contextual suggestions while maintaining a smooth user experience and managing API resources efficiently.

   ### Key Components

   #### 1. useTestAISuggestions Hook
   Located in `hooks/useTestAISuggestions.ts`, this hook manages the entire suggestion lifecycle.

   ##### Core Features
   - **Debounced Suggestions**: Waits for 1 second of no typing before generating suggestions
   - **Rate Limiting**: Handles both temporary and daily API rate limits
   - **Request Management**: Automatically cancels stale requests
   - **Error Handling**: Provides user-friendly error messages with emojis

   ##### Usage Example
   ```typescript
   const {
     isActive,
     isRateLimited,
     isDailyLimitReached,
     start,
     stop
   } = useTestAISuggestions({
     challenge: selectedChallenge,
     content: inputMessage,
     enabled: true,
     onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
     onError: (error) => toast(error),
     targetLanguage: 'EN'
   });
   ```

   ##### States
   - `isActive`: Whether suggestions are currently active
   - `isRateLimited`: Temporary rate limit status
   - `isDailyLimitReached`: Daily API limit status

   ##### Methods
   - `start()`: Begin suggestion generation
   - `stop()`: Stop suggestion generation and cleanup

   ##### Error Messages
   The hook provides friendly, encouraging error messages:
   - Daily limit: "We've reached today's AI suggestion limit. Don't worry though - it'll reset tomorrow! 🌅"
   - Rate limit: "Taking a quick breather to process suggestions. Keep writing! ✨"
   - Generic error: "Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟"

   #### 2. Integration with Test Component
   The suggestions system is integrated into the main test component through:
   - Automatic suggestion triggering after typing pauses
   - Clear error feedback through toast messages
   - Graceful degradation when limits are reached

   ### Implementation Details

   #### 1. Debouncing Logic
   ```typescript
   useEffect(() => {
     if (!enabled) return;
     
     // Clear previous timer
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
       debounceRef.current = null;
     }

     // Wait for typing to stop
     debounceRef.current = setTimeout(() => {
       start();
     }, 1000);

     return () => {
       if (debounceRef.current) {
         clearTimeout(debounceRef.current);
         debounceRef.current = null;
       }
     };
   }, [enabled, content, start]);
   ```

   #### 2. Request Management
   - Uses AbortController to cancel pending requests
   - Tracks last content to prevent duplicate suggestions
   - Cleans up resources on component unmount

   #### 3. Error Handling Strategy
   - User-friendly messages with emojis
   - Different handling for temporary vs daily limits
   - Clear feedback through toast notifications

   ### Best Practices

   1. **Rate Limit Handling**
     - Don't retry automatically on rate limits
     - Show clear feedback to users
     - Differentiate between temporary and daily limits

   2. **Resource Management**
     - Cancel pending requests when new ones start
     - Clean up timers and controllers on unmount
     - Track and prevent duplicate suggestions

   3. **User Experience**
     - Use friendly, encouraging error messages
     - Maintain smooth typing experience
     - Provide clear status indicators

   ### Troubleshooting

   1. **Frequent Rate Limits**
     - Check typing debounce timing
     - Verify content change detection
     - Review API usage patterns

   2. **Stale Suggestions**
     - Ensure proper request cancellation
     - Check content tracking logic
     - Verify cleanup on unmount

   3. **Performance Issues**
     - Monitor debounce timing
     - Check request cleanup
     - Review state update frequency

   ## Recent UI/UX Enhancements

   ### 1. Notebook-Style Writing Interface
   The writing interface has been styled to resemble a traditional notebook page for a more natural writing experience:

   ##### Textarea Styling
   - Custom ruled lines with 1.5rem spacing
   - Left margin line at 4rem (red line)
   - Paper-like texture and background
   - Times New Roman font for classic appearance
   - Disabled spell checking for distraction-free writing
   - Consistent text color in both light and dark modes

   ```typescript
   <textarea
     style={{
       backgroundImage: `
         linear-gradient(transparent, transparent calc(1.5rem - 1px), #e5e7eb calc(1.5rem - 1px), #e5e7eb 1.5rem, transparent 1.5rem),
         linear-gradient(90deg, transparent 4rem, #f3f4f6 4rem, #f3f4f6 4.25rem, transparent 4.25rem),
         linear-gradient(#fafafa, #fafafa)
       `,
       backgroundSize: '100% 1.5rem, 100% 100%, 100% 100%',
       backgroundAttachment: 'local, scroll, scroll',
       lineHeight: '1.5rem',
       paddingTop: '1.5rem',
       paddingLeft: '4.5rem',
       fontFamily: '"Times New Roman", Times, serif',
       fontSize: '1.125rem'
     }}
     spellCheck="false"
     className="..."
   />
   ```

   ### 2. AI Suggestions Display
   Enhanced the suggestions UI with:
   - Elegant quote decorations
   - Gradient backgrounds
   - Responsive layout
   - Improved typography and spacing
   - Dark mode support

   The suggestions are displayed in a card with:
   - Yellow/amber gradient background
   - Decorative quote marks
   - Subtle border and shadow effects
   - Clear visual hierarchy

   These enhancements aim to create a more immersive and focused writing environment while maintaining functionality and accessibility.

   ## Language Learning Feedback System

   ### Overview
   The language learning feedback system provides AI-powered feedback on user submissions, offering detailed metrics and suggestions. The system is designed to be modular, extensible, and user-friendly.

   ### Feedback Format
   The system provides three types of feedback markers:
   ```
   - Correct usage or instruction alignment
   - Error identification or improvement area
   - Translation or improvement suggestion
   ```

   ### Format Rules
   1. **Marker Usage**
     - Each marker appears exactly once
     - No additional text in markers
     - Consistent order: , 

   2. **Content Requirements**
     - Concise, specific feedback
     - No questions or hypotheticals
     - Translation required for non-target language

   3. **Response Structure**
     ```typescript
     interface FeedbackResponse {
       correctUsage: string;    - marker
       errorPoint: string;      - marker
       suggestion: string;      - marker
     }
     ```

   4. **Implementation Notes**
     - Validates target language usage
     - Provides specific error context
     - Ensures actionable improvements
     - Maintains consistent formatting

   ### Usage in LeftColumn

   The LeftColumn component (`components/dashboard/test/LeftColumn.tsx`) integrates the feedback system through:

   1. **State Management**
     ```typescript
     const {
       showFeedback,
       performanceMetrics,
       isLoading,
       error
     } = useFeedbackState(challenge, isTimeUp, content);
     ```

   2. **UI Integration**
     - Renders FeedbackAccordion when feedback is available
     - Shows loading states during feedback generation
     - Displays error messages when needed
     - Manages visibility of feedback results

   ### Best Practices

   1. **Error Handling**
     - Always provide user-friendly error messages
     - Log technical details for debugging
     - Implement proper rate limiting
     - Handle network issues gracefully

   2. **Performance**
     - Minimize unnecessary API calls
     - Cache results when appropriate
     - Implement proper loading states
     - Handle large responses efficiently

   3. **User Experience**
     - Show clear loading indicators
     - Provide helpful error messages
     - Maintain consistent UI during feedback generation
     - Allow easy navigation between instructions and feedback

   4. **Security**
     - Validate all inputs
     - Sanitize user content
     - Protect sensitive data
     - Implement proper rate limiting

   ### Known Limitations

   1. **Rate Limiting**
     - AI service has request limits
     - Implement proper queuing if needed
     - Consider fallback options

   2. **Response Time**
     - AI processing can take time
     - Show appropriate loading states
     - Consider partial results display

   3. **Content Size**
     - Large submissions may need chunking
     - Consider implementing progress indicators
     - Handle timeout scenarios

   ### Future Improvements

   1. **Metrics Enhancement**
     - Add more detailed writing metrics
     - Implement historical comparison
     - Add peer comparison features

   2. **UI Improvements**
     - Add visual metrics representation
     - Implement progress tracking
     - Add export functionality

   3. **Performance Optimization**
     - Implement response caching
     - Add offline support
     - Optimize large content handling

   ## Global State Management

   ### 1. useTestState Hook (`hooks/useTestState.ts`)

   #### Purpose
   Centralized state management for test-related UI states and timers.

   #### Key States
   - `showChallenges`: Controls challenge selection visibility
   - `showEvaluation`: Controls evaluation view visibility
   - `idleTimer`: Manages user inactivity countdown

   #### Core Functions
   ```typescript
   interface TestState {
     showChallenges: boolean;
     showEvaluation: boolean;
     idleTimer: number | null;
     setShowChallenges: (show: boolean) => void;
     setShowEvaluation: (show: boolean) => void;
     setIdleTimer: (time: number | null) => void;
     startChallenge: () => void;
     resetState: () => void;
   }
   ```

   ##### `startChallenge()`
   - Purpose: Initializes challenge state
   - Actions:
     - Sets showChallenges to false
     - Sets showEvaluation to false
     - Resets idleTimer to 20 seconds

   ##### `resetState()`
   - Purpose: Resets all states to default
   - Actions:
     - Clears all UI states
     - Nullifies idleTimer

   #### Integration Points
   1. **Test Component** (`index.tsx`)
     - Uses global states for UI visibility
     - Manages idle timer through global state
     - Calls startChallenge on new challenge initialization

   2. **LeftColumn Component** (`LeftColumn.tsx`)
     - Consumes global UI states
     - Updates challenge visibility state
     - Manages evaluation view state

   #### State Flow
   ```mermaid
   graph TD
       A[User Action] --> B[useTestState]
       B --> C[Test Component]
       B --> D[LeftColumn Component]
       C --> E[UI Updates]
       D --> E
   ```

   #### Best Practices
   1. **State Updates**
     - Always use provided state setters
     - Avoid direct state manipulation
     - Use startChallenge for initialization
     - Use resetState for cleanup

   2. **Timer Management**
     - Reset timer through startChallenge
     - Clear timer through resetState
     - Update timer only through setIdleTimer

   3. **Component Integration**
     - Import only needed state and functions
     - Use destructuring for clean code
     - Maintain single source of truth

   ## Challenge Evaluation API

   Located in `app/api/challenge-evaluation/route.ts`, this API endpoint handles the evaluation of writing challenges and provides comprehensive feedback.

   ### API Structure

   #### Request Format
   ```typescript
   {
     challengeId: string;    // ID of the challenge being evaluated
     content: string;        // The user's written content
     timeSpent: number;      // Time spent on the challenge in seconds
   }
   ```

   #### Response Format
   ```typescript
   {
     performanceMetrics: {
       wordCount: number;        // Total words in submission
       paragraphCount: number;   // Number of paragraphs
       timeSpent: number;        // Time taken in seconds
       performanceScore: number; // Overall score (0-1)
       feedback: string;         // AI-generated feedback
     },
     skillMetrics: {
       writingComplexity: number; // Sentence complexity (0-1)
       accuracy: number;          // Content accuracy (0-1)
       coherence: number;         // Logical flow (0-1)
       style: number;            // Writing style (0-1)
     },
     insights: {
       strengths: string[];      // List of identified strengths
       weaknesses: string[];     // Areas needing improvement
       tips: string[];          // Actionable improvement suggestions
     }
   }
   ```

   ### Validation and Error Handling

   #### Input Validation
   - Ensures `challengeId` is provided
   - Verifies `content` is non-empty
   - Validates request structure

   #### Response Validation
   1. **JSON Extraction**
     - Safely extracts JSON from AI response
     - Handles potential formatting issues
     - Validates JSON structure

   2. **Array Validation**
     ```typescript
     // Validates insight arrays (strengths, weaknesses, tips)
     const validateInsightArray = (arr: any[], name: string): string[] => {
       if (!arr.every(item => typeof item === 'string' && item.trim())) {
         throw new Error(`Invalid ${name} format`);
       }
       return arr.map(item => item.trim());
     };
     ```

   3. **Data Requirements**
     - Non-empty arrays for insights
     - Valid numeric ranges for metrics
     - Complete response structure

   #### Error States
   1. **400 Bad Request**
     - Empty content
     - Missing challenge ID
     - Invalid request format

   2. **429 Rate Limit**
     - Too many requests
     - AI service limitations

   3. **500 Internal Error**
     - AI response parsing failure
     - Invalid response structure
     - Missing required data

   ### Integration Points

   1. **Frontend Components**
     - `EvaluationAccordion`: Displays evaluation results
     - `FocusCard`: Shows strengths, weaknesses, and tips
     - `MetricsCard`: Visualizes performance metrics

   2. **State Management**
     - `useEvaluationState`: Manages evaluation data
     - Handles loading and error states
     - Updates UI based on response

   3. **Data Flow**
     ```
     User Submission → API Request → AI Processing → 
     Validation → Response Formatting → State Update → UI Render
     ```

   ### Best Practices

   1. **Error Handling**
     - Always validate API responses
     - Provide clear error messages
     - Implement retry mechanisms
     - Log validation failures

   2. **Performance**
     - Cache evaluation results
     - Implement rate limiting
     - Optimize response size

   3. **Security**
     - Sanitize user input
     - Validate request origins
     - Protect sensitive data

   ### Testing Checklist

   - [ ] Input validation
     - [ ] Empty content handling
     - [ ] Invalid challenge ID
     - [ ] Malformed requests

   - [ ] Response validation
     - [ ] Array structure
     - [ ] Data completeness
     - [ ] Type checking

   - [ ] Error handling
     - [ ] Rate limit responses
     - [ ] Parsing failures
     - [ ] Network errors

   - [ ] Integration
     - [ ] Frontend updates
     - [ ] State management
     - [ ] UI rendering

   ### Known Issues and Solutions

   1. **Empty Insight Arrays**
     - Issue: FocusCards appearing blank
     - Solution: Added strict array validation
     - Prevention: Validate response structure

   2. **Invalid Metrics**
     - Issue: Scores outside 0-1 range
     - Solution: Value normalization
     - Prevention: Range validation

   3. **Response Format**
     - Issue: Inconsistent AI responses
     - Solution: JSON extraction utility
     - Prevention: Structured prompts

   ### Maintenance Notes

   1. **Regular Checks**
     - Monitor error rates
     - Review AI response quality
     - Update validation rules

   2. **Updates Required**
     - Document API changes
     - Test new validations
     - Update error messages

   3. **Performance Monitoring**
     - Track response times
     - Monitor rate limits
     - Log validation failures

   ## AI Suggestions System

   ### Overview
   The AI suggestions system provides real-time writing assistance through the `useTestAISuggestions` hook. This system is designed to offer contextual suggestions while maintaining a smooth user experience and managing API resources efficiently.

   ### Key Components

   #### 1. useTestAISuggestions Hook
   Located in `hooks/useTestAISuggestions.ts`, this hook manages the entire suggestion lifecycle.

   ##### Core Features
   - **Debounced Suggestions**: Waits for 1 second of no typing before generating suggestions
   - **Rate Limiting**: Handles both temporary and daily API rate limits
   - **Request Management**: Automatically cancels stale requests
   - **Error Handling**: Provides user-friendly error messages with emojis

   ##### Usage Example
   ```typescript
   const {
     isActive,
     isRateLimited,
     isDailyLimitReached,
     start,
     stop
   } = useTestAISuggestions({
     challenge: selectedChallenge,
     content: inputMessage,
     enabled: true,
     onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
     onError: (error) => toast(error),
     targetLanguage: 'EN'
   });
   ```

   ##### States
   - `isActive`: Whether suggestions are currently active
   - `isRateLimited`: Temporary rate limit status
   - `isDailyLimitReached`: Daily API limit status

   ##### Methods
   - `start()`: Begin suggestion generation
   - `stop()`: Stop suggestion generation and cleanup

   ##### Error Messages
   The hook provides friendly, encouraging error messages:
   - Daily limit: "We've reached today's AI suggestion limit. Don't worry though - it'll reset tomorrow! 🌅"
   - Rate limit: "Taking a quick breather to process suggestions. Keep writing! ✨"
   - Generic error: "Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟"

   #### 2. Integration with Test Component
   The suggestions system is integrated into the main test component through:
   - Automatic suggestion triggering after typing pauses
   - Clear error feedback through toast messages
   - Graceful degradation when limits are reached

   ### Implementation Details

   #### 1. Debouncing Logic
   ```typescript
   useEffect(() => {
     if (!enabled) return;
     
     // Clear previous timer
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
       debounceRef.current = null;
     }

     // Wait for typing to stop
     debounceRef.current = setTimeout(() => {
       start();
     }, 1000);

     return () => {
       if (debounceRef.current) {
         clearTimeout(debounceRef.current);
         debounceRef.current = null;
       }
     };
   }, [enabled, content, start]);
   ```

   #### 2. Request Management
   - Uses AbortController to cancel pending requests
   - Tracks last content to prevent duplicate suggestions
   - Cleans up resources on component unmount

   #### 3. Error Handling Strategy
   - User-friendly messages with emojis
   - Different handling for temporary vs daily limits
   - Clear feedback through toast notifications

   ### Best Practices

   1. **Rate Limit Handling**
     - Don't retry automatically on rate limits
     - Show clear feedback to users
     - Differentiate between temporary and daily limits

   2. **Resource Management**
     - Cancel pending requests when new ones start
     - Clean up timers and controllers on unmount
     - Track and prevent duplicate suggestions

   3. **User Experience**
     - Use friendly, encouraging error messages
     - Maintain smooth typing experience
     - Provide clear status indicators

   ### Troubleshooting

   1. **Frequent Rate Limits**
     - Check typing debounce timing
     - Verify content change detection
     - Review API usage patterns

   2. **Stale Suggestions**
     - Ensure proper request cancellation
     - Check content tracking logic
     - Verify cleanup on unmount

   3. **Performance Issues**
     - Monitor debounce timing
     - Check request cleanup
     - Review state update frequency

   ## TimerProgress Component

   ### Overview
   The TimerProgress component is a sophisticated progress indicator that transforms into a grade button based on specific conditions. It provides visual feedback for time remaining and word count progress.

   ### Component Architecture

   ##### GradeButton Subcomponent
   ```typescript
   interface GradeButtonProps {
     onClick: () => void;
     onMouseLeave?: () => void;
     showWordCount?: boolean;
     wordCount?: number;
     requiredWordCount?: number;
   }
   ```
   A reusable button component that displays grading options with:
   - Gradient background and border effects
   - Word count progress (optional)
   - Hover animations
   - Dark mode support

   ##### TimerProgress Component
   ```typescript
   interface TimerProgressProps {
     timeElapsed: number;
     timeAllocation?: number;
     mode: 'practice' | 'exam';
     onGradeChallenge: () => void;
     wordCount?: number;
     requiredWordCount?: number;
     showGradeButton?: boolean;
   }
   ```

   ### Key Features

   1. **Dynamic State Management**
     - Tracks hover state for conditional button display
     - Manages fill animation for progress bar
     - Handles time-up conditions
     - Monitors word count requirements

   2. **Progress Bar Visualization**
     - Smooth width transitions
     - Mode-specific colors (exam/practice)
     - Remaining time display
     - Dark mode support

   3. **Conditional Grade Button**
     - Appears in two scenarios:
       1. When time is up (automatic)
       2. When hovered AND word count requirement is met
     - Shows word count progress when applicable
     - Maintains consistent styling with gradient effects

   4. **Accessibility Features**
     - Clear visual feedback
     - Hover states for interactivity
     - Readable time remaining display
     - High contrast in both light/dark modes

   ### Implementation Details

   1. **Progress Calculation**
   ```typescript
   const progress = timeAllocation 
     ? Math.max(0, 100 - (timeElapsed / (timeAllocation * 60)) * 100) 
     : 0;
   ```

   2. **Time Formatting**
   ```typescript
   const formatTimeRemaining = (seconds: number) => {
     if (!timeAllocation) return "∞";
     const remainingSeconds = Math.max(0, (timeAllocation * 60) - seconds);
     const minutes = Math.floor(remainingSeconds / 60);
     const secs = Math.floor(remainingSeconds % 60);
     return `${minutes}:${secs.toString().padStart(2, '0')}`;
   };
   ```

   3. **Conditional Rendering Logic**
   ```typescript
   if (isTimeUp) {
     return <GradeButton onClick={onGradeChallenge} />;
   }

   if (isHovered && showGradeButton) {
     return (
       <GradeButton 
         onClick={onGradeChallenge}
         onMouseLeave={() => setIsHovered(false)}
         showWordCount
         wordCount={wordCount}
         requiredWordCount={requiredWordCount}
       />
     );
   }
   ```

   ### Usage Guidelines

   1. **Time Allocation**
     - Optional parameter
     - When undefined, shows "∞" for time remaining
     - Specified in minutes, converted to seconds internally

   2. **Word Count Requirements**
     - Set `requiredWordCount` to enable word count checking
     - Grade button appears only when `wordCount >= requiredWordCount`
     - Word count display shows progress toward goal

   3. **Mode-Specific Styling**
     - 'exam' mode: Blue progress bar (#2563eb)
     - 'practice' mode: Green progress bar (#059669)

   4. **Event Handling**
     - `onGradeChallenge`: Callback for grading action
     - `onMouseEnter/onMouseLeave`: For hover state management
     - Automatic cleanup of animation frames

   ### Best Practices

   1. **Performance Optimization**
     - Use `useRef` for animation frame management
     - Implement smooth transitions with CSS
     - Avoid unnecessary re-renders

   2. **Styling Consistency**
     - Maintain gradient effects across states
     - Use consistent spacing and sizing
     - Follow dark mode guidelines

   3. **Error Prevention**
     - Handle undefined timeAllocation gracefully
     - Prevent negative progress values
     - Manage cleanup of animation frames

   4. **Accessibility**
     - Maintain readable contrast ratios
     - Provide clear visual feedback
     - Support keyboard navigation

   ## Global State Management

   ### 1. useTestState Hook (`hooks/useTestState.ts`)

   #### Purpose
   Centralized state management for test-related UI states and timers.

   #### Key States
   - `showChallenges`: Controls challenge selection visibility
   - `showEvaluation`: Controls evaluation view visibility
   - `idleTimer`: Manages user inactivity countdown

   #### Core Functions
   ```typescript
   interface TestState {
     showChallenges: boolean;
     showEvaluation: boolean;
     idleTimer: number | null;
     setShowChallenges: (show: boolean) => void;
     setShowEvaluation: (show: boolean) => void;
     setIdleTimer: (time: number | null) => void;
     startChallenge: () => void;
     resetState: () => void;
   }
   ```

   ##### `startChallenge()`
   - Purpose: Initializes challenge state
   - Actions:
     - Sets showChallenges to false
     - Sets showEvaluation to false
     - Resets idleTimer to 20 seconds

   ##### `resetState()`
   - Purpose: Resets all states to default
   - Actions:
     - Clears all UI states
     - Nullifies idleTimer

   #### Integration Points
   1. **Test Component** (`index.tsx`)
     - Uses global states for UI visibility
     - Manages idle timer through global state
     - Calls startChallenge on new challenge initialization

   2. **LeftColumn Component** (`LeftColumn.tsx`)
     - Consumes global UI states
     - Updates challenge visibility state
     - Manages evaluation view state

   #### State Flow
   ```mermaid
   graph TD
       A[User Action] --> B[useTestState]
       B --> C[Test Component]
       B --> D[LeftColumn Component]
       C --> E[UI Updates]
       D --> E
   ```

   #### Best Practices
   1. **State Updates**
     - Always use provided state setters
     - Avoid direct state manipulation
     - Use startChallenge for initialization
     - Use resetState for cleanup

   2. **Timer Management**
     - Reset timer through startChallenge
     - Clear timer through resetState
     - Update timer only through setIdleTimer

   3. **Component Integration**
     - Import only needed state and functions
     - Use destructuring for clean code
     - Maintain single source of truth

   ## Challenge Evaluation API

   Located in `app/api/challenge-evaluation/route.ts`, this API endpoint handles the evaluation of writing challenges and provides comprehensive feedback.

   ### API Structure

   #### Request Format
   ```typescript
   {
     challengeId: string;    // ID of the challenge being evaluated
     content: string;        // The user's written content
     timeSpent: number;      // Time spent on the challenge in seconds
   }
   ```

   #### Response Format
   ```typescript
   {
     performanceMetrics: {
       wordCount: number;        // Total words in submission
       paragraphCount: number;   // Number of paragraphs
       timeSpent: number;        // Time taken in seconds
       performanceScore: number; // Overall score (0-1)
       feedback: string;         // AI-generated feedback
     },
     skillMetrics: {
       writingComplexity: number; // Sentence complexity (0-1)
       accuracy: number;          // Content accuracy (0-1)
       coherence: number;         // Logical flow (0-1)
       style: number;            // Writing style (0-1)
     },
     insights: {
       strengths: string[];      // List of identified strengths
       weaknesses: string[];     // Areas needing improvement
       tips: string[];          // Actionable improvement suggestions
     }
   }
   ```

   ### Validation and Error Handling

   #### Input Validation
   - Ensures `challengeId` is provided
   - Verifies `content` is non-empty
   - Validates request structure

   #### Response Validation
   1. **JSON Extraction**
     - Safely extracts JSON from AI response
     - Handles potential formatting issues
     - Validates JSON structure

   2. **Array Validation**
     ```typescript
     // Validates insight arrays (strengths, weaknesses, tips)
     const validateInsightArray = (arr: any[], name: string): string[] => {
       if (!arr.every(item => typeof item === 'string' && item.trim())) {
         throw new Error(`Invalid ${name} format`);
       }
       return arr.map(item => item.trim());
     };
     ```

   3. **Data Requirements**
     - Non-empty arrays for insights
     - Valid numeric ranges for metrics
     - Complete response structure

   #### Error States
   1. **400 Bad Request**
     - Empty content
     - Missing challenge ID
     - Invalid request format

   2. **429 Rate Limit**
     - Too many requests
     - AI service limitations

   3. **500 Internal Error**
     - AI response parsing failure
     - Invalid response structure
     - Missing required data

   ### Integration Points

   1. **Frontend Components**
     - `EvaluationAccordion`: Displays evaluation results
     - `FocusCard`: Shows strengths, weaknesses, and tips
     - `MetricsCard`: Visualizes performance metrics

   2. **State Management**
     - `useEvaluationState`: Manages evaluation data
     - Handles loading and error states
     - Updates UI based on response

   3. **Data Flow**
     ```
     User Submission → API Request → AI Processing → 
     Validation → Response Formatting → State Update → UI Render
     ```

   ### Best Practices

   1. **Error Handling**
     - Always validate API responses
     - Provide clear error messages
     - Implement retry mechanisms
     - Log validation failures

   2. **Performance**
     - Cache evaluation results
     - Implement rate limiting
     - Optimize response size

   3. **Security**
     - Sanitize user input
     - Validate request origins
     - Protect sensitive data

   ### Testing Checklist

   - [ ] Input validation
     - [ ] Empty content handling
     - [ ] Invalid challenge ID
     - [ ] Malformed requests

   - [ ] Response validation
     - [ ] Array structure
     - [ ] Data completeness
     - [ ] Type checking

   - [ ] Error handling
     - [ ] Rate limit responses
     - [ ] Parsing failures
     - [ ] Network errors

   - [ ] Integration
     - [ ] Frontend updates
     - [ ] State management
     - [ ] UI rendering

   ### Known Issues and Solutions

   1. **Empty Insight Arrays**
     - Issue: FocusCards appearing blank
     - Solution: Added strict array validation
     - Prevention: Validate response structure

   2. **Invalid Metrics**
     - Issue: Scores outside 0-1 range
     - Solution: Value normalization
     - Prevention: Range validation

   3. **Response Format**
     - Issue: Inconsistent AI responses
     - Solution: JSON extraction utility
     - Prevention: Structured prompts

   ### Maintenance Notes

   1. **Regular Checks**
     - Monitor error rates
     - Review AI response quality
     - Update validation rules

   2. **Updates Required**
     - Document API changes
     - Test new validations
     - Update error messages

   3. **Performance Monitoring**
     - Track response times
     - Monitor rate limits
     - Log validation failures

   ## AI Suggestions System

   ### Overview
   The AI suggestions system provides real-time writing assistance through the `useTestAISuggestions` hook. This system is designed to offer contextual suggestions while maintaining a smooth user experience and managing API resources efficiently.

   ### Key Components

   #### 1. useTestAISuggestions Hook
   Located in `hooks/useTestAISuggestions.ts`, this hook manages the entire suggestion lifecycle.

   ##### Core Features
   - **Debounced Suggestions**: Waits for 1 second of no typing before generating suggestions
   - **Rate Limiting**: Handles both temporary and daily API rate limits
   - **Request Management**: Automatically cancels stale requests
   - **Error Handling**: Provides user-friendly error messages with emojis

   ##### Usage Example
   ```typescript
   const {
     isActive,
     isRateLimited,
     isDailyLimitReached,
     start,
     stop
   } = useTestAISuggestions({
     challenge: selectedChallenge,
     content: inputMessage,
     enabled: true,
     onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
     onError: (error) => toast(error),
     targetLanguage: 'EN'
   });
   ```

   ##### States
   - `isActive`: Whether suggestions are currently active
   - `isRateLimited`: Temporary rate limit status
   - `isDailyLimitReached`: Daily API limit status

   ##### Methods
   - `start()`: Begin suggestion generation
   - `stop()`: Stop suggestion generation and cleanup

   ##### Error Messages
   The hook provides friendly, encouraging error messages:
   - Daily limit: "We've reached today's AI suggestion limit. Don't worry though - it'll reset tomorrow! 🌅"
   - Rate limit: "Taking a quick breather to process suggestions. Keep writing! ✨"
   - Generic error: "Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟"

   #### 2. Integration with Test Component
   The suggestions system is integrated into the main test component through:
   - Automatic suggestion triggering after typing pauses
   - Clear error feedback through toast messages
   - Graceful degradation when limits are reached

   ### Implementation Details

   #### 1. Debouncing Logic
   ```typescript
   useEffect(() => {
     if (!enabled) return;
     
     // Clear previous timer
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
       debounceRef.current = null;
     }

     // Wait for typing to stop
     debounceRef.current = setTimeout(() => {
       start();
     }, 1000);

     return () => {
       if (debounceRef.current) {
         clearTimeout(debounceRef.current);
         debounceRef.current = null;
       }
     };
   }, [enabled, content, start]);
   ```

   #### 2. Request Management
   - Uses AbortController to cancel pending requests
   - Tracks last content to prevent duplicate suggestions
   - Cleans up resources on component unmount

   #### 3. Error Handling Strategy
   - User-friendly messages with emojis
   - Different handling for temporary vs daily limits
   - Clear feedback through toast notifications

   ### Best Practices

   1. **Rate Limit Handling**
     - Don't retry automatically on rate limits
     - Show clear feedback to users
     - Differentiate between temporary and daily limits

   2. **Resource Management**
     - Cancel pending requests when new ones start
     - Clean up timers and controllers on unmount
     - Track and prevent duplicate suggestions

   3. **User Experience**
     - Use friendly, encouraging error messages
     - Maintain smooth typing experience
     - Provide clear status indicators

   ### Troubleshooting

   1. **Frequent Rate Limits**
     - Check typing debounce timing
     - Verify content change detection
     - Review API usage patterns

   2. **Stale Suggestions**
     - Ensure proper request cancellation
     - Check content tracking logic
     - Verify cleanup on unmount

   3. **Performance Issues**
     - Monitor debounce timing
     - Check request cleanup
     - Review state update frequency

   ## Recent Updates

   ### 1. Challenge State Management
   - Added `currentSuggestion` clearing in `handleStartChallenge`
   - Ensures clean state when starting new challenges
   - Prevents suggestion persistence between challenges

   ### 2. AI Suggestions System

   #### Response Format
   The AI suggestions system has been updated to enforce single-sentence responses:

   ```typescript
   // System message enforces:
   1. ONLY GENERATE ONE SINGLE SENTENCE
   2. Language-specific output
   3. Natural context fit
   4. Style and tone matching
   5. No explanations or translations
   ```

   #### Implementation Details
   - Strict prompt formatting for consistent responses
   - Clear task definition in user messages
   - Explicit single-sentence enforcement
   - Language-specific generation based on challenge context

   ### 3. State Cleanup
   The `handleStartChallenge` function now resets:
   - Input message (`setInputMessage('')`)
   - Output code (`setOutputCode('')`)
   - Feedback state (`setShowFeedbackState(false)`)
   - Manual feedback closure state (`setManuallyClosedFeedbackState(false)`)
   - Current suggestion (`setCurrentSuggestion('')`)

   This ensures a clean slate for each new challenge attempt.

   ## TimerProgress Component

   ### Overview
   The TimerProgress component is a sophisticated progress indicator that transforms into a grade button based on specific conditions. It provides visual feedback for time remaining and word count progress.

   ### Component Architecture

   ##### GradeButton Subcomponent
   ```typescript
   interface GradeButtonProps {
     onClick: () => void;
     onMouseLeave?: () => void;
     showWordCount?: boolean;
     wordCount?: number;
     requiredWordCount?: number;
   }
   ```
   A reusable button component that displays grading options with:
   - Gradient background and border effects
   - Word count progress (optional)
   - Hover animations
   - Dark mode support

   ##### TimerProgress Component
   ```typescript
   interface TimerProgressProps {
     timeElapsed: number;
     timeAllocation?: number;
     mode: 'practice' | 'exam';
     onGradeChallenge: () => void;
     wordCount?: number;
     requiredWordCount?: number;
     showGradeButton?: boolean;
   }
   ```

   ### Key Features

   1. **Dynamic State Management**
     - Tracks hover state for conditional button display
     - Manages fill animation for progress bar
     - Handles time-up conditions
     - Monitors word count requirements

   2. **Progress Bar Visualization**
     - Smooth width transitions
     - Mode-specific colors (exam/practice)
     - Remaining time display
     - Dark mode support

   3. **Conditional Grade Button**
     - Appears in two scenarios:
       1. When time is up (automatic)
       2. When hovered AND word count requirement is met
     - Shows word count progress when applicable
     - Maintains consistent styling with gradient effects

   4. **Accessibility Features**
     - Clear visual feedback
     - Hover states for interactivity
     - Readable time remaining display
     - High contrast in both light/dark modes

   ### Implementation Details

   1. **Progress Calculation**
   ```typescript
   const progress = timeAllocation 
     ? Math.max(0, 100 - (timeElapsed / (timeAllocation * 60)) * 100) 
     : 0;
   ```

   2. **Time Formatting**
   ```typescript
   const formatTimeRemaining = (seconds: number) => {
     if (!timeAllocation) return "∞";
     const remainingSeconds = Math.max(0, (timeAllocation * 60) - seconds);
     const minutes = Math.floor(remainingSeconds / 60);
     const secs = Math.floor(remainingSeconds % 60);
     return `${minutes}:${secs.toString().padStart(2, '0')}`;
   };
   ```

   3. **Conditional Rendering Logic**
   ```typescript
   if (isTimeUp) {
     return <GradeButton onClick={onGradeChallenge} />;
   }

   if (isHovered && showGradeButton) {
     return (
       <GradeButton 
         onClick={onGradeChallenge}
         onMouseLeave={() => setIsHovered(false)}
         showWordCount
         wordCount={wordCount}
         requiredWordCount={requiredWordCount}
       />
     );
   }
   ```

   ### Usage Guidelines

   1. **Time Allocation**
     - Optional parameter
     - When undefined, shows "∞" for time remaining
     - Specified in minutes, converted to seconds internally

   2. **Word Count Requirements**
     - Set `requiredWordCount` to enable word count checking
     - Grade button appears only when `wordCount >= requiredWordCount`
     - Word count display shows progress toward goal

   3. **Mode-Specific Styling**
     - 'exam' mode: Blue progress bar (#2563eb)
     - 'practice' mode: Green progress bar (#059669)

   4. **Event Handling**
     - `onGradeChallenge`: Callback for grading action
     - `onMouseEnter/onMouseLeave`: For hover state management
     - Automatic cleanup of animation frames

   ### Best Practices

   1. **Performance Optimization**
     - Use `useRef` for animation frame management
     - Implement smooth transitions with CSS
     - Avoid unnecessary re-renders

   2. **Styling Consistency**
     - Maintain gradient effects across states
     - Use consistent spacing and sizing
     - Follow dark mode guidelines

   3. **Error Prevention**
     - Handle undefined timeAllocation gracefully
     - Prevent negative progress values
     - Manage cleanup of animation frames

   4. **Accessibility**
     - Maintain readable contrast ratios
     - Provide clear visual feedback
     - Support keyboard navigation

   ## Global State Management

   ### 1. useTestState Hook (`hooks/useTestState.ts`)

   #### Purpose
   Centralized state management for test-related UI states and timers.

   #### Key States
   - `showChallenges`: Controls challenge selection visibility
   - `showEvaluation`: Controls evaluation view visibility
   - `idleTimer`: Manages user inactivity countdown

   #### Core Functions
   ```typescript
   interface TestState {
     showChallenges: boolean;
     showEvaluation: boolean;
     idleTimer: number | null;
     setShowChallenges: (show: boolean) => void;
     setShowEvaluation: (show: boolean) => void;
     setIdleTimer: (time: number | null) => void;
     startChallenge: () => void;
     resetState: () => void;
   }
   ```

   ##### `startChallenge()`
   - Purpose: Initializes challenge state
   - Actions:
     - Sets showChallenges to false
     - Sets showEvaluation to false
     - Resets idleTimer to 20 seconds

   ##### `resetState()`
   - Purpose: Resets all states to default
   - Actions:
     - Clears all UI states
     - Nullifies idleTimer

   #### Integration Points
   1. **Test Component** (`index.tsx`)
     - Uses global states for UI visibility
     - Manages idle timer through global state
     - Calls startChallenge on new challenge initialization

   2. **LeftColumn Component** (`LeftColumn.tsx`)
     - Consumes global UI states
     - Updates challenge visibility state
     - Manages evaluation view state

   #### State Flow
   ```mermaid
   graph TD
       A[User Action] --> B[useTestState]
       B --> C[Test Component]
       B --> D[LeftColumn Component]
       C --> E[UI Updates]
       D --> E
   ```

   #### Best Practices
   1. **State Updates**
     - Always use provided state setters
     - Avoid direct state manipulation
     - Use startChallenge for initialization
     - Use resetState for cleanup

   2. **Timer Management**
     - Reset timer through startChallenge
     - Clear timer through resetState
     - Update timer only through setIdleTimer

   3. **Component Integration**
     - Import only needed state and functions
     - Use destructuring for clean code
     - Maintain single source of truth

   ## Challenge Evaluation API

   Located in `app/api/challenge-evaluation/route.ts`, this API endpoint handles the evaluation of writing challenges and provides comprehensive feedback.

   ### API Structure

   #### Request Format
   ```typescript
   {
     challengeId: string;    // ID of the challenge being evaluated
     content: string;        // The user's written content
     timeSpent: number;      // Time spent on the challenge in seconds
   }
   ```

   #### Response Format
   ```typescript
   {
     performanceMetrics: {
       wordCount: number;        // Total words in submission
       paragraphCount: number;   // Number of paragraphs
       timeSpent: number;        // Time taken in seconds
       performanceScore: number; // Overall score (0-1)
       feedback: string;         // AI-generated feedback
     },
     skillMetrics: {
       writingComplexity: number; // Sentence complexity (0-1)
       accuracy: number;          // Content accuracy (0-1)
       coherence: number;         // Logical flow (0-1)
       style: number;            // Writing style (0-1)
     },
     insights: {
       strengths: string[];      // List of identified strengths
       weaknesses: string[];     // Areas needing improvement
       tips: string[];          // Actionable improvement suggestions
     }
   }
   ```

   ### Validation and Error Handling

   #### Input Validation
   - Ensures `challengeId` is provided
   - Verifies `content` is non-empty
   - Validates request structure

   #### Response Validation
   1. **JSON Extraction**
     - Safely extracts JSON from AI response
     - Handles potential formatting issues
     - Validates JSON structure

   2. **Array Validation**
     ```typescript
     // Validates insight arrays (strengths, weaknesses, tips)
     const validateInsightArray = (arr: any[], name: string): string[] => {
       if (!arr.every(item => typeof item === 'string' && item.trim())) {
         throw new Error(`Invalid ${name} format`);
       }
       return arr.map(item => item.trim());
     };
     ```

   3. **Data Requirements**
     - Non-empty arrays for insights
     - Valid numeric ranges for metrics
     - Complete response structure

   #### Error States
   1. **400 Bad Request**
     - Empty content
     - Missing challenge ID
     - Invalid request format

   2. **429 Rate Limit**
     - Too many requests
     - AI service limitations

   3. **500 Internal Error**
     - AI response parsing failure
     - Invalid response structure
     - Missing required data

   ### Integration Points

   1. **Frontend Components**
     - `EvaluationAccordion`: Displays evaluation results
     - `FocusCard`: Shows strengths, weaknesses, and tips
     - `MetricsCard`: Visualizes performance metrics

   2. **State Management**
     - `useEvaluationState`: Manages evaluation data
     - Handles loading and error states
     - Updates UI based on response

   3. **Data Flow**
     ```
     User Submission → API Request → AI Processing → 
     Validation → Response Formatting → State Update → UI Render
     ```

   ### Best Practices

   1. **Error Handling**
     - Always validate API responses
     - Provide clear error messages
     - Implement retry mechanisms
     - Log validation failures

   2. **Performance**
     - Cache evaluation results
     - Implement rate limiting
     - Optimize response size

   3. **Security**
     - Sanitize user input
     - Validate request origins
     - Protect sensitive data

   ### Testing Checklist

   - [ ] Input validation
     - [ ] Empty content handling
     - [ ] Invalid challenge ID
     - [ ] Malformed requests

   - [ ] Response validation
     - [ ] Array structure
     - [ ] Data completeness
     - [ ] Type checking

   - [ ] Error handling
     - [ ] Rate limit responses
     - [ ] Parsing failures
     - [ ] Network errors

   - [ ] Integration
     - [ ] Frontend updates
     - [ ] State management
     - [ ] UI rendering

   ### Known Issues and Solutions

   1. **Empty Insight Arrays**
     - Issue: FocusCards appearing blank
     - Solution: Added strict array validation
     - Prevention: Validate response structure

   2. **Invalid Metrics**
     - Issue: Scores outside 0-1 range
     - Solution: Value normalization
     - Prevention: Range validation

   3. **Response Format**
     - Issue: Inconsistent AI responses
     - Solution: JSON extraction utility
     - Prevention: Structured prompts

   ### Maintenance Notes

   1. **Regular Checks**
     - Monitor error rates
     - Review AI response quality
     - Update validation rules

   2. **Updates Required**
     - Document API changes
     - Test new validations
     - Update error messages

   3. **Performance Monitoring**
     - Track response times
     - Monitor rate limits
     - Log validation failures

   ## AI Suggestions System

   ### Overview
   The AI suggestions system provides real-time writing assistance through the `useTestAISuggestions` hook. This system is designed to offer contextual suggestions while maintaining a smooth user experience and managing API resources efficiently.

   ### Key Components

   #### 1. useTestAISuggestions Hook
   Located in `hooks/useTestAISuggestions.ts`, this hook manages the entire suggestion lifecycle.

   ##### Core Features
   - **Debounced Suggestions**: Waits for 1 second of no typing before generating suggestions
   - **Rate Limiting**: Handles both temporary and daily API rate limits
   - **Request Management**: Automatically cancels stale requests
   - **Error Handling**: Provides user-friendly error messages with emojis

   ##### Usage Example
   ```typescript
   const {
     isActive,
     isRateLimited,
     isDailyLimitReached,
     start,
     stop
   } = useTestAISuggestions({
     challenge: selectedChallenge,
     content: inputMessage,
     enabled: true,
     onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
     onError: (error) => toast(error),
     targetLanguage: 'EN'
   });
   ```

   ##### States
   - `isActive`: Whether suggestions are currently active
   - `isRateLimited`: Temporary rate limit status
   - `isDailyLimitReached`: Daily API limit status

   ##### Methods
   - `start()`: Begin suggestion generation
   - `stop()`: Stop suggestion generation and cleanup

   ##### Error Messages
   The hook provides friendly, encouraging error messages:
   - Daily limit: "We've reached today's AI suggestion limit. Don't worry though - it'll reset tomorrow! 🌅"
   - Rate limit: "Taking a quick breather to process suggestions. Keep writing! ✨"
   - Generic error: "Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟"

   #### 2. Integration with Test Component
   The suggestions system is integrated into the main test component through:
   - Automatic suggestion triggering after typing pauses
   - Clear error feedback through toast messages
   - Graceful degradation when limits are reached

   ### Implementation Details

   #### 1. Debouncing Logic
   ```typescript
   useEffect(() => {
     if (!enabled) return;
     
     // Clear previous timer
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
       debounceRef.current = null;
     }

     // Wait for typing to stop
     debounceRef.current = setTimeout(() => {
       start();
     }, 1000);

     return () => {
       if (debounceRef.current) {
         clearTimeout(debounceRef.current);
         debounceRef.current = null;
       }
     };
   }, [enabled, content, start]);
   ```

   #### 2. Request Management
   - Uses AbortController to cancel pending requests
   - Tracks last content to prevent duplicate suggestions
   - Cleans up resources on component unmount

   #### 3. Error Handling Strategy
   - User-friendly messages with emojis
   - Different handling for temporary vs daily limits
   - Clear feedback through toast notifications

   ### Best Practices

   1. **Rate Limit Handling**
     - Don't retry automatically on rate limits
     - Show clear feedback to users
     - Differentiate between temporary and daily limits

   2. **Resource Management**
     - Cancel pending requests when new ones start
     - Clean up timers and controllers on unmount
     - Track and prevent duplicate suggestions

   3. **User Experience**
     - Use friendly, encouraging error messages
     - Maintain smooth typing experience
     - Provide clear status indicators

   ### Troubleshooting

   1. **Frequent Rate Limits**
     - Check typing debounce timing
     - Verify content change detection
     - Review API usage patterns

   2. **Stale Suggestions**
     - Ensure proper request cancellation
     - Check content tracking logic
     - Verify cleanup on unmount

   3. **Performance Issues**
     - Monitor debounce timing
     - Check request cleanup
     - Review state update frequency

   ## Language Learning Feedback System

   ### Overview
   The language learning feedback system provides AI-powered feedback on user submissions, offering detailed metrics and suggestions. The system is designed to be modular, extensible, and user-friendly.

   ### Feedback Format
   The system provides three types of feedback markers:
   ```
   - Correct usage or instruction alignment
   - Error identification or improvement area
   - Translation or improvement suggestion
   ```

   ### Format Rules
   1. **Marker Usage**
     - Each marker appears exactly once
     - No additional text in markers
     - Consistent order: , 

   2. **Content Requirements**
     - Concise, specific feedback
     - No questions or hypotheticals
     - Translation required for non-target language

   3. **Response Structure**
     ```typescript
     interface FeedbackResponse {
       correctUsage: string;    - marker
       errorPoint: string;      - marker
       suggestion: string;      - marker
     }
     ```

   4. **Implementation Notes**
     - Validates target language usage
     - Provides specific error context
     - Ensures actionable improvements
     - Maintains consistent formatting

   ### Usage in LeftColumn

   The LeftColumn component (`components/dashboard/test/LeftColumn.tsx`) integrates the feedback system through:

   1. **State Management**
     ```typescript
     const {
       showFeedback,
       performanceMetrics,
       isLoading,
       error
     } = useFeedbackState(challenge, isTimeUp, content);
     ```

   2. **UI Integration**
     - Renders FeedbackAccordion when feedback is available
     - Shows loading states during feedback generation
     - Displays error messages when needed
     - Manages visibility of feedback results

   ### Best Practices

   1. **Error Handling**
     - Always provide user-friendly error messages
     - Log technical details for debugging
     - Implement proper rate limiting
     - Handle network issues gracefully

   2. **Performance**
     - Minimize unnecessary API calls
     - Cache results when appropriate
     - Implement proper loading states
     - Handle large responses efficiently

   3. **User Experience**
     - Show clear loading indicators
     - Provide helpful error messages
     - Maintain consistent UI during feedback generation
     - Allow easy navigation between instructions and feedback

   4. **Security**
     - Validate all inputs
     - Sanitize user content
     - Protect sensitive data
     - Implement proper rate limiting

   ### Known Limitations

   1. **Rate Limiting**
     - AI service has request limits
     - Implement proper queuing if needed
     - Consider fallback options

   2. **Response Time**
     - AI processing can take time
     - Show appropriate loading states
     - Consider partial results display

   3. **Content Size**
     - Large submissions may need chunking
     - Consider implementing progress indicators
     - Handle timeout scenarios

   ### Future Improvements

   1. **Metrics Enhancement**
     - Add more detailed writing metrics
     - Implement historical comparison
     - Add peer comparison features

   2. **UI Improvements**
     - Add visual metrics representation
     - Implement progress tracking
     - Add export functionality

   3. **Performance Optimization**
     - Implement response caching
     - Add offline support
     - Optimize large content handling

   ## Global State Management

   ### 1. useTestState Hook (`hooks/useTestState.ts`)

   #### Purpose
   Centralized state management for test-related UI states and timers.

   #### Key States
   - `showChallenges`: Controls challenge selection visibility
   - `showEvaluation`: Controls evaluation view visibility
   - `idleTimer`: Manages user inactivity countdown

   #### Core Functions
   ```typescript
   interface TestState {
     showChallenges: boolean;
     showEvaluation: boolean;
     idleTimer: number | null;
     setShowChallenges: (show: boolean) => void;
     setShowEvaluation: (show: boolean) => void;
     setIdleTimer: (time: number | null) => void;
     startChallenge: () => void;
     resetState: () => void;
   }
   ```

   ##### `startChallenge()`
   - Purpose: Initializes challenge state
   - Actions:
     - Sets showChallenges to false
     - Sets showEvaluation to false
     - Resets idleTimer to 20 seconds

   ##### `resetState()`
   - Purpose: Resets all states to default
   - Actions:
     - Clears all UI states
     - Nullifies idleTimer

   #### Integration Points
   1. **Test Component** (`index.tsx`)
     - Uses global states for UI visibility
     - Manages idle timer through global state
     - Calls startChallenge on new challenge initialization

   2. **LeftColumn Component** (`LeftColumn.tsx`)
     - Consumes global UI states
     - Updates challenge visibility state
     - Manages evaluation view state

   #### State Flow
   ```mermaid
   graph TD
       A[User Action] --> B[useTestState]
       B --> C[Test Component]
       B --> D[LeftColumn Component]
       C --> E[UI Updates]
       D --> E
   ```

   #### Best Practices
   1. **State Updates**
     - Always use provided state setters
     - Avoid direct state manipulation
     - Use startChallenge for initialization
     - Use resetState for cleanup

   2. **Timer Management**
     - Reset timer through startChallenge
     - Clear timer through resetState
     - Update timer only through setIdleTimer

   3. **Component Integration**
     - Import only needed state and functions
     - Use destructuring for clean code
     - Maintain single source of truth

   ## Challenge Evaluation API

   Located in `app/api/challenge-evaluation/route.ts`, this API endpoint handles the evaluation of writing challenges and provides comprehensive feedback.

   ### API Structure

   #### Request Format
   ```typescript
   {
     challengeId: string;    // ID of the challenge being evaluated
     content: string;        // The user's written content
     timeSpent: number;      // Time spent on the challenge in seconds
   }
   ```

   #### Response Format
   ```typescript
   {
     performanceMetrics: {
       wordCount: number;        // Total words in submission
       paragraphCount: number;   // Number of paragraphs
       timeSpent: number;        // Time taken in seconds
       performanceScore: number; // Overall score (0-1)
       feedback: string;         // AI-generated feedback
     },
     skillMetrics: {
       writingComplexity: number; // Sentence complexity (0-1)
       accuracy: number;          // Content accuracy (0-1)
       coherence: number;         // Logical flow (0-1)
       style: number;            // Writing style (0-1)
     },
     insights: {
       strengths: string[];      // List of identified strengths
       weaknesses: string[];     // Areas needing improvement
       tips: string[];          // Actionable improvement suggestions
     }
   }
   ```

   ### Validation and Error Handling

   #### Input Validation
   - Ensures `challengeId` is provided
   - Verifies `content` is non-empty
   - Validates request structure

   #### Response Validation
   1. **JSON Extraction**
     - Safely extracts JSON from AI response
     - Handles potential formatting issues
     - Validates JSON structure

   2. **Array Validation**
     ```typescript
     // Validates insight arrays (strengths, weaknesses, tips)
     const validateInsightArray = (arr: any[], name: string): string[] => {
       if (!arr.every(item => typeof item === 'string' && item.trim())) {
         throw new Error(`Invalid ${name} format`);
       }
       return arr.map(item => item.trim());
     };
     ```

   3. **Data Requirements**
     - Non-empty arrays for insights
     - Valid numeric ranges for metrics
     - Complete response structure

   #### Error States
   1. **400 Bad Request**
     - Empty content
     - Missing challenge ID
     - Invalid request format

   2. **429 Rate Limit**
     - Too many requests
     - AI service limitations

   3. **500 Internal Error**
     - AI response parsing failure
     - Invalid response structure
     - Missing required data

   ### Integration Points

   1. **Frontend Components**
     - `EvaluationAccordion`: Displays evaluation results
     - `FocusCard`: Shows strengths, weaknesses, and tips
     - `MetricsCard`: Visualizes performance metrics

   2. **State Management**
     - `useEvaluationState`: Manages evaluation data
     - Handles loading and error states
     - Updates UI based on response

   3. **Data Flow**
     ```
     User Submission → API Request → AI Processing → 
     Validation → Response Formatting → State Update → UI Render
     ```

   ### Best Practices

   1. **Error Handling**
     - Always validate API responses
     - Provide clear error messages
     - Implement retry mechanisms
     - Log validation failures

   2. **Performance**
     - Cache evaluation results
     - Implement rate limiting
     - Optimize response size

   3. **Security**
     - Sanitize user input
     - Validate request origins
     - Protect sensitive data

   ### Testing Checklist

   - [ ] Input validation
     - [ ] Empty content handling
     - [ ] Invalid challenge ID
     - [ ] Malformed requests

   - [ ] Response validation
     - [ ] Array structure
     - [ ] Data completeness
     - [ ] Type checking

   - [ ] Error handling
     - [ ] Rate limit responses
     - [ ] Parsing failures
     - [ ] Network errors

   - [ ] Integration
     - [ ] Frontend updates
     - [ ] State management
     - [ ] UI rendering

   ### Known Issues and Solutions

   1. **Empty Insight Arrays**
     - Issue: FocusCards appearing blank
     - Solution: Added strict array validation
     - Prevention: Validate response structure

   2. **Invalid Metrics**
     - Issue: Scores outside 0-1 range
     - Solution: Value normalization
     - Prevention: Range validation

   3. **Response Format**
     - Issue: Inconsistent AI responses
     - Solution: JSON extraction utility
     - Prevention: Structured prompts

   ### Maintenance Notes

   1. **Regular Checks**
     - Monitor error rates
     - Review AI response quality
     - Update validation rules

   2. **Updates Required**
     - Document API changes
     - Test new validations
     - Update error messages

   3. **Performance Monitoring**
     - Track response times
     - Monitor rate limits
     - Log validation failures

   ## AI Suggestions System

   ### Overview
   The AI suggestions system provides real-time writing assistance through the `useTestAISuggestions` hook. This system is designed to offer contextual suggestions while maintaining a smooth user experience and managing API resources efficiently.

   ### Key Components

   #### 1. useTestAISuggestions Hook
   Located in `hooks/useTestAISuggestions.ts`, this hook manages the entire suggestion lifecycle.

   ##### Core Features
   - **Debounced Suggestions**: Waits for 1 second of no typing before generating suggestions
   - **Rate Limiting**: Handles both temporary and daily API rate limits
   - **Request Management**: Automatically cancels stale requests
   - **Error Handling**: Provides user-friendly error messages with emojis

   ##### Usage Example
   ```typescript
   const {
     isActive,
     isRateLimited,
     isDailyLimitReached,
     start,
     stop
   } = useTestAISuggestions({
     challenge: selectedChallenge,
     content: inputMessage,
     enabled: true,
     onSuggestion: (suggestion) => setCurrentSuggestion(suggestion),
     onError: (error) => toast(error),
     targetLanguage: 'EN'
   });
   ```

   ##### States
   - `isActive`: Whether suggestions are currently active
   - `isRateLimited`: Temporary rate limit status
   - `isDailyLimitReached`: Daily API limit status

   ##### Methods
   - `start()`: Begin suggestion generation
   - `stop()`: Stop suggestion generation and cleanup

   ##### Error Messages
   The hook provides friendly, encouraging error messages:
   - Daily limit: "We've reached today's AI suggestion limit. Don't worry though - it'll reset tomorrow! 🌅"
   - Rate limit: "Taking a quick breather to process suggestions. Keep writing! ✨"
   - Generic error: "Having a bit of trouble with suggestions at the moment. Keep writing - you're doing great! 🌟"

   #### 2. Integration with Test Component
   The suggestions system is integrated into the main test component through:
   - Automatic suggestion triggering after typing pauses
   - Clear error feedback through toast messages
   - Graceful degradation when limits are reached

   ### Implementation Details

   #### 1. Debouncing Logic
   ```typescript
   useEffect(() => {
     if (!enabled) return;
     
     // Clear previous timer
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
       debounceRef.current = null;
     }

     // Wait for typing to stop
     debounceRef.current = setTimeout(() => {
       start();
     }, 1000);

     return () => {
       if (debounceRef.current) {
         clearTimeout(debounceRef.current);
         debounceRef.current = null;
       }
     };
   }, [enabled, content, start]);
   ```

   #### 2. Request Management
   - Uses AbortController to cancel pending requests
   - Tracks last content to prevent duplicate suggestions
   - Cleans up resources on component unmount

   #### 3. Error Handling Strategy
   - User-friendly messages with emojis
   - Different handling for temporary vs daily limits
   - Clear feedback through toast notifications

   ### Best Practices

   1. **Rate Limit Handling**
     - Don't retry automatically on rate limits
     - Show clear feedback to users
     - Differentiate between temporary and daily limits

   2. **Resource Management**
     - Cancel pending requests when new ones start
     - Clean up timers and controllers on unmount
     - Track and prevent duplicate suggestions

   3. **User Experience**
     - Use friendly, encouraging error messages
     - Maintain smooth typing experience
     - Provide clear status indicators

   ### Troubleshooting

   1. **Frequent Rate Limits**
     - Check typing debounce timing
     - Verify content change detection
     - Review API usage patterns

   2. **Stale Suggestions**
     - Ensure proper request cancellation
     - Check content tracking logic
     - Verify cleanup on unmount

   3. **Performance Issues**
     - Monitor debounce timing
     - Check request cleanup
     - Review state update frequency

   ## Recent UI/UX Enhancements

   ### 1. Notebook-Style Writing Interface
   The writing interface has been styled to resemble a traditional notebook page for a more natural writing experience:

   ##### Textarea Styling
   - Custom ruled lines with 1.5rem spacing
   - Left margin line at 4rem (red line)
   - Paper-like texture and background
   - Times New Roman font for classic appearance
   - Disabled spell checking for distraction-free writing
   - Consistent text color in both light and dark modes

   ```typescript
   <textarea
     style={{
       backgroundImage: `
         linear-gradient(transparent, transparent calc(1.5rem - 1px), #e5e7eb calc(1.5rem - 1px), #e5e7eb 1.5rem, transparent 1.5rem),
         linear-gradient(90deg, transparent 4rem, #f3f4f6 4rem, #f3f4f6 4.25rem, transparent 4.25rem),
         linear-gradient(#fafafa, #fafafa)
       `,
       backgroundSize: '100% 1.5rem, 100% 100%, 100% 100%',
       backgroundAttachment: 'local, scroll, scroll',
       lineHeight: '1.5rem',
       paddingTop: '1.5rem',
       paddingLeft: '4.5rem',
       fontFamily: '"Times New Roman", Times, serif',
       fontSize: '1.125rem'
     }}
     spellCheck="false"
     className="..."
   />
   ```

   ### 2. AI Suggestions Display
   Enhanced the suggestions UI with:
   - Elegant quote decorations
   - Gradient backgrounds
   - Responsive layout
   - Improved typography and spacing
   - Dark mode support

   The suggestions are displayed in a card with:
   - Yellow/amber gradient background
   - Decorative quote marks
   - Subtle border and shadow effects
   - Clear visual hierarchy

   These enhancements aim to create a more immersive and focused writing environment while maintaining functionality and accessibility.
