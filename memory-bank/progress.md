# Progress

This document tracks the development progress. It outlines what functionalities are currently working, what remains to be built, the overall status, and any known issues or bugs.

## What Works

- **Tab-based Navigation Structure**
  - Basic implementation of tabs for Home, Activity, Leaderboard, Cliques, and Notifications
  - Tab layout and icons configured
- **Home Screen**
  - User summary card displayed at the top
  - Notebooks list with mock data
  - Options menu for notebooks (rename, share, delete) with alerts
- **Cliques Screen**
  - Basic cliques widget display
  - Upcoming exams section with mock data
  - Exam creation modal

## What's Left to Build

- **User Authentication & Profile Management**
- **Notebook & Topic Management UI/Logic**
  - Create functionality for notebooks
  - Notebook detail screen
  - CRUD operations for topics
  - Attachment handling (images, audio, video, files)
- **PDF Annotation Feature**
  - PDF viewer integration (`react-native-pdf`)
  - Highlight creation, display, and storage
  - Note creation, display, and storage, linked to highlights/attachments
- **Occlusion Card Feature**
  - Occlusion creation UI (defining areas on PDFs/images)
  - Quiz interface for reviewing occlusion cards
  - Spaced repetition algorithm implementation
  - User ratings for cards (sad, neutral, happy)
- **Study Statistics & Mastery Tracking**
  - Data models and logic for `User.statistics` (notebook and topic stats)
  - Calculation and display of mastery, review streaks, longest streaks, average ratings
  - Tracking time spent per topic/session
- **Exam Scheduling & Reminders**
  - Implement full functionality for exam creation in Cliques screen
  - Connect exams to topics
  - Reminder/notification system for upcoming exams
- **Cliques (Group/Partner Study) Feature**
  - Clique creation, joining, and management
  - Shared study sessions and tracking
  - Group notifications and exam linking
  - Leaderboard functionality within notebooks/cliques
- **Data Persistence (PouchDB)**
  - Implementation of PouchDB setup and CRUD operations for all models
  - Synchronization logic (if cloud sync is pursued)
- **Screens & Features Completion**
  - Complete Activity screen with real activity data
  - Complete Leaderboard screen with real rankings
  - Complete Notifications screen with real notifications
  - Settings screen
- **End-to-end testing setup (Maestro)**

## Current Status

- Basic tab navigation structure implemented
- Home screen with notebooks list functional
- Cliques screen with exam section in progress

## Known Issues

- Notebook options menu position may not be optimal on all device sizes
- No proper handling for long notebook titles
- Modal content in Cliques screen needs refinement 