import React, { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native"
import { Screen, Icon } from "@/components"
import { CliquesWidget } from "@/components/dashboard"
import { useAppTheme } from "@/utils/useAppTheme"

interface Exam {
  id: string
  title: string
  date: string
  topics: string[]
}

const MOCK_EXAMS: Exam[] = [
  {
    id: "1",
    title: "Biology Midterm",
    date: "2024-03-15",
    topics: ["Cell Biology", "Genetics"]
  },
  {
    id: "2",
    title: "Physics Final",
    date: "2024-04-20",
    topics: ["Mechanics", "Thermodynamics"]
  }
]

export default function CliquesScreen() {
  const { colors } = useAppTheme().theme
  const [showExamForm, setShowExamForm] = useState(false)
  const [newExam, setNewExam] = useState({
    title: "",
    date: "",
    topics: ""
  })

  const handleCreateExam = () => {
    console.log("Creating exam:", newExam)
    setShowExamForm(false)
    setNewExam({ title: "", date: "", topics: "" })
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={styles.container}>
      <CliquesWidget />

      <View style={styles.examsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Exams</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowExamForm(true)}
          >
            <Icon
              icon="components"
              size={22}
              color={colors.tint}
            />
          </TouchableOpacity>
        </View>

        {MOCK_EXAMS.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.separator }]}>
            <Text style={{ color: colors.textDim }}>No upcoming exams</Text>
          </View>
        ) : (
          MOCK_EXAMS.map((exam, index) => (
            <View
              key={exam.id}
              style={[
                styles.examItem,
                { borderBottomColor: colors.separator },
                index === MOCK_EXAMS.length - 1 && styles.lastExamItem
              ]}
            >
              <View style={styles.examHeader}>
                <Text style={[styles.examTitle, { color: colors.text }]}>{exam.title}</Text>
                <TouchableOpacity>
                  <Icon icon="more" size={20} color={colors.textDim} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.examDate, { color: colors.textDim }]}>Date: {exam.date}</Text>
              <View style={styles.topicsContainer}>
                {exam.topics.map((topic, index) => (
                  <View key={index} style={[styles.topicTag, { backgroundColor: colors.tint + '15' }]}>
                    <Text style={[styles.topicText, { color: colors.tint }]}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={showExamForm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExamForm(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExamForm(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Exam</Text>
                <TouchableOpacity
                  onPress={() => setShowExamForm(false)}
                >
                  <Icon icon="x" size={20} color={colors.textDim} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { borderBottomColor: colors.separator, color: colors.text }]}
                placeholder="Exam Title"
                placeholderTextColor={colors.textDim}
                value={newExam.title}
                onChangeText={(text) => setNewExam({ ...newExam, title: text })}
              />
              <TextInput
                style={[styles.input, { borderBottomColor: colors.separator, color: colors.text }]}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor={colors.textDim}
                value={newExam.date}
                onChangeText={(text) => setNewExam({ ...newExam, date: text })}
              />
              <TextInput
                style={[styles.input, styles.topicsInput, { borderBottomColor: colors.separator, color: colors.text }]}
                placeholder="Topics (comma-separated)"
                placeholderTextColor={colors.textDim}
                value={newExam.topics}
                onChangeText={(text) => setNewExam({ ...newExam, topics: text })}
                multiline
              />

              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.tint }]}
                onPress={handleCreateExam}
              >
                <Text style={styles.createButtonText}>Create Exam</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    padding: 16,
  },
  examsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  emptyState: {
    padding: 24,
    borderRadius: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  lastExamItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  examDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topicText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 0,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 0,
    marginBottom: 20,
    fontSize: 16,
  },
  topicsInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
