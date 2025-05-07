import { FC } from "react"
import { View, Text, StyleSheet } from "react-native"

// Color Constants
const COLORS = {
  darkGray: "#333333",
  mediumGray: "#666666",
  lightBlue: "#E0F2F7", // Example color for topic tags
  darkBlue: "#007AFF",
  lightGray: "#E0E0E0", // For border
  transparent: "transparent",
}

interface ExamItem {
  id: string
  title: string
  date: string // Could be a Date object, string for simplicity now
  countdown: string
  topics: string[]
}

interface UpcomingExamsWidgetProps {
  exams?: ExamItem[]
}

const MOCK_EXAMS: ExamItem[] = [
  {
    id: "1",
    title: "Midterm Exam - Chapter 1-5",
    date: "2023-10-26",
    countdown: "3 days",
    topics: ["Cellular Biology", "Genetics", "Evolutionary Theory"],
  },
  {
    id: "2",
    title: "Final Project Submission",
    date: "2023-11-15",
    countdown: "3 weeks",
    topics: ["Research Methods", "Statistical Analysis"],
  },
]

export const UpcomingExamsWidget: FC<UpcomingExamsWidgetProps> = ({ exams = MOCK_EXAMS }) => {
  return (
    <View style={styles.widgetContainer}>
      <Text style={styles.widgetTitle}>Upcoming Exams</Text>
      <View style={styles.contentContainer}>
        {exams.length === 0 ? (
          <Text style={styles.noExamsText}>No upcoming exams. Well done!</Text>
        ) : (
          exams.map((exam) => (
            <View key={exam.id} style={styles.examItemContainer}>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={styles.dateCountdownContainer}>
                <Text style={styles.examDate}>{exam.date}</Text>
                <Text style={styles.examCountdown}>({exam.countdown})</Text>
              </View>
              <View style={styles.topicsContainer}>
                {exam.topics.map((topic, index) => (
                  <View key={index} style={styles.topicTag}>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  widgetContainer: {
    backgroundColor: COLORS.transparent, // Assuming screen background is white
    paddingVertical: 15,
    paddingHorizontal: 15, // Add horizontal padding here for the content within this widget
  },
  widgetTitle: {
    color: COLORS.darkGray,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  contentContainer: {
    // Removed padding from here, handled by widgetContainer or specific items
  },
  examItemContainer: {
    borderBottomColor: COLORS.lightBlue,
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingBottom: 10,
  },
  examTitle: {
    color: COLORS.darkGray,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dateCountdownContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  examDate: {
    color: COLORS.mediumGray,
    fontSize: 14,
    marginRight: 8,
  },
  examCountdown: {
    color: COLORS.darkBlue,
    fontSize: 14,
    fontWeight: "500",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicTag: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 12,
    marginBottom: 5,
    marginRight: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicText: {
    color: COLORS.darkBlue,
    fontSize: 12,
  },
  noExamsText: {
    color: COLORS.mediumGray,
    fontSize: 16,
    paddingVertical: 20,
    textAlign: "center",
  },
})
