import React from "react"
import { StyleSheet } from "react-native"
import { Screen } from "@/components"
import { NotificationsWidget } from "@/components/dashboard"

export default function NotificationsScreen() {
  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={styles.container}>
      <NotificationsWidget />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
})
