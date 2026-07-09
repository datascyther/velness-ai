import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { BrainIcon } from '@/shared/components/SymbolIcons';

export function JourneyPlaceholderScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]} edges={['top']}>
      <View style={styles.container}>
        <BrainIcon size={48} />
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Journey In Progress
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          This lesson is currently under development.{'\n'}
          You'll automatically resume here once it's available.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: colors.brand.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.buttonText, { color: colors.brand.contrastText }]}>
            Back
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
