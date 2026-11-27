// The conversation course. Each lesson continues the same conversation one
// step further, and a lesson opens when the one before it is finished.
// DRAFT: the texts are waiting for the teacher's review.

export const LESSON_IDS = [
  'start-a-conversation',
  'get-to-know',
  'keep-it-going',
  'make-plans',
  'say-goodbye',
] as const;

export type LessonId = (typeof LESSON_IDS)[number];

// A line of English with its Hebrew meaning.
export interface Line {
  en: string;
  he: string;
}

export interface DialogueLine extends Line {
  speaker: 'Maya' | 'Daniel';
}

// The other person says `prompt`; the student picks the fitting answer.
export interface ChoiceExercise {
  prompt: Line;
  correct: string;
  wrong: [string, string];
}

// The student writes or builds, in English, what `answer.he` says. `answer.en`
// is the model sentence; `alsoAccepted` lists other right ways to say it.
export interface ReplyExercise {
  prompt: Line;
  answer: Line;
  alsoAccepted: string[];
}

export interface Lesson {
  id: LessonId;
  title: string;
  goal: string;
  phrases: Line[];
  dialogue: DialogueLine[];
  choices: ChoiceExercise[];
  replies: ReplyExercise[];
  speak: Line[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'start-a-conversation',
    title: 'איך מתחילים שיחה',
    goal: 'לומר שלום, להציג את עצמכם ולשאול לשלום האדם שמולכם.',
    phrases: [
      { en: 'Hi, how are you?', he: 'היי, מה שלומך?' },
      { en: "I'm fine, thank you.", he: 'אני בסדר, תודה.' },
      { en: 'My name is Maya.', he: 'קוראים לי מאיה.' },
      { en: "What's your name?", he: 'איך קוראים לך?' },
      { en: 'Nice to meet you.', he: 'נעים להכיר.' },
    ],
    dialogue: [
      { speaker: 'Maya', en: 'Hi, how are you?', he: 'היי, מה שלומך?' },
      {
        speaker: 'Daniel',
        en: "I'm fine, thank you. And you?",
        he: 'אני בסדר, תודה. ומה איתך?',
      },
      {
        speaker: 'Maya',
        en: "I'm great. My name is Maya.",
        he: 'מצוין. קוראים לי מאיה.',
      },
      {
        speaker: 'Daniel',
        en: "I'm Daniel. Nice to meet you.",
        he: 'אני דניאל. נעים להכיר.',
      },
      {
        speaker: 'Maya',
        en: 'Nice to meet you too.',
        he: 'נעים להכיר גם אותך.',
      },
    ],
    choices: [
      {
        prompt: { en: 'Hi, how are you?', he: 'היי, מה שלומך?' },
        correct: "I'm fine, thank you.",
        wrong: ['My name is blue.', 'Yes, I do.'],
      },
      {
        prompt: { en: "What's your name?", he: 'איך קוראים לך?' },
        correct: 'My name is Maya.',
        wrong: ["I'm ten o'clock.", "You're welcome."],
      },
      {
        prompt: { en: 'Nice to meet you.', he: 'נעים להכיר.' },
        correct: 'Nice to meet you too.',
        wrong: ['No, thank you.', 'See you yesterday.'],
      },
    ],
    replies: [
      {
        prompt: { en: 'Hello!', he: 'שלום!' },
        answer: { en: 'Hi, how are you?', he: 'היי, מה שלומך?' },
        alsoAccepted: ['Hello, how are you?'],
      },
      {
        prompt: { en: "What's your name?", he: 'איך קוראים לך?' },
        answer: { en: 'My name is Dana.', he: 'קוראים לי דנה.' },
        alsoAccepted: ["I'm Dana."],
      },
      {
        prompt: { en: "I'm Daniel.", he: 'אני דניאל.' },
        answer: { en: 'Nice to meet you.', he: 'נעים להכיר.' },
        alsoAccepted: ["It's nice to meet you."],
      },
    ],
    speak: [
      { en: 'Hi, how are you?', he: 'היי, מה שלומך?' },
      { en: "I'm fine, thank you.", he: 'אני בסדר, תודה.' },
      { en: 'Nice to meet you.', he: 'נעים להכיר.' },
    ],
  },
  {
    id: 'get-to-know',
    title: 'ממשיכים להכיר',
    goal: 'לשאול מאיפה מישהו, איפה הוא גר ומה הוא עושה, ולענות על כך.',
    phrases: [
      { en: 'Where are you from?', he: 'מאיפה את/ה?' },
      { en: "I'm from Israel.", he: 'אני מישראל.' },
      { en: 'Where do you live?', he: 'איפה את/ה גר/ה?' },
      { en: 'What do you do?', he: 'במה את/ה עוסק/ת?' },
      { en: "I'm a student.", he: 'אני תלמיד/ה.' },
    ],
    dialogue: [
      {
        speaker: 'Daniel',
        en: 'So, where are you from, Maya?',
        he: 'אז מאיפה את, מאיה?',
      },
      {
        speaker: 'Maya',
        en: "I'm from Israel. And you?",
        he: 'אני מישראל. ואתה?',
      },
      {
        speaker: 'Daniel',
        en: "I'm from Canada, but I live here now.",
        he: 'אני מקנדה, אבל עכשיו אני גר כאן.',
      },
      {
        speaker: 'Maya',
        en: 'Really? Where do you live?',
        he: 'באמת? איפה אתה גר?',
      },
      {
        speaker: 'Daniel',
        en: 'I live near the park. What do you do?',
        he: 'אני גר ליד הפארק. במה את עוסקת?',
      },
      { speaker: 'Maya', en: "I'm a student.", he: 'אני תלמידה.' },
    ],
    choices: [
      {
        prompt: { en: 'Where are you from?', he: 'מאיפה את/ה?' },
        correct: "I'm from Israel.",
        wrong: ["I'm a student.", "It's Monday."],
      },
      {
        prompt: { en: 'What do you do?', he: 'במה את/ה עוסק/ת?' },
        correct: "I'm a student.",
        wrong: ["I'm from Canada.", 'Yes, please.'],
      },
      {
        prompt: { en: 'I live near the park.', he: 'אני גר/ה ליד הפארק.' },
        correct: "Oh, that's a nice place.",
        wrong: ['Nice to eat you.', 'My name is park.'],
      },
    ],
    replies: [
      {
        prompt: { en: "I'm from Canada.", he: 'אני מקנדה.' },
        answer: { en: "I'm from Israel.", he: 'אני מישראל.' },
        alsoAccepted: ['I come from Israel.'],
      },
      {
        prompt: { en: 'I live here now.', he: 'עכשיו אני גר/ה כאן.' },
        answer: { en: 'Where do you live?', he: 'איפה את/ה גר/ה?' },
        alsoAccepted: ['Really? Where do you live?'],
      },
      {
        prompt: { en: 'What do you do?', he: 'במה את/ה עוסק/ת?' },
        answer: { en: "I'm a teacher.", he: 'אני מורה.' },
        alsoAccepted: ['I work as a teacher.'],
      },
    ],
    speak: [
      { en: 'Where are you from?', he: 'מאיפה את/ה?' },
      { en: 'Where do you live?', he: 'איפה את/ה גר/ה?' },
      { en: "I'm a student.", he: 'אני תלמיד/ה.' },
    ],
  },
  {
    id: 'keep-it-going',
    title: 'שומרים על השיחה',
    goal: 'לדבר על תחביבים, להגיב בעניין ולשאול שאלות המשך.',
    phrases: [
      {
        en: 'What do you like to do?',
        he: 'מה את/ה אוהב/ת לעשות?',
      },
      { en: 'I really like music.', he: 'אני מאוד אוהב/ת מוזיקה.' },
      { en: "That's cool!", he: 'זה מגניב!' },
      { en: 'Tell me more.', he: 'ספר/י לי עוד.' },
      { en: 'What about you?', he: 'ומה איתך?' },
    ],
    dialogue: [
      {
        speaker: 'Maya',
        en: 'What do you like to do after work?',
        he: 'מה אתה אוהב לעשות אחרי העבודה?',
      },
      {
        speaker: 'Daniel',
        en: 'I play the guitar. What about you?',
        he: 'אני מנגן בגיטרה. ומה איתך?',
      },
      {
        speaker: 'Maya',
        en: "That's cool! I really like music too.",
        he: 'זה מגניב! גם אני מאוד אוהבת מוזיקה.',
      },
      {
        speaker: 'Daniel',
        en: 'What kind of music do you like?',
        he: 'איזו מוזיקה את אוהבת?',
      },
      {
        speaker: 'Maya',
        en: 'I like pop music. How long have you played?',
        he: 'אני אוהבת פופ. כמה זמן אתה מנגן?',
      },
      {
        speaker: 'Daniel',
        en: 'For about three years.',
        he: 'בערך שלוש שנים.',
      },
    ],
    choices: [
      {
        prompt: { en: 'I play the guitar.', he: 'אני מנגן/ת בגיטרה.' },
        correct: "That's cool! Tell me more.",
        wrong: ["I'm from Israel.", 'Goodbye.'],
      },
      {
        prompt: {
          en: 'What kind of music do you like?',
          he: 'איזו מוזיקה את/ה אוהב/ת?',
        },
        correct: 'I like pop music.',
        wrong: ['I like it three years.', 'Yes, I am.'],
      },
      {
        prompt: {
          en: 'I like to cook. What about you?',
          he: 'אני אוהב/ת לבשל. ומה איתך?',
        },
        correct: 'I like to read books.',
        wrong: ["You're welcome.", "It's near the park."],
      },
    ],
    replies: [
      {
        prompt: { en: 'I love sports.', he: 'אני מת/ה על ספורט.' },
        answer: { en: "That's cool!", he: 'זה מגניב!' },
        alsoAccepted: ["That's great!", "That's nice!"],
      },
      {
        prompt: { en: 'I like to travel.', he: 'אני אוהב/ת לטייל.' },
        answer: { en: 'Tell me more.', he: 'ספר/י לי עוד.' },
        alsoAccepted: ['Tell me more about it.'],
      },
      {
        prompt: { en: 'I like to read.', he: 'אני אוהב/ת לקרוא.' },
        answer: {
          en: 'What do you like to read?',
          he: 'מה את/ה אוהב/ת לקרוא?',
        },
        alsoAccepted: [],
      },
    ],
    speak: [
      { en: 'What do you like to do?', he: 'מה את/ה אוהב/ת לעשות?' },
      { en: 'I really like music.', he: 'אני מאוד אוהב/ת מוזיקה.' },
      { en: "That's cool, tell me more.", he: 'זה מגניב, ספר/י לי עוד.' },
    ],
  },
  {
    id: 'make-plans',
    title: 'קובעים להיפגש',
    goal: 'להציע לעשות משהו יחד, לקבוע יום ושעה, ולהסכים או לסרב בנימוס.',
    phrases: [
      {
        en: 'Would you like to get coffee?',
        he: 'בא לך לשתות קפה?',
      },
      { en: "Sure, I'd love to.", he: 'בטח, אשמח.' },
      { en: "Sorry, I can't.", he: 'סליחה, אני לא יכול/ה.' },
      { en: 'Are you free on Friday?', he: 'את/ה פנוי/ה ביום שישי?' },
      { en: 'What time?', he: 'באיזו שעה?' },
    ],
    dialogue: [
      {
        speaker: 'Daniel',
        en: 'I am playing at a cafe this week. Would you like to come?',
        he: 'אני מנגן השבוע בבית קפה. בא לך לבוא?',
      },
      {
        speaker: 'Maya',
        en: "Sure, I'd love to. When?",
        he: 'בטח, אשמח. מתי?',
      },
      {
        speaker: 'Daniel',
        en: 'Are you free on Thursday?',
        he: 'את פנויה ביום חמישי?',
      },
      {
        speaker: 'Maya',
        en: "Sorry, I can't on Thursday. How about Friday?",
        he: 'סליחה, ביום חמישי אני לא יכולה. מה עם שישי?',
      },
      {
        speaker: 'Daniel',
        en: 'Friday works. What time is good for you?',
        he: 'שישי מתאים. איזו שעה נוחה לך?',
      },
      { speaker: 'Maya', en: "Let's meet at seven.", he: 'בוא ניפגש בשבע.' },
    ],
    choices: [
      {
        prompt: { en: 'Would you like to get coffee?', he: 'בא לך קפה?' },
        correct: "Sure, I'd love to.",
        wrong: ['I am coffee.', 'For three years.'],
      },
      {
        prompt: {
          en: 'Are you free on Thursday?',
          he: 'את/ה פנוי/ה ביום חמישי?',
        },
        correct: "Sorry, I can't. How about Friday?",
        wrong: ["I'm free from Israel.", 'Nice to meet you.'],
      },
      {
        prompt: { en: 'What time is good for you?', he: 'איזו שעה נוחה לך?' },
        correct: "Let's meet at seven.",
        wrong: ['On the table.', "I'm fine, thank you."],
      },
    ],
    replies: [
      {
        prompt: {
          en: 'Would you like to see a movie?',
          he: 'בא לך לראות סרט?',
        },
        answer: { en: "Sure, I'd love to.", he: 'בטח, אשמח.' },
        alsoAccepted: ["Yes, I'd love to."],
      },
      {
        prompt: { en: "Let's meet today.", he: 'בוא/י ניפגש היום.' },
        answer: {
          en: "Sorry, I can't today.",
          he: 'סליחה, היום אני לא יכול/ה.',
        },
        alsoAccepted: ["I'm sorry, I can't today."],
      },
      {
        prompt: { en: 'I am free this week.', he: 'אני פנוי/ה השבוע.' },
        answer: {
          en: 'Are you free on Friday?',
          he: 'את/ה פנוי/ה ביום שישי?',
        },
        alsoAccepted: [],
      },
    ],
    speak: [
      { en: 'Would you like to get coffee?', he: 'בא לך לשתות קפה?' },
      { en: 'Are you free on Friday?', he: 'את/ה פנוי/ה ביום שישי?' },
      { en: "Sure, I'd love to.", he: 'בטח, אשמח.' },
    ],
  },
  {
    id: 'say-goodbye',
    title: 'מסיימים שיחה בנימוס',
    goal: 'להודיע שצריך ללכת, לסכם את מה שקבעתם ולהיפרד.',
    phrases: [
      { en: 'I have to go now.', he: 'אני חייב/ת ללכת עכשיו.' },
      { en: 'It was nice talking to you.', he: 'היה נעים לדבר איתך.' },
      { en: 'See you on Friday.', he: 'נתראה ביום שישי.' },
      { en: 'Have a good day!', he: 'שיהיה לך יום טוב!' },
      { en: 'Take care.', he: 'תשמור/י על עצמך.' },
    ],
    dialogue: [
      {
        speaker: 'Maya',
        en: 'Oh, it is late. I have to go now.',
        he: 'אוי, מאוחר. אני חייבת ללכת עכשיו.',
      },
      {
        speaker: 'Daniel',
        en: 'No problem. It was nice talking to you.',
        he: 'אין בעיה. היה נעים לדבר איתך.',
      },
      {
        speaker: 'Maya',
        en: 'You too. So, Friday at seven?',
        he: 'גם איתך. אז שישי בשבע?',
      },
      {
        speaker: 'Daniel',
        en: 'Yes, see you on Friday.',
        he: 'כן, נתראה ביום שישי.',
      },
      { speaker: 'Maya', en: 'Have a good day!', he: 'שיהיה לך יום טוב!' },
      {
        speaker: 'Daniel',
        en: 'You too. Take care.',
        he: 'גם לך. תשמרי על עצמך.',
      },
    ],
    choices: [
      {
        prompt: { en: 'I have to go now.', he: 'אני חייב/ת ללכת עכשיו.' },
        correct: 'No problem. It was nice talking to you.',
        wrong: ["What's your name?", 'I like to go music.'],
      },
      {
        prompt: { en: 'Have a good day!', he: 'שיהיה לך יום טוב!' },
        correct: 'You too.',
        wrong: ["Yes, it's a day.", 'Where are you from?'],
      },
      {
        prompt: { en: 'See you on Friday.', he: 'נתראה ביום שישי.' },
        correct: 'See you!',
        wrong: ["I'm a student.", 'At the park, three years.'],
      },
    ],
    replies: [
      {
        prompt: { en: "Let's talk more.", he: 'בוא/י נדבר עוד.' },
        answer: { en: 'I have to go now.', he: 'אני חייב/ת ללכת עכשיו.' },
        alsoAccepted: ['I need to go now.'],
      },
      {
        prompt: { en: 'I have to go.', he: 'אני צריך/ה ללכת.' },
        answer: {
          en: 'It was nice talking to you.',
          he: 'היה נעים לדבר איתך.',
        },
        alsoAccepted: ['It was nice to talk to you.'],
      },
      {
        prompt: { en: 'Bye!', he: 'ביי!' },
        answer: { en: 'See you on Friday.', he: 'נתראה ביום שישי.' },
        alsoAccepted: ['See you Friday.'],
      },
    ],
    speak: [
      { en: 'I have to go now.', he: 'אני חייב/ת ללכת עכשיו.' },
      { en: 'It was nice talking to you.', he: 'היה נעים לדבר איתך.' },
      { en: 'See you on Friday.', he: 'נתראה ביום שישי.' },
    ],
  },
];

