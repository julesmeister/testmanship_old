import { FC, Fragment } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle } from "react-native"
import { Card, Icon, IconTypes } from "@/components" // Assuming Icon is available

// Color Constants
const COLORS = {
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F0F0F0",
  reminderBlue: "#007AFF",
  inviteGreen: "#34C759",
  announcementPurple: "#5856D6",
  readNotification: "#D1D1D6", // Lighter color for read notifications
  primaryAction: "#007AFF", // Added for View All button
}

interface NotificationItem {
  id: string
  type: "reminder" | "invite" | "announcement"
  message: string
  timestamp: string
  icon: IconTypes
  isRead?: boolean
  action?: () => void // Optional action for the notification
}

interface NotificationsWidgetProps {
  notifications?: NotificationItem[]
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "reminder",
    message: "Upcoming exam: Biology Midterm in 3 days!",
    timestamp: "10m ago",
    icon: "bell",
    isRead: false,
    action: () => alert("View Biology Midterm details"),
  },
  {
    id: "2",
    type: "invite",
    message: "You've been invited to join 'Physics Study Squad'",
    timestamp: "1h ago",
    icon: "community", // Using community icon for group invites
    isRead: false,
    action: () => alert("Respond to Physics Study Squad invite"),
  },
  {
    id: "3",
    type: "announcement",
    message: "New study materials added for Chapter 5.",
    timestamp: "Yesterday",
    icon: "settings", // Using settings as a generic announcement icon, can be changed
    isRead: true,
  },
  {
    id: "4",
    type: "reminder",
    message: "Study session for History 101 starts in 1 hour.",
    timestamp: "5h ago",
    icon: "bell",
    isRead: true,
  },
]

export const NotificationsWidget: FC<NotificationsWidgetProps> = ({
  notifications = MOCK_NOTIFICATIONS,
}) => {
  const getNotificationIconColor = (type: NotificationItem["type"], isRead?: boolean) => {
    if (isRead) return COLORS.readNotification
    switch (type) {
      case "reminder":
        return COLORS.reminderBlue
      case "invite":
        return COLORS.inviteGreen
      case "announcement":
        return COLORS.announcementPurple
      default:
        return COLORS.mediumGray
    }
  }

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationRow, item.isRead && styles.readNotificationRow]}
      onPress={item.action}
      disabled={!item.action}
    >
      <Icon
        icon={item.icon}
        size={22}
        color={getNotificationIconColor(item.type, item.isRead)}
        style={styles.notificationIcon}
      />
      <View style={styles.notificationTextContainer}>
        <Text style={[styles.notificationMessage, item.isRead && styles.readText]}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTimestamp, item.isRead && styles.readText]}>
          {item.timestamp}
        </Text>
      </View>
      {item.action && (
        <Icon
          icon="caretRight"
          size={18}
          color={item.isRead ? COLORS.readNotification : COLORS.mediumGray}
        />
      )}
    </TouchableOpacity>
  )

  const WidgetContent = () => (
    <View style={styles.contentContainer}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>No new notifications.</Text>
      ) : (
        <FlatList
          data={notifications.slice(0, 3)} // Show top 3 or adjust
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
      {notifications.length > 0 && (
        <TouchableOpacity
          onPress={() => alert("View all notifications")}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <Card
      style={[styles.cardStyle, $noCardStyle]}
      ContentComponent={<WidgetContent />}
      heading="Notifications"
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
  cardStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  contentContainer: {
    // paddingVertical: 5, // List items handle their own padding
  },
  noNotificationsText: {
    color: COLORS.mediumGray,
    fontSize: 16,
    padding: 20,
    textAlign: "center",
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationMessage: {
    color: COLORS.darkGray,
    fontSize: 15,
    marginBottom: 3,
  },
  notificationRow: {
    alignItems: "center",
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTimestamp: {
    color: COLORS.mediumGray,
    fontSize: 12,
  },
  readNotificationRow: {
    // backgroundColor: COLORS.lightGray, // Optional: slightly different background for read items
  },
  readText: {
    color: COLORS.readNotification, // Make text lighter for read notifications
  },
  viewAllButton: {
    alignItems: "center",
    borderTopColor: COLORS.lightGray,
    borderTopWidth: 1,
    marginTop: 5,
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 15,
    color: COLORS.primaryAction, // Using a defined color from another widget
    fontWeight: "600",
  },
})
