# Wordsmiths Documentation

This document provides comprehensive documentation for the Wordsmiths feature in Testmanship, which displays user information and statistics.

## Directory Structure
```
wordsmiths/
├── index.tsx     # Main Wordsmiths container component
└── page.tsx      # Next.js page component
```

## Core Components

### 1. Wordsmiths Container (index.tsx)
The main container component that displays user information:
- Uses DashboardLayout for consistent UI with other dashboard pages
- Manages user data fetching and state
- Implements search functionality
- Displays user cards in a responsive grid

### 2. User Card
Each user card displays:
- Avatar and full name
- Target and native languages (with badges)
- Credits and trial credits
- Last updated timestamp

## Layout Integration

### DashboardLayout
The component integrates with the shared dashboard layout:
```typescript
return (
  <DashboardLayout user={user} userDetails={userDetails}>
    {content}
  </DashboardLayout>
);
```

This ensures:
- Consistent navigation with sidebar
- Shared header and user context
- Responsive layout handling
- Unified styling across dashboard

## State Management

### User Data Structure
```typescript
interface WordsmithUser {
  id: string;
  full_name: string;
  avatar_url: string;
  credits: number;
  trial_credits: number;
  target_language?: { name: string };
  native_language?: { name: string };
  updated_at: string;
}
```

### Data Flow
1. Initial data fetching on component mount
2. Real-time search filtering
3. Responsive grid layout adaptation

## Features

### 1. Search Functionality
- Case-insensitive search
- Filters by user's full name
- Real-time filtering as user types

### 2. User Information Display
- Avatar with fallback to initials
- Language badges for target and native languages
- Credit information display

### 3. Responsive Design
- Grid layout adapts to screen size:
  - 1 column on mobile
  - 2 columns on tablet
  - 3 columns on desktop

## Database Integration

### Supabase Query
```sql
SELECT
  id,
  full_name,
  avatar_url,
  credits,
  trial_credits,
  target_language:target_language_id(name),
  native_language:native_language_id(name),
  updated_at
FROM users
ORDER BY full_name
```

### Security Considerations
- Utilizes Supabase RLS policies
- Only authenticated users can access the page
- Users can only view public user information

## UI Components Used
- Card, CardContent from @/components/ui/card
- Input from @/components/ui/input
- Label from @/components/ui/label
- Badge from @/components/ui/badge
- Avatar components from @/components/ui/avatar
- Search icon from lucide-react

## Error Handling
- Console error logging for fetch failures
- Loading state management
- Graceful handling of missing data (optional fields)
