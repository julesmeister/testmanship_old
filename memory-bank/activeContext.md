# Active Context

This document captures the current state of work. It includes the immediate focus, recent modifications, planned next steps, and any active decisions or considerations relevant to the ongoing tasks.

## Current Focus

- Refining UI components for the Dashboard.
- Consolidating `UserHeader` and `StudyStatsWidget` into a single `UserSummaryCard` component.

## Recent Changes

- **Merged `UserHeader` and `StudyStatsWidget` into `UserSummaryCard.tsx`.**
  - Created `src/components/dashboard/UserSummaryCard.tsx`.
  - Updated `src/components/dashboard/index.ts` to export the new component.
  - Updated `src/app/dashboard.tsx` to use the new component.
  - Deleted `src/components/dashboard/UserHeader.tsx` and `src/components/dashboard/StudyStatsWidget.tsx`.
- Prototyped all initial dashboard widgets (`UpcomingExamsWidget`, `LeaderboardWidget`, `RecentActivityWidget`, `CliquesWidget`, `NotificationsWidget`) using the `Card` component and `ContentComponent` prop for their main content area, with mock data and basic styling.
- Addressed various linter errors in dashboard components (React imports, color definitions, style property order, icon names, Fragment usage).
- Updated platform target priorities in `projectbrief.md` and `activeContext.md` (Android > Web > iOS).
- Populated initial Memory Bank files based on `README.md`.
- Documented `Card` component usage pattern in `.cursorrules` and `systemPatterns.md`.

## Next Steps

- Verify the new `UserSummaryCard` renders correctly and meets requirements for being hideable.
- Continue developing and refining other dashboard widgets as outlined in `progress.md` and the UI schematic.
- Begin detailed planning for the features outlined in `progress.md` and `projectbrief.md`.

## Active Decisions & Considerations

- The `UserSummaryCard` now combines user greeting/avatar and key study statistics. This entire card is considered `[Hideable]` as per the UI schematic.
- The `Card` component in `@/components` is designed to receive its primary content via specific props like `ContentComponent`, `HeadingComponent`, etc., rather than `props.children` for its main structured areas. This pattern should be followed for consistent rendering.
- The project is in its initial phase; all features described in the README are considered for implementation.
- The primary platform target is Android (phones and tablets), with Web as a secondary target, and iOS as tertiary.
- Offline-first is a critical architectural consideration. 