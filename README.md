# Welcome to your new ignited app!

> The latest and greatest boilerplate for Infinite Red opinions

+**Platform Support:**
+This app is primarily targeted for Android phones and Android tablets. While the codebase is cross-platform and can run on iOS, the main focus for development, testing, and optimization is Android devices, including tablets.

This is the boilerplate that [Infinite Red](https://infinite.red) uses as a way to test bleeding-edge changes to our React Native stack.

- [Quick start documentation](https://github.com/infinitered/ignite/blob/master/docs/boilerplate/Boilerplate.md)
- [Full documentation](https://github.com/infinitered/ignite/blob/master/docs/README.md)

## Getting Started

```bash
npm install
npm run start
```

To make things work on your local simulator, or on your phone, you need first to [run `eas build`](https://github.com/infinitered/ignite/blob/master/docs/expo/EAS.md). We have many shortcuts on `package.json` to make it easier:

```bash
npm run build:ios:sim # build for ios simulator
npm run build:ios:dev # build for ios device
npm run build:ios:prod # build for ios device
```

### `./assets` directory

This directory is designed to organize and store various assets, making it easy for you to manage and use them in your application. The assets are further categorized into subdirectories, including `icons` and `images`:

```tree
assets
├── icons
└── images
```

**icons**
This is where your icon assets will live. These icons can be used for buttons, navigation elements, or any other UI components. The recommended format for icons is PNG, but other formats can be used as well.

Ignite comes with a built-in `Icon` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/boilerplate/app/components/Icon.md).

**images**
This is where your images will live, such as background images, logos, or any other graphics. You can use various formats such as PNG, JPEG, or GIF for your images.

Another valuable built-in component within Ignite is the `AutoImage` component. You can find detailed usage instructions in the [docs](https://github.com/infinitered/ignite/blob/master/docs/Components-AutoImage.md).

How to use your `icon` or `image` assets:

```typescript
import { Image } from 'react-native';

const MyComponent = () => {
  return (
    <Image source={require('../assets/images/my_image.png')} />
  );
};
```

## Running Maestro end-to-end tests

Follow our [Maestro Setup](https://ignitecookbook.com/docs/recipes/MaestroSetup) recipe.

## Next Steps

### Ignite Cookbook

[Ignite Cookbook](https://ignitecookbook.com/) is an easy way for developers to browse and share code snippets (or "recipes") that actually work.

### Upgrade Ignite boilerplate

Read our [Upgrade Guide](https://ignitecookbook.com/docs/recipes/UpdatingIgnite) to learn how to upgrade your Ignite project.

## Project Model Tree & Data Structure

This app is designed to help users annotate PDFs, create occlusion cards for quizzes, track study statistics, and manage study schedules for exams. Below is the planned data model structure and documentation for the core features.

### Model Tree Structure (Draft)

```
Root
│
├── Notebooks (array)
│   └── Notebook
│       ├── id
│       ├── title
│       ├── attachments (array)
│       │   └── Attachment
│       │       ├── id
│       │       ├── type (image, audio, video, file)
│       │       ├── uri
│       │       └── description
│       ├── ownerId
│       ├── isPublic (boolean)
│       ├── exportId
│       ├── lastUpdated
│       ├── syncProvider (e.g., Google Drive, Dropbox)
│       ├── leaderboards (array)
│       │   └── LeaderboardEntry
│       │       ├── userId
│       │       ├── username
│       │       ├── score (e.g., XP, streak, mastery)
│       │       ├── rank
│       │       └── lastActive
│       ├── topics (array)
│       │   └── Topic
│       │       ├── id
│       │       ├── title
│       │       ├── pageNumber
│       │       ├── occlusions (array)
│       │       │   └── Occlusion
│       │       │       ├── id
│       │       │       ├── attachmentId
│       │       │       ├── pageNumber
│       │       │       ├── coordinates (x, y, width, height)
│       │       │       ├── scale (zoom level of attachment: pdf, image)
│       │       │       ├── type (text, image)
│       │       │       ├── annotation (highlight, note, etc.)
│       │       │       ├── lastReviewed
│       │       │       └── reviewHistory (array of {date, rating})
│       │       ├── highlights (array)
│       │       │   └── Highlight
│       │       │       ├── id
│       │       │       ├── attachmentId
│       │       │       ├── pageNumber
│       │       │       ├── coordinates (x, y, width, height)
│       │       │       ├── scale (zoom level of pdf)
│       │       │       ├── annotation (highlight, note, etc.)
│       │       │       ├── color
│       │       │       └── note
│       │       ├── questions (array)
│       │       │   └── Question
│       │       │       ├── id
│       │       │       ├── text
│       │       │       ├── options (array)
│       │       │       │   └── Option
│       │       │       │       ├── id
│       │       │       │       └── text
│       │       │       ├── correctOptionId
│       │       │       └── userAnswers (array)
│       │       │           └── { optionId, date, isCorrect }
│       │       ├── ratings (array)
│       │       │   └── RatingRecord
│       │       │       ├── occlusionId
│       │       │       ├── questionId (optional)
│       │       │       ├── rating (sad, neutral, happy)
│       │       │       ├── wasCorrect (optional, boolean)
│       │       │       └── date
├── studySessions (array)
│   └── StudySession
│       ├── id
│       ├── cliqueId
│       ├── participants (array of userIds)
│       ├── startTime
│       ├── endTime
│       ├── topicsCovered (array of topicIds)
│
├── cliques (array)
│   └── Clique
│       ├── cliqueId
│       ├── name
│       ├── description
│       ├── type (clique | partner)
│       ├── members (array of userIds)
│       ├── createdBy (userId)
│       ├── createdAt
│       ├── updatedAt
│       ├── sessions (array of Study Session Ids)
│       ├── exams (array of examIds)
│       ├── notifications (array of Notification)
│       │   └── Notification
│       │       ├── id
│       │       ├── type (e.g., 'exam', 'reminder', 'message')
│       │       ├── examId (if type is 'exam')
│       │       ├── message
│       │       ├── createdAt
│       │       └── readBy (array of userIds)
│       └── invitations (array of {userId, status, invitedAt, respondedAt})
│
├── Exams (array)
│   └── Exam
│       ├── id
│       ├── title
│       ├── date
│       ├── topics (array of topic ids)
│       ├── cliques (array of cliqueIds)
│       └── reminders (array of {date, message})
│
└── User
    ├── preferences
    ├── cliques (array of cliqueIds)
    ├── accessibleNotebooks (array of notebook IDs the user can access)
    ├── studyAlarms (array of {date, topicId, message})
    ├── sessions
    │   ├── studySessions (array)
    │   │   └── StudySession
    │   │       ├── sessionId
    │   │       ├── topicsCovered (array of topicIds)
    │   │       ├── userScore
    │   │       ├── totalQuestionsAnswered
    │   │       ├── correctAnswers
    │   │       ├── incorrectAnswers
    │   │       ├── averageScore
    │   │       ├── timeSpentPerTopic (array of {topicId, duration})
    │   └── ... (other session types if needed)
    └── statistics
        ├── notebooks (array)
        │   └── NotebookStats
        │       ├── notebookId
        │       ├── mastery
        │       ├── reviewStreak
        │       ├── longestStreak
        │       ├── averageRating
        │       └── lastReviewed
        ├── topics (array)
        │   └── TopicStats
        │       ├── topicId
        │       ├── mastery
        │       ├── reviewStreak
        │       ├── longestStreak
        │       ├── averageRating
        │       └── lastReviewed
        └── otherStats (object)
```

#### User

- `preferences`: User settings
- `cliques`: Array of clique IDs the user is a member of

## UI Schematic Tree (Prototype)

This section outlines the planned UI structure for the initial prototype, focusing on the User Dashboard and its main widgets/components.

**Note:** On small mobile screens, some widgets may be hidden or collapsed by default (e.g., using an accordion or toggle) to improve usability. These are marked as [Hideable] below.

```
App
│
├── Navigation
│   ├── Dashboard (Home)
│   ├── Notebooks
│   ├── Study Sessions
│   ├── Cliques
│   ├── Exams
│   └── Settings
│
└── Dashboard Screen
    ├── User Header
    │   ├── Avatar
    │   └── Greeting / Name
    ├── Study Stats Widget [Hideable]
    │   ├── Mastery Progress
    │   ├── Review Streak
    │   └── Time Studied
    ├── Upcoming Exams Widget [Hideable]
    │   ├── Exam Title
    │   ├── Date/Countdown
    │   └── Linked Topics
    ├── Leaderboard Widget [Hideable]
    │   ├── Top Users
    │   └── User Rank
    ├── Recent Activity Widget [Hideable]
    │   ├── Recent Reviews
    │   ├── New Highlights
    │   └── Recent Occlusions
    ├── Cliques Widget [Hideable]
    │   ├── My Cliques
    │   └── Join/Create
    └── Notifications Widget [Hideable]
        ├── Reminders
        ├── Group Invites
        └── Announcements
```

---

## Architecture & Design Decisions

This project is built with a focus on robust, user-centric study features and offline-first support, optimized for Android phones and tablets.

### Tech Stack

- **Ignite**: Used to scaffold the app, providing a modern React Native foundation.
- **MobX-State-Tree (MST)**: Handles in-memory state management and UI logic.
- **PouchDB**: Provides offline-first, document-based storage for all models (Notebook, Topic, User, Clique, etc.).
- **react-native-pdf**: Used for PDF viewing and annotation.

### Key Features

- **PDF Annotation**: View and annotate PDFs, with highlights and notes linked to attachments.
- **Occlusion Cards**: Create occlusion cards for quizzes, with user ratings (sad/neutral/happy) and spaced repetition.
- **Statistics & Mastery**: All study statistics, mastery, and review streaks are tracked under `User.statistics`, referencing notebooks, topics, and sessions by ID.
- **Study Scheduling & Notifications**: Schedule study sessions, set alarms/reminders for exams, and receive notifications (including group notifications for cliques).
- **Group/Partner Study (Cliques)**: Study with others in cliques, track group statistics, and share notifications. Each user has a `cliques` array of clique IDs they belong to.
- **Attachments**: Images, audio, video, and files can be attached to topics, occlusions, and highlights via `attachmentId`.
- **Leaderboards**: Each notebook can have a leaderboard, tracking user scores, streaks, and mastery.

### Model Structure Rationale

- **User-Centric Statistics**: All mastery, review, and study stats are stored under the User model, not in Notebooks or Topics, for a unified user experience.
- **References by ID**: Relationships between models (e.g., topics, cliques, exams) are managed by referencing IDs, making syncing and querying efficient.
- **Nested Notifications**: All notifications for cliques are nested under `cliques.notifications` for clarity and group management.
- **Exams & Cliques**: Exams can be linked to cliques for group notifications and collaborative study.

### MST & PouchDB Integration

- **MST** is used for UI and in-memory state logic.
- **PouchDB** is used for persistence. All CRUD operations are performed on PouchDB, and MST actions keep the in-memory state in sync with the database.
- **Best Practice**: Use MST for fast UI updates and logic, and PouchDB for reliable, offline-first storage.

---

## Using PouchDB for Model Storage

This project uses [PouchDB](https://pouchdb.com/) for offline-first, document-based storage. Each model (Notebook, Topic, User, Clique, etc.) is stored as a document in the database. Below are example CRUD operations for a typical model (e.g., Notebook):

### 1. Setup

```js
import PouchDB from "pouchdb"
const db = new PouchDB("myappdb")
```

### 2. Create a Document

```js
const notebook = {
  _id: "notebook_123", // unique id
  type: "notebook",
  title: "My Notebook",
  ownerId: "user_1",
  // ...other fields
}

db.put(notebook)
  .then((response) => console.log("Created:", response))
  .catch((err) => console.error(err))
```

### 3. Read (Get) a Document

```js
db.get("notebook_123")
  .then((doc) => console.log("Fetched:", doc))
  .catch((err) => console.error(err))
```

### 4. Update a Document

```js
db.get("notebook_123")
  .then((doc) => {
    doc.title = "Updated Title"
    return db.put(doc)
  })
  .then((response) => console.log("Updated:", response))
  .catch((err) => console.error(err))
```

### 5. Delete a Document

```js
db.get("notebook_123")
  .then((doc) => {
    return db.remove(doc)
  })
  .then((response) => console.log("Deleted:", response))
  .catch((err) => console.error(err))
```

### 6. Query Documents by Type

```js
db.allDocs({ include_docs: true }).then((result) => {
  const notebooks = result.rows.map((row) => row.doc).filter((doc) => doc.type === "notebook")
  console.log("All notebooks:", notebooks)
})
```

> You can repeat this pattern for other models (Topic, User, Clique, etc.) by changing the `type` field and document structure.

For more advanced queries, consider using the [pouchdb-find](https://pouchdb.com/guides/mango-queries.html) plugin.
