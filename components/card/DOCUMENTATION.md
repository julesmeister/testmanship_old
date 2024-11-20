# Card Components Documentation

A collection of reusable card components for consistent UI presentation across the application.

## Component Overview

### Base Components

1. `GradientCard`
   - Base card component with gradient background
   - Used as foundation for other card components
   - Props:
     - `className?: string` - Additional CSS classes
     - `children: React.ReactNode` - Card content

2. `InfoCard`
   - General-purpose information card
   - Props:
     - `title: string` - Card title
     - `content: string | React.ReactNode` - Card content
     - `className?: string` - Additional CSS classes

### Special Purpose Cards

1. `InstructionsCard`
   - Specialized card for displaying test/challenge instructions
   - Props:
     - `instructions: string | React.ReactNode` - Instruction content
     - `className?: string` - Additional CSS classes

2. `FocusCard`
   - Card with emphasis styling for important content
   - Props:
     - `title: string` - Card title
     - `content: string | React.ReactNode` - Card content
     - `highlight?: boolean` - Enable highlight styling

### UI Elements

1. `DifficultyBadge`
   - Visual indicator for CEFR difficulty levels
   - Props:
     - `difficulty: DifficultyLevel` - CEFR level (A1-C2)
     - `size?: 'sm' | 'md' | 'lg'` - Badge size

2. `FooterStats`
   - Statistics display for card footers
   - Props:
     - `stats: Stats` - Statistics data
     - `className?: string` - Additional CSS classes

## Usage Guidelines

1. Import components:
   ```typescript
   import { GradientCard, InfoCard, DifficultyBadge } from '@/components/card';
   ```

2. Basic usage:
   ```typescript
   <GradientCard className="p-4">
     <h2>Title</h2>
     <p>Content</p>
   </GradientCard>
   ```

3. Composition example:
   ```typescript
   <GradientCard>
     <DifficultyBadge difficulty="B2" />
     <InfoCard title="Tips" content="..." />
     <FooterStats stats={stats} />
   </GradientCard>
   ```

## Development Guidelines

When modifying card components:

1. Component Structure
   - [ ] Keep components focused and single-purpose
   - [ ] Use composition over inheritance
   - [ ] Maintain consistent prop patterns

2. Styling
   - [ ] Use Tailwind utilities
   - [ ] Support dark/light modes
   - [ ] Ensure responsive design
   - [ ] Follow accessibility guidelines

3. Testing
   - [ ] Add unit tests for new components
   - [ ] Test responsive behavior
   - [ ] Verify accessibility
   - [ ] Test with different content types

4. Documentation
   - [ ] Update this document
   - [ ] Add JSDoc comments
   - [ ] Include usage examples
   - [ ] Document breaking changes

## Migration Guide

When migrating from dashboard-specific cards:

1. Update imports:
   ```typescript
   // Before
   import { InfoCard } from '@/components/dashboard/test/components/cards';
   
   // After
   import { InfoCard } from '@/components/card';
   ```

2. Check prop compatibility
3. Test in all usage contexts
4. Update related documentation

## Related Components
- `components/ui/card` - Base card components
- `components/dashboard/test` - Test interface components
- `components/dashboard/challenges` - Challenge components
