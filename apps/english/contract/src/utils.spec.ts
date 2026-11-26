import { describe, expect, it } from 'vitest';
import { pickDistractors, pickRoundWithDistinctTranslations } from './utils.js';
import { scoreToBand } from './placement.js';

const word = (name: string, translation: string) => ({
  word: name,
  translation,
  example: `${name} example`,
});

describe('scoreToBand', () => {
  it('maps the overall accuracy to a band', () => {
    expect(scoreToBand(0, 0)).toBe(1);
    expect(scoreToBand(9, 24)).toBe(1);
    expect(scoreToBand(10, 24)).toBe(2);
    expect(scoreToBand(18, 24)).toBe(3);
  });
});

describe('pickDistractors', () => {
  it('never repeats the translation of the correct answer when it can avoid it', () => {
    const correct = word('big', 'גדול');
    const pool = [
      correct,
      word('large', 'גדול'),
      word('cat', 'חתול'),
      word('dog', 'כלב'),
      word('sun', 'שמש'),
    ];

    const picked = pickDistractors(pool, correct, 3);

    expect(picked).toHaveLength(3);
    expect(picked.map((entry) => entry.translation)).not.toContain('גדול');
  });

  it('falls back to a repeated translation when the pool is too thin', () => {
    const correct = word('big', 'גדול');
    const pool = [correct, word('large', 'גדול'), word('huge', 'גדול')];

    expect(pickDistractors(pool, correct, 2)).toHaveLength(2);
  });
});

describe('pickRoundWithDistinctTranslations', () => {
  it('picks words whose translations differ', () => {
    const pool = [
      word('big', 'גדול'),
      word('large', 'גדול'),
      word('cat', 'חתול'),
      word('dog', 'כלב'),
    ];

    const translations = pickRoundWithDistinctTranslations(pool, 3).map(
      (entry) => entry.translation,
    );

    expect(new Set(translations).size).toBe(3);
  });
});
