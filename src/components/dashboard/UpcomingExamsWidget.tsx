import { FC } from "react"
import { View, Text, StyleSheet } from "react-native"
import { useAppTheme } from "@/utils/useAppTheme"

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
  const { colors } = useAppTheme().theme

  return (
    <View style={styles.widgetContainer}>
      <Text style={[styles.widgetTitle, { color: colors.text }]}>Upcoming Exams</Text>
      <View style={styles.contentContainer}>
        {exams.length === 0 ? (
          <Text style={[styles.noExamsText, { color: colors.textDim }]}>No upcoming exams. Well done!</Text>
        ) : (
          exams.map((exam) => (
            <View key={exam.id} style={[styles.examItemContainer, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.examTitle, { color: colors.text }]}>{exam.title}</Text>
              <View style={styles.dateCountdownContainer}>
                <Text style={[styles.examDate, { color: colors.textDim }]}>{exam.date}</Text>
                <Text style={[styles.examCountdown, { color: colors.tint }]}>({exam.countdown})</Text>
              </View>
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
    </View>
  )
}

const styles = StyleSheet.create({
  widgetContainer: {
    paddingVertical: 15,
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  contentContainer: {
  },
  examItemContainer: {
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 16,
  },
  examTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  dateCountdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  examDate: {
    fontSize: 14,
    marginRight: 8,
  },
  examCountdown: {
    fontSize: 14,
    fontWeight: "500",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  topicTag: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicText: {
    fontSize: 12,
    fontWeight: "500",
  },
  noExamsText: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 16,
  },
})
