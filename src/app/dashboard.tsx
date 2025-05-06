import { StyleSheet, ScrollView } from "react-native"
import { Screen } from "@/components"
import {
  UserHeader,
  StudyStatsWidget,
  UpcomingExamsWidget,
  LeaderboardWidget,
  RecentActivityWidget,
  CliquesWidget,
  NotificationsWidget,
} from "@/components/dashboard"

export default function DashboardScreen() {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <UserHeader />
        <StudyStatsWidget />
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
