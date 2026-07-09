import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet, Animated as RNAnimated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Play, Pause, RotateCcw, Check, Sparkles, BookOpen, Clock, Heart, Award } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/shared/hooks/useAuth';
import { useJourney } from '@/shared/hooks/useJourney';
import { useQueryClient } from '@tanstack/react-query';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { spacing, borderRadius } from '@/core/theme';
import { EXERCISE_TYPE } from '@/features/journey/constants';
import type { ExerciseWithProgress } from '@/features/journey/models';
import { GuidedExerciseEngine } from '../components/GuidedExerciseEngine';
import { GUIDED_STEPS_CONFIG } from '../data/guidedSteps';
import { JourneyNavigationGuard } from '../services/JourneyNavigationGuard';
import { DEFAULT_LESSONS } from '@/features/journey/data/programs';
import { analyticsService } from '@/services/analytics';

type LifecycleStage = 'introduction' | 'preparation' | 'exercise' | 'pause' | 'completion' | 'reflection' | 'saving';

// ─── Child Component: Meditation Timer ─────────────────────────────────
function MeditationTimer({ 
  estimatedTime, 
  isRunning, 
  onComplete 
}: { 
  estimatedTime: number; 
  isRunning: boolean; 
  onComplete: () => void; 
}) {
  const { colors } = useTheme();
  const totalSeconds = estimatedTime * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <View style={styles.timerCircle}>
      <View style={[styles.timerCircleBg, { borderColor: colors.brand.primary }]}>
        <Text style={[styles.timerText, { color: colors.text.primary }]}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
        <Text style={[styles.timerLabel, { color: colors.text.secondary }]}>remaining</Text>
      </View>
    </View>
  );
}

