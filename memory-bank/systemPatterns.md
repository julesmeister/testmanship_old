# System Patterns

This document describes the system architecture, key technical decisions made, design patterns employed, and the relationships between different components of the system.

## System Architecture Overview

- The application is a mobile app built with React Native (Ignite boilerplate).
- It employs an offline-first approach using PouchDB for local data storage.
- MobX-State-Tree (MST) is used for managing in-memory application state and UI logic.
- The system is designed around a set of core models: `Notebook`, `Topic`, `Occlusion`, `Highlight`, `Question`, `StudySession`, `Clique`, `Exam`, and `User`.

```mermaid
graph LR
    UserInterface[React Native UI Components] --> MSTState[MobX-State-Tree (In-Memory State)]
    MSTState --> PouchDB[(PouchDB Local Database)]
    PouchDB --> Sync[Sync (Optional, e.g., Cloud)]

    subgraph CoreModels
        Notebook
        Topic
        Occlusion
        Highlight
        Question
        StudySession
        Clique
        Exam
        UserStats[User Statistics]
    end

    MSTState -- Manages --> CoreModels
    PouchDB -- Persists --> CoreModels
```

## Key Technical Decisions

- **Offline-First with PouchDB**: Ensures data availability and app functionality without a constant internet connection. All CRUD operations are performed on PouchDB.
- **State Management with MST**: Provides a structured way to manage complex application state and UI logic. MST actions keep the in-memory state synchronized with PouchDB.
- **Document-Based Data Model**: PouchDB stores data as documents (e.g., a Notebook document, a Topic document), which aligns well with the nature of the application's data.
- **User-Centric Statistics**: All mastery, review, and study statistics are stored under the `User` model for a unified user experience, referencing other models by ID.
- **ID-Based Relationships**: Relationships between models (e.g., topics in an exam, members in a clique) are managed by referencing IDs for efficient querying and syncing.
- **Platform Focus**: Primary development and optimization target Android phones and tablets.

## Design Patterns in Use

- **Model-View-ViewModel (MVVM) like pattern**: React components (View) interact with MST stores/models (ViewModel/Model).
- **Repository Pattern (Implicit)**: PouchDB interactions can be thought of as a repository layer, abstracting data persistence.
- **Observer Pattern**: MST observables allow UI components to react to state changes.
- **Offline-First**: A core architectural pattern dictating local data storage and synchronization strategies.

## Component Relationships

- **UI Layer (React Native Components)**: Renders data from MST stores and dispatches actions to update the state.
- **State Layer (MobX-State-Tree)**: Holds the application's in-memory state, business logic, and actions to modify the state. It synchronizes with the persistence layer.
- **Persistence Layer (PouchDB)**: Stores all application data locally as documents. It is the source of truth for persisted data.
- **Models (`Notebook`, `Topic`, etc.)**: Define the structure of the data. Instances are managed by MST and persisted by PouchDB.
  - `User` model contains `preferences`, `cliques` (IDs), `accessibleNotebooks` (IDs), `studyAlarms`, `sessions` (detailed study session stats), and `statistics` (for notebooks, topics, etc.).
  - `Notebooks` contain `topics`, `attachments`, `leaderboards`.
  - `Topics` contain `occlusions`, `highlights`, `questions`, `ratings`.
  - `Cliques` manage `members`, `sessions`, `exams`, `notifications`, and `invitations`.
  - `Exams` link to `topics` and `cliques`.

## Data Flow

1.  User interacts with UI.
2.  UI dispatches an action to an MST store.
3.  MST action performs business logic, updates the in-memory state.
4.  MST action also triggers a PouchDB operation (create, read, update, delete) to persist the change.
5.  PouchDB operation completes.
6.  If necessary, MST state is further updated based on PouchDB response (e.g., new `_id`, `_rev`).
7.  UI re-renders based on the new MST state.

## UI Component Patterns & Key Components

### Navigation Structure

- **Tab-based Navigation**: The application uses Expo Router's Tabs component configured in `src/app/(tabs)/_layout.tsx` to implement the main navigation structure.
  - **Home Tab** (`index.tsx`): Displays the `UserSummaryCard` and a notebooks list.
  - **Activity Tab** (`activity.tsx`): Hosts the `RecentActivityWidget` as its main content.
  - **Leaderboard Tab** (`leaderboard.tsx`): Hosts the `LeaderboardWidget` as its main content.
  - **Cliques Tab** (`cliques.tsx`): Hosts the `CliquesWidget` and a dedicated Upcoming Exams section with the ability to create new exams.
  - **Notifications Tab** (`notifications.tsx`): Hosts the `NotificationsWidget` as its main content.

### Icon Components

- **Original Icon Component** (`src/components/Icon.tsx`): 
  - Provides access to locally stored PNG icons.
  - Uses an `iconRegistry` object that maps icon names to image assets.
  - Used for app-specific icons and legacy components.

- **MaterialIcon Component** (`src/components/MaterialIcon.tsx`):
  - Uses Material Design icons from the `@expo/vector-icons` package.
  - Provides access to the full suite of Material Design icons.
  - Used for common UI elements like add buttons, navigation icons, and action buttons.
  - Should be the preferred choice for new icons when a suitable Material icon exists.

### `UserSummaryCard.tsx` (Dashboard Component)
- **Purpose**: Combines user greeting/avatar with key study statistics (mastery, streak, time studied).
- **Structure**: Uses the `Card` component. The user's greeting (e.g., "Hello, Valued User!") is passed to the `Card`'s `heading` prop. The avatar and the list of study statistics are rendered within a custom component passed to the `Card`'s `ContentComponent` prop.
- **Usage**: Displayed at the top of the Home screen.

### `NotebookItem` Component (Home Screen)
- **Purpose**: Renders a single notebook item in the notebooks list.
- **Structure**: Includes the notebook title, last modified date, an icon, and a more options button.
- **Options Menu**: When the more options button is clicked, a modal is displayed with options to rename, share, or delete the notebook.

### Card Component (`src/components/Card.tsx`)
- **Content Injection**: The `Card` component is designed to receive its main body content primarily through the `ContentComponent` prop. Other specific props like `HeadingComponent` and `FooterComponent` (or their text-based counterparts like `heading`, `content`, `footer`) are used for those respective sections.
- **Children Prop Behavior**: While the base `View` or `TouchableOpacity` within the `Card` might receive `props.children`, the `Card`'s internal layout logic does not explicitly place these generic children within its main styled content area. For predictable rendering within the card's body, `ContentComponent` is preferred.
- **Styling**: The `Card` likely provides its own base styling (background, padding, shadow). When using it, pass custom styles via the `style` prop. If providing content via `ContentComponent`, ensure padding is handled either within the `ContentComponent` or by the `Card` itself, avoiding duplicate padding. 