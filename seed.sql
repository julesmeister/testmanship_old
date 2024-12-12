-- Insert initial exercises
INSERT INTO public.exercises (
    topic,
    description,
    exercise_types,
    grammar_category,
    order_index
) VALUES 
    (
        'Conjugate verbs (regular and irregular)',
        'Learn how to conjugate both regular and irregular verbs in the present tense.',
        ARRAY['fill-in-the-blanks', 'matching', 'conjugation-tables']::exercise_type[],
        'Verb Conjugation',
        1
    ),
    (
        'W-Questions (Wer, Was, Wo, etc.)',
        'Understand and form open-ended questions using interrogatives.',
        ARRAY['question-formation', 'dialogue-sorting', 'multiple-choice']::exercise_type[],
        'Question Formation',
        2
    ),
    (
        'Yes/No Questions',
        'Practice forming and answering yes/no questions.',
        ARRAY['multiple-choice', 'sentence-transformation', 'dialogue-sorting']::exercise_type[],
        'Question Formation',
        3
    ),
    (
        'Definite Articles (der, die, das)',
        'Learn the correct usage of definite articles with nouns.',
        ARRAY['matching', 'fill-in-the-blanks', 'drag-and-drop']::exercise_type[],
        'Articles',
        4
    ),
    (
        'Indefinite Articles (ein, eine)',
        'Learn how to use indefinite articles with nouns.',
        ARRAY['fill-in-the-blanks', 'multiple-choice', 'gap-fill']::exercise_type[],
        'Articles',
        5
    ),
    (
        'Negative Article (kein, keine)',
        'Practice negating sentences using the correct form of ''kein''.',
        ARRAY['sentence-transformation', 'gap-fill', 'dialogue-sorting']::exercise_type[],
        'Articles',
        6
    ),
    (
        'Plural Forms of Nouns',
        'Learn the plural forms of common German nouns.',
        ARRAY['drag-and-drop', 'matching', 'word-sorting']::exercise_type[],
        'Nouns',
        7
    ),
    (
        'Verb Position in Sentences',
        'Understand the correct placement of verbs in main and subordinate clauses.',
        ARRAY['sentence-reordering', 'fill-in-the-blanks', 'sentence-transformation']::exercise_type[],
        'Sentence Structure',
        8
    ),
    (
        'Accusative Case',
        'Learn to use the accusative case with articles and direct objects.',
        ARRAY['gap-fill', 'multiple-choice', 'fill-in-the-blanks']::exercise_type[],
        'Cases',
        9
    ),
    (
        'Modal Verbs: ''können'' (can)',
        'Practice the conjugation and usage of ''können'' to express ability.',
        ARRAY['dialogue-sorting', 'sentence-transformation', 'conjugation-tables']::exercise_type[],
        'Modal Verbs',
        10
    ),
    (
        'Modal Verbs: ''mögen'' (like) and ''möchten'' (would like)',
        'Learn how to use ''mögen'' and ''möchten'' to express preferences and wishes.',
        ARRAY['dialogue-sorting', 'gap-fill', 'multiple-choice']::exercise_type[],
        'Modal Verbs',
        11
    ),
    (
        'Verbs with Vowel Change (e.g., fahren, sehen)',
        'Understand and practice verbs that change their stem vowels in conjugation.',
        ARRAY['conjugation-tables', 'fill-in-the-blanks', 'matching']::exercise_type[],
        'Verb Conjugation',
        12
    ),
    (
        'Separable Verbs (e.g., aufstehen, anrufen)',
        'Learn how separable verbs are used in sentences and conjugated.',
        ARRAY['sentence-splitting', 'matching', 'gap-fill']::exercise_type[],
        'Verb Types',
        13
    ),
    (
        'Non-Separable Verbs (e.g., besuchen, verstehen)',
        'Practice using non-separable verbs correctly in sentences.',
        ARRAY['sentence-correction', 'fill-in-the-blanks', 'multiple-choice']::exercise_type[],
        'Verb Types',
        14
    ),
    (
        'Sentence Bracket (e.g., modal verbs with infinitives)',
        'Learn how modal verbs create a sentence bracket with the infinitive at the end.',
        ARRAY['fill-in-the-blanks', 'gap-fill', 'dialogue-sorting']::exercise_type[],
        'Sentence Structure',
        15
    ),
    (
        'Temporal Prepositions (e.g., am, im, um)',
        'Understand how to use prepositions to express time.',
        ARRAY['multiple-choice', 'matching', 'fill-in-the-blanks']::exercise_type[],
        'Prepositions',
        16
    ),
    (
        'Compound Nouns (e.g., Haus + Tür = Haustür)',
        'Learn how to form and understand compound nouns.',
        ARRAY['word-building', 'matching', 'drag-and-drop']::exercise_type[],
        'Nouns',
        17
    ),
    (
        'Perfect Tense with ''haben''',
        'Practice forming sentences in the perfect tense with ''haben''.',
        ARRAY['sentence-transformation', 'fill-in-the-blanks', 'dialogue-sorting']::exercise_type[],
        'Perfect Tense',
        18
    ),
    (
        'Perfect Tense with ''sein''',
        'Learn when and how to use ''sein'' to form the perfect tense.',
        ARRAY['gap-fill', 'multiple-choice', 'dialogue-sorting']::exercise_type[],
        'Perfect Tense',
        19
    ),
    (
        'Perfect Tense with ''haben'' and ''sein''',
        'Understand the distinction between ''haben'' and ''sein'' in perfect tense usage.',
        ARRAY['dialogue-sorting', 'gap-fill', 'sentence-transformation']::exercise_type[],
        'Perfect Tense',
        20
    );
