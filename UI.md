# UI Components Documentation

## Dashboard Widgets (`src/components/dashboard/`)

- **UserHeader**: Displays the user avatar and greeting.
  ```jsx
  import { UserHeader } from "@/components/dashboard"
  ;<UserHeader />
  ```
- **StudyStatsWidget**: Shows study statistics (mastery, streak, time studied).
  ```jsx
  import { StudyStatsWidget } from "@/components/dashboard"
  ;<StudyStatsWidget />
  ```
- **UpcomingExamsWidget**: Lists upcoming exams and countdowns.
  ```jsx
  import { UpcomingExamsWidget } from "@/components/dashboard"
  ;<UpcomingExamsWidget />
  ```
- **LeaderboardWidget**: Displays top users and user rank.
  ```jsx
  import { LeaderboardWidget } from "@/components/dashboard"
  ;<LeaderboardWidget />
  ```
- **RecentActivityWidget**: Shows recent reviews, highlights, and occlusions.
  ```jsx
  import { RecentActivityWidget } from "@/components/dashboard"
  ;<RecentActivityWidget />
  ```
- **CliquesWidget**: Lists user cliques and join/create options.
  ```jsx
  import { CliquesWidget } from "@/components/dashboard"
  ;<CliquesWidget />
  ```
- **NotificationsWidget**: Shows reminders, group invites, and announcements.
  ```jsx
  import { NotificationsWidget } from "@/components/dashboard"
  ;<NotificationsWidget />
  ```

## UI Primitives (`src/components/`)

- **AutoImage**: Image component that automatically sizes remote or data-uri images.
  ```jsx
  import { AutoImage } from "@/components"
  ;<AutoImage source={{ uri: "https://example.com/image.png" }} maxWidth={200} />
  ```
- **Button**: Pressable button with text, icons, and multiple style presets.
  ```jsx
  import { Button } from "@/components"
  ;<Button text="Click me" onPress={() => alert("Clicked!")} />
  ```
- **Card**: Container for displaying related information vertically, with optional heading, content, and footer.
  ```jsx
  import { Card } from "@/components"
  ;<Card heading="Title" content="This is a card." />
  ```
- **Header**: App or screen header with title, left/right actions, and safe area support.
  ```jsx
  import { Header } from "@/components"
  ;<Header title="My App" leftIcon="back" onLeftPress={() => {}} />
  ```
- **Icon**: Renders a registered icon, either as a static image or pressable.
  ```jsx
  import { Icon } from "@/components"
  ;<Icon icon="bell" size={24} />
  ```
- **ListItem**: Styled row for lists, with left/right icons, text, and actions.
  ```jsx
  import { ListItem } from "@/components"
  ;<ListItem text="List Item" leftIcon="check" onPress={() => {}} />
  ```
- **ListView**: Wrapper for FlashList/FlatList, supporting RTL and LTR layouts.
  ```jsx
  import { ListView } from "@/components"
  ;<ListView
    data={[1, 2, 3]}
    renderItem={({ item }) => <Text text={String(item)} />}
    estimatedItemSize={50}
  />
  ```
- **Screen**: Provides consistent layout, safe area, and scrolling for screens.
  ```jsx
  import { Screen } from "@/components"
  ;<Screen preset="scroll">
    <Text text="Hello" />
  </Screen>
  ```
- **Text**: Themed text component with presets for headings, subheadings, etc.
  ```jsx
  import { Text } from "@/components"
  ;<Text preset="heading" text="Hello World" />
  ```
- **TextField**: Themed text input with label, helper, and accessory support.
  ```jsx
  import { TextField } from "@/components"
  ;<TextField label="Username" placeholder="Enter your username" />
  ```
- **EmptyState**: Used when there is no data to display, with image, heading, content, and button.
  ```jsx
  import { EmptyState } from "@/components"
  ;<EmptyState
    heading="No Data"
    content="Nothing to show here."
    button="Reload"
    buttonOnPress={() => {}}
  />
  ```
- **ErrorBoundary**: Catches JS errors in children and displays an error screen.
  ```jsx
  import { ErrorBoundary } from "@/components/ErrorBoundary"
  ;<ErrorBoundary catchErrors="always">
    <App />
  </ErrorBoundary>
  ```
- **ErrorDetails**: Renders error details, stack trace, and a reset button.
  ```jsx
  import { ErrorDetails } from "@/components/ErrorBoundary"
  ;<ErrorDetails error={new Error("Oops!")} errorInfo={null} onReset={() => {}} />
  ```

## Toggle Components (`src/components/Toggle/`)

- **Checkbox**: Checkbox input with animated check icon.
  ```jsx
  import { Checkbox } from "@/components/Toggle"
  ;<Checkbox value={true} onValueChange={(checked) => {}} />
  ```
- **Radio**: Radio button input for single selection.
  ```jsx
  import { Radio } from "@/components/Toggle"
  ;<Radio value={true} onValueChange={(selected) => {}} />
  ```
- **Switch**: Switch/toggle input for boolean values.
  ```jsx
  import { Switch } from "@/components/Toggle"
  ;<Switch value={false} onValueChange={(val) => {}} />
  ```
- **Toggle**: Base toggle input used by Checkbox, Radio, and Switch.
  ```jsx
  import { Toggle } from "@/components/Toggle"
  ;<Toggle value={false} onValueChange={(val) => {}} />
  ```

## Example: Composing a Real Ignite Screen (`src/app/index.tsx`)

This example shows how Ignite composes its UI using the provided primitives and theming utilities. It demonstrates the use of `Screen`, `Text`, `Image`, and theming hooks to build a real screen.

```jsx
import { observer } from "mobx-react-lite"
import { Image, View } from "react-native"
import { Screen, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"

const welcomeLogo = require("../../assets/images/logo.png")
const welcomeFace = require("../../assets/images/welcome-face.png")

export default observer(function WelcomeScreen() {
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const { theme, themed } = useAppTheme()

  return (
    <Screen safeAreaEdges={["top"]} contentContainerStyle={themed($container)}>
      <View style={themed($topContainer)}>
        <Image style={themed($welcomeLogo)} source={welcomeLogo} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={themed($welcomeHeading)}
          tx="welcomeScreen:readyForLaunch"
          preset="heading"
        />
        <Text tx="welcomeScreen:exciting" preset="subheading" />
        <Image
          style={$welcomeFace}
          source={welcomeFace}
          resizeMode="contain"
          tintColor={theme.isDark ? theme.colors.palette.neutral900 : undefined}
        />
      </View>
      <View style={[themed($bottomContainer), $bottomContainerInsets]}>
        <Text tx="welcomeScreen:postscript" size="md" />
      </View>
    </Screen>
  )
})
```

**Key points:**

- `Screen` provides layout, safe area, and theming.
- `Text` is used for all text, supporting i18n and presets.
- `useAppTheme` and `themed` enable dynamic styling based on the current theme.
- `useSafeAreaInsetsStyle` helps with safe area padding.
- Images and other primitives are composed together for a modern UI.

---
