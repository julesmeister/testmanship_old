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

