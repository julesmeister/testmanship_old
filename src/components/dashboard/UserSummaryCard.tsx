/* eslint-disable prettier/prettier */
import { FC, useState, useRef } from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ImageSourcePropType,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native"

// Placeholder avatar URI
const PLACEHOLDER_AVATAR_URI =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"

// Color Constants
const COLORS = {
  darkGray: "#333333",
  highlight: "#007AFF",
  lightGray: "#E0E0E0",
  mediumGray: "#666666",
  popoverBackground: "#FFFFFF",
  primaryText: "#111827",
  secondaryText: "#4B5563",
  shadow: "#000",
  transparent: "transparent",
  transparentOverlay: "rgba(0,0,0,0.1)",
  hoverBackground: 'rgba(0,122,255,0.1)',
}

// List of available avatars - Adjust paths as per your project structure
// Assuming UserSummaryCard.tsx is in src/components/dashboard/
const AVATARS: ImageSourcePropType[] = [
  require("../../../assets/images/avatars/Avatar-1.png"),
  require("../../../assets/images/avatars/Avatar-2.png"),
  require("../../../assets/images/avatars/Avatar-3.png"),
  require("../../../assets/images/avatars/Avatar-4.png"),
  require("../../../assets/images/avatars/Avatar-5.png"),
  require("../../../assets/images/avatars/Avatar-6.png"),
  require("../../../assets/images/avatars/Avatar-7.png"),
  require("../../../assets/images/avatars/Avatar-8.png"),
  require("../../../assets/images/avatars/Avatar-9.png"),
  require("../../../assets/images/avatars/Avatar-10.png"),
  require("../../../assets/images/avatars/Avatar-11.png"),
  require("../../../assets/images/avatars/Avatar-12.png"),
  require("../../../assets/images/avatars/Avatar-13.png"),
  require("../../../assets/images/avatars/Avatar-14.png"),
  require("../../../assets/images/avatars/Avatar-15.png"),
  require("../../../assets/images/avatars/Avatar-16.png"),
  require("../../../assets/images/avatars/Avatar-17.png"),
  require("../../../assets/images/avatars/Avatar-18.png"),
  require("../../../assets/images/avatars/Avatar-19.png"),
  require("../../../assets/images/avatars/Avatar-20.png"),
  require("../../../assets/images/avatars/Avatar-21.png"),
  require("../../../assets/images/avatars/Avatar-22.png"),
  require("../../../assets/images/avatars/Avatar-23.png"),
  require("../../../assets/images/avatars/Avatar-24.png"),
  require("../../../assets/images/avatars/Avatar-25.png"),
  require("../../../assets/images/avatars/Avatar-26.png"),
  require("../../../assets/images/avatars/Avatar-27.png"),
  require("../../../assets/images/avatars/Avatar-28.png"),
  require("../../../assets/images/avatars/Avatar-29.png"),
  require("../../../assets/images/avatars/Avatar-30.png"),
  require("../../../assets/images/avatars/Avatar-31.png"),
  require("../../../assets/images/avatars/Avatar-32.png"),
  require("../../../assets/images/avatars/Avatar-33.png"),
  require("../../../assets/images/avatars/Avatar-34.png"),
  require("../../../assets/images/avatars/Avatar-35.png"),
  require("../../../assets/images/avatars/Avatar-36.png"),
]

interface AvatarLayout {
  x: number
  y: number
  width: number
  height: number
}

