import { Challenge } from '@/types/types';

type RowObj = {
  id: string;
  title: string;
  difficulty: string;
  performance: number;
  paragraphs: number;
  completedAt: Date;
  timeSpent: number;
  wordCount: number;
  feedback: string;
};

const tableDataUserReports: Challenge[] = [
  {
    id: "1",
    title: "IELTS Task 2: Technology Impact",
    difficulty: "Moderate",
    performance: 8.5,
    paragraphs: 4,
    completedAt: new Date("2024-02-15T10:30:00"),
    timeSpent: 45,
    wordCount: 280,
    feedback: "Well-structured essay with clear arguments"
  },
  {
    id: "2",
    title: "TOEFL Independent Writing: Education",
    difficulty: "Hard",
    performance: 9.0,
    paragraphs: 5,
    completedAt: new Date("2024-02-14T15:45:00"),
    timeSpent: 35,
    wordCount: 320,
    feedback: "Excellent use of academic vocabulary and complex structures"
  },
  {
    id: "3",
    title: "Academic Writing: Climate Change",
    difficulty: "Easy",
    performance: 7.5,
    paragraphs: 3,
    completedAt: new Date("2024-02-13T09:15:00"),
    timeSpent: 30,
    wordCount: 250,
    feedback: "Good content but needs more supporting evidence"
  }
];

export default tableDataUserReports;
