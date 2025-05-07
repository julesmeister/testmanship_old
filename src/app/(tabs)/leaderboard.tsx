import React from "react"
import { StyleSheet } from "react-native"
import { Screen } from "@/components"
import { LeaderboardWidget } from "@/components/dashboard"

export default function LeaderboardScreen() {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={styles.container}>
      <LeaderboardWidget />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
})
