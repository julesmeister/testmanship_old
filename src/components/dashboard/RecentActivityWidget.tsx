import { FC, Fragment } from "react"
import { View, Text, StyleSheet, FlatList, ViewStyle } from "react-native"
import { Card, Icon, IconTypes } from "@/components" // Assuming Icon is available in @/components

// Color Constants
const COLORS = {
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F0F0F0",
  accentBlue: "#007AFF",
  accentGreen: "#34C759",
  accentOrange: "#FF9500",
}

interface ActivityItem {
  id: string
  type: "review" | "highlight" | "occlusion"
  description: string
  timestamp: string // e.g., "5m ago", "1h ago", "Yesterday"
  icon: IconTypes
}

interface RecentActivityWidgetProps {
  activities?: ActivityItem[]
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "review",
    description: "Reviewed 'Photosynthesis Basics'",
    timestamp: "15m ago",
    icon: "check", // Changed from "refresh"
  },
  {
    id: "2",
    type: "highlight",
    description: "Highlighted section in 'Newtonian Physics'",
    timestamp: "1h ago",
    icon: "pin", // Changed from "bookmark"
  },
  {
    id: "3",
    type: "occlusion",
    description: "Created 3 new occlusions for 'Anatomy - Skeletal System'",
    timestamp: "Yesterday",
    icon: "view", // Changed from "image"
  },
  {
    id: "4",
    type: "review",
    description: "Completed quiz on 'Organic Chemistry Nomenclature'",
    timestamp: "2 days ago",
    icon: "check", // Changed from "refresh"
  },
]

export const RecentActivityWidget: FC<RecentActivityWidgetProps> = ({
  activities = MOCK_ACTIVITIES,
}) => {
  const getActivityIconColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "review":
        return COLORS.accentGreen
      case "highlight":
        return COLORS.accentOrange
      case "occlusion":
        return COLORS.accentBlue
      default:
        return COLORS.mediumGray
    }
  }

  const renderActivity = ({ item }: { item: ActivityItem }) => (
    <View style={styles.activityRow}>
      <Icon
        icon={item.icon}
        size={20}
        color={getActivityIconColor(item.type)}
        style={styles.activityIcon}
      />
      <View style={styles.activityTextContainer}>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTimestamp}>{item.timestamp}</Text>
      </View>
    </View>
  )

  const WidgetContent = () => (
    <View style={styles.contentContainer}>
      {activities.length === 0 ? (
        <Text style={styles.noActivityText}>No recent activity.</Text>
      ) : (
        <FlatList
          data={activities.slice(0, 3)} // Show top 3 or adjust
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </View>
  )

  return (
    <Card
      style={[styles.cardStyle, $noCardStyle]}
      ContentComponent={<WidgetContent />}
      heading="Recent Activity"
    />
  )
}

const $noCardStyle: ViewStyle = {
  backgroundColor: "transparent",
  borderWidth: 0,
  borderBottomWidth: 0,
  shadowOpacity: 0,
  elevation: 0,
}

const styles = StyleSheet.create({
  activityDescription: {
    color: COLORS.darkGray,
    fontSize: 15,
    marginBottom: 2,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityRow: {
    alignItems: "center",
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTimestamp: {
    color: COLORS.mediumGray,
    fontSize: 12,
  },
  cardStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  contentContainer: {
    paddingVertical: 5, // Reduce padding if list items have their own
  },
  noActivityText: {
    color: COLORS.mediumGray,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 20,
    textAlign: "center",
  },
})
