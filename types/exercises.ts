export interface ConjugationTablesProps {
    exercise: {
        id: string;
        verb: string;
        tense: string;
        pronouns: string[];
        conjugations: string[];
    };
    onComplete: (score: number) => void;
}

export interface DialogueCompletionProps {
    exercise: {
        id: string;
        context: string;
        dialogue: {
            speaker: string;
            text: string;
            isResponse?: boolean;
            expectedResponse?: string;
            hint?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface DragAndDropProps {
    exercise: {
        id: string;
        items: {
            id: string;
            content: string;
            correctPosition: number;
        }[];
        instruction: string;
    };
    onComplete: (score: number) => void;
}

export interface FillInTheBlanksProps {
    exercise: {
        id: string;
        sentence: string;
        blanks: {
            word: string;
            position: number;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface GapFillProps {
    exercise: {
        id: string;
        text: string;
        gaps: {
            id: string;
            answer: string;
            hint?: string;
            acceptableAnswers?: string[];
        }[];
    };
    onComplete: (score: number) => void;
}

export interface MatchingProps {
    exercise: {
        id: string;
        pairs: {
            left: string;
            right: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface MultipleChoiceProps {
    exercise: {
        id: string;
        questions: {
            text: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface QuestionFormationProps {
    exercise: {
        id: string;
        statements: {
            text: string;
            expectedQuestion: string;
            hint?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface RolePlayingProps {
    exercise: {
        id: string;
        scenario: string;
        context: string;
        roles: {
            id: string;
            name: string;
            description: string;
            prompts: {
                id: string;
                text: string;
                expectedResponse: string;
                alternatives?: string[];
                hint?: string;
            }[];
        }[];
    };
    onComplete: (score: number) => void;
}

export interface SentenceCorrectionProps {
    exercise: {
        id: string;
        sentences: {
            id: string;
            text: string;
            correction: string;
            hint?: string;
            explanation?: string;
            focus?: string; // e.g., "grammar", "spelling", "punctuation"
        }[];
    };
    onComplete: (score: number) => void;
}

export interface SentenceReorderingProps {
    exercise: {
        id: string;
        sentences: {
            id: string;
            segments: {
                id: string;
                text: string;
                position: number;
            }[];
            hint?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface SentenceSplittingProps {
    exercise: {
        id: string;
        sentences: {
            id: string;
            text: string;
            expectedSplits: string[];
            hint?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface SentenceTransformationProps {
    exercise: {
        id: string;
        sentences: {
            original: string;
            transformation: string;
            expectedResult: string;
            hint?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface WordBuildingProps {
    exercise: {
        id: string;
        words: {
            id: string;
            root: string;
            prefix?: string;
            suffix?: string;
            target: string;
            type: string; // e.g., "prefix", "suffix", "both"
            hint?: string;
            explanation?: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface WordSortingProps {
    exercise: {
        id: string;
        categories: {
            id: string;
            name: string;
            description?: string;
        }[];
        words: {
            id: string;
            text: string;
            category: string;
        }[];
    };
    onComplete: (score: number) => void;
}

export interface SortedWords {
    [categoryId: string]: {
        id: string;
        text: string;
        category: string;
    }[];
}