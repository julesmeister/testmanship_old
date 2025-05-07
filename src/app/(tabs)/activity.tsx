import React from "react"
import { StyleSheet } from "react-native"
import { Screen } from "@/components"
import { RecentActivityWidget } from "@/components/dashboard"

export default function ActivityScreen() {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={styles.container}>
      <RecentActivityWidget />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
})
