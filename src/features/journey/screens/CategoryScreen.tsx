import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Brain, Wind, Sparkles, Leaf, BookOpen, Clock, ChevronRight, Play, Award, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { spacing, borderRadius } from '@/core/theme';
import { DIFFICULTY } from '@/features/journey/constants';
import { filterProgramsByCategory } from '@/features/journey/services/JourneyService';

function getCategoryIcon(type: string, color: string, size = 24) {
  switch (type) {
    case 'brain': return <Brain size={size} color={color} />;
    case 'wind': return <Wind size={size} color={color} />;
    case 'sparkles': return <Sparkles size={size} color={color} />;
    case 'leaf': return <Leaf size={size} color={color} />;
    default: return <Sparkles size={size} color={color} />;
  }
}

export function CategoryScreen() {
  const { colors } = useTheme();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { programs, categories, userProgress, isLoading } = useJourney();

  const category = useMemo(() => categories.find(c => c.id === categoryId), [categories, categoryId]);

  const categoryPrograms = useMemo(() => {
    return filterProgramsByCategory(programs, categoryId || '');
  }, [programs, categoryId]);

  // ─── Program Sub-Groups ───────────────────────────────────────────

  // 1. Continue Program (Active & between 0% and 100%)
  const continueProgram = useMemo(() => {
    return categoryPrograms.find(p => {
      const progProg = userProgress?.programProgress[p.id];
      return progProg && progProg.completionPercent > 0 && progProg.completionPercent < 100;
    });
  }, [categoryPrograms, userProgress]);

  // 2. Featured Program (First program in catalog that is not the active continue program)
  const featuredProgram = useMemo(() => {
    const candidates = categoryPrograms.filter(p => p.id !== continueProgram?.id);
    return candidates[0] || null;
  }, [categoryPrograms, continueProgram]);

  // 3. Beginner Programs (Excluding continue and featured)
  const beginnerPrograms = useMemo(() => {
    return categoryPrograms.filter(
      p => p.difficulty === DIFFICULTY.BEGINNER &&
      p.id !== continueProgram?.id &&
      p.id !== featuredProgram?.id
    );
  }, [categoryPrograms, continueProgram, featuredProgram]);

  // 4. Recommended Programs (Excluding continue and featured)
  const recommendedPrograms = useMemo(() => {
    return categoryPrograms.filter(
      p => p.id !== continueProgram?.id &&
      p.id !== featuredProgram?.id
    );
  }, [categoryPrograms, continueProgram, featuredProgram]);

  // 5. Recently Completed (Completed program in this category)
  const recentlyCompleted = useMemo(() => {
    return categoryPrograms.filter(p => {
      const progProg = userProgress?.programProgress[p.id];
      return progProg && progProg.completionPercent === 100;
    });
  }, [categoryPrograms, userProgress]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case DIFFICULTY.BEGINNER: return colors.success;
      case DIFFICULTY.INTERMEDIATE: return colors.warning;
      case DIFFICULTY.ADVANCED: return colors.danger;
      default: return colors.text.secondary;
    }
  };

  const handleProgramPress = (programId: string) => {
    router.push(buildRoute(ROUTES.JOURNEY.PROGRAM, { programId }) as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  const hasNoPrograms = categoryPrograms.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {category?.title || 'Catalog'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Hero */}
        {category && (
          <View style={styles.categoryHero}>
            <View style={[styles.categoryIconLarge, { backgroundColor: `${category.accentColor}15` }]}>
              {getCategoryIcon(category.iconType, category.accentColor, 32)}
            </View>
            <Text style={[styles.categoryDescription, { color: colors.text.secondary }]}>
              {category.description}
            </Text>
          </View>
        )}

        {hasNoPrograms ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No programs in this category yet.</Text>
          </View>
        ) : (
          <View style={styles.catalogSections}>
            
            {/* 1. Continue Program */}
            {continueProgram && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Continue Practice</Text>
                <Pressable
                  style={[styles.continueCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
                  onPress={() => handleProgramPress(continueProgram.id)}
                  accessibilityRole="button"
                >
                  <View style={styles.continueCardHeader}>
                    <View style={styles.continueTitleGroup}>
                      <Text style={[styles.continueTag, { color: category?.accentColor || colors.brand.primary }]}>ACTIVE PROGRAM</Text>
                      <Text style={[styles.programTitle, { color: colors.text.primary }]}>{continueProgram.title}</Text>
                    </View>
                    <Pressable
                      style={[styles.resumeButton, { backgroundColor: category?.accentColor || colors.brand.primary }]}
                      onPress={() => handleProgramPress(continueProgram.id)}
                    >
                      <Play size={14} color="#FFF" fill="#FFF" />
                      <Text style={styles.resumeButtonText}>Resume</Text>
                    </Pressable>
                  </View>

                  <Text style={[styles.programDescriptionText, { color: colors.text.secondary }]} numberOfLines={2}>
                    {continueProgram.description}
                  </Text>

                  <View style={styles.continueProgress}>
                    <View style={styles.progressTextRow}>
                      <Text style={[styles.progressTextLabel, { color: colors.text.secondary }]}>Overall Progress</Text>
                      <Text style={[styles.progressPercentLabel, { color: colors.text.primary }]}>
                        {userProgress?.programProgress[continueProgram.id]?.completionPercent ?? 0}%
                      </Text>
                    </View>
                    <ProgressBar 
                      percent={userProgress?.programProgress[continueProgram.id]?.completionPercent ?? 0} 
                      height={6} 
                      color={category?.accentColor || colors.brand.primary} 
                      trackColor={colors.border.default} 
                    />
                  </View>
                </Pressable>
              </View>
            )}

            {/* 2. Featured Program */}
            {featuredProgram && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Featured Program</Text>
                <Pressable
                  style={[
                    styles.featuredCard, 
                    { 
                      backgroundColor: colors.surface.primary, 
                      borderColor: colors.border.default,
                      borderLeftColor: category?.accentColor || colors.brand.primary,
                      borderLeftWidth: 4
                    }
                  ]}
                  onPress={() => handleProgramPress(featuredProgram.id)}
                  accessibilityRole="button"
                >
                  <View style={styles.featuredBadge}>
                    <Sparkles size={12} color="#FFF" fill="#FFF" />
                    <Text style={styles.featuredBadgeText}>RECOMMENDED FOCUS</Text>
                  </View>
                  <Text style={[styles.featuredProgramTitle, { color: colors.text.primary }]}>{featuredProgram.title}</Text>
                  <Text style={[styles.programDescriptionText, { color: colors.text.secondary }]}>
                    {featuredProgram.description}
                  </Text>

                  {/* Program Benefits */}
                  {featuredProgram.benefits && featuredProgram.benefits.length > 0 && (
                    <View style={styles.benefitsContainer}>
                      {featuredProgram.benefits.map((benefit, bIdx) => (
                        <View key={bIdx} style={styles.benefitRow}>
                          <Text style={[styles.benefitDot, { color: category?.accentColor || colors.brand.primary }]}>•</Text>
                          <Text style={[styles.benefitText, { color: colors.text.secondary }]}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.featuredFooter}>
                    <View style={styles.metaRow}>
                      <Clock size={14} color={colors.text.secondary} />
                      <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                        {featuredProgram.estimatedTime || `${featuredProgram.duration} min`}
                      </Text>
                      <Text style={[styles.metaSeparator, { color: colors.border.default }]}>|</Text>
                      <BookOpen size={14} color={colors.text.secondary} />
                      <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                        {featuredProgram.lessonCount} lessons
                      </Text>
                    </View>
                    <Pressable 
                      style={[styles.startButtonCompact, { backgroundColor: `${category?.accentColor || colors.brand.primary}15` }]}
                      onPress={() => handleProgramPress(featuredProgram.id)}
                    >
                      <Text style={[styles.startButtonCompactText, { color: category?.accentColor || colors.brand.primary }]}>Start</Text>
                      <ChevronRight size={14} color={category?.accentColor || colors.brand.primary} />
                    </Pressable>
                  </View>
                </Pressable>
              </View>
            )}

            {/* 3. Beginner Programs */}
            {beginnerPrograms.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Beginner Friendly</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {beginnerPrograms.map((program) => (
                    <Pressable
                      key={program.id}
                      style={[styles.horizontalCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
                      onPress={() => handleProgramPress(program.id)}
                    >
                      <View style={[styles.difficultyIndicator, { backgroundColor: `${getDifficultyColor(program.difficulty)}15` }]}>
                        <Text style={[styles.difficultyIndicatorText, { color: getDifficultyColor(program.difficulty) }]}>
                          {program.difficulty}
                        </Text>
                      </View>
                      <Text style={[styles.cardProgramTitle, { color: colors.text.primary }]} numberOfLines={1}>{program.title}</Text>
                      <Text style={[styles.cardDescriptionText, { color: colors.text.secondary }]} numberOfLines={2}>
                        {program.description}
                      </Text>
                      <View style={styles.cardFooter}>
                        <Clock size={12} color={colors.text.secondary} />
                        <Text style={[styles.cardFooterText, { color: colors.text.secondary }]}>
                          {program.estimatedTime || `${program.duration}m`}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 4. Recommended Programs */}
            {recommendedPrograms.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Explore All Programs</Text>
                <View style={styles.verticalList}>
                  {recommendedPrograms.map((program) => (
                    <Pressable
                      key={program.id}
                      style={[styles.programListItem, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
                      onPress={() => handleProgramPress(program.id)}
                      accessibilityRole="button"
                    >
                      <View style={styles.listItemInfo}>
                        <View style={styles.listItemHeaderRow}>
                          <Text style={[styles.listItemTitle, { color: colors.text.primary }]}>{program.title}</Text>
                          <View style={[styles.smallBadge, { backgroundColor: `${getDifficultyColor(program.difficulty)}12` }]}>
                            <Text style={[styles.smallBadgeText, { color: getDifficultyColor(program.difficulty) }]}>
                              {program.difficulty}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.listItemDesc, { color: colors.text.secondary }]} numberOfLines={1}>
                          {program.description}
                        </Text>
                        <View style={styles.listItemMeta}>
                          <Clock size={12} color={colors.text.secondary} />
                          <Text style={[styles.listItemMetaText, { color: colors.text.secondary }]}>{program.estimatedTime || `${program.duration}m`}</Text>
                          <Text style={[styles.metaSeparator, { color: colors.border.default }]}>•</Text>
                          <BookOpen size={12} color={colors.text.secondary} />
                          <Text style={[styles.listItemMetaText, { color: colors.text.secondary }]}>{program.lessonCount} lessons</Text>
                        </View>
                      </View>
                      <ChevronRight size={18} color={colors.text.secondary} />
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* 5. Recently Completed */}
            {recentlyCompleted.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Completed practices</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {recentlyCompleted.map((program) => (
                    <Pressable
                      key={program.id}
                      style={[styles.horizontalCardCompleted, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
                      onPress={() => handleProgramPress(program.id)}
                    >
                      <View style={styles.completedBadgeRow}>
                        <CheckCircle size={16} color={colors.success} />
                        <Text style={[styles.completedTextTag, { color: colors.success }]}>COMPLETED</Text>
                      </View>
                      <Text style={[styles.cardProgramTitle, { color: colors.text.primary }]} numberOfLines={1}>{program.title}</Text>
                      <View style={styles.completionCertificate}>
                        <Award size={18} color={colors.warning} />
                        <Text style={[styles.certificateText, { color: colors.text.secondary }]}>Well Done!</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

          </View>
        )}
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSpacer: { width: 32 },
  scrollContent: { paddingBottom: spacing['5xl'], paddingHorizontal: spacing.xl },
  categoryHero: { alignItems: 'center', paddingVertical: spacing.lg, marginBottom: spacing.md },
  categoryIconLarge: { width: 64, height: 64, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  categoryDescription: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.xl },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyText: { fontSize: 15, textAlign: 'center' },
  catalogSections: { gap: spacing['2xl'] },
  section: {},
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, letterSpacing: -0.2 },
  
  // Continue Card
  continueCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  continueCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueTitleGroup: { flex: 1, gap: 2 },
  continueTag: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  programTitle: { fontSize: 18, fontWeight: '600' },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  resumeButtonText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  programDescriptionText: { fontSize: 13, lineHeight: 18 },
  continueProgress: { gap: spacing.xs },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTextLabel: { fontSize: 11, fontWeight: '500' },
  progressPercentLabel: { fontSize: 12, fontWeight: '700' },

  // Featured Card
  featuredCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: '#3B82F6',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginBottom: 4,
  },
  featuredBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  featuredProgramTitle: { fontSize: 18, fontWeight: '700' },
  benefitsContainer: { gap: spacing.xs, marginVertical: spacing.xs },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  benefitDot: { fontSize: 16, lineHeight: 16 },
  benefitText: { fontSize: 12 },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { fontSize: 12 },
  metaSeparator: { fontSize: 12 },
  startButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  startButtonCompactText: { fontSize: 13, fontWeight: '600' },

  // Horizontal Card
  horizontalList: { gap: spacing.md, paddingRight: spacing.xl },
  horizontalCard: {
    width: 200,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  difficultyIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  difficultyIndicatorText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardProgramTitle: { fontSize: 14, fontWeight: '600' },
  cardDescriptionText: { fontSize: 12, lineHeight: 16, height: 32 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  cardFooterText: { fontSize: 11 },

  // Horizontal Card Completed
  horizontalCardCompleted: {
    width: 180,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
  },
  completedBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  completedTextTag: { fontSize: 10, fontWeight: '700' },
  completionCertificate: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
  certificateText: { fontSize: 12, fontWeight: '600' },

  // Vertical List
  verticalList: { gap: spacing.sm },
  programListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  listItemInfo: { flex: 1, gap: 4 },
  listItemHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  listItemTitle: { fontSize: 15, fontWeight: '600' },
  smallBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  smallBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  listItemDesc: { fontSize: 12 },
  listItemMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  listItemMetaText: { fontSize: 11 },
});

export default CategoryScreen;
