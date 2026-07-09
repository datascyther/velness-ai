import { describe, it, expect } from 'vitest';
import { DEFAULT_PROGRAMS, DEFAULT_LESSONS } from '../programs';
import { CATEGORY_ID } from '../../constants';

describe('CBT Curriculum and Lesson Blueprint validation', () => {
  it('should have exactly 8 CBT programs', () => {
    const cbtPrograms = DEFAULT_PROGRAMS.filter(p => p.categoryId === CATEGORY_ID.CBT);
    expect(cbtPrograms.length).toBe(8);

    const programIds = cbtPrograms.map(p => p.id).sort();
    const expectedIds = [
      'understanding-thoughts',
      'challenging-negative-thinking',
      'managing-anxiety',
      'emotional-regulation',
      'building-confidence',
      'healthy-habits',
      'self-compassion',
      'resilience'
    ].sort();

    expect(programIds).toEqual(expectedIds);
  });

  it('should verify every CBT lesson has all blueprint fields populated', () => {
    const cbtPrograms = DEFAULT_PROGRAMS.filter(p => p.categoryId === CATEGORY_ID.CBT);
    const cbtProgramIds = new Set(cbtPrograms.map(p => p.id));

    const cbtLessons = DEFAULT_LESSONS.filter(l => cbtProgramIds.has(l.programId));

    // There should be exactly 5 lessons per CBT program, totaling 40 lessons
    expect(cbtLessons.length).toBe(40);

    for (const lesson of cbtLessons) {
      // 1. Learning Goal (learningObjective)
      expect(lesson.learningObjective).toBeDefined();
      expect(typeof lesson.learningObjective).toBe('string');
      expect(lesson.learningObjective?.trim().length).toBeGreaterThan(0);

      // 2. Estimated Time (duration)
      expect(lesson.duration).toBeDefined();
      expect(typeof lesson.duration).toBe('number');
      expect(lesson.duration).toBeGreaterThan(0);

      // 3. Preparation
      expect(lesson.preparation).toBeDefined();
      expect(typeof lesson.preparation).toBe('string');
      expect(lesson.preparation?.trim().length).toBeGreaterThan(0);

      // 4. Guided Exercise (introduction)
      expect(lesson.introduction).toBeDefined();
      expect(typeof lesson.introduction).toBe('string');
      expect(lesson.introduction?.trim().length).toBeGreaterThan(0);

      // 5. Reflection (reflectionPrompt)
      expect(lesson.reflectionPrompt).toBeDefined();
      expect(typeof lesson.reflectionPrompt).toBe('string');
      expect(lesson.reflectionPrompt?.trim().length).toBeGreaterThan(0);

      // 6. Takeaway
      expect(lesson.takeaway).toBeDefined();
      expect(typeof lesson.takeaway).toBe('string');
      expect(lesson.takeaway?.trim().length).toBeGreaterThan(0);

      // 7. Completion (completionSummary)
      expect(lesson.completionSummary).toBeDefined();
      expect(typeof lesson.completionSummary).toBe('string');
      expect(lesson.completionSummary?.trim().length).toBeGreaterThan(0);
    }
  });

  it('should verify all 15 building-confidence exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'building-confidence-l1-ex1',
      'building-confidence-l1-ex2',
      'building-confidence-l1-ex3',
      'building-confidence-l2-ex1',
      'building-confidence-l2-ex2',
      'building-confidence-l2-ex3',
      'building-confidence-l3-ex1',
      'building-confidence-l3-ex2',
      'building-confidence-l3-ex3',
      'building-confidence-l4-ex1',
      'building-confidence-l4-ex2',
      'building-confidence-l4-ex3',
      'building-confidence-l5-ex1',
      'building-confidence-l5-ex2',
      'building-confidence-l5-ex3',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });

  it('should verify all 13 understanding-thoughts exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'understanding-thoughts-l1-ex1',
      'understanding-thoughts-l1-ex2',
      'understanding-thoughts-l1-ex3',
      'understanding-thoughts-l2-ex1',
      'understanding-thoughts-l2-ex2',
      'understanding-thoughts-l2-ex3',
      'understanding-thoughts-l3-ex1',
      'understanding-thoughts-l3-ex2',
      'understanding-thoughts-l3-ex3',
      'understanding-thoughts-l4-ex1',
      'understanding-thoughts-l4-ex2',
      'understanding-thoughts-l4-ex3',
      'understanding-thoughts-l5-ex1',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });

  it('should verify all 25 managing-anxiety exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'managing-anxiety-l1-ex1',
      'managing-anxiety-l1-ex2',
      'managing-anxiety-l1-ex3',
      'managing-anxiety-l1-ex4',
      'managing-anxiety-l1-ex5',
      'managing-anxiety-l2-ex1',
      'managing-anxiety-l2-ex2',
      'managing-anxiety-l2-ex3',
      'managing-anxiety-l2-ex4',
      'managing-anxiety-l2-ex5',
      'managing-anxiety-l3-ex1',
      'managing-anxiety-l3-ex2',
      'managing-anxiety-l3-ex3',
      'managing-anxiety-l3-ex4',
      'managing-anxiety-l3-ex5',
      'managing-anxiety-l4-ex1',
      'managing-anxiety-l4-ex2',
      'managing-anxiety-l4-ex3',
      'managing-anxiety-l4-ex4',
      'managing-anxiety-l4-ex5',
      'managing-anxiety-l5-ex1',
      'managing-anxiety-l5-ex2',
      'managing-anxiety-l5-ex3',
      'managing-anxiety-l5-ex4',
      'managing-anxiety-l5-ex5',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });

  it('should verify all 5 emotional-regulation exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'emotional-regulation-l1-ex1',
      'emotional-regulation-l2-ex1',
      'emotional-regulation-l3-ex1',
      'emotional-regulation-l4-ex1',
      'emotional-regulation-l5-ex1',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });

  it('should verify all 5 healthy-habits exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'healthy-habits-l1-ex1',
      'healthy-habits-l2-ex1',
      'healthy-habits-l3-ex1',
      'healthy-habits-l4-ex1',
      'healthy-habits-l5-ex1',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });

  it('should verify all 5 challenging-negative-thinking exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'challenging-negative-thinking-l1-ex1',
      'challenging-negative-thinking-l2-ex1',
      'challenging-negative-thinking-l3-ex1',
      'challenging-negative-thinking-l4-ex1',
      'challenging-negative-thinking-l5-ex1',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });

  it('should verify all 5 self-compassion exercises have guided steps config', async () => {
    const { GUIDED_STEPS_CONFIG } = await import('../guidedSteps');
    const expectedExerciseIds = [
      'self-compassion-l1-ex1',
      'self-compassion-l2-ex1',
      'self-compassion-l3-ex1',
      'self-compassion-l4-ex1',
      'self-compassion-l5-ex1',
    ];

    for (const exId of expectedExerciseIds) {
      expect(GUIDED_STEPS_CONFIG[exId]).toBeDefined();
      expect(GUIDED_STEPS_CONFIG[exId].length).toBeGreaterThan(0);
    }
  });
});
