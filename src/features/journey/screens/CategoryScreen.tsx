import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Brain, Wind, Sparkles, Leaf } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useJourney } from '@/shared/hooks/useJourney';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ROUTES, buildRoute } from '@/core/config/routes';
import { spacing, borderRadius } from '@/core/theme';
import { filterProgramsByCategory } from '@/features/journey/services/JourneyService';

function getCategoryIcon(type: string, color: string) {
  const size = 24;
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

  const filteredPrograms = useMemo(() => {
    const all = userProgress ? programs : programs;
    return filterProgramsByCategory(all, categoryId || '');
  }, [programs, categoryId]);

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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {category?.title || 'Category'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {category && (
          <View style={styles.categoryHero}>
            <View style={[styles.categoryIconLarge, { backgroundColor: `${category.accentColor}20` }]}>
              {getCategoryIcon(category.iconType, category.accentColor)}
            </View>
            <Text style={[styles.categoryDescription, { color: colors.text.secondary }]}>
              {category.description}
            </Text>
          </View>
        )}

        {filteredPrograms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No programs in this category yet.</Text>
          </View>
        ) : (
          <View style={styles.programsList}>
            {filteredPrograms.map((program) => {
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
                      {program.difficulty} · {program.lessonCount} lessons · {program.duration} min
                    </Text>
                    {percent > 0 && (
                      <View style={styles.progressRow}>
                        <ProgressBar percent={percent} height={4} color={colors.brand.primary} trackColor={colors.border.default} />
                        <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>{percent}%</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.chevron, { color: colors.text.secondary }]}>›</Text>
                </Pressable>
              );
            })}
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
  categoryHero: { alignItems: 'center', paddingVertical: spacing.xl },
  categoryIconLarge: { width: 64, height: 64, borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  categoryDescription: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.xl },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyText: { fontSize: 15, textAlign: 'center' },
  programsList: { marginTop: spacing.lg },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  programInfo: { flex: 1 },
  programTitle: { fontSize: 16, fontWeight: '600' },
  programMeta: { fontSize: 12, marginTop: 3 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm },
  progressLabel: { fontSize: 11, fontWeight: '500', width: 32, textAlign: 'right' },
  chevron: { fontSize: 24, marginLeft: spacing.sm },
});

export default CategoryScreen;