// A lesson is open when the one before it is finished. A finished lesson
// stays open, and the teacher (admin) can open any lesson to review it.
export function isLessonUnlocked(
  lessonId: LessonId,
  completed: readonly string[],
  isAdmin: boolean,
): boolean {
  const index = LESSON_IDS.indexOf(lessonId);
  const previous = LESSON_IDS[index - 1];

  return (
    isAdmin ||
    previous === undefined ||
    completed.includes(previous) ||
    completed.includes(lessonId)
  );
}

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(it|that|what|where|he|she|there|how)'s\b/g, '$1 is'],
  [/\blet's\b/g, 'let us'],
  [/\b(i|you|we|they)'d\b/g, '$1 would'],
  [/\b(i|you|we|they)'ll\b/g, '$1 will'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\bcan't\b/g, 'cannot'],
  [/\b(do|does|is|are)n't\b/g, '$1 not'],
];

// The words of a sentence, ignoring case, punctuation and the difference
// between "I'm" and "I am". A phone keyboard types a curly apostrophe.
export function toWords(sentence: string): string[] {
  const expanded = CONTRACTIONS.reduce(
    (text, [pattern, full]) => text.replace(pattern, full),
    sentence.toLowerCase().replace(/[‘’]/g, "'"),
  );

  return expanded
    .replace(/\bcan not\b/g, 'cannot')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function matchesReply(input: string, accepted: string[]): boolean {
  const typed = toWords(input).join(' ');

  return accepted.some((sentence) => toWords(sentence).join(' ') === typed);
}

// How much of the expected sentence was heard, in order, from 0 to 1. Speech
// recognition drops or adds a word easily, so this is not an exact match.
export function speechScore(heard: string, expected: string): number {
  const said = toWords(heard);
  const wanted = toWords(expected);
  if (wanted.length === 0) return 0;

  // Longest common subsequence, one row at a time.
  let row = Array.from({ length: said.length + 1 }, () => 0);

  for (const word of wanted) {
    const next = [0];
    said.forEach((spoken, i) => {
      next.push(
        spoken === word ? row[i]! + 1 : Math.max(next[i]!, row[i + 1]!),
      );
    });
    row = next;
  }

  // Extra words lower the score too, so a long ramble does not pass.
  return row[said.length]! / Math.max(wanted.length, said.length);
}
