export interface PerformanceMetrics {
  wordCount: number;
  paragraphCount: number;
  timeSpent: number;
  performanceScore: number;
  improvedEssay?: string;
  metrics: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    overall: number;
  };
}

export interface SkillMetrics {
  writingComplexity: number;
  accuracy: number;
  coherence: number;
  style: number;
}

export interface Insights {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

export interface EvaluationState {
  showEvaluation: boolean;
  performanceMetrics: PerformanceMetrics;
  skillMetrics: SkillMetrics;
  insights: Insights;
  isLoading: boolean;
  error: string | null;
}
