import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Heart, Wind, Sparkles, Moon, Briefcase, Users, GraduationCap, RefreshCw, ChevronRight } from 'lucide-react-native';
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

  const userName = user?.name || 'NK';
  const currentMood = sessionContext?.mood || sessionContext?.previousSessionMood || 'Overwhelmed';
  const reflectionStreak = sessionContext?.streak || user?.stats?.streakDays || 0;
  const hasPreviousSession = !!sessionContext?.previousSessionAt;

  const handleStarterSelect = useCallback((text: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onQuickStarterSelect?.(text);
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
    { label: "I can't focus", icon: Sparkles },
    { label: "Help me calm down", icon: Wind },
    { label: "Reflect on today", icon: Sparkles },
    { label: "Sleep support", icon: Moon },
  ], []);

  // Mood lookup map
  const moodMap = useMemo(() => ({
    great: { emoji: '😊', label: 'Great', color: '#10B981' },
    calm: { emoji: '😌', label: 'Calm', color: '#3B82F6' },
    sad: { emoji: '😔', label: 'Sad', color: '#8B5CF6' },
    frustrated: { emoji: '😤', label: 'Frustrated', color: '#EF4444' },
    anxious: { emoji: '😰', label: 'Anxious', color: '#F59E0B' },
    overwhelmed: { emoji: '🤯', label: 'Overwhelmed', color: '#6D28D9' },
  }), []);

  const currentMoodKey = currentMood?.toLowerCase() || 'overwhelmed';
  const moodInfo = moodMap[currentMoodKey as keyof typeof moodMap] || { emoji: '😊', label: currentMood, color: colors.brand.primary };

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

      {/* 2. Your Last Check-in Dashboard Card */}
      <Animated.View entering={FadeInUp.duration(450).delay(150)} style={[styles.dashboardCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text.secondary }]}>😊 YOUR LAST CHECK-IN</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.statColumn}>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Mood</Text>
            <View style={[styles.moodTag, { backgroundColor: moodInfo.color + '10' }]}>
              <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
              <Text style={[styles.moodValue, { color: moodInfo.color }]}>
                {moodInfo.label}
              </Text>
            </View>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border.default }]} />
          <View style={styles.statColumn}>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Streak</Text>
            <Text style={[styles.streakValue, { color: colors.text.primary }]}>
              🔥 {reflectionStreak} days
            </Text>
            <Text style={[styles.streakSub, { color: colors.text.secondary }]}>Reflection streak</Text>
          </View>
        </View>
      </Animated.View>

      {/* 3. What's been on your mind today? Chips Section */}
      <Animated.View entering={FadeInUp.duration(450).delay(250)} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>What's been on your mind today?</Text>
        <View style={styles.chipRow}>
          {topicChips.map((chip) => {
            const Icon = chip.icon;
            return (
              <Pressable
                key={chip.label}
                onPress={() => handleStarterSelect(chip.text)}
                style={styles.chipPressable}
                accessibilityRole="button"
                accessibilityLabel={chip.label}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.chipButton,
                    {
                      backgroundColor: pressed ? colors.background.secondary : colors.surface.primary,
                      borderColor: colors.border.default,
                    }
                  ]}>
                    <Icon size={14} color={colors.brand.primary} style={styles.chipIcon} />
                    <Text style={[styles.chipLabel, { color: colors.text.primary }]}>{chip.label}</Text>
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
          {quickPrompts.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <Pressable
                key={prompt.label}
                onPress={() => handleStarterSelect(prompt.label)}
                style={styles.pressableContainer}
                accessibilityRole="button"
                accessibilityLabel={prompt.label}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.promptCard,
                    {
                      backgroundColor: pressed ? colors.background.secondary : colors.surface.primary,
                      borderColor: colors.border.default,
                    }
                  ]}>
                    <View style={[styles.promptIconCircle, { backgroundColor: colors.background.secondary }]}>
                      <Icon size={16} color={colors.brand.primary} />
                    </View>
                    <Text style={[styles.promptText, { color: colors.text.primary }]}>
                      {prompt.label}
                    </Text>
                    <ChevronRight size={16} color={colors.text.secondary} style={styles.promptArrow} />
                  </View>
                )}
              </Pressable>
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
                <View style={[styles.breathingIconCircle, { backgroundColor: colors.surface.primary }]}>
                  <Text style={styles.breathingEmoji}>🫁</Text>
                </View>
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
                    <Text style={[styles.resumeSubtitle, { color: colors.text.secondary }]}>Pick up where you left off with Neeva</Text>
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
    marginTop: spacing.sm,
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
  dashboardCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 48,
    marginHorizontal: spacing.md,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: spacing.xs,
  },
  moodTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 15,
  },
  moodValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  streakValue: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  streakSub: {
    fontSize: 11,
    fontWeight: '400',
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
    gap: spacing.sm,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  promptIconCircle: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  promptText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  promptArrow: {
    marginLeft: spacing.sm,
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
  breathingEmoji: {
    fontSize: 18,
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
