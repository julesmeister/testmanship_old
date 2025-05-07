import React from "react"
import { Tabs } from "expo-router"
import { Icon, IconTypes } from "@/components/Icon" // Assuming Icon component path
import { useAppTheme } from "@/utils/useAppTheme" // For theming tab bar

// Helper function to render icons (adjust path to your Icon component)
const TabBarIcon = (props: { name: IconTypes; color: string }) => {
  return <Icon icon={props.name} size={24} color={props.color} />
}

export default function TabLayout() {
  const { colors } = useAppTheme().theme // For consistent theming

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tintInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index" // This will correspond to (tabs)/index.tsx for the Home screen
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="components" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity" // This will correspond to (tabs)/activity.tsx
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => <TabBarIcon name="check" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard" // This will correspond to (tabs)/leaderboard.tsx
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => <TabBarIcon name="clap" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cliques" // This will correspond to (tabs)/cliques.tsx
        options={{
          title: "Cliques",
          tabBarIcon: ({ color }) => <TabBarIcon name="community" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications" // This will correspond to (tabs)/notifications.tsx
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />
    </Tabs>
  )
}
