import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Sparkles,
  Wind,
  Check,
  Award,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { generateResponse } from '@/services/ai';
import { guidedProgressRepository } from '../../../../backend/repositories/GuidedProgressRepository';
import { journeyRepository } from '@/repositories/JourneyRepository';
import { GUIDED_STEPS_CONFIG, GuidedStep } from '../data/guidedSteps';
import { slugToUUID } from '../utils/uuidMapping';
import { spacing, borderRadius, colors } from '@/core/theme';

const { width } = Dimensions.get('window');

interface GuidedExerciseEngineProps {
  exerciseId: string;
  onComplete: () => void;
  uid: string;
  programId: string;
  lessonId: string;
}

export function GuidedExerciseEngine({
  exerciseId,
  onComplete,
  uid,
  programId,
  lessonId,
}: GuidedExerciseEngineProps) {
  const { colors: themeColors } = useTheme();
  const steps = GUIDED_STEPS_CONFIG[exerciseId] || GUIDED_STEPS_CONFIG[lessonId] || [];

  // Local State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiReflections, setAiReflections] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Session details
  const [dbRowId, setDbRowId] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeStepIndex, setResumeStepIndex] = useState(0);
  const [resumeData, setResumeData] = useState<{
    answers: Record<string, string>;
    reflections: Record<string, string>;
    draftText?: string | null;
    timerState?: number | null;
    breathingCycle?: number | null;
  } | null>(null);

  // Timer & Duration
  const startTimeRef = useRef<number>(Date.now());
  const elapsedSecsRef = useRef<number>(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;

  const currentStep = steps[currentStepIndex];

  // Shimmer animation for AI loading
  useEffect(() => {
    if (isGeneratingAI) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shimmerValue.setValue(0);
    }
  }, [isGeneratingAI]);

  // Load saved progress on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    // Interval to track duration
    const interval = setInterval(() => {
      elapsedSecsRef.current += 1;
    }, 1000);

    const checkSavedProgress = async () => {
      if (!uid) return;
      try {
        const saved = await guidedProgressRepository.get(exerciseId);
        if (saved && saved.status === 'in_progress' && saved.current_step > 0) {
          setDbRowId(saved.id);
          setResumeStepIndex(saved.current_step);
          setResumeData({
            answers: (saved.answers as Record<string, string>) || {},
            reflections: (saved.ai_reflections as Record<string, string>) || {},
            draftText: saved.draft_text,
            timerState: saved.timer_state,
            breathingCycle: saved.breathing_cycle,
          });
          setShowResumeModal(true);
        }
      } catch (err) {
        console.warn('Failed to load saved progress:', err);
      }
    };

    checkSavedProgress();

    return () => clearInterval(interval);
  }, [exerciseId, uid]);

  // Setup current input text when step changes
  useEffect(() => {
    if (currentStep && (currentStep.type === 'question' || currentStep.type === 'summary')) {
      setInputText(answers[currentStep.id] || '');
      setInputError(null);
    }
  }, [currentStepIndex]);

  // Handle Resuming
  const handleResume = () => {
    if (resumeData) {
      setAnswers(resumeData.answers);
      setAiReflections(resumeData.reflections);
      setCurrentStepIndex(resumeStepIndex);
      if (resumeData.draftText) setInputText(resumeData.draftText);
      if (resumeData.timerState) elapsedSecsRef.current = resumeData.timerState;
      if (resumeData.breathingCycle) {
        setBreathingCyclesLeft(resumeData.breathingCycle);
      }
    }
    setShowResumeModal(false);
  };

  const handleStartOver = async () => {
    setShowResumeModal(false);
    try {
      await guidedProgressRepository.remove(exerciseId);
    } catch (err) {
      console.warn('Failed to clear progress:', err);
    }
  };

  // Fade transition helper
  const transitionToStep = (nextIndex: number) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStepIndex(nextIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  // Breathing Loop State
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'complete'>('inhale');
  const [breathingCyclesLeft, setBreathingCyclesLeft] = useState(3);
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing countdown effect
  useEffect(() => {
    if (currentStep && currentStep.type === 'breathing' && breathingCyclesLeft > 0) {
      // Setup breathing animation loop based on phase
      const cycleDuration = 4000;
      let targetScale = 1;
      if (breathingPhase === 'inhale') {
        targetScale = 1.4;
      } else if (breathingPhase === 'exhale') {
        targetScale = 1.0;
      } else {
        targetScale = 1.4; // Hold
      }

      Animated.timing(breathingScale, {
        toValue: targetScale,
        duration: cycleDuration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      breathingTimerRef.current = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            // Shift phase
            if (breathingPhase === 'inhale') {
              setBreathingPhase('hold');
              return 4;
            } else if (breathingPhase === 'hold') {
              setBreathingPhase('exhale');
              return 4;
            } else {
              setBreathingPhase('inhale');
              setBreathingCyclesLeft((c) => c - 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (breathingCyclesLeft === 0 && breathingPhase !== 'complete') {
      setBreathingPhase('complete');
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    }
    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [currentStepIndex, breathingPhase, breathingCyclesLeft]);

  // Auto-save draft text on change (debounced)
  useEffect(() => {
    if (!currentStep || (currentStep.type !== 'question' && currentStep.type !== 'summary') || !inputText) return;

    const timer = setTimeout(async () => {
      try {
        await guidedProgressRepository.save(
          exerciseId,
          currentStepIndex,
          answers,
          aiReflections,
          'in_progress',
          elapsedSecsRef.current,
          null,
          programId,
          lessonId,
          inputText,
          elapsedSecsRef.current,
          currentStepIndex === 2 ? breathingCyclesLeft : null
        );
      } catch (err) {
        console.warn('Debounced save draft failed:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [inputText]);

  // Auto-save breathing cycles on change
  useEffect(() => {
    if (currentStep?.type === 'breathing' && breathingCyclesLeft > 0) {
      guidedProgressRepository.save(
        exerciseId,
        currentStepIndex,
        answers,
        aiReflections,
        'in_progress',
        elapsedSecsRef.current,
        null,
        programId,
        lessonId,
        null,
        elapsedSecsRef.current,
        breathingCyclesLeft
      ).catch(() => {});
    }
  }, [breathingCyclesLeft, breathingPhase]);

  // Generate AI Reflection
  const generateReflection = async (questionStepId: string, userInput: string) => {
    setIsGeneratingAI(true);
    try {
      let prompt = '';
      const nextStep = steps[currentStepIndex + 1];
      const aiInstruction = nextStep?.aiInstruction;

      if (aiInstruction) {
        prompt = `[SYSTEM INSTRUCTION: You are Velness, a compassionate CBT companion. ${aiInstruction}]
Other Context: ${JSON.stringify(answers)}
User's input for current step "${questionStepId}": "${userInput}"`;
      } else if (questionStepId === 'negative_belief') {
        prompt = `[SYSTEM INSTRUCTION: You are Velness, a compassionate CBT companion. Review the user's negative core belief. Validate their feeling warmly with empathy. Point out any thinking pattern (e.g. personalization, overgeneralization) gently. Ask exactly one small, actionable reframing question. Under 55 words.]
User's core belief: "${userInput}"`;
      } else if (questionStepId === 'history') {
        prompt = `[SYSTEM INSTRUCTION: You are Velness, a compassionate CBT companion. Review the origin/history of the user's negative core belief. Validate their childhood or past experience with warm empathy. Offer exactly one small grounding insight about how beliefs are learned rules rather than facts. Under 55 words.]
User's core belief: "${answers.negative_belief}"
Belief origin: "${userInput}"`;
      } else if (questionStepId === 'contradicting_evidence') {
        prompt = `[SYSTEM INSTRUCTION: You are Velness, a compassionate CBT companion. Review the user's contradicting evidence. Highlight their resilience and facts. Provide a warm validation and a brief encouragement. Under 55 words.]
User's core belief: "${answers.negative_belief}"
Their evidence: "${userInput}"`;
      } else {
        prompt = `Review this input and write a supportive, warm validation in 1-2 sentences: "${userInput}"`;
      }

      const response = await generateResponse({
        text: prompt,
        uid: uid,
      });

      const text = response.content.trim();
      
      const newReflections = {
        ...aiReflections,
        [currentStep.id]: text,
      };
      setAiReflections(newReflections);

      // Save to Supabase mid-exercise
      await guidedProgressRepository.save(
        exerciseId,
        currentStepIndex + 1,
        answers,
        newReflections,
        'in_progress',
        elapsedSecsRef.current,
        null,
        programId,
        lessonId,
        null,
        elapsedSecsRef.current,
        null
      );

      // Transition to the reflection step
      transitionToStep(currentStepIndex + 1);
    } catch (err) {
      console.warn('AI reflection generation failed:', err);
      // Fallback in case of API failure so user isn't stuck
      const fallbackText = "Thank you for sharing this. Recognizing these thoughts is the first step toward releasing them. Let's keep moving forward.";
      const newReflections = {
        ...aiReflections,
        [currentStep.id]: fallbackText,
      };
      setAiReflections(newReflections);
      transitionToStep(currentStepIndex + 1);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save completion and sync
  const saveCompletion = async () => {
    setIsGeneratingAI(true);
    try {
      // 1. Save completed progress to Supabase
      await guidedProgressRepository.save(
        exerciseId,
        currentStepIndex + 1,
        answers,
        aiReflections,
        'completed',
        elapsedSecsRef.current,
        new Date(),
        programId,
        lessonId,
        null,
        elapsedSecsRef.current,
        null
      );

      // 2. Save completion progress to Firestore (streaks and progress)
      await journeyRepository.saveProgress(uid, exerciseId, 1);

      // 3. Save reflection memory to journal_entries
      try {
        const { journalRepository } = await import('../../../../backend/repositories/JournalRepository');
        const { DEFAULT_EXERCISES } = await import('../data/exercises');
        const exerciseObj = DEFAULT_EXERCISES.find(ex => ex.id === exerciseId);
        const exerciseTitle = exerciseObj?.title || exerciseId;
        const reflectionText = Object.values(aiReflections).join('\n\n');
        await journalRepository.create({
          title: `Reflection on ${exerciseTitle}`,
          body: `Reflection Summary:\n${reflectionText}\n\nExercise Answers:\n${JSON.stringify(answers, null, 2)}`,
          attachments: [
            {
              type: 'cbt-reflection',
              exerciseId,
              emotionalTag: 'confident',
              confidenceScore: 0.95,
              completionTime: elapsedSecsRef.current,
              keywords: ['confidence', 'core belief', 'reframe'],
              theme: 'Cognitive Restructuring',
            }
          ] as any,
        });
      } catch (err) {
        if ((err as { name?: string })?.name !== 'NotAuthenticatedError') {
          console.warn('Failed to save reflection to journal_entries:', err);
        }
      }

      // 4. Track completion in analytics_events
      try {
        const { analyticsRepository } = await import('../../../../backend/repositories/AnalyticsRepository');
        await analyticsRepository.track({
          user_id: uid,
          event_name: 'cbt_exercise_completed',
          properties: {
            exerciseId,
            duration: elapsedSecsRef.current,
            stepsCount: steps.length,
            completedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn('Failed to track completion event:', err);
      }

      // 5. Save/Complete recommendation
      try {
        const { recommendationRepository } = await import('../../../../backend/repositories/RecommendationRepository');
        await recommendationRepository.create({
          exercise_id: slugToUUID(exerciseId)!,
          program_id: slugToUUID(programId)!,
          reason: 'Auto-recorded exercise completion',
          priority: 0,
          source: 'cbt',
        }).then(async (rec) => {
          await recommendationRepository.complete(rec.id);
        });
      } catch (err) {
        if ((err as { name?: string })?.name !== 'NotAuthenticatedError') {
          console.warn('Failed to record completion in recommendations:', err);
        }
      }

      // Transition to celebrate
      transitionToStep(currentStepIndex + 1);
    } catch (err) {
      console.warn('Failed to save completion:', err);
      // Proceed to celebrate anyway
      transitionToStep(currentStepIndex + 1);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Next / Continue button click
  const handleContinue = async () => {
    if (!currentStep) return;

    if (currentStep.type === 'question' || currentStep.type === 'summary') {
      const trimmed = inputText.trim();
      if (currentStep.required && !trimmed) {
        setInputError('Please write your response before continuing.');
        return;
      }

      const updatedAnswers = {
        ...answers,
        [currentStep.id]: trimmed,
      };
      setAnswers(updatedAnswers);

      // Save current answers to Supabase
      try {
        await guidedProgressRepository.save(
          exerciseId,
          currentStepIndex + 1,
          updatedAnswers,
          aiReflections,
          'in_progress',
          elapsedSecsRef.current,
          null,
          programId,
          lessonId,
          null,
          elapsedSecsRef.current,
          null
        );
      } catch (err) {
        console.warn('Failed to save mid-exercise state:', err);
      }

      // If this question requires an AI reflection next
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep && nextStep.type === 'reflection') {
        await generateReflection(currentStep.id, trimmed);
      } else {
        transitionToStep(currentStepIndex + 1);
      }
    } else if (currentStep.type === 'save') {
      await saveCompletion();
    } else {
      transitionToStep(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      // Find previous step. If the previous step is a reflection, we skip it and go to the question before it.
      let prevIndex = currentStepIndex - 1;
      if (steps[prevIndex]?.type === 'reflection') {
        prevIndex -= 1;
      }
      if (prevIndex >= 0) {
        transitionToStep(prevIndex);
      }
    } else {
      router.back();
    }
  };

  // Calculate Progress Percent
  const progressPercent = steps.length > 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  // Shimmer opacity calculation
  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Top Header / Progress */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <RotateCcw size={20} color="rgba(255, 255, 255, 0.6)" style={{ transform: [{ scaleX: -1 }] }} />
        </Pressable>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content Area with Fade animation */}
      <Animated.View style={[styles.contentCard, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Screen */}
          {currentStep?.type === 'welcome' && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Award size={48} color="#8B5CF6" />
              </View>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.description}>{currentStep.explanation}</Text>
            </View>
          )}

          {/* Purpose Screen */}
          {currentStep?.type === 'purpose' && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(34, 211, 238, 0.15)' }]}>
                <HelpCircle size={48} color="#06B6D4" />
              </View>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.description}>{currentStep.explanation}</Text>
            </View>
          )}

          {/* Breathing Screen */}
          {currentStep?.type === 'breathing' && (
            <View style={[styles.stepContainer, { alignItems: 'center' }]}>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.breathingSubtitle}>{currentStep.explanation}</Text>

              {breathingPhase !== 'complete' ? (
                <View style={styles.breathingVisualContainer}>
                  <Animated.View
                    style={[
                      styles.breathingCircle,
                      {
                        transform: [{ scale: breathingScale }],
                        borderColor: breathingPhase === 'inhale' ? '#8B5CF6' : breathingPhase === 'hold' ? '#A78BFA' : '#06B6D4',
                      },
                    ]}
                  />
                  <View style={styles.breathingContent}>
                    <Wind size={36} color={breathingPhase === 'inhale' ? '#8B5CF6' : '#06B6D4'} />
                    <Text style={[styles.breathingPhaseText, { textTransform: 'uppercase' }]}>
                      {breathingPhase}
                    </Text>
                    <Text style={styles.breathingTimerText}>{breathingSeconds}s</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.breathingVisualContainer}>
                  <View style={[styles.breathingCircle, { transform: [{ scale: 1.2 }], borderColor: '#34D399', backgroundColor: 'rgba(52, 211, 153, 0.1)' }]} />
                  <View style={styles.breathingContent}>
                    <Check size={40} color="#34D399" />
                    <Text style={styles.breathingPhaseText}>Mind Centered</Text>
                  </View>
                </View>
              )}

              {breathingPhase !== 'complete' && (
                <Pressable
                  onPress={() => {
                    setBreathingCyclesLeft(0);
                    setBreathingPhase('complete');
                  }}
                  style={styles.skipBreathingButton}
                >
                  <Text style={styles.skipBreathingText}>Skip Grounding</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Question / Summary Input Screen */}
          {(currentStep?.type === 'question' || currentStep?.type === 'summary') && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.questionPrompt}>{currentStep.prompt}</Text>
              
              {currentStep.explanation && (
                <Text style={styles.explanationText}>{currentStep.explanation}</Text>
              )}

              {currentStep.example && (
                <View style={styles.exampleBox}>
                  <Text style={styles.exampleTitle}>Example Helper</Text>
                  <Text style={styles.exampleText}>{currentStep.example}</Text>
                </View>
              )}

              <TextInput
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                  if (inputError) setInputError(null);
                }}
                placeholder={currentStep.placeholder || 'Write your reflection...'}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                style={[
                  styles.textInput,
                  {
                    borderColor: inputError ? '#F87171' : 'rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(15, 10, 26, 0.4)',
                  },
                ]}
              />

              {inputError && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#F87171" />
                  <Text style={styles.errorText}>{inputError}</Text>
                </View>
              )}

              <Text style={styles.charCount}>
                {inputText.length} characters
              </Text>
            </View>
          )}

          {/* AI Reflection Screen (Also used during loading) */}
          {currentStep?.type === 'reflection' && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>{currentStep.title}</Text>
              
              {isGeneratingAI ? (
                <View style={styles.aiLoadingContainer}>
                  <Animated.View style={[styles.aiSkeletonCard, { opacity: shimmerOpacity }]}>
                    <View style={styles.aiSkeletonLineLg} />
                    <View style={styles.aiSkeletonLineMd} />
                    <View style={styles.aiSkeletonLineSm} />
                  </Animated.View>
                  <View style={styles.aiLoadingStatus}>
                    <ActivityIndicator color="#8B5CF6" size="small" />
                    <Text style={styles.aiLoadingText}>Velness AI is reflecting on your thoughts...</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.reflectionCard}>
                  <View style={styles.reflectionHeader}>
                    <Sparkles size={20} color="#8B5CF6" />
                    <Text style={styles.reflectionTitle}>Velness AI Companion</Text>
                  </View>
                  <Text style={styles.reflectionBody}>
                    {aiReflections[steps[currentStepIndex - 1]?.id] || 'Generating reflection...'}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Saving Screen */}
          {currentStep?.type === 'save' && (
            <View style={styles.stepContainer}>
              <View style={styles.aiLoadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.title}>{currentStep.title}</Text>
                <Text style={styles.description}>{currentStep.explanation}</Text>
              </View>
            </View>
          )}

          {/* Celebrate Screen */}
          {currentStep?.type === 'celebrate' && (
            <View style={styles.stepContainer}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(52, 211, 153, 0.15)', width: 100, height: 100, borderRadius: 50 }]}>
                <Award size={64} color="#34D399" />
              </View>
              <Text style={[styles.title, { color: '#34D399' }]}>{currentStep.title}</Text>
              <Text style={styles.description}>{currentStep.explanation}</Text>

              <View style={styles.celebrationCard}>
                <Text style={styles.celebrationStatTitle}>Achievements Earned</Text>
                <View style={styles.celebrationBadgeRow}>
                  <View style={styles.celebrationBadge}>
                    <Sparkles size={16} color="#8B5CF6" />
                    <Text style={styles.celebrationBadgeText}>Silence the Critic</Text>
                  </View>
                  <View style={styles.celebrationBadge}>
                    <Check size={16} color="#06B6D4" />
                    <Text style={styles.celebrationBadgeText}>CBT Journey L1</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Bottom Button Footer */}
      <View style={styles.footer}>
        {currentStep?.type === 'celebrate' ? (
          <Pressable
            onPress={onComplete}
            style={[styles.continueButton, { backgroundColor: '#34D399' }]}
          >
            <Text style={styles.continueButtonText}>Return to Journey</Text>
            <Check size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleContinue}
            disabled={
              isGeneratingAI ||
              (currentStep?.type === 'breathing' && breathingPhase !== 'complete')
            }
            style={[
              styles.continueButton,
              {
                backgroundColor: isGeneratingAI || (currentStep?.type === 'breathing' && breathingPhase !== 'complete')
                  ? 'rgba(139, 92, 246, 0.4)'
                  : '#8B5CF6',
              },
            ]}
          >
            {isGeneratingAI ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>
                  {currentStep?.type === 'welcome' ? 'Get Started' : currentStep?.type === 'breathing' && breathingPhase !== 'complete' ? 'Grounding...' : 'Continue'}
                </Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* Resume Previous Session Modal */}
      {showResumeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Sparkles size={32} color="#8B5CF6" style={{ marginBottom: spacing.sm }} />
            <Text style={styles.modalTitle}>Resume Exercise?</Text>
            <Text style={styles.modalDescription}>
              We found a saved progress in this exercise. Would you like to resume from step {resumeStepIndex + 1} or start over?
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable onPress={handleStartOver} style={styles.modalStartOverBtn}>
                <Text style={styles.modalStartOverText}>Start Over</Text>
              </Pressable>
              <Pressable onPress={handleResume} style={styles.modalResumeBtn}>
                <Text style={styles.modalResumeText}>Resume</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 20 : 12,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  progressBarBackground: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  contentCard: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#1A1428',
    borderRadius: borderRadius['glass-lg'] || 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scrollBody: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  stepContainer: {
    gap: spacing.lg,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  breathingSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  breathingVisualContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: spacing.xl,
  },
  breathingCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  breathingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  breathingPhaseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  breathingTimerText: {
    fontSize: 28,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  skipBreathingButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  skipBreathingText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  questionPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  exampleBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  textInput: {
    height: 120,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: -spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.xs,
  },
  errorText: {
    fontSize: 13,
    color: '#F87171',
    fontWeight: '500',
  },
  aiLoadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  aiSkeletonCard: {
    width: '100%',
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  aiSkeletonLineLg: {
    height: 16,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  aiSkeletonLineMd: {
    height: 16,
    width: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  aiSkeletonLineSm: {
    height: 16,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  aiLoadingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  aiLoadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  reflectionCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    gap: spacing.md,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A78BFA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#FFFFFF',
  },
  celebrationCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  celebrationStatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  celebrationBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  celebrationBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  continueButton: {
    height: 54,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: '#1A1428',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  modalStartOverBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStartOverText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modalResumeBtn: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
