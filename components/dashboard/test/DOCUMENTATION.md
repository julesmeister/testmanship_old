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
  - Updates input message
  - Shows feedback window on first typing
  - Preserves previous text for comparison

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

## Related Files
- `/hooks/useAIFeedback.ts`: Central feedback state
- `/hooks/useFeedbackGeneration.ts`: Feedback generation logic
- `/hooks/useChallenge.ts`: Challenge state management
- `/types/challenge.ts`: Type definitions
- `/components/ui/*`: UI components

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
   - [ ] Graceful degradation

5. Components
   - [ ] DraggableWindow functions
   - [ ] ChallengeCard displays correctly
   - [ ] All props passed correctly

This documentation should be reviewed and updated whenever making changes to ensure system integrity.
