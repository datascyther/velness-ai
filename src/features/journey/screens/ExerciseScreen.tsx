import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, StyleSheet, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/shared/hooks/useAuth';
import { useJourney } from '@/shared/hooks/useJourney';
import { useQueryClient } from '@tanstack/react-query';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { spacing, borderRadius } from '@/core/theme';
import { EXERCISE_TYPE } from '@/features/journey/constants';
import type { ExerciseWithProgress } from '@/features/journey/models';

function MeditationTimer({ estimatedTime, onComplete }: { estimatedTime: number; onComplete: () => void }) {
  const { colors } = useTheme();
  const totalSeconds = estimatedTime * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onComplete]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = 1 - remaining / totalSeconds;
  const strokeDasharray = 2 * Math.PI * 120;
  const strokeDashoffset = strokeDasharray * (1 - progress);

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerCircle}>
        <View style={[styles.timerCircleBg, { borderColor: colors.border.default }]}>
          <Text style={[styles.timerText, { color: colors.text.primary }]}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={[styles.timerLabel, { color: colors.text.secondary }]}>remaining</Text>
        </View>
      </View>
      <View style={styles.timerControls}>
        <Pressable
          style={[styles.timerButton, { backgroundColor: isRunning ? colors.warning : colors.brand.primary }]}
          onPress={toggleTimer}
          accessibilityRole="button"
          accessibilityLabel={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause size={24} color="#FFF" /> : <Play size={24} color="#FFF" fill="#FFF" />}
        </Pressable>
        <Pressable
          style={[styles.timerButtonSmall, { backgroundColor: colors.surface.secondary }]}
          onPress={reset}
          accessibilityRole="button"
          accessibilityLabel="Reset"
        >
          <RotateCcw size={18} color={colors.text.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

function BreathingGuide({ estimatedTime, onComplete }: { estimatedTime: number; onComplete: () => void }) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;
  const [phaseText, setPhaseText] = useState('Inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const cycleRef = useRef(0);
  const mountedRef = useRef(true);

  const cycles = Math.max(1, Math.round(estimatedTime / 0.32));

  const runCycle = useCallback(() => {
    if (!mountedRef.current) return;
    setPhaseText('Inhale');

    const phaseTimers: ReturnType<typeof setTimeout>[] = [];

    RNAnimated.sequence([
      RNAnimated.timing(scaleAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }),
      RNAnimated.timing(scaleAnim, { toValue: 1.5, duration: 7000, useNativeDriver: true }),
      RNAnimated.timing(scaleAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (!finished || !mountedRef.current) return;
      cycleRef.current += 1;
      setCycleCount(cycleRef.current);
      if (cycleRef.current >= cycles) {
        onComplete();
      } else {
        runCycle();
      }
    });

    phaseTimers.push(setTimeout(() => {
      if (mountedRef.current) setPhaseText('Hold');
    }, 4000));
    phaseTimers.push(setTimeout(() => {
      if (mountedRef.current) setPhaseText('Exhale');
    }, 11000));

    return () => phaseTimers.forEach(clearTimeout);
  }, [cycles, scaleAnim, onComplete]);

  useEffect(() => {
    mountedRef.current = true;
    cycleRef.current = 0;
    runCycle();
    return () => {
      mountedRef.current = false;
      scaleAnim.stopAnimation();
      scaleAnim.setValue(1);
    };
  }, [runCycle, scaleAnim]);

  return (
    <View style={styles.breathingContainer}>
      <RNAnimated.View
        style={[
          styles.breathingCircle,
          {
            backgroundColor: colors.brand.primary,
            opacity: 0.3,
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

function JournalingForm({ exercise, onSave }: { exercise: ExerciseWithProgress; onSave: (text: string) => void }) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const maxChars = 2000;

  return (
    <View style={styles.formContainer}>
      <Text style={[styles.promptText, { color: colors.text.primary }]}>
        {exercise.description || `Reflect on "${exercise.title}"`}
      </Text>
      <TextInput
        style={[styles.textArea, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary }]}
        multiline
        placeholder="Write your thoughts here..."
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
        onPress={() => text.trim().length > 0 && onSave(text)}
        disabled={text.trim().length === 0}
        accessibilityRole="button"
      >
        <Text style={[styles.saveButtonText, { color: text.trim().length > 0 ? colors.brand.contrastText : colors.text.secondary }]}>
          Save Entry
        </Text>
      </Pressable>
    </View>
  );
}

function GratitudeForm({ exercise, onSave }: { exercise: ExerciseWithProgress; onSave: (items: string[], reflection: string) => void }) {
  const { colors } = useTheme();
  const [items, setItems] = useState(['', '', '']);
  const [reflection, setReflection] = useState('');

  const allFilled = items.every(i => i.trim().length > 0);

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
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
        onPress={() => allFilled && onSave(items, reflection)}
        disabled={!allFilled}
        accessibilityRole="button"
      >
        <Text style={[styles.saveButtonText, { color: allFilled ? colors.brand.contrastText : colors.text.secondary }]}>
          Save
        </Text>
      </Pressable>
    </View>
  );
}

export function ExerciseScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { exercises } = useJourney();
  const queryClient = useQueryClient();

  const exercise = useMemo(() => {
    return exercises.find((ex: ExerciseWithProgress) => ex.id === exerciseId) || null;
  }, [exercises, exerciseId]);

  const handleSave = useCallback(async (data?: any) => {
    if (!uid || !exerciseId) return;
    try {
      await journeyRepository.saveProgress(uid, exerciseId, 1);
      await queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
      await queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
      await queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
      const title = exercise?.title || 'Exercise';
      const duration = exercise?.estimatedTime || 0;
      router.replace(`/journey/summary?title=${encodeURIComponent(title)}&duration=${duration}&type=${exercise?.type || 'meditation'}` as any);
    } catch (err) {
      console.error('[ExerciseScreen] Save failed:', err);
    }
  }, [uid, exerciseId, exercise, queryClient]);

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>{exercise.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {exercise.type === EXERCISE_TYPE.MEDITATION && (
        <View style={styles.exerciseBody}>
          <Text style={[styles.exerciseDescription, { color: colors.text.secondary }]}>{exercise.description}</Text>
          <MeditationTimer estimatedTime={exercise.estimatedTime} onComplete={handleSave} />
        </View>
      )}

      {exercise.type === EXERCISE_TYPE.BREATHING && (
        <View style={styles.exerciseBody}>
          <BreathingGuide estimatedTime={exercise.estimatedTime} onComplete={handleSave} />
        </View>
      )}

      {exercise.type === EXERCISE_TYPE.JOURNALING && (
        <ScrollView style={styles.exerciseBody} contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
          <JournalingForm exercise={exercise} onSave={() => handleSave()} />
        </ScrollView>
      )}

      {exercise.type === EXERCISE_TYPE.GRATITUDE && (
        <ScrollView style={styles.exerciseBody} contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
          <GratitudeForm exercise={exercise} onSave={() => handleSave()} />
        </ScrollView>
      )}
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
  exerciseBody: { flex: 1, paddingHorizontal: spacing.xl },
  formBody: { paddingTop: spacing.xl },
  exerciseDescription: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15 },
  timerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing['3xl'] },
  timerCircle: { alignItems: 'center', justifyContent: 'center' },
  timerCircleBg: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: { fontSize: 56, fontWeight: '300', letterSpacing: 2 },
  timerLabel: { fontSize: 13, marginTop: spacing.xs },
  timerControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  timerButton: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  timerButtonSmall: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  breathingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  breathingCircle: { width: 200, height: 200, borderRadius: 100, position: 'absolute' },
  breathingOverlay: { alignItems: 'center' },
  breathingPhase: { fontSize: 28, fontWeight: '600' },
  breathingCycle: { fontSize: 14, marginTop: spacing.sm },
  formContainer: { gap: spacing.md },
  promptText: { fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: spacing.sm },
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
});

export default ExerciseScreen;
