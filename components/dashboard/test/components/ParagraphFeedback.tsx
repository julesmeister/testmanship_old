interface ParagraphFeedbackProps {
  feedback: {
    languages: {
      detected: string;
      target: string;
    };
    translations: {
      from: string[];
      to: string[];
    };
    fixes: string[];
    tips: string[];
  };
}

export function ParagraphFeedback({ feedback }: ParagraphFeedbackProps) {
  return (
    <div className="space-y-4">
      {/* Language Information */}
      <div>
        <h3 className="font-semibold mb-2">Language</h3>
        <p>Detected: {feedback.languages.detected}</p>
        <p>Target: {feedback.languages.target}</p>
      </div>
      
      {/* Translations */}
      <div>
        <h3 className="font-semibold mb-2">Translations</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">From:</h4>
            <ul className="list-disc pl-4">
              {feedback.translations.from.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium">To:</h4>
            <ul className="list-disc pl-4">
              {feedback.translations.to.map((text, i) => (
                <li key={i}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Fixes */}
      <div>
        <h3 className="font-semibold mb-2">Fixes</h3>
        <ul className="list-disc pl-4">
          {feedback.fixes.map((fix, i) => (
            <li key={i}>{fix}</li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div>
        <h3 className="font-semibold mb-2">Tips</h3>
        <ul className="list-disc pl-4">
          {feedback.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
