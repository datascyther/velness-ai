import React, { useState, useMemo, useCallback } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/shared/hooks/useAuth';
import { useJourney } from '@/shared/hooks/useJourney';
import { useQueryClient } from '@tanstack/react-query';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { spacing, borderRadius } from '@/core/theme';
import { EXERCISE_TYPE } from '@/features/journey/constants';
import type { ExerciseWithProgress } from '@/features/journey/models';

const STEP_PROMPTS: Record<string, string[]> = {
  [EXERCISE_TYPE.JOURNALING]: [
    'What\'s on your mind right now?',
    'How does this feeling connect to your day?',
    'What insight will you carry forward?',
  ],
  [EXERCISE_TYPE.GRATITUDE]: [
    'What are you grateful for today?',
    'How did these things make you feel?',
    'Who or what helped create these moments?',
  ],
};

export function SessionScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const uid = user?.uid || null;
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { exercises } = useJourney();
  const queryClient = useQueryClient();

  const exercise = useMemo(() => {
    return exercises.find((ex: ExerciseWithProgress) => ex.id === sessionId) || null;
  }, [exercises, sessionId]);

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(['', '', '']);

  const totalSteps = 3;

  const prompts = useMemo(() => {
    if (!exercise) return ['', '', ''];
    return STEP_PROMPTS[exercise.type] || [
      'Share your thoughts...',
      'Reflect deeper...',
      'Final reflection...',
    ];
  }, [exercise]);

  const canProceed = responses[currentStep]?.trim().length > 0;

  const updateResponse = useCallback((text: string) => {
    setResponses(prev => {
      const next = [...prev];
      next[currentStep] = text;
      return next;
    });
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSave = useCallback(async () => {
    if (!uid || !sessionId) return;
    try {
      await journeyRepository.saveProgress(uid, sessionId, 1);
      await queryClient.invalidateQueries({ queryKey: ['journey', 'exercises', uid] });
      await queryClient.invalidateQueries({ queryKey: ['journey', 'user-progress', uid] });
      await queryClient.invalidateQueries({ queryKey: ['journey', 'legacy', uid] });
      const title = exercise?.title || 'Session';
      const duration = exercise?.estimatedTime || 0;
      router.replace(`/journey/summary?title=${encodeURIComponent(title)}&duration=${duration}&type=${exercise?.type || 'journaling'}` as any);
    } catch (err) {
      console.error('[SessionScreen] Save failed:', err);
    }
  }, [uid, sessionId, exercise, queryClient]);

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>Session not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>{exercise.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.progressDot,
              {
                backgroundColor: idx <= currentStep ? colors.brand.primary : colors.border.default,
                width: idx === currentStep ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.stepLabel, { color: colors.text.secondary }]}>
        Step {currentStep + 1} of {totalSteps}
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isLastStep ? (
          <View style={styles.reviewContainer}>
            <Text style={[styles.reviewTitle, { color: colors.text.primary }]}>Review Your Entry</Text>
            {responses.map((resp, idx) => (
              resp.trim().length > 0 ? (
                <View key={idx} style={[styles.reviewCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
                  <Text style={[styles.reviewPrompt, { color: colors.text.secondary }]}>{prompts[idx]}</Text>
                  <Text style={[styles.reviewResponse, { color: colors.text.primary }]}>{resp}</Text>
                </View>
              ) : null
            ))}
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={[styles.promptText, { color: colors.text.primary }]}>{prompts[currentStep]}</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.surface.primary, borderColor: colors.border.default, color: colors.text.primary }]}
              multiline
              placeholder="Write your thoughts..."
              placeholderTextColor={colors.text.secondary}
              value={responses[currentStep]}
              onChangeText={updateResponse}
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Pressable
            style={[styles.footerButton, styles.footerButtonSecondary, { borderColor: colors.border.default }]}
            onPress={handleBack}
            accessibilityRole="button"
          >
            <ChevronLeft size={20} color={colors.text.primary} />
            <Text style={[styles.footerButtonText, { color: colors.text.primary }]}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.footerButton,
            styles.footerButtonPrimary,
            { backgroundColor: canProceed || isLastStep ? colors.brand.primary : colors.border.default },
            currentStep === 0 && { flex: 1 },
          ]}
          onPress={isLastStep ? handleSave : handleNext}
          disabled={!canProceed && !isLastStep}
          accessibilityRole="button"
        >
          <Text style={[styles.footerButtonText, { color: canProceed || isLastStep ? colors.brand.contrastText : colors.text.secondary }]}>
            {isLastStep ? 'Save & Complete' : 'Next'}
          </Text>
          {!isLastStep && <ChevronRight size={20} color={canProceed ? colors.brand.contrastText : colors.text.secondary} />}
        </Pressable>
      </View>
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
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  progressDot: { height: 8, borderRadius: 4 },
  stepLabel: { textAlign: 'center', fontSize: 12, fontWeight: '500', marginBottom: spacing.lg },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, flexGrow: 1 },
  stepContainer: { flex: 1, gap: spacing.lg },
  promptText: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  textArea: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    minHeight: 220,
    fontSize: 15,
    lineHeight: 22,
  },
  reviewContainer: { gap: spacing.md },
  reviewTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  reviewCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  reviewPrompt: { fontSize: 12, fontWeight: '600', marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  reviewResponse: { fontSize: 15, lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  footerButtonPrimary: { flex: 1 },
  footerButtonSecondary: { borderWidth: 1, paddingHorizontal: spacing.lg },
  footerButtonText: { fontSize: 15, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 15 },
});

export default SessionScreen;
