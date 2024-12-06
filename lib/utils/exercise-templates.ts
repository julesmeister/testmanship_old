type ExerciseType = 
  | 'conjugation-tables'
  | 'dialogue-completion'
  | 'drag-and-drop'
  | 'fill-in-the-blanks'
  | 'gap-fill'
  | 'matching'
  | 'multiple-choice'
  | 'question-formation'
  | 'role-playing'
  | 'sentence-correction'
  | 'sentence-reordering'
  | 'sentence-splitting'
  | 'sentence-transformation'
  | 'word-building'
  | 'word-sorting';

const interfaceStructures = {
  'conjugation-tables': {
    exercise_type: 'conjugation-tables',
    verb: '',
    tense: '',
    pronouns: [],
    conjugations: []
  },
  'dialogue-completion': {
    exercise_type: 'dialogue-completion',
    context: '',
    dialogue: [{
      speaker: '',
      text: '',
      isResponse: false,
      expectedResponse: '',
      hint: ''
    }]
  },
  'drag-and-drop': {
    exercise_type: 'drag-and-drop',
    items: [{
      id: '',
      content: '',
      correctTarget: ''
    }],
    targets: [{
      id: '',
      label: ''
    }],
    instruction: ''
  },
  'fill-in-the-blanks': {
    exercise_type: 'fill-in-the-blanks',
    sentence: '',
    blanks: [{
      word: '',
      position: 0
    }]
  },
  'matching': {
    exercise_type: 'matching',
    pairs: [{
      left: '',
      right: ''
    }]
  },
  'multiple-choice': {
    exercise_type: 'multiple-choice',
    questions: [{
      text: '',
      options: [],
      correctAnswer: 0,
      explanation: ''
    }]
  },
  'question-formation': {
    exercise_type: 'question-formation',
    statements: [{
      text: '',
      expectedQuestion: '',
      hint: ''
    }]
  },
  'role-playing': {
    exercise_type: 'role-playing',
    scenario: '',
    context: '',
    roles: [{
      id: '',
      name: '',
      description: '',
      prompts: [{
        id: '',
        text: '',
        expectedResponse: '',
        alternatives: [],
        hint: ''
      }]
    }]
  },
  'sentence-correction': {
    exercise_type: 'sentence-correction',
    sentences: [{
      id: '',
      text: '',
      correction: '',
      hint: '',
      explanation: '',
      focus: ''
    }]
  },
  'sentence-reordering': {
    exercise_type: 'sentence-reordering',
    sentences: [{
      id: '',
      segments: [{
        id: '',
        text: '',
        position: 0
      }],
      hint: ''
    }]
  },
  'sentence-splitting': {
    exercise_type: 'sentence-splitting',
    sentences: [{
      id: '',
      text: '',
      expectedSplits: [],
      hint: ''
    }]
  },
  'sentence-transformation': {
    exercise_type: 'sentence-transformation',
    sentences: [{
      original: '',
      transformation: '',
      expectedResult: '',
      hint: ''
    }]
  },
  'word-building': {
    exercise_type: 'word-building',
    words: [{
      id: '',
      root: '',
      prefix: '',
      suffix: '',
      target: '',
      type: '',
      hint: '',
      explanation: ''
    }]
  },
  'word-sorting': {
    exercise_type: 'word-sorting',
    categories: [{
      id: '',
      name: '',
      description: ''
    }],
    words: [{
      id: '',
      text: '',
      category: ''
    }]
  }
} as const;

export const getExerciseTypes = (): ExerciseType[] => {
  return Object.keys(interfaceStructures) as ExerciseType[];
};

export const getExerciseTemplate = (type: ExerciseType) => {
  return interfaceStructures[type]
};