// ─── Child Component: Breathing Guide ──────────────────────────────────
function BreathingGuide({ 
  exercise, 
  isRunning, 
  onComplete 
}: { 
  exercise: ExerciseWithProgress; 
  isRunning: boolean; 
  onComplete: () => void; 
}) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const [phaseText, setPhaseText] = useState('Inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const cycleRef = useRef(0);
  const mountedRef = useRef(true);

  const programId = exercise.lessonId ? exercise.lessonId.split('-l')[0] : '';
  const estimatedTime = exercise.estimatedTime || 5;

  const pattern = useMemo(() => {
    if (programId.includes('box-breathing')) {
      return { inhale: 4000, hold1: 4000, exhale: 4000, hold2: 4000, name: 'Box Breathing' };
    }
    if (programId.includes('4-7-8')) {
      return { inhale: 4000, hold1: 7000, exhale: 8000, hold2: 0, name: '4-7-8 Relax' };
    }
    if (programId.includes('focus-breathing')) {
      return { inhale: 2000, hold1: 0, exhale: 2000, hold2: 0, name: 'Alertness Breath' };
    }
    if (programId.includes('sleep-preparation')) {
      return { inhale: 6000, hold1: 0, exhale: 6000, hold2: 0, name: 'Unwinding Breath' };
    }
    // Default calm reset/stress relief: 5s in, 5s out
    return { inhale: 5000, hold1: 0, exhale: 5000, hold2: 0, name: 'Resonant Breath' };
  }, [programId]);

  const cycleDurationSec = (pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2) / 1000;
  const cycles = Math.max(1, Math.round((estimatedTime * 60) / cycleDurationSec));

  const runCycle = useCallback(() => {
    if (!mountedRef.current || !isRunning) return;
    setPhaseText('Inhale');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const phaseTimers: ReturnType<typeof setTimeout>[] = [];
    const animations: RNAnimated.CompositeAnimation[] = [];

    // Inhale animation
    animations.push(RNAnimated.timing(scaleAnim, { toValue: 1.4, duration: pattern.inhale, useNativeDriver: true }));
    
    // Hold animation (if hold1 > 0)
    if (pattern.hold1 > 0) {
      animations.push(RNAnimated.timing(scaleAnim, { toValue: 1.4, duration: pattern.hold1, useNativeDriver: true }));
    }
    
    // Exhale animation
    animations.push(RNAnimated.timing(scaleAnim, { toValue: 1.0, duration: pattern.exhale, useNativeDriver: true }));
    
    // Hold Empty animation (if hold2 > 0)
    if (pattern.hold2 > 0) {
      animations.push(RNAnimated.timing(scaleAnim, { toValue: 1.0, duration: pattern.hold2, useNativeDriver: true }));
    }

    RNAnimated.sequence(animations).start(({ finished }) => {
      if (!finished || !mountedRef.current || !isRunning) return;
      cycleRef.current += 1;
      setCycleCount(cycleRef.current);
      if (cycleRef.current >= cycles) {
        onComplete();
      } else {
        runCycle();
      }
    });

    let elapsed = pattern.inhale;
    
    if (pattern.hold1 > 0) {
      phaseTimers.push(setTimeout(() => {
        if (mountedRef.current && isRunning) {
          setPhaseText('Hold');
          Haptics.selectionAsync().catch(() => {});
        }
      }, elapsed));
      elapsed += pattern.hold1;
    }
    
    phaseTimers.push(setTimeout(() => {
      if (mountedRef.current && isRunning) {
        setPhaseText('Exhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    }, elapsed));
    elapsed += pattern.exhale;
    
    if (pattern.hold2 > 0) {
      phaseTimers.push(setTimeout(() => {
        if (mountedRef.current && isRunning) {
          setPhaseText('Hold Empty');
          Haptics.selectionAsync().catch(() => {});
        }
      }, elapsed));
    }

    return () => {
      phaseTimers.forEach(clearTimeout);
    };
  }, [cycles, scaleAnim, onComplete, isRunning, pattern]);

  useEffect(() => {
    mountedRef.current = true;
    if (isRunning) {
      runCycle();
    } else {
      scaleAnim.stopAnimation();
    }
    return () => {
      mountedRef.current = false;
      scaleAnim.stopAnimation();
    };
  }, [isRunning, runCycle, scaleAnim]);

  return (
    <View style={styles.breathingContainer} accessible={true} accessibilityLabel={`Breathing exercise animation for ${pattern.name}`} accessibilityHint={`Currently in ${phaseText} phase. Cycle ${cycleCount + 1} of ${cycles}`}>
      <RNAnimated.View
        style={[
          styles.breathingCircle,
          {
            backgroundColor: colors.brand.primary,
            opacity: 0.25,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />
      <View style={styles.breathingOverlay}>
        <Text style={[styles.breathingPhase, { color: colors.text.primary }]}>{phaseText}</Text>
        <Text style={[styles.breathingCycle, { color: colors.text.secondary }]}>
          Cycle {cycleCount + 1} of {cycles}
        </Text>
      </View>
    </View>
  );
}

// ─── Child Component: Journaling / CBT Form ─────────────────────────────
function JournalingForm({ 
  exercise, 
  onComplete 
}: { 
  exercise: ExerciseWithProgress; 
  onComplete: (reflection: string) => void; 
}) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const maxChars = 2000;

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.promptText, { color: colors.text.primary }]}>
        {exercise.goal || 'Type your reflection below:'}
      </Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary }]}
        multiline
        placeholder="Type here..."
        placeholderTextColor={colors.text.secondary}
        value={text}
        onChangeText={setText}
        maxLength={maxChars}
        textAlignVertical="top"
      />
      <Text style={[styles.charCount, { color: colors.text.secondary }]}>
        {text.length}/{maxChars}
      </Text>
      <Pressable
        style={[styles.saveButton, { backgroundColor: text.trim().length > 0 ? colors.brand.primary : colors.border.default }]}
        onPress={() => text.trim().length > 0 && onComplete(text)}
        disabled={text.trim().length === 0}
        accessibilityRole="button"
      >
        <Text style={[styles.saveButtonText, { color: text.trim().length > 0 ? colors.brand.contrastText : colors.text.secondary }]}>
          Complete Exercise
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Child Component: Gratitude Form ───────────────────────────────────
function GratitudeForm({ 
  exercise, 
  onComplete 
}: { 
  exercise: ExerciseWithProgress; 
  onComplete: (reflection: string) => void; 
}) {
  const { colors } = useTheme();
  const [items, setItems] = useState(['', '', '']);
  const [reflection, setReflection] = useState('');

  const allFilled = items.every(i => i.trim().length > 0);

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
  };

  const handleFinish = () => {
    if (!allFilled) return;
    const summaryText = `Grateful for:\n1. ${items[0]}\n2. ${items[1]}\n3. ${items[2]}\n\nReflection: ${reflection}`;
    onComplete(summaryText);
  };

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.promptText, { color: colors.text.primary }]}>
        What are three things you're grateful for today?
      </Text>
      {items.map((item, idx) => (
        <TextInput
          key={idx}
          style={[styles.gratitudeInput, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary }]}
          placeholder={`I'm grateful for...`}
          placeholderTextColor={colors.text.secondary}
          value={item}
          onChangeText={(v) => updateItem(idx, v)}
        />
      ))}
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary, marginTop: spacing.md }]}
        multiline
        placeholder="Reflect on why these matter to you..."
        placeholderTextColor={colors.text.secondary}
        value={reflection}
        onChangeText={setReflection}
        textAlignVertical="top"
      />
      <Pressable
        style={[styles.saveButton, { backgroundColor: allFilled ? colors.brand.primary : colors.border.default }]}
        onPress={handleFinish}
        disabled={!allFilled}
        accessibilityRole="button"
      >
        <Text style={[styles.saveButtonText, { color: allFilled ? colors.brand.contrastText : colors.text.secondary }]}>
          Complete
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Main Component: ExerciseScreen ────────────────────────────────────
export function ExerciseScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const { exerciseId, sessionId } = useLocalSearchParams<{ exerciseId?: string; sessionId?: string }>();
  const targetId = exerciseId || sessionId;
  const { exercises } = useJourney();
  const queryClient = useQueryClient();

  const exercise = useMemo(() => {
    return exercises.find((ex: ExerciseWithProgress) => ex.id === targetId) || null;
  }, [exercises, targetId]);

  const lesson = useMemo(() => {
    if (!exercise) return null;
    return DEFAULT_LESSONS.find((l) => l.id === exercise.lessonId) || null;
  }, [exercise]);

  // Lifecycle stage state
  const [stage, setStage] = useState<LifecycleStage>('introduction');
  const [prepSeconds, setPrepSeconds] = useState(5);
  const [reflectionText, setReflectionText] = useState('');
  const [savedReflection, setSavedReflection] = useState('');

  // ─── Stage Transitions (Sprint 4.10) ──────────────────────────────────
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const translateYAnim = useRef(new RNAnimated.Value(0)).current;

  const transitionToStage = useCallback((newStage: LifecycleStage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      RNAnimated.timing(translateYAnim, { toValue: 10, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStage(newStage);
      translateYAnim.setValue(-10);
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        RNAnimated.timing(translateYAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, translateYAnim]);

  // ─── 5-second countdown timer for preparation stage ────────────────────
  useEffect(() => {
    if (stage !== 'preparation') return;
    const timer = setInterval(() => {
      setPrepSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          transitionToStage('exercise');
          return 0;
        }
        Haptics.selectionAsync().catch(() => {});
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, transitionToStage]);

  // Log exercise start event
  useEffect(() => {
    if (stage === 'exercise' && exercise && uid) {
      const isSleep = exercise.lessonId?.startsWith('sleep-preparation') || targetId.startsWith('sleep-preparation');
      const eventName = isSleep
        ? 'sleep_session_started'
        : exercise.type === EXERCISE_TYPE.BREATHING
        ? 'breathing_session_started'
        : exercise.type === EXERCISE_TYPE.MEDITATION
        ? 'meditation_session_started'
        : null;

      if (eventName) {
        analyticsService.trackEvent(eventName as any, {
          exercise_id: exercise.id,
          program_id: lesson?.programId || '',
          lesson_id: exercise.lessonId || '',
          session_id: targetId,
        });
      }
    }
  }, [stage, exercise, uid, targetId, lesson?.programId]);

  const handleSave = useCallback(async () => {
    if (!uid || !targetId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    transitionToStage('saving');
    try {
      await journeyRepository.saveProgress(uid, targetId, 1);

      // Log completion event
      if (exercise) {
        const isSleep = exercise.lessonId?.startsWith('sleep-preparation') || targetId.startsWith('sleep-preparation');
        const eventName = isSleep
          ? 'sleep_session_completed'
          : exercise.type === EXERCISE_TYPE.BREATHING
          ? 'breathing_session_completed'
          : exercise.type === EXERCISE_TYPE.MEDITATION
          ? 'meditation_completed'
          : null;

        if (eventName) {
          analyticsService.trackEvent(eventName as any, {
            exercise_id: exercise.id,
            program_id: lesson?.programId || '',
            lesson_id: exercise.lessonId || '',
            session_id: targetId,
          });
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
      await queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
      await queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
      await queryClient.invalidateQueries({ queryKey: ['homeState'] });
      
      const title = exercise?.title || 'Exercise';
      const duration = exercise?.estimatedTime || 0;
      router.replace(`/journey/summary?exerciseId=${targetId}&title=${encodeURIComponent(title)}&duration=${duration}&type=${exercise?.type || 'meditation'}` as any);
    } catch (err) {
      console.error('[ExerciseScreen] Save failed:', err);
      transitionToStage('reflection'); // fallback
    }
  }, [uid, targetId, exercise, lesson?.programId, queryClient, transitionToStage]);

  const handleExerciseComplete = (data?: string) => {
    if (data) {
      setSavedReflection(data);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    transitionToStage('completion');
  };

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>Exercise not found.</Text>
        </View>
      </SafeAreaView>
    );
  }



  const isGuided = useMemo(() => {
    if (!exercise) return false;
    return !!GUIDED_STEPS_CONFIG[exercise.id] || !!GUIDED_STEPS_CONFIG[exercise.lessonId];
  }, [exercise]);

  if (isGuided) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top', 'bottom']}>
        <GuidedExerciseEngine
          exerciseId={exercise.id}
          uid={uid || ''}
          programId={lesson?.programId || ''}
          lessonId={exercise.lessonId}
          onComplete={async () => {
            await queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
            await queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
            await queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
            await queryClient.invalidateQueries({ queryKey: ['homeState'] });
            router.replace('/(tabs)/journey');
          }}
        />
      </SafeAreaView>
    );
  }

  // ─── Stage Rendering ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header (hidden in prep/save to increase focus) */}
      {stage !== 'preparation' && stage !== 'saving' && (
        <View style={styles.header} accessibilityRole="header">
          <Pressable 
            onPress={() => {
              if (stage === 'exercise') {
                transitionToStage('pause');
              } else if (stage === 'pause') {
                transitionToStage('exercise');
              } else {
                router.back();
              }
            }} 
            style={styles.backButton} 
            accessibilityRole="button" 
            accessibilityLabel={stage === 'exercise' ? "Pause session" : stage === 'pause' ? "Resume session" : "Go back"}
            accessibilityHint="Pauses or navigates back from the current exercise screen"
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
            {exercise.title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <RNAnimated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }}>
        {/* Stage: Introduction */}
        {stage === 'introduction' && (
          <ScrollView contentContainerStyle={styles.introContainer} showsVerticalScrollIndicator={false}>
            <View style={[styles.badge, { backgroundColor: `${colors.brand.primary}12` }]} accessible={true} accessibilityLabel={`Exercise type: ${exercise.type}`}>
              <Sparkles size={14} color={colors.brand.primary} />
              <Text style={[styles.badgeText, { color: colors.brand.primary }]}>
                {exercise.type.toUpperCase()} PRACTICE
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>{exercise.title}</Text>
            <Text style={[styles.desc, { color: colors.text.secondary }]}>{exercise.description}</Text>

            {/* Goal & Duration */}
            <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true}>
              <View style={styles.cardHeader}>
                <Heart size={18} color={colors.brand.primary} />
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Focus & Goal</Text>
              </View>
              <Text style={[styles.cardContentText, { color: colors.text.secondary }]}>
                {exercise.goal || 'Train mindfulness, emotional focus, and cognitive resilience.'}
              </Text>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.cardHeader}>
                <Clock size={18} color={colors.brand.primary} />
                <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Duration</Text>
              </View>
              <Text style={[styles.cardContentText, { color: colors.text.secondary }]}>
                ~{exercise.estimatedTime} minutes
              </Text>
            </View>

            {/* Instructions List */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <View style={[styles.card, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]} accessible={true} accessibilityLabel="Steps to perform the exercise">
                <View style={styles.cardHeader}>
                  <BookOpen size={18} color={colors.brand.primary} />
                  <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Instructions</Text>
                </View>
                {exercise.instructions.map((inst, iIdx) => (
                  <View key={iIdx} style={styles.instructionStep} accessible={true} accessibilityLabel={`Step ${iIdx + 1}: ${inst}`}>
                    <Text style={[styles.stepNumber, { color: colors.brand.primary }]}>{iIdx + 1}</Text>
                    <Text style={[styles.stepText, { color: colors.text.secondary }]}>{inst}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Completion Criteria */}
            {exercise.completionCriteria && (
              <View style={[styles.criteriaBox, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}20` }]} accessible={true} accessibilityLabel={`Completion criteria: ${exercise.completionCriteria}`}>
                <Text style={[styles.criteriaTitle, { color: colors.success }]}>COMPLETION CRITERIA</Text>
                <Text style={[styles.criteriaText, { color: colors.text.secondary }]}>{exercise.completionCriteria}</Text>
              </View>
            )}

            <Pressable 
              style={[styles.primaryButton, { backgroundColor: colors.brand.primary }]}
              onPress={() => transitionToStage('preparation')}
              accessibilityRole="button"
              accessibilityLabel="Get Ready"
              accessibilityHint="Navigates to the preparation screen and starts a countdown"
            >
              <Text style={[styles.primaryButtonText, { color: colors.brand.contrastText }]}>Get Ready</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Stage: Preparation */}
        {stage === 'preparation' && (
          <View style={styles.prepContainer}>
            <Text style={[styles.prepHeader, { color: colors.text.secondary }]}>Prepare your space</Text>
            <Text style={[styles.prepPrompt, { color: colors.text.primary }]}>
              Take a deep breath. Settle into a comfortable posture.
            </Text>
            <View style={[styles.prepTimerCircle, { borderColor: colors.brand.primary }]} accessible={true} accessibilityLabel={`Countdown timer: ${prepSeconds} seconds remaining`}>
              <Text style={[styles.prepSecondsText, { color: colors.brand.primary }]}>{prepSeconds}</Text>
            </View>
            <Pressable 
              style={[styles.secondaryButton, { borderColor: colors.border.default }]}
              onPress={() => transitionToStage('exercise')}
              accessibilityRole="button"
              accessibilityLabel="Begin Now"
              accessibilityHint="Skips the countdown and immediately starts the exercise session"
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>Begin Now</Text>
            </Pressable>
          </View>
        )}

        {/* Stage: Exercise */}
        {stage === 'exercise' && (
          <View style={styles.exerciseBody}>
            {/* Active Exercise Screens */}
            {exercise.type === EXERCISE_TYPE.MEDITATION && (
              <MeditationTimer estimatedTime={exercise.estimatedTime} isRunning={true} onComplete={() => handleExerciseComplete()} />
            )}

            {exercise.type === EXERCISE_TYPE.BREATHING && (
              <BreathingGuide exercise={exercise} isRunning={true} onComplete={() => handleExerciseComplete()} />
            )}

            {exercise.type === EXERCISE_TYPE.JOURNALING && (
              <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
                <JournalingForm exercise={exercise} onComplete={handleExerciseComplete} />
              </ScrollView>
            )}

            {exercise.type === EXERCISE_TYPE.GRATITUDE && (
              <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
                <GratitudeForm exercise={exercise} onComplete={handleExerciseComplete} />
              </ScrollView>
            )}

            {/* Pause Trigger */}
            {(exercise.type === EXERCISE_TYPE.MEDITATION || exercise.type === EXERCISE_TYPE.BREATHING) && (
              <Pressable 
                style={[styles.pauseButton, { backgroundColor: colors.surface.secondary }]}
                onPress={() => transitionToStage('pause')}
                accessibilityRole="button"
                accessibilityLabel="Pause Session"
                accessibilityHint="Pauses the exercise timer and audio"
              >
                <Pause size={20} color={colors.text.primary} />
                <Text style={[styles.pauseButtonText, { color: colors.text.primary }]}>Pause Session</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Stage: Pause Overlay */}
        {stage === 'pause' && (
          <View style={styles.pauseOverlay}>
            <Text style={[styles.pauseTitle, { color: colors.text.primary }]}>Session Paused</Text>
            <Text style={[styles.pauseSubtitle, { color: colors.text.secondary }]}>
              Take your time. We're ready when you are.
            </Text>

            <View style={styles.pauseButtons}>
              <Pressable 
                style={[styles.primaryButton, { backgroundColor: colors.brand.primary, width: '80%' }]}
                onPress={() => transitionToStage('exercise')}
                accessibilityRole="button"
                accessibilityLabel="Resume Practice"
                accessibilityHint="Resumes the current practice timer"
              >
                <Play size={18} color="#FFF" fill="#FFF" />
                <Text style={[styles.primaryButtonText, { color: '#FFF' }]}>Resume Practice</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.secondaryButton, { borderColor: colors.border.default, width: '80%' }]}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="End Session"
                accessibilityHint="Cancels progress and navigates back to the lesson page"
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>End Session</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Stage: Completion congratulatory card */}
        {stage === 'completion' && (
          <View style={styles.completionCard} accessible={true}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
              <Check size={40} color="#FFF" strokeWidth={3} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>Session Completed!</Text>
            <Text style={[styles.desc, { color: colors.text.secondary }]}>
              You spent dedicated time investing in your mental health.
            </Text>
            
            <Pressable 
              style={[styles.primaryButton, { backgroundColor: colors.brand.primary, marginTop: spacing.xl }]}
              onPress={() => transitionToStage('reflection')}
              accessibilityRole="button"
              accessibilityLabel="Reflect and Save"
              accessibilityHint="Proceeds to write a short reflection and save progress"
            >
              <Text style={[styles.primaryButtonText, { color: colors.brand.contrastText }]}>Reflect & Save</Text>
            </Pressable>
          </View>
        )}

        {/* Stage: Reflection prompt */}
        {stage === 'reflection' && (
          <ScrollView contentContainerStyle={styles.reflectionContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.achievementBadge}>
              <Award size={18} color={colors.warning} />
              <Text style={[styles.achievementText, { color: colors.text.primary }]}>ADD REFLECTION</Text>
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>How do you feel now?</Text>
            <Text style={[styles.desc, { color: colors.text.secondary }]}>
              A brief reflection helps solidify your learning and track changes over time.
            </Text>

            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary, height: 160 }]}
              multiline
              placeholder="Write how you feel, or any insights you gained..."
              placeholderTextColor={colors.text.secondary}
              value={reflectionText}
              onChangeText={setReflectionText}
              textAlignVertical="top"
              accessibilityLabel="Journal reflection text input area"
              accessibilityHint="Type your notes and thoughts here. Optional but recommended."
            />

            <Pressable 
              style={[styles.primaryButton, { backgroundColor: colors.brand.primary, marginTop: spacing.lg }]}
              onPress={handleSave}
              accessibilityRole="button"
              accessibilityLabel="Save Progress"
              accessibilityHint="Submits your reflection, saves your exercise completion, and redirects to summary screen"
            >
              <Text style={[styles.primaryButtonText, { color: colors.brand.contrastText }]}>Save Progress</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Stage: Saving Progress Indicator */}
        {stage === 'saving' && (
          <View style={styles.savingContainer} accessible={true} accessibilityLabel="Saving your progress status page">
            <ActivityIndicator size="large" color={colors.brand.primary} />
            <Text style={[styles.savingText, { color: colors.text.primary }]}>Saving your progress...</Text>
          </View>
        )}
      </RNAnimated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 32 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15 },
  
  // Intro Stage
  introContainer: { paddingBottom: spacing['5xl'], paddingHorizontal: spacing.xl, gap: spacing.md, paddingTop: spacing.md },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  desc: { fontSize: 15, lineHeight: 22 },
  card: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardContentText: { fontSize: 13, lineHeight: 18 },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: spacing.xs },
  instructionStep: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNumber: { fontSize: 16, fontWeight: '700', width: 20 },
  stepText: { fontSize: 13, lineHeight: 18, flex: 1 },
  criteriaBox: { borderRadius: borderRadius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.xs },
  criteriaTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  criteriaText: { fontSize: 13, lineHeight: 18 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '600' },

  // Prep Stage
  prepContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'], gap: spacing.xl },
  prepHeader: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  prepPrompt: { fontSize: 22, fontWeight: '600', textAlign: 'center', lineHeight: 30 },
  prepTimerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prepSecondsText: { fontSize: 48, fontWeight: '700' },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '500' },

  // Exercise Stage
  exerciseBody: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  formBody: { paddingTop: spacing.xl },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  pauseButtonText: { fontSize: 14, fontWeight: '600' },

  // Timer Component styles
  timerCircle: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: spacing['2xl'] },
  timerCircleBg: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { fontSize: 52, fontWeight: '300', letterSpacing: 2 },
  timerLabel: { fontSize: 12, marginTop: spacing.xs },

  // Breathing Guide styles
  breathingContainer: { alignSelf: 'center', justifyContent: 'center', alignItems: 'center', width: 240, height: 240, marginVertical: spacing['2xl'] },
  breathingCircle: { width: 160, height: 160, borderRadius: 80, position: 'absolute' },
  breathingOverlay: { alignItems: 'center' },
  breathingPhase: { fontSize: 28, fontWeight: '600' },
  breathingCycle: { fontSize: 13, marginTop: spacing.sm },

  // Forms styles
  formContainer: { gap: spacing.md },
  promptText: { fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: spacing.xs },
  textArea: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 180,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: { fontSize: 12, textAlign: 'right' },
  gratitudeInput: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    fontSize: 15,
    height: 52,
  },
  saveButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: { fontSize: 16, fontWeight: '600' },

  // Pause Overlay
  pauseOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing['2xl'] },
  pauseTitle: { fontSize: 24, fontWeight: '700' },
  pauseSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: spacing.xl },
  pauseButtons: { width: '100%', gap: spacing.md, alignItems: 'center' },

  // Completion Screen styles
  completionCard: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'], gap: spacing.md },
  iconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },

  // Reflection Screen styles
  reflectionContainer: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md, flexGrow: 1 },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: 4,
  },
  achievementText: { fontSize: 10, fontWeight: '700' },

  // Saving Screen styles
  savingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  savingText: { fontSize: 16, fontWeight: '600' }
});

export default ExerciseScreen;