interface UserSummaryCardProps {
  userName?: string
  avatarUrl?: string // Initial avatar URL
  masteryProgress?: string
  reviewStreak?: number
  timeStudied?: string
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SCREEN_EDGE_MARGIN = 10;
const AVATAR_OPTION_ITEM_SIZE = 60 + 10 + 6; // image + margin + padding*2 for avatarOption
const MIN_POPOVER_WIDTH = 200;
const MAX_POPOVER_COLUMNS = 5;

export const UserSummaryCard: FC<UserSummaryCardProps> = ({
  userName = "Valued User",
  avatarUrl = PLACEHOLDER_AVATAR_URI, // Use this as the initial default
  masteryProgress = "75%",
  reviewStreak = 10,
  timeStudied = "15h 30m",
}) => {
  const [isAvatarPopoverVisible, setIsAvatarPopoverVisible] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<ImageSourcePropType>(
    avatarUrl === PLACEHOLDER_AVATAR_URI ? { uri: PLACEHOLDER_AVATAR_URI } : { uri: avatarUrl },
  )
  const [avatarLayout, setAvatarLayout] = useState<AvatarLayout | null>(null)
  const avatarRef = useRef<View>(null)
  const [hoveredAvatarIndex, setHoveredAvatarIndex] = useState<number | null>(null)

  const greeting = `Hello, ${userName}!`

  const handleAvatarPress = () => {
    avatarRef.current?.measure(
      (_fx: number, _fy: number, width: number, height: number, px: number, py: number) => {
        setAvatarLayout({ x: px, y: py, width, height })
        setIsAvatarPopoverVisible(true)
      },
    )
  }

  const handleAvatarSelect = (avatarSource: ImageSourcePropType) => {
    setSelectedAvatar(avatarSource)
    setIsAvatarPopoverVisible(false)
  }

  let popoverLeftCalculated = 0;
  let popoverTopCalculated = 0;
  let popoverWidthCalculated = Math.max(MIN_POPOVER_WIDTH, screenWidth - (SCREEN_EDGE_MARGIN * 2));
  let numColumnsCalculated = Math.floor(popoverWidthCalculated / AVATAR_OPTION_ITEM_SIZE);
  numColumnsCalculated = Math.min(numColumnsCalculated, MAX_POPOVER_COLUMNS, AVATARS.length > 0 ? AVATARS.length : 1);
  popoverWidthCalculated = numColumnsCalculated * AVATAR_OPTION_ITEM_SIZE + 30; // +30 for overall padding in popover
  popoverWidthCalculated = Math.min(popoverWidthCalculated, screenWidth - (SCREEN_EDGE_MARGIN * 2));

  let caretLeftStyle = (popoverWidthCalculated / 2) - styles.caret.borderLeftWidth;

  if (avatarLayout) {
    popoverTopCalculated = avatarLayout.y + avatarLayout.height + 10;
    let desiredLeft = avatarLayout.x + (avatarLayout.width / 2) - (popoverWidthCalculated / 2);
    if (desiredLeft < SCREEN_EDGE_MARGIN) desiredLeft = SCREEN_EDGE_MARGIN;
    if (desiredLeft + popoverWidthCalculated > screenWidth - SCREEN_EDGE_MARGIN) {
      desiredLeft = screenWidth - popoverWidthCalculated - SCREEN_EDGE_MARGIN;
    }
    popoverLeftCalculated = desiredLeft;
    const avatarCenterX = avatarLayout.x + avatarLayout.width / 2;
    caretLeftStyle = avatarCenterX - popoverLeftCalculated - styles.caret.borderLeftWidth;
    const minCaretLeft = styles.caret.borderLeftWidth;
    const maxCaretLeft = popoverWidthCalculated - (styles.caret.borderLeftWidth * 3);
    caretLeftStyle = Math.max(minCaretLeft, Math.min(caretLeftStyle, maxCaretLeft));
  }

  return (
    <View style={styles.widgetContainer}>
      <View style={styles.userInfoSection}>
        <TouchableOpacity onPress={handleAvatarPress}>
          <View ref={avatarRef} collapsable={false}>
            <Image source={selectedAvatar} style={styles.avatar} />
          </View>
        </TouchableOpacity>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mastery Progress</Text>
          <Text style={styles.statValue}>{masteryProgress}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Review Streak</Text>
          <Text style={styles.statValue}>{reviewStreak} days</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time Studied</Text>
          <Text style={styles.statValue}>{timeStudied}</Text>
        </View>
      </View>

      {isAvatarPopoverVisible && avatarLayout && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isAvatarPopoverVisible}
          onRequestClose={() => setIsAvatarPopoverVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsAvatarPopoverVisible(false)}>
            <View style={styles.popoverOverlay} />
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.popoverContainer,
              {
                top: popoverTopCalculated,
                left: popoverLeftCalculated,
                width: popoverWidthCalculated,
                maxHeight: screenHeight * 0.6, // Max 60% of screen height
              },
            ]}
          >
            <View style={[styles.caret, { left: caretLeftStyle }]} />
            <Text style={styles.popoverTitle}>Select Avatar</Text>
            <FlatList
              data={AVATARS}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => handleAvatarSelect(item)}
                  style={[
                    styles.avatarOption,
                    hoveredAvatarIndex === index && styles.avatarOptionHovered
                  ]}
                  // @ts-ignore - onMouseEnter/Leave are web specific but work
                  onMouseEnter={() => setHoveredAvatarIndex(index)}
                  onMouseLeave={() => setHoveredAvatarIndex(null)}
                >
                  <Image source={item} style={styles.avatarOptionImage} />
                </TouchableOpacity>
              )}
              keyExtractor={(_item, index) => index.toString()}
              numColumns={numColumnsCalculated}
              contentContainerStyle={styles.avatarListContainer}
            />
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 30,
    height: 60,
    marginRight: 15,
    width: 60,
  },
  avatarListContainer: {
    alignItems: "center", // Center columns if they don't fill width
  },
  avatarOption: {
    borderColor: COLORS.transparent,
    borderRadius: 8,
    borderWidth: 1,
    margin: 5,
    padding: 3,
  },
  avatarOptionHovered: { // Style for hover effect
    borderColor: COLORS.highlight,
    backgroundColor: COLORS.hoverBackground,
  },
  avatarOptionImage: {
    width: 50, // Smaller for list display
    height: 50,
    borderRadius: 25,
  },
  caret: {
    position: "absolute",
    top: -10, // Position it above the bubble content
    width: 0,
    height: 0,
    borderLeftWidth: 10, // base/2
    borderRightWidth: 10, // base/2
    borderBottomWidth: 10, // height of caret
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLORS.popoverBackground, // Must match popover background
  },
  divider: {
    backgroundColor: COLORS.lightGray,
    height: 1,
    marginBottom: 15,
    marginVertical: 0,
  },
  greeting: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  greetingTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  popoverContainer: {
    backgroundColor: COLORS.popoverBackground,
    borderRadius: 8,
    elevation: 5,
    padding: 15,
    position: "absolute",
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 10, // Ensure it's above the overlay
  },
  popoverOverlay: {
    backgroundColor: COLORS.transparentOverlay,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0, // Slight dimming
  },
  popoverTitle: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  statItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  statLabel: {
    color: COLORS.secondaryText,
    fontSize: 16,
  },
  statValue: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  statsSection: {},
  userInfoSection: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
  },
  widgetContainer: {
    backgroundColor: COLORS.transparent,
    paddingVertical: 15,
  },
})
