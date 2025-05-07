import React, { FC, useState } from "react"
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Modal } from "react-native"
import { Screen, Icon, IconTypes, MaterialIcon } from "@/components"
import {
    UserSummaryCard,
    // UpcomingExamsWidget, // Temporarily remove for notebook focus
} from "@/components/dashboard"

// const TABLET_BREAKPOINT = 768; // Temporarily remove for notebook focus

interface Notebook {
    id: string
    title: string
    // color?: string; // Removed color for now to simplify and reduce color usage
    lastModified?: string
    icon?: IconTypes // Optional icon for the notebook
}

const MOCK_NOTEBOOKS: Notebook[] = [
    { id: "1", title: "Biology Notes", lastModified: "Yesterday", icon: "components" },
    { id: "2", title: "Physics Formulas", lastModified: "2 days ago", icon: "components" },
    { id: "3", title: "History Revision", lastModified: "Last week", icon: "components" },
    { id: "4", title: "Calculus Problems", lastModified: "3 hours ago", icon: "components" },
]

const NotebookItem: FC<{ item: Notebook }> = ({ item }) => {
    const [showOptions, setShowOptions] = useState(false)
    const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 })

    const handleOptionsPress = (event: any) => {
        const { pageX, pageY } = event.nativeEvent
        setOptionsPosition({ x: pageX, y: pageY })
        setShowOptions(true)
    }

    const handleOptionSelect = (action: string) => {
        setShowOptions(false)
        switch (action) {
            case 'delete':
                alert(`Delete notebook: ${item.title}`)
                break
            case 'rename':
                alert(`Rename notebook: ${item.title}`)
                break
            case 'share':
                alert(`Share notebook: ${item.title}`)
                break
        }
    }

    return (
        <>
            <TouchableOpacity style={styles.notebookItem}>
                {item.icon && (
                    <Icon
                        icon={item.icon}
                        size={24}
                        color={styles.notebookIconStyle.color}
                        style={styles.notebookIconStyle}
                    />
                )}
                <View style={styles.notebookTextContainer}>
                    <Text style={styles.notebookTitle}>{item.title}</Text>
                    {item.lastModified && (
                        <Text style={styles.notebookMeta}>Last modified: {item.lastModified}</Text>
                    )}
                </View>
                <TouchableOpacity onPress={handleOptionsPress}>
                    <Icon
                        icon="more"
                        size={20}
                        color="#007AFF"
                        style={styles.notebookOptionsIconPlaceholderStyle}
                    />
                </TouchableOpacity>
            </TouchableOpacity>

            <Modal
                visible={showOptions}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowOptions(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowOptions(false)}
                >
                    <View style={[styles.optionsMenu, { top: optionsPosition.y, left: optionsPosition.x - 100 }]}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => handleOptionSelect('rename')}
                        >
                            <Text style={styles.optionText}>Rename</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => handleOptionSelect('share')}
                        >
                            <Text style={styles.optionText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionItem, styles.deleteOption]}
                            onPress={() => handleOptionSelect('delete')}
                        >
                            <Text style={[styles.optionText, styles.deleteOptionText]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    )
}

export default function HomeScreen() {
    // const { width } = useWindowDimensions(); // Temporarily remove for notebook focus
    // const isTablet = width >= TABLET_BREAKPOINT; // Temporarily remove for notebook focus

    return (
        <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={styles.container}>
            <UserSummaryCard />
            <View style={styles.notebookListContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Notebooks</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => alert('Create new notebook')}
                    >
                        <MaterialIcon
                            name="add"
                            size={24}
                            color="#007AFF"
                        />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={MOCK_NOTEBOOKS}
                    renderItem={({ item }) => <NotebookItem item={item} />}
                    keyExtractor={(item) => item.id}
                // For a horizontal list, if desired later:
                // horizontal
                // showsHorizontalScrollIndicator={false}
                />
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16, // Keep horizontal padding
        paddingVertical: 16, // Added vertical padding for overall screen
    },
    // tabletExtraWidgetContainer: { // Temporarily remove for notebook focus
    //   marginTop: 16,
    // },
    notebookListContainer: {
        marginTop: 24, // Space below UserSummaryCard
    },
    notebookItem: {
        alignItems: "center",
        backgroundColor: "#FFFFFF", // White background for items
        borderColor: "#E0E0E0", // Light border
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        marginBottom: 12, // Increased margin
        paddingHorizontal: 15,
        paddingVertical: 12, // Adjusted padding
        // Removed direct shadow, border provides separation
    },
    notebookIconStyle: {
        color: "#555555", // Neutral icon color
        marginRight: 12,
    },
    notebookMeta: {
        color: "#666666", // Adjusted color
        fontSize: 12,
        // marginBottom: 8, // Removed as options icon is on the right
    },
    notebookOptionsIconPlaceholderStyle: {
        marginLeft: 8,
    },
    notebookTextContainer: {
        flex: 1, // Allow text to take available space
    },
    notebookTitle: {
        fontSize: 17, // Slightly adjusted
        fontWeight: "500",
        marginBottom: 3, // Adjusted margin
    },
    sectionTitle: {
        color: "#333", // Example color
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16, // Increased margin
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    optionsMenu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 150,
    },
    optionItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    deleteOption: {
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    deleteOptionText: {
        color: '#FF3B30',
    },
})
