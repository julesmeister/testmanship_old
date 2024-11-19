interface EssayFeedbackProps {
  feedback: {
    language_check: {
      detected_language: string;
      is_target_language: boolean;
      translation?: string;
      language_advice?: string;
    };
    overall_score: number;
    general_feedback: string;
    detailed_feedback: {
      grammar: {
        errors: string[];
        suggestions: string[];
      };
      vocabulary: {
        level: string;
        suggestions: string[];
      };
      structure: {
        strengths: string[];
        improvements: string[];
      };
      content: {
        clarity: number;
        coherence: number;
        suggestions: string[];
      };
    };
    improvement_plan: string[];
  };
}

export function EssayFeedback({ feedback }: EssayFeedbackProps) {
  return (
    <div className="space-y-4">
      {/* Language Check */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Language Check
        </h3>
        <div className="space-y-2 text-zinc-700 dark:text-zinc-300">
          <p className="flex items-center gap-2">
            <span className="font-medium">Detected Language:</span>
            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-sm">
              {feedback.language_check.detected_language}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Target Language Match:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              feedback.language_check.is_target_language
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {feedback.language_check.is_target_language ? 'Yes' : 'No'}
            </span>
          </p>
          {feedback.language_check.translation && (
            <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-md">
              <span className="font-medium">Translation:</span>
              <p className="mt-1 italic">{feedback.language_check.translation}</p>
            </div>
          )}
          {feedback.language_check.language_advice && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md">
              {feedback.language_check.language_advice}
            </div>
          )}
        </div>
      </div>

      {/* Overall Score */}
      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Overall Score
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-green-500 dark:border-green-600">
            <span className="text-xl font-bold text-green-600 dark:text-green-500">
              {feedback.overall_score}/10
            </span>
          </div>
          <p className="flex-1 text-zinc-700 dark:text-zinc-300">{feedback.general_feedback}</p>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Detailed Feedback
        </h3>
        
        {/* Grammar */}
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Grammar</h4>
            {feedback.detailed_feedback.grammar.errors.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Errors to Fix:</h5>
                <ul className="space-y-2">
                  {feedback.detailed_feedback.grammar.errors.map((error, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.detailed_feedback.grammar.suggestions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Suggestions:</h5>
                <ul className="space-y-2">
                  {feedback.detailed_feedback.grammar.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Vocabulary */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Vocabulary</h4>
            <p className="mb-3 inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
              Level: {feedback.detailed_feedback.vocabulary.level}
            </p>
            {feedback.detailed_feedback.vocabulary.suggestions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Suggestions:</h5>
                <ul className="space-y-2">
                  {feedback.detailed_feedback.vocabulary.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Structure */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Structure</h4>
            {feedback.detailed_feedback.structure.strengths.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Strengths:</h5>
                <ul className="space-y-2">
                  {feedback.detailed_feedback.structure.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.detailed_feedback.structure.improvements.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Areas for Improvement:</h5>
                <ul className="space-y-2">
                  {feedback.detailed_feedback.structure.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
            <h4 className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Content</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-md text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Clarity</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {feedback.detailed_feedback.content.clarity}/10
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-md text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Coherence</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {feedback.detailed_feedback.content.coherence}/10
                </p>
              </div>
            </div>
            {feedback.detailed_feedback.content.suggestions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Suggestions:</h5>
                <ul className="space-y-2">
                  {feedback.detailed_feedback.content.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Improvement Plan
        </h3>
        <div className="space-y-3">
          {feedback.improvement_plan.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm font-medium">
                {i + 1}
              </span>
              <p className="text-amber-700 dark:text-amber-300">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
