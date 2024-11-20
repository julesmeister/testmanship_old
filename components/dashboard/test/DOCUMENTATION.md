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
   - Purpose: Displays challenge metadata
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
   - Purpose: Displays focused information with visual emphasis
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

   ## Recent Updates (2024)

   ### Card Components Refactoring
   1. **FocusCard**
      - Simplified props interface
      - Added specific color schemes for emerald and amber
      - Improved dark mode support
      - Enhanced accessibility with semantic HTML

   2. **GradientCard**
      - Streamlined props to essential fields
      - Updated gradient styling
      - Improved dark mode compatibility
      - Better responsive design

   3. **InstructionsCard**
      - Migrated to HiClipboardDocument icon
      - Enhanced readability with better text formatting
      - Improved dark mode support
      - Added line-by-line instruction rendering

   4. **InfoCard**
      - Simplified color scheme options (blue/purple)
      - Enhanced dark mode support
      - Improved typography and spacing
      - Better icon integration

   5. **FooterStats**
      - Added dynamic minute/minutes text based on time allocation
      - Enhanced difficulty level badge styling
      - Improved dark mode support
      - Better responsive layout

   ### LeftColumn Component Updates
   1. **Pagination Improvements**
      - Added conditional rendering (only shows when totalPages > 1)
      - Enhanced spacing and layout
      - Centered pagination controls
      - Improved dark mode border colors

   2. **Time Display Enhancement**
      - Added grammatically correct singular/plural form for time allocation
      - Example: "1 minute" vs "2 minutes"

   These updates focus on maintaining visual consistency, improving dark mode support, and enhancing user experience across all components.

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
