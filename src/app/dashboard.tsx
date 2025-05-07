import { StyleSheet, ScrollView, ViewStyle } from "react-native"
import { Screen } from "@/components"
import {
  UserSummaryCard,
  UpcomingExamsWidget,
  LeaderboardWidget,
  RecentActivityWidget,
  CliquesWidget,
  NotificationsWidget,
} from "@/components/dashboard"

const $containerStyle: ViewStyle = {
  backgroundColor: "white",
}

export default function DashboardScreen() {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$containerStyle}>
      <ScrollView contentContainerStyle={styles.container}>
        <UserSummaryCard />
        <UpcomingExamsWidget />
        <LeaderboardWidget />
        <RecentActivityWidget />
        <CliquesWidget />
        <NotificationsWidget />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
})
