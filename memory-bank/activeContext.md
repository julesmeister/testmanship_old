# Active Context

This document captures the current state of work. It includes the immediate focus, recent modifications, planned next steps, and any active decisions or considerations relevant to the ongoing tasks.

## Current Focus

- Implementing the tab-based navigation structure with dedicated screens for each major feature.
- Developing the notebook list UI for the Home tab.

## Recent Changes

- **Migrated from dashboard-based to tab-based structure**
  - Created `src/app/(tabs)` directory with dedicated screens for each tab: `index.tsx` (Home), `activity.tsx`, `leaderboard.tsx`, `cliques.tsx`, and `notifications.tsx`.
  - Implemented tab layout configuration in `src/app/(tabs)/_layout.tsx` using Expo Router's Tabs component.
  - Each tab now hosts its corresponding widget as a full-screen component.
- **Implemented notebook list in Home tab**
  - Added `NotebookItem` component with options menu.
  - Created mock data for notebooks and implemented basic list UI.
  - Added actions for rename, share, and delete options.
  - Fixed React fragment import error.
- **Developed more detailed Cliques tab**
  - Added Upcoming Exams section with mock data.
  - Implemented exam creation modal with form.
- **Enhanced icon system with Material Design icons**
  - Added `@expo/vector-icons` package for access to icon libraries.
  - Created new `MaterialIcon` component to use standard Material Design icons.
  - Replaced placeholder "components" icon with proper "add" icon for add buttons.

## Next Steps

- Implement notebook creation functionality.
- Develop notebook detail screen with topics list.
- Complete remaining tab screens with proper content and functionality.
- Begin implementing PDF annotation features.

## Active Decisions & Considerations

- The application now uses a tab-based navigation structure with dedicated screens for Home, Activity, Leaderboard, Cliques, and Notifications.
- The `UserSummaryCard` is displayed only on the Home screen along with the notebooks list.
- Each tab screen directly uses its corresponding widget component as the main content.
- The primary platform target remains Android (phones and tablets), with Web as a secondary target, and iOS as tertiary.
- Offline-first is still a critical architectural consideration.
- The app now uses both the original icon system (through the `Icon` component) and Material Design icons (through the new `MaterialIcon` component) to provide a richer set of icons. 