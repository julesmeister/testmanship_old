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

## Community

⭐️ Help us out by [starring on GitHub](https://github.com/infinitered/ignite), filing bug reports in [issues](https://github.com/infinitered/ignite/issues) or [ask questions](https://github.com/infinitered/ignite/discussions).

💬 Join us on [Slack](https://join.slack.com/t/infiniteredcommunity/shared_invite/zt-1f137np4h-zPTq_CbaRFUOR_glUFs2UA) to discuss.

📰 Make our Editor-in-chief happy by [reading the React Native Newsletter](https://reactnativenewsletter.com/).

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
│       ├── sharedWith (array of userIds/emails)
│       ├── ownerId
│       ├── isPublic (boolean)
│       ├── spacedRepetitionSettings
│       │   ├── intervalBase (number, e.g., days)
│       │   ├── difficultyModifier (number)
│       │   └── snoozedUntil (date, optional)
│       ├── exportId
│       ├── lastSynced
│       └── syncProvider (e.g., Google Drive, Dropbox)
│       ├── topics (array)
│       │   └── Topic
│       │       ├── id
│       │       ├── title
│       │       ├── pageNumber
│       │       ├── attachments (array)
│       │       │   └── Attachment
│       │       │       ├── id
│       │       │       ├── type (image, audio, video, file)
│       │       │       ├── uri
│       │       │       └── description
│       │       ├── occlusions (array)
│       │       │   └── Occlusion
│       │       │       ├── id
│       │       │       ├── pageNumber
│       │       │       ├── coordinates (x, y, width, height)
│       │       │       ├── scale (zoom level)
│       │       │       ├── type (text, image)
│       │       │       ├── annotation (highlight, note, etc.)
│       │       │       ├── lastReviewed
│       │       │       └── reviewHistory (array of {date, rating})
│       │       ├── highlights (array)
│       │       │   └── Highlight
│       │       │       ├── id
│       │       │       ├── pageNumber
│       │       │       ├── coordinates (x, y, width, height)
│       │       │       ├── scale (zoom level)
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
│       │       ├── mastery
│       │       │   ├── currentRating (sad, neutral, happy)
│       │       │   ├── lastRatingDate
│       │       │   ├── reviewStreak (number of consecutive days reviewed)
│       │       │   ├── longestStreak (longest consecutive review streak)
│       │       │   ├── averageRating (average of all ratings)
│       │       │   └── reviewHistory (array of {date, rating})
│       │
│       └── statistics
│           ├── totalReviewSessions
│           ├── lastReviewed
│           ├── masteryLevel (numeric, e.g., 0-100, representing computed mastery score)
│           ├── reviewStreak (number of consecutive days reviewed)
│           ├── longestStreak (longest consecutive review streak)
│           ├── lastPerformance (last emoji rating given)
│           ├── averagePerformance (average of all ratings)
│           └── reviewHistory (array of {date, rating})
│
├── Exams (array)
│   └── Exam
│       ├── id
│       ├── title
│       ├── date
│       ├── topics (array of topic ids)
│       └── reminders (array of {date, message})
│
└── User
    ├── preferences
    └── studyAlarms (array of {date, topicId, message})
```

### Model Documentation

#### Notebook
- `id`: Unique identifier
- `title`: Name of the notebook
- `pdfUri`: File path or URL to the PDF
- `topics`: Array of Topic objects
- `statistics`: Aggregated stats for the notebook
  - `totalReviews`: Total number of reviews for this notebook
  - `lastReviewed`: Date of the last review
  - `masteryLevel`: Computed mastery level for the notebook (numeric, e.g., 0-100, representing a percentage or score)
  - `reviewStreak`: Number of consecutive days reviewed
  - `longestStreak`: Longest consecutive review streak
  - `lastRating`: Last emoji rating given
  - `averageRating`: Average of all ratings
  - `reviewHistory`: Array of `{date, rating}` for spaced repetition and progress tracking
- `attachments`: Array of Attachment objects (media/files associated with the notebook)
- `sharedWith`: Array of user IDs or emails the notebook is shared with
- `ownerId`: User ID of the notebook owner
- `isPublic`: Boolean indicating if the notebook is public
- `spacedRepetitionSettings`: Settings for spaced repetition for the entire notebook
  - `intervalBase`: Base interval for reviews (in days)
  - `difficultyModifier`: Multiplier for adjusting review frequency
  - `snoozedUntil`: Date until which the notebook is snoozed
- `exportId`: Unique export/import identifier for the notebook
- `lastSynced`: Last sync date for the notebook
- `syncProvider`: Cloud provider used for notebook sync

#### Topic
- `id`: Unique identifier
- `title`: Name of the topic/section
- `pageNumber`: Page in the PDF
- `attachments`: Array of Attachment objects (media/files associated with the topic)
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

## Community

⭐️ Help us out by [starring on GitHub](https://github.com/infinitered/ignite), filing bug reports in [issues](https://github.com/infinitered/ignite/issues) or [ask questions](https://github.com/infinitered/ignite/discussions).

💬 Join us on [Slack](https://join.slack.com/t/infiniteredcommunity/shared_invite/zt-1f137np4h-zPTq_CbaRFUOR_glUFs2UA) to discuss.

📰 Make our Editor-in-chief happy by [reading the React Native Newsletter](https://reactnativenewsletter.com/).

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
│       ├── sharedWith (array of userIds/emails)
│       ├── ownerId
│       ├── isPublic (boolean)
│       ├── spacedRepetitionSettings
│       │   ├── intervalBase (number, e.g., days)
│       │   ├── difficultyModifier (number)
│       │   └── snoozedUntil (date, optional)
│       ├── exportId
│       ├── lastSynced
│       └── syncProvider (e.g., Google Drive, Dropbox)
│       ├── topics (array)
│       │   └── Topic
│       │       ├── id
│       │       ├── title
│       │       ├── pageNumber
│       │       ├── occlusions (array)
│       │       │   └── Occlusion
│       │       │       ├── id
│       │       │       ├── pageNumber
│       │       │       ├── coordinates (x, y, width, height)
│       │       │       ├── scale (zoom level)
│       │       │       ├── type (text, image)
│       │       │       ├── annotation (highlight, note, etc.)
│       │       │       ├── lastReviewed
│       │       │       └── reviewHistory (array of {date, rating})
│       │       ├── highlights (array)
│       │       │   └── Highlight
│       │       │       ├── id
│       │       │       ├── pageNumber
│       │       │       ├── coordinates (x, y, width, height)
│       │       │       ├── scale (zoom level)
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
│       │       ├── mastery
│       │       │   ├── currentRating (sad, neutral, happy)
│       │       │   ├── lastRatingDate
│       │       │   ├── reviewStreak (number of consecutive days reviewed)
│       │       │   ├── longestStreak (longest consecutive review streak)
│       │       │   ├── averageRating (average of all ratings)
│       │       │   └── reviewHistory (array of {date, rating})
│       │
│       └── statistics
│           ├── totalReviewSessions
│           ├── lastReviewed
│           ├── masteryLevel (numeric, e.g., 0-100, representing computed mastery score)
│           ├── reviewStreak (number of consecutive days reviewed)
│           ├── longestStreak (longest consecutive review streak)
│           ├── lastPerformance (last emoji rating given)
│           ├── averagePerformance (average of all ratings)
│           └── reviewHistory (array of {date, rating})
│
├── Exams (array)
│   └── Exam
│       ├── id
│       ├── title
│       ├── date
│       ├── topics (array of topic ids)
│       └── reminders (array of {date, message})
│
└── User
    ├── preferences
    └── studyAlarms (array of {date, topicId, message})
```

### Model Documentation

#### Notebook
- `id`: Unique identifier
- `title`: Name of the notebook
- `pdfUri`: File path or URL to the PDF
- `topics`: Array of Topic objects
- `statistics`: Aggregated stats for the notebook
  - `totalReviews`: Total number of reviews for this notebook
  - `lastReviewed`: Date of the last review
  - `masteryLevel`: Computed mastery level for the notebook (numeric, e.g., 0-100, representing a percentage or score)
  - `reviewStreak`: Number of consecutive days reviewed
  - `longestStreak`: Longest consecutive review streak
  - `lastRating`: Last emoji rating given
  - `averageRating`: Average of all ratings
  - `reviewHistory`: Array of `{date, rating}` for spaced repetition and progress tracking
- `attachments`: Array of Attachment objects (media/files associated with the notebook)
- `sharedWith`: Array of user IDs or emails the notebook is shared with
- `ownerId`: User ID of the notebook owner
- `isPublic`: Boolean indicating if the notebook is public
- `spacedRepetitionSettings`: Settings for spaced repetition for the entire notebook
  - `intervalBase`: Base interval for reviews (in days)
  - `difficultyModifier`: Multiplier for adjusting review frequency
  - `snoozedUntil`: Date until which the notebook is snoozed
- `exportId`: Unique export/import identifier for the notebook
- `lastSynced`: Last sync date for the notebook
- `syncProvider`: Cloud provider used for notebook sync

#### Topic
- `id`: Unique identifier
- `title`: Name of the topic/section
- `pageNumber`: Page in the PDF
- `occlusions`: Array of Occlusion objects (for quiz/occlusion cards)
- `highlights`: Array of Highlight objects
- `questions`: Array of Question objects
  - `id`: Unique identifier
  - `text`: The question text
  - `options`: Array of Option objects
    - `id`: Unique identifier
    - `text`: Option text
  - `correctOptionId`: The id of the correct option
  - `userAnswers`: Array of `{ optionId, date, isCorrect }` for tracking user responses
- `ratings`: Array of immutable RatingRecord objects, each representing a user's mastery rating for an occlusion at a specific time
  - `occlusionId`: Reference to the occlusion being rated
  - `questionId`: Optional reference to the question being rated
  - `rating`: User's familiarity rating (`sad`, `neutral`, `happy`)
  - `wasCorrect`: Optional boolean indicating whether the answer was correct
  - `date`: Date the rating was given
  - `durationSinceLast`: Time in milliseconds since the previous rating for this occlusion
- `mastery`: Aggregated mastery stats for the topic
  - `currentRating`: The most recent rating for the topic (`sad`, `neutral`, `happy`)
  - `lastRatingDate`: Date of the most recent rating
  - `reviewStreak`: Number of consecutive days reviewed
  - `longestStreak`: Longest consecutive review streak
  - `averageRating`: Average of all ratings
  - `reviewHistory`: Array of `{date, rating}` for spaced repetition and progress tracking

#### Occlusion
- `id`: Unique identifier
- `pageNumber`: Page in the PDF where the occlusion is located
- `coordinates`: `{x, y, width, height}` (relative to page)
- `scale`: Zoom level when created
- `type`: `"text"` or `"image"`
- `annotation`: Optional text or type of annotation
- `lastReviewed`: Date last reviewed
- `reviewHistory`: Array of `{date, rating}` for spaced repetition (for historical reference, but ratings are now tracked at the Topic level)

#### Highlight
- `id`: Unique identifier
- `pageNumber`: Page in the PDF where the highlight is located
- `coordinates`: `{x, y, width, height}` (relative to page)
- `scale`: Zoom level when created
- `type`: `"text"` or `"image"`
- `annotation`: Optional text or type of annotation
- `color`: Highlight color
- `note`: Optional note
- `lastReviewed`: Date last reviewed
- `reviewHistory`: Array of `{date, color, note}` for tracking highlight changes and reviews

#### Question
- `id`: Unique identifier
- `text`: The question text
- `options`: Array of Option objects
  - `id`: Unique identifier
  - `text`: Option text
- `correctOptionId`: The id of the correct option
- `userAnswers`: Array of `{ optionId, date, isCorrect }` for tracking user responses

#### Exam
- `id`: Unique identifier
- `title`: Name of the exam
- `date`: Exam date
- `topics`: Array of topic IDs to study
- `reminders`: Array of `{date, message}`

#### User
- `preferences`: User settings
- `studyAlarms`: Array of `{date, topicId, message}`

#### Attachment
- `id`: Unique identifier
- `type`: Type of attachment (`image`, `audio`, `video`, `file`)
- `uri`: File path or URL
- `description`: Optional description

#### Sharing & Collaboration
- `sharedWith`: Array of user IDs or emails the item is shared with
- `ownerId`: User ID of the owner
- `isPublic`: Boolean indicating if the item is public

#### Spaced Repetition Settings
- `intervalBase`: Base interval for reviews (in days)
- `difficultyModifier`: Multiplier for adjusting review frequency
- `snoozedUntil`: Date until which the item is snoozed

#### Leaderboard Entry
- `userId`: Unique identifier for the user
- `username`: Display name
- `score`: Numeric score (XP, streak, or mastery)
- `rank`: Leaderboard rank
- `lastActive`: Last activity date

#### Sync/Export
- `exportId`: Unique export/import identifier
- `lastSynced`: Last sync date
- `syncProvider`: Cloud provider used for sync

---

### Storage
- All data will be stored locally using [PouchDB](https://pouchdb.com/), allowing for offline-first usage and future sync capabilities.

### PDF Annotation & Occlusion
- PDF viewing is powered by `react-native-pdf`.
- Occlusion cards and highlights are implemented as overlays, with their dimensions, page, and zoom scale saved in the model.
- User can rate their recall for each occlusion (sad, neutral, happy), and the app will use spaced repetition to schedule reviews.

### Study Scheduling
- Users can create exams, associate topics, and set reminders/alarms for study sessions.
- The app will prioritize review of items/topics based on user ratings and upcoming exam dates.

---
