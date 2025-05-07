import { FC, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Card, Icon, IconTypes } from "@/components"; // Assuming Icon is available

// Color Constants
const COLORS = {
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#F0F0F0',
  primaryAction: '#007AFF',
  secondaryAction: '#5856D6',
};

interface CliqueItem {
  id: string;
  name: string;
  memberCount: number;
  // lastActivity: string; // Optional: could add later
}

interface CliquesWidgetProps {
  cliques?: CliqueItem[];
}

const MOCK_CLIQUES: CliqueItem[] = [
  { id: "1", name: "Biology Study Group", memberCount: 5 },
  { id: "2", name: "Physics Partners", memberCount: 2 },
  { id: "3", name: "History Buffs United", memberCount: 12 },
];

export const CliquesWidget: FC<CliquesWidgetProps> = ({ 
  cliques = MOCK_CLIQUES 
}) => {

  const renderClique = ({ item }: { item: CliqueItem }) => (
    <TouchableOpacity style={styles.cliqueRow} onPress={() => alert(`Navigate to ${item.name}`)}>
      <Icon icon="community" size={22} color={COLORS.mediumGray} style={styles.cliqueIcon} />
      <View style={styles.cliqueInfo}>
        <Text style={styles.cliqueName}>{item.name}</Text>
        <Text style={styles.cliqueMembers}>{item.memberCount} members</Text>
      </View>
      <Icon icon="caretRight" size={18} color={COLORS.mediumGray} />
    </TouchableOpacity>
  );

  const WidgetContent = () => (
    <View style={styles.contentContainer}>
      {cliques.length === 0 ? (
        <Text style={styles.noCliquesText}>You are not part of any cliques yet.</Text>
      ) : (
        <FlatList
          data={cliques.slice(0,3)} // Show top 3 or adjust
          renderItem={renderClique}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.joinButton]} onPress={() => alert("Open Join Clique UI")}>
          <Icon icon="menu" size={18} color={COLORS.primaryAction} style={styles.actionIcon}/>
          <Text style={styles.actionButtonText}>Join Clique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.createButton]} onPress={() => alert("Open Create Clique UI")}>
          <Icon icon="components" size={18} color={COLORS.secondaryAction} style={styles.actionIcon}/> {/* Using 'components' as a placeholder for 'add' or 'plus' if not available */}
          <Text style={styles.actionButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Card
      style={styles.cardStyle}
      ContentComponent={<WidgetContent />}
      heading="My Cliques"
    />
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  contentContainer: {
    // paddingVertical: 5, // Removed as items and buttons will manage their padding
  },
  cliqueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cliqueIcon: {
    marginRight: 12,
  },
  cliqueInfo: {
    flex: 1,
  },
  cliqueName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.darkGray,
  },
  cliqueMembers: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  noCliquesText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: "center",
    padding: 20,
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20, // Make buttons rounded
  },
  actionIcon: {
    marginRight: 8,
  },
  joinButton: {
    backgroundColor: '#E0F2FF', // Light blue background
  },
  createButton: {
    backgroundColor: '#EDE7F6', // Light purple background
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryAction, // Default color, can be overridden by specific button styles
  },
});

// In createButton, consider changing color for text to COLORS.secondaryAction if desired.
