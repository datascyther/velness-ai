import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Heart, Wind, Sparkles, Moon, Briefcase, Users, GraduationCap, RefreshCw, ChevronRight } from 'lucide-react-native';
import { EmotionAvatar } from '@/components/emotion';
import type { EmotionType } from '@/constants/emotions';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/core/store/useAppStore';
import { useSessionContext } from '@/features/chat/hooks/useSessionContext';
import { spacing, borderRadius } from '@/core/theme/tokens';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0] || 'NK';
  if (hour >= 5 && hour < 12) return `Good morning, ${firstName}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${firstName}.`;
  return `Good evening, ${firstName}.`;
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface LastCheckInCardProps {
  moodInfo: { emotion: EmotionType; label: string; color: string };
  previousSessionAt: Date | null;
  focus: string | null;
}

const LastCheckInCard = React.memo(function LastCheckInCard({
  moodInfo,
  previousSessionAt,
  focus,
}: LastCheckInCardProps) {
  const { colors } = useTheme();
  const dateLabel = previousSessionAt ? formatRelativeDate(previousSessionAt) : null;

  return (
    <Animated.View
      entering={FadeInUp.duration(450).delay(150)}
      style={[styles.lastCheckInCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
    >
      <View style={styles.checkInHeader}>
        <Text style={[styles.checkInHeaderLabel, { color: colors.text.tertiary }]}>Your last check-in</Text>
        {dateLabel && (
          <Text style={[styles.checkInHeaderDate, { color: colors.text.tertiary }]}>{dateLabel}</Text>
        )}
      </View>

      <View style={styles.checkInBody}>
        <View style={styles.checkInMood}>
          <View style={[styles.checkInMoodAvatar, { backgroundColor: moodInfo.color + '1A' }]}>
            <EmotionAvatar emotion={moodInfo.emotion} size={30} animated={false} showGlow={false} />
          </View>
          <Text style={[styles.checkInMoodCaption, { color: colors.text.secondary }]}>Feeling</Text>
        </View>
        <Text style={[styles.checkInMoodValue, { color: moodInfo.color }]}>{moodInfo.label}</Text>
      </View>

      {focus && (
        <View style={[styles.checkInFocus, { borderTopColor: colors.border.subtle }]}>
          <Text style={[styles.checkInFocusLabel, { color: colors.text.tertiary }]}>Focus</Text>
          <Text style={[styles.checkInFocusValue, { color: colors.text.secondary }]} numberOfLines={1}>
            {focus}
          </Text>
        </View>
      )}
    </Animated.View>
  );
});

interface EmptyConversationProps {
  onQuickStarterSelect?: (text: string) => void;
  onResumeLastConversation?: () => void;
}

export const EmptyConversation = React.memo(function EmptyConversation({
  onQuickStarterSelect,
  onResumeLastConversation,
}: EmptyConversationProps) {
  const { colors } = useTheme();
  const user = useAppStore((state) => state.session.user);
  const sessionContext = useSessionContext();
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const userName = user?.name || 'NK';
  const currentMood = sessionContext?.mood || sessionContext?.previousSessionMood || 'Overwhelmed';
  const hasPreviousSession = !!sessionContext?.previousSessionAt;

  const handleStarterSelect = useCallback((text: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onQuickStarterSelect?.(text);
  }, [onQuickStarterSelect]);

  const handleChipSelect = useCallback((chip: { label: string; text: string }) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setSelectedChip(chip.label);
    onQuickStarterSelect?.(chip.text);
  }, [onQuickStarterSelect]);

  const handleResumePress = useCallback(() => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    onResumeLastConversation?.();
  }, [onResumeLastConversation]);

  // Topic chips for "What's been on your mind today?"
  const topicChips = useMemo(() => [
    { label: 'Work', icon: Briefcase, text: 'I want to reflect on my work day' },
    { label: 'Relationships', icon: Users, text: 'I need to talk about relationships' },
    { label: 'Studies', icon: GraduationCap, text: "I'm feeling stress about my studies" },
    { label: 'Sleep', icon: Moon, text: "I'm having trouble winding down for sleep" },
  ], []);

  // Quick prompts list
  const quickPrompts = useMemo(() => [
    { label: "I'm feeling overwhelmed", icon: Heart },
    { label: 'Help me calm down', icon: Wind },
    { label: "I can't focus", icon: Sparkles },
    { label: 'Sleep support', icon: Moon },
  ], []);

  // Mood lookup map
  const moodMap = useMemo(() => ({
    great: { emotion: 'great' as EmotionType, label: 'Great', color: '#10B981' },
    calm: { emotion: 'calm' as EmotionType, label: 'Calm', color: '#3B82F6' },
    sad: { emotion: 'notGood' as EmotionType, label: 'Sad', color: '#8B5CF6' },
    frustrated: { emotion: 'overwhelmed' as EmotionType, label: 'Frustrated', color: '#EF4444' },
    anxious: { emotion: 'overwhelmed' as EmotionType, label: 'Anxious', color: '#F59E0B' },
    overwhelmed: { emotion: 'overwhelmed' as EmotionType, label: 'Overwhelmed', color: '#6D28D9' },
  }), []);

  const currentMoodKey = currentMood?.toLowerCase() || 'overwhelmed';
  const moodInfo = moodMap[currentMoodKey as keyof typeof moodMap] || { emotion: 'good' as EmotionType, label: currentMood, color: colors.brand.primary };

  return (
    <View style={styles.container}>
      {/* 1. Welcoming Branding Hero (Branding Logo Removed) */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.heroContainer}>
        <Text style={[styles.greeting, { color: colors.text.primary }]}>
          {getGreeting(userName)}
        </Text>
        <Text style={[styles.tagline, { color: colors.text.secondary }]}>
          You don't have to carry today alone.
        </Text>
      </Animated.View>

      {/* 2. Your Last Check-in */}
      <LastCheckInCard
        moodInfo={moodInfo}
        previousSessionAt={sessionContext?.previousSessionAt ?? null}
        focus={sessionContext?.previousSessionFocus ?? null}
      />

      {/* 3. What's been on your mind today? Chips Section */}
      <Animated.View entering={FadeInUp.duration(450).delay(250)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>What's been on your mind today?</Text>
        <View style={styles.chipRow}>
          {topicChips.map((chip) => {
            const Icon = chip.icon;
            const isSelected = selectedChip === chip.label;
            return (
              <Pressable
                key={chip.label}
                onPress={() => handleChipSelect(chip)}
                style={styles.chipPressable}
                accessibilityRole="button"
                accessibilityLabel={chip.label}
                accessibilityState={{ selected: isSelected }}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.chipButton,
                    {
                      backgroundColor: isSelected
                        ? colors.brand.primary
                        : pressed
                          ? colors.brand.primary + '18'
                          : colors.surface.primary,
                      borderColor: isSelected ? colors.brand.primary : colors.border.default,
                    }
                  ]}>
                    <Icon size={16} color={isSelected ? colors.brand.contrastText : colors.brand.primary} style={styles.chipIcon} />
                    <Text style={[styles.chipLabel, { color: isSelected ? colors.brand.contrastText : colors.text.primary }]}>{chip.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* 4. Quick Prompts Section (Styled as Card Chips) */}
      <Animated.View entering={FadeInUp.duration(450).delay(350)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Quick conversation starters</Text>
        <View style={styles.promptsGrid}>
          {quickPrompts.map((prompt, index) => {
            const Icon = prompt.icon;
            return (
              <Animated.View
                key={prompt.label}
                entering={FadeInUp.duration(400).delay(400 + index * 60)}
                style={styles.promptCell}
              >
                <Pressable
                  onPress={() => handleStarterSelect(prompt.label)}
                  style={styles.pressableContainer}
                  accessibilityRole="button"
                  accessibilityLabel={prompt.label}
                >
                  {({ pressed }) => (
                    <View style={[
                      styles.promptCard,
                      {
                        backgroundColor: pressed ? colors.brand.primary + '10' : colors.surface.primary,
                        borderColor: pressed ? colors.brand.primary + '30' : colors.border.default,
                      }
                    ]}>
                      <View style={styles.promptCardTop}>
                        <View style={[styles.promptIconCircle, { backgroundColor: colors.brand.primary + '14' }]}>
                          <Icon size={16} color={colors.brand.primary} />
                        </View>
                        <ChevronRight size={15} color={colors.text.tertiary} />
                      </View>
                      <Text
                        style={[styles.promptText, { color: colors.text.primary }]}
                        numberOfLines={2}
                      >
                        {prompt.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      {/* 5. Shortcuts: Breathing & Resume last session (Upgraded to prominent full-width card widgets) */}
      <Animated.View entering={FadeInUp.duration(450).delay(450)} style={styles.shortcutContainer}>
        <Pressable
          onPress={() => handleStarterSelect("Let's do a breathing exercise")}
          style={styles.pressableContainer}
          accessibilityRole="button"
        >
          {({ pressed }) => (
            <View style={[
              styles.breathingSpaceCard,
              {
                backgroundColor: pressed ? colors.brand.primary + '18' : colors.brand.primary + '0A',
                borderColor: colors.brand.primary + '25',
              }
            ]}>
              <View style={styles.breathingLeft}>
                <View style={[styles.breathingIconCircle, { backgroundColor: colors.surface.primary }]} />
                <View style={styles.breathingMeta}>
                  <Text style={[styles.breathingTitle, { color: colors.text.primary }]}>Breathing Space</Text>
                  <Text style={[styles.breathingSubtitle, { color: colors.text.secondary }]}>A quick 2-minute exercise to calm your racing thoughts</Text>
                </View>
              </View>
              <View style={[styles.startPill, { backgroundColor: colors.brand.primary }]}>
                <Text style={[styles.startText, { color: colors.brand.contrastText }]}>Start</Text>
              </View>
            </View>
          )}
        </Pressable>

        {hasPreviousSession && onResumeLastConversation && (
          <Pressable
            onPress={handleResumePress}
            style={[styles.pressableContainer, { marginTop: spacing.md }]}
            accessibilityRole="button"
          >
            {({ pressed }) => (
              <View style={[
                styles.resumeCard,
                {
                  backgroundColor: pressed ? colors.background.secondary : colors.surface.primary,
                  borderColor: colors.border.default,
                }
              ]}>
                <View style={styles.resumeLeft}>
                  <View style={[styles.resumeIconCircle, { backgroundColor: colors.background.secondary }]}>
                    <RefreshCw size={16} color={colors.brand.primary} />
                  </View>
                  <View style={styles.resumeMeta}>
                    <Text style={[styles.resumeTitle, { color: colors.text.primary }]}>Resume Last Conversation</Text>
                    <Text style={[styles.resumeSubtitle, { color: colors.text.secondary }]}>Pick up where you left off with Velness</Text>
                  </View>
                </View>
                <ChevronRight size={18} color={colors.text.secondary} />
              </View>
            )}
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing['6xl'],
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl + spacing.sm,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  lastCheckInCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  checkInHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  checkInHeaderDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkInBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkInMood: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInMoodAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkInMoodCaption: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkInMoodValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  checkInFocus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  checkInFocusLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginRight: spacing.sm,
  },
  checkInFocusValue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
    opacity: 0.85,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pressableContainer: {
    width: '100%',
  },
  chipPressable: {
    alignSelf: 'flex-start',
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
    alignSelf: 'flex-start',
  },
  chipIcon: {
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  promptsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  promptCell: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  promptCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 92,
    justifyContent: 'space-between',
  },
  promptCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  promptIconCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  shortcutContainer: {
    width: '100%',
  },
  breathingSpaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    width: '100%',
  },
  breathingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  breathingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  breathingMeta: {
    flex: 1,
  },
  breathingTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  breathingSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },
  startPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  startText: {
    fontSize: 12,
    fontWeight: '700',
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md + 2,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  resumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  resumeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  resumeMeta: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  resumeSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },
});

export default EmptyConversation;
