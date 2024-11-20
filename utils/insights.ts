import { type PerformanceMetrics, type SkillMetrics, type Insights } from '@/types/evaluation';

const THRESHOLD_HIGH = 0.8; // 80% and above is considered a strength
const THRESHOLD_LOW = 0.6; // Below 60% is considered a weakness

export function generateInsights(
  performanceMetrics: PerformanceMetrics,
  skillMetrics: SkillMetrics
): Insights {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const tips: string[] = [];

  // Analyze grammar
  if (performanceMetrics.metrics.grammar >= THRESHOLD_HIGH) {
    strengths.push('Strong command of grammar and sentence structure');
  } else if (performanceMetrics.metrics.grammar < THRESHOLD_LOW) {
    weaknesses.push('Room for improvement in grammar usage');
    tips.push('Review common grammar rules and practice using complex sentence structures');
  }

  // Analyze vocabulary
  if (performanceMetrics.metrics.vocabulary >= THRESHOLD_HIGH) {
    strengths.push('Rich and varied vocabulary usage');
  } else if (performanceMetrics.metrics.vocabulary < THRESHOLD_LOW) {
    weaknesses.push('Limited vocabulary range');
    tips.push('Expand your vocabulary by reading diverse materials and using a thesaurus');
  }

  // Analyze fluency
  if (performanceMetrics.metrics.fluency >= THRESHOLD_HIGH) {
    strengths.push('Excellent writing fluency and natural flow');
  } else if (performanceMetrics.metrics.fluency < THRESHOLD_LOW) {
    weaknesses.push('Writing could be more fluid and natural');
    tips.push('Practice writing regularly and read your work aloud to improve flow');
  }

  // Analyze writing complexity
  if (skillMetrics.writingComplexity >= THRESHOLD_HIGH) {
    strengths.push('Sophisticated writing style with complex ideas');
  } else if (skillMetrics.writingComplexity < THRESHOLD_LOW) {
    weaknesses.push('Writing could be more sophisticated');
    tips.push('Try incorporating more complex sentence structures and advanced concepts');
  }

  // Analyze accuracy
  if (skillMetrics.accuracy >= THRESHOLD_HIGH) {
    strengths.push('High accuracy in content and facts');
  } else if (skillMetrics.accuracy < THRESHOLD_LOW) {
    weaknesses.push('Accuracy of content could be improved');
    tips.push('Double-check facts and statements for accuracy before submission');
  }

  // Analyze coherence
  if (skillMetrics.coherence >= THRESHOLD_HIGH) {
    strengths.push('Well-structured and coherent writing');
  } else if (skillMetrics.coherence < THRESHOLD_LOW) {
    weaknesses.push('Writing coherence needs improvement');
    tips.push('Focus on logical flow and transitions between paragraphs');
  }

  // Analyze style
  if (skillMetrics.style >= THRESHOLD_HIGH) {
    strengths.push('Distinctive and engaging writing style');
  } else if (skillMetrics.style < THRESHOLD_LOW) {
    weaknesses.push('Writing style could be more engaging');
    tips.push('Develop a more distinctive voice by varying sentence structure and tone');
  }

  // Add general tips based on overall performance
  if (performanceMetrics.metrics.overall < THRESHOLD_HIGH) {
    tips.push('Set aside time for editing and revision');
    tips.push('Consider using writing tools to help identify areas for improvement');
  }

  // Add time management tip if time spent is high
  if (performanceMetrics.timeSpent > performanceMetrics.wordCount / 10) { // Rough estimate of words per minute
    tips.push('Work on improving writing speed while maintaining quality');
  }

  return {
    strengths,
    weaknesses,
    tips: [...new Set(tips)] // Remove any duplicate tips
  };
}
