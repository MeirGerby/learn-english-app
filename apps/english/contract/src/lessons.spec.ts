import { describe, expect, it } from 'vitest';
import {
  isLessonUnlocked,
  LESSON_IDS,
  LESSONS,
  matchesReply,
  speechScore,
} from './lessons.js';

describe('lesson content', () => {
  it('has one lesson per id, in the course order', () => {
    expect(LESSONS.map((lesson) => lesson.id)).toEqual([...LESSON_IDS]);
  });

  it('accepts every model answer and never repeats a choice', () => {
    for (const lesson of LESSONS) {
      for (const { answer, alsoAccepted } of lesson.replies) {
        expect(matchesReply(answer.en, [answer.en, ...alsoAccepted])).toBe(
          true,
        );
      }
      for (const { correct, wrong } of lesson.choices) {
        expect(new Set([correct, ...wrong]).size).toBe(3);
      }
    }
  });
});

describe('isLessonUnlocked', () => {
  const [first, second, third] = LESSON_IDS;

  it('opens the first lesson to everyone', () => {
    expect(isLessonUnlocked(first, [], false)).toBe(true);
  });

  it('opens a lesson only after the one before it', () => {
    expect(isLessonUnlocked(second, [], false)).toBe(false);
    expect(isLessonUnlocked(second, [first], false)).toBe(true);
    expect(isLessonUnlocked(third, [first], false)).toBe(false);
  });

  it('opens every lesson to the admin', () => {
    expect(isLessonUnlocked(third, [], true)).toBe(true);
  });
});

describe('matchesReply', () => {
  it('ignores case, punctuation, contractions and curly apostrophes', () => {
    expect(matchesReply('i am from israel', ["I'm from Israel."])).toBe(true);
    expect(matchesReply('I’m from Israel!', ["I'm from Israel."])).toBe(true);
    expect(
      matchesReply('sorry I can not today', ["Sorry, I can't today."]),
    ).toBe(true);
  });

  it('rejects a different or reordered sentence', () => {
    expect(matchesReply('from I am Israel', ["I'm from Israel."])).toBe(false);
    expect(matchesReply('', ["I'm from Israel."])).toBe(false);
  });
});

describe('speechScore', () => {
  it('is 1 for the same words and 0 for silence', () => {
    expect(speechScore('nice to meet you', 'Nice to meet you.')).toBe(1);
    expect(speechScore('', 'Nice to meet you.')).toBe(0);
  });

  it('allows one missed word in a short sentence', () => {
    expect(speechScore('nice meet you', 'Nice to meet you.')).toBe(0.75);
  });

  it('scores another sentence and a long ramble low', () => {
    expect(speechScore('where are you from', 'Nice to meet you.')).toBeLessThan(
      0.7,
    );
    expect(
      speechScore(
        'well I think it is nice to meet you all here today',
        'Nice to meet you.',
      ),
    ).toBeLessThan(0.7);
  });
});
