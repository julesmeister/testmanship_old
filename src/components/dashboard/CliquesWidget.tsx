import { FC, Fragment } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ViewStyle } from "react-native"
import { Card, Icon, IconTypes } from "@/components" // Assuming Icon is available

// Color Constants
const COLORS = {
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F0F0F0",
  primaryAction: "#007AFF",
  secondaryAction: "#5856D6",
}

interface CliqueItem {
  id: string
  name: string
  memberCount: number
  // lastActivity: string; // Optional: could add later
}

interface CliquesWidgetProps {
  cliques?: CliqueItem[]
}

const MOCK_CLIQUES: CliqueItem[] = [
  { id: "1", name: "Biology Study Group", memberCount: 5 },
  { id: "2", name: "Physics Partners", memberCount: 2 },
  { id: "3", name: "History Buffs United", memberCount: 12 },
]

export const CliquesWidget: FC<CliquesWidgetProps> = ({ cliques = MOCK_CLIQUES }) => {
  const renderClique = ({ item }: { item: CliqueItem }) => (
    <TouchableOpacity style={styles.cliqueRow} onPress={() => alert(`Navigate to ${item.name}`)}>
      <Icon icon="community" size={22} color={COLORS.mediumGray} style={styles.cliqueIcon} />
      <View style={styles.cliqueInfo}>
        <Text style={styles.cliqueName}>{item.name}</Text>
        <Text style={styles.cliqueMembers}>{item.memberCount} members</Text>
      </View>
      <Icon icon="caretRight" size={18} color={COLORS.mediumGray} />
    </TouchableOpacity>
  )

  const WidgetContent = () => (
    <View style={styles.contentContainer}>
      {cliques.length === 0 ? (
        <Text style={styles.noCliquesText}>You are not part of any cliques yet.</Text>
      ) : (
        <FlatList
          data={cliques.slice(0, 3)} // Show top 3 or adjust
          renderItem={renderClique}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.joinButton]}
          onPress={() => alert("Open Join Clique UI")}
        >
          <Icon icon="menu" size={18} color={COLORS.primaryAction} style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Join Clique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.createButton]}
          onPress={() => alert("Open Create Clique UI")}
        >
          <Icon
            icon="components"
            size={18}
            color={COLORS.secondaryAction}
            style={styles.actionIcon}
          />{" "}
          {/* Using 'components' as a placeholder for 'add' or 'plus' if not available */}
          <Text style={styles.actionButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <Card
      style={[styles.cardStyle, $noCardStyle]}
      ContentComponent={<WidgetContent />}
      heading="My Cliques"
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
  actionButton: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10, // Make buttons rounded
  },
  actionButtonText: {
    color: COLORS.primaryAction,
    fontSize: 14,
    fontWeight: "600", // Default color, can be overridden by specific button styles
  },
  actionIcon: {
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 10, // Added padding for button container
    borderTopWidth: 1, // Separator for buttons
    borderTopColor: COLORS.lightGray,
    marginTop: 5, // Margin if there are list items above
  },
  cardStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  cliqueIcon: {
    marginRight: 12,
  },
  cliqueInfo: {
    flex: 1,
  },
  cliqueMembers: {
    color: COLORS.mediumGray,
    fontSize: 13,
  },
  cliqueName: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: "500",
  },
  cliqueRow: {
    alignItems: "center",
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  contentContainer: {
    // paddingVertical: 5, // Removed as items and buttons will manage their padding
  },
  createButton: {
    backgroundColor: "#EDE7F6", // Light purple background
  },
  joinButton: {
    backgroundColor: "#E0F2FF", // Light blue background
  },
  noCliquesText: {
    color: COLORS.mediumGray,
    fontSize: 16,
    padding: 20,
    textAlign: "center",
  },
})

// In createButton, consider changing color for text to COLORS.secondaryAction if desired.
