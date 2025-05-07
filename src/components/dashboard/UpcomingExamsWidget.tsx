import { FC } from "react"
import { View, Text, StyleSheet } from "react-native"
import { Card } from "@/components"

// Color Constants
const COLORS = {
  darkGray: "#333333",
  mediumGray: "#666666",
  lightBlue: "#E0F2F7", // Example color for topic tags
  darkBlue: "#007AFF",
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
  const WidgetContent = () => (
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
  )

  return (
    <Card style={styles.cardStyle} ContentComponent={<WidgetContent />} heading="Upcoming Exams" />
  )
}

const styles = StyleSheet.create({
  cardStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10, // Less vertical padding if list items have their own
  },
  examItemContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightBlue,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  dateCountdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  examDate: {
    fontSize: 14,
    color: COLORS.mediumGray,
    marginRight: 8,
  },
  examCountdown: {
    fontSize: 14,
    color: COLORS.darkBlue,
    fontWeight: "500",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  topicTag: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  topicText: {
    fontSize: 12,
    color: COLORS.darkBlue,
  },
  noExamsText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: "center",
    paddingVertical: 20,
  },
})
