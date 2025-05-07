# Progress

This document tracks the development progress. It outlines what functionalities are currently working, what remains to be built, the overall status, and any known issues or bugs.

## What Works

- (N/A - Project in planning phase based on README)

## What's Left to Build

- **User Authentication & Profile Management**
- **Notebook & Topic Management UI/Logic**
  - CRUD operations for notebooks and topics.
  - Attachment handling (images, audio, video, files).
- **PDF Annotation Feature**
  - PDF viewer integration (`react-native-pdf`).
  - Highlight creation, display, and storage.
  - Note creation, display, and storage, linked to highlights/attachments.
- **Occlusion Card Feature**
  - Occlusion creation UI (defining areas on PDFs/images).
  - Quiz interface for reviewing occlusion cards.
  - Spaced repetition algorithm implementation.
  - User ratings for cards (sad, neutral, happy).
- **Study Statistics & Mastery Tracking**
  - Data models and logic for `User.statistics` (notebook and topic stats).
  - Calculation and display of mastery, review streaks, longest streaks, average ratings.
  - Tracking time spent per topic/session.
- **Exam Scheduling & Reminders**
  - UI for creating exams, setting dates, linking topics.
  - Reminder/notification system for upcoming exams.
- **Cliques (Group/Partner Study) Feature**
  - Clique creation, joining, and management.
  - Shared study sessions and tracking.
  - Group notifications and exam linking.
  - Leaderboard functionality within notebooks/cliques.
- **Data Persistence (PouchDB)**
  - Implementation of PouchDB setup and CRUD operations for all models as described in README.
  - Synchronization logic (if cloud sync is pursued).
- **UI Implementation (Based on UI Schematic Tree)**
  - Dashboard Screen widgets:
    - `UserSummaryCard` (combines User Header and Study Stats, hideable) - *Prototyped*
    - `UpcomingExamsWidget` (hideable) - *Prototyped*
    - `LeaderboardWidget` (hideable) - *Prototyped*
    - `RecentActivityWidget` (hideable) - *Prototyped*
    - `CliquesWidget` (hideable) - *Prototyped*
    - `NotificationsWidget` (hideable) - *Prototyped*
  - Navigation structure (Dashboard, Notebooks, Study Sessions, Cliques, Exams, Settings).
  - Responsive design considerations for Android phones and tablets (hideable widgets).
- **Settings Screen**
  - User preferences management.
- **End-to-end testing setup (Maestro)**

## Current Status

- Planning / Pre-development (based on README contents)
- Dashboard widget prototyping complete.

## Known Issues

- (N/A - Project in planning phase based on README) 