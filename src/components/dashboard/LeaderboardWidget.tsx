import { FC, Fragment } from "react"
import { View, Text, StyleSheet, FlatList } from "react-native"
import { Card } from "@/components"

// Color Constants
const COLORS = {
  darkGray: "#333333",
  mediumGray: "#666666",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  lightGray: "#F0F0F0",
}

interface LeaderboardUser {
  id: string
  rank: number
  name: string
  score: number
  isCurrentUser?: boolean
}

interface LeaderboardWidgetProps {
  users?: LeaderboardUser[]
  currentUserRank?: LeaderboardUser
}

const MOCK_USERS: LeaderboardUser[] = [
  { id: "1", rank: 1, name: "Alice Wonderland", score: 10500 },
  { id: "2", rank: 2, name: "Bob The Builder", score: 9800 },
  { id: "3", rank: 3, name: "Charlie Brown", score: 9750 },
  { id: "4", rank: 4, name: "Diana Prince", score: 8500 },
  { id: "5", rank: 5, name: "Edward Scissorhands", score: 7200 },
]

const MOCK_CURRENT_USER: LeaderboardUser = {
  id: "currentUser",
  rank: 15,
  name: "Valued User (You)",
  score: 5500,
  isCurrentUser: true,
}

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = ({
  users = MOCK_USERS,
  currentUserRank = MOCK_CURRENT_USER,
}) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return COLORS.gold
    if (rank === 2) return COLORS.silver
    if (rank === 3) return COLORS.bronze
    return COLORS.mediumGray
  }

  const renderUser = ({ item }: { item: LeaderboardUser }) => (
    <View style={[styles.userRow, item.isCurrentUser && styles.currentUserRow]}>
      <Text style={[styles.rank, { color: getRankColor(item.rank) }]}>{item.rank}.</Text>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.score}>{item.score} XP</Text>
    </View>
  )

  const WidgetContent = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.subheading}>Top Performers</Text>
      <FlatList
        data={users.slice(0, 5)} // Show top 5 or adjust as needed
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // If list is short, disable scroll
      />
      {currentUserRank && (
        <Fragment>
          <View style={styles.separator} />
          <Text style={styles.subheading}>Your Rank</Text>
          {renderUser({ item: currentUserRank })}
        </Fragment>
      )}
    </View>
  )

  return (
    <Card style={styles.cardStyle} ContentComponent={<WidgetContent />} heading="Leaderboard" />
  )
}

const styles = StyleSheet.create({
  cardStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 10,
    marginTop: 5,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  currentUserRow: {
    backgroundColor: "#E8F5E9", // A light highlight for the current user
    marginHorizontal: -15, // Extend highlight to container edges
    paddingHorizontal: 15, // Re-apply padding
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
    width: 30, // For alignment
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  score: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 15,
  },
})
