import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Brain, Wind, Sparkles, Leaf } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { spacing, borderRadius } from '@/core/theme';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { sortPrograms, filterProgramsByCategory } from '@/features/journey/services/JourneyService';
import type { Category } from '@/features/journey/models';

function getCategoryIcon(type: string, color: string) {
  const size = 20;
  switch (type) {
    case 'brain': return <Brain size={size} color={color} />;
    case 'wind': return <Wind size={size} color={color} />;
    case 'sparkles': return <Sparkles size={size} color={color} />;
    case 'leaf': return <Leaf size={size} color={color} />;
    default: return <Sparkles size={size} color={color} />;
  }
}

export function LibraryScreen() {
  const { colors } = useTheme();
  const { programs, categories, userProgress, isLoading } = useJourney();

  const grouped = useMemo(() => {
    const sorted = sortPrograms(programs, userProgress || { userId: '', totalExercisesCompleted: 0, streakDays: 0, lastActivityAt: null, programProgress: {} });
    const map: Record<string, { category: Category; programs: typeof programs }> = {};
    for (const cat of categories) {
      const catPrograms = sorted.filter(p => p.categoryId === cat.id);
      if (catPrograms.length > 0) {
        map[cat.id] = { category: cat, programs: catPrograms };
      }
    }
    return Object.values(map);
  }, [programs, categories, userProgress]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Library</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {grouped.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No programs available yet.</Text>
          </View>
        ) : (
          grouped.map(({ category, programs: catPrograms }) => (
            <View key={category.id} style={styles.section}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.accentColor}20` }]}>
                  {getCategoryIcon(category.iconType, category.accentColor)}
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryTitle, { color: colors.text.primary }]}>{category.title}</Text>
                  <Text style={[styles.categoryDescription, { color: colors.text.secondary }]}>{category.description}</Text>
                </View>
              </View>
              {catPrograms.map((program) => {
                const progProg = userProgress?.programProgress[program.id];
                const percent = progProg?.completionPercent ?? 0;
                return (
                  <Pressable
                    key={program.id}
                    style={[styles.programCard, { backgroundColor: colors.surface.primary, borderColor: colors.border.default }]}
                    onPress={() => router.push(buildRoute(ROUTES.JOURNEY.PROGRAM, { programId: program.id }) as any)}
                    accessibilityRole="button"
                  >
                    <View style={styles.programInfo}>
                      <Text style={[styles.programTitle, { color: colors.text.primary }]}>{program.title}</Text>
                      <Text style={[styles.programMeta, { color: colors.text.secondary }]}>
                        {program.difficulty} · {program.duration} min
                      </Text>
                      {percent > 0 && (
                        <View style={styles.programProgress}>
                          <ProgressBar percent={percent} height={4} color={colors.brand.primary} trackColor={colors.border.default} />
                          <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>{percent}%</Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.viewButton, { backgroundColor: colors.brand.primary }]}>
                      <Text style={[styles.viewButtonText, { color: colors.brand.contrastText }]}>View</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyText: { fontSize: 15, textAlign: 'center' },
  section: { marginTop: spacing['2xl'] },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  categoryIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 17, fontWeight: '700' },
  categoryDescription: { fontSize: 13, marginTop: 2 },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  programInfo: { flex: 1 },
  programTitle: { fontSize: 15, fontWeight: '600' },
  programMeta: { fontSize: 12, marginTop: 2 },
  programProgress: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  progressLabel: { fontSize: 11, fontWeight: '500', width: 32, textAlign: 'right' },
  viewButton: { borderRadius: borderRadius.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, marginLeft: spacing.md },
  viewButtonText: { fontSize: 13, fontWeight: '600' },
});

export default LibraryScreen;
