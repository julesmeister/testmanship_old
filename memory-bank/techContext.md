# Technical Context

This document details the technologies used in the project, instructions for setting up the development environment, any technical constraints, and a list of dependencies.

## Technologies Used

- **Ignite**: Scaffolding and React Native foundation.
- **React Native**: Core framework for cross-platform mobile app development.
- **MobX-State-Tree (MST)**: In-memory state management and UI logic.
- **PouchDB**: Offline-first, document-based storage for all models.
- **react-native-pdf**: PDF viewing and annotation.

## Development Setup

- Install dependencies: `npm install`
- Start the development server: `npm run start`
- Build for specific platforms (iOS simulator, iOS device, Android - EAS Build needed for local simulator/device):
  - `npm run build:ios:sim`
  - `npm run build:ios:dev`
  - `npm run build:ios:prod`
  - (Android build commands likely similar, or refer to `eas build` documentation)
- Refer to [EAS Build documentation](https://github.com/infinitered/ignite/blob/master/docs/expo/EAS.md) for local simulator/device builds.

## Technical Constraints

- Primarily focused on Android phones and tablets; iOS is a secondary target.
- Offline-first architecture is a core requirement.

## Dependencies

- `pouchdb`
- `react-native-pdf`
- Core Ignite stack dependencies (e.g., MobX-State-Tree, React Navigation) 