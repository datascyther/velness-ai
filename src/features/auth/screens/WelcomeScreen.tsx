import React, { useCallback } from 'react';
import { View, Text, Dimensions, Image, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Svg, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { User } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/core/store/useAppStore';
import { authService } from '@/services/auth';
import { analyticsService } from '@/services/analytics';
import { spacing, typography, borderRadius } from '@/theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function WelcomeScreen() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const setEmailVerified = useAppStore((state) => state.setEmailVerified);
  const setOnboardingCompleted = useAppStore((state) => state.setOnboardingCompleted);
  
  const { colors: themeColors, theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSignIn = useCallback(() => {
    analyticsService.trackEvent('login_attempt', { action: 'welcome_login' });
    router.push('/auth/login');
  }, [router]);

  const handleSignUp = useCallback(() => {
    analyticsService.trackEvent('login_attempt', { action: 'welcome_signup' });
    router.push('/auth/signup');
  }, [router]);

  const handleGuestMode = useCallback(async () => {
    analyticsService.trackEvent('login_attempt', { action: 'welcome_guest' });

    const guestProfile = await authService.signInAsGuest();
    setUser(guestProfile);
    setEmailVerified(true);
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  }, [setUser, setEmailVerified, setOnboardingCompleted, router]);

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background.primary }}>
      {/* Premium Radial Background */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          <Defs>
            <RadialGradient
              id="bgGlow"
              cx="50%"
              cy="28%"
              rx="85%"
              ry="68%"
            >
              <Stop offset="0%" stopColor={isDark ? "#A5B4FC" : "#E0E7FF"} stopOpacity={isDark ? 0.25 : 0.45} />
              <Stop offset="35%" stopColor={isDark ? "#4F46E5" : "#6366F1"} stopOpacity={isDark ? 0.18 : 0.25} />
              <Stop offset="70%" stopColor={isDark ? "#1E1B4B" : "#F8FAFC"} stopOpacity={isDark ? 0.9 : 1} />
              <Stop offset="100%" stopColor={isDark ? "#0F172A" : "#F1F5F9"} stopOpacity={1} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#bgGlow)" />
        </Svg>
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Top Branding */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.topBrand}>
            <Image
              source={require('@/shared/assets/velness-logo.jpg')}
              style={styles.smallLogo}
            />
            <Text style={[typography.titleLarge, { color: themeColors.text.primary, fontWeight: '700' }]}>
              Velness
            </Text>
          </Animated.View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Animated.View entering={FadeInDown.delay(100).duration(800).springify()}>
              <Text style={[styles.welcomeText, { color: themeColors.text.primary }]}>Welcome!</Text>
              <Text style={[styles.subtitle, { color: themeColors.text.secondary }]}>
                Your personal AI wellness companion
              </Text>
            </Animated.View>

            {/* Premium Logo Container */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(1000).springify()}
              style={styles.logoContainer}
            >
              <View style={[styles.glowRing, { backgroundColor: themeColors.surface.primary }]}>
                <Image
                  source={require('@/shared/assets/velness-logo.jpg')}
                  style={styles.mainLogo}
                />
              </View>
            </Animated.View>
          </View>

          {/* Actions */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(800).springify()}
            style={styles.actionContainer}
          >
            <Pressable style={styles.primaryButton} onPress={handleSignIn}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleSignUp}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </Pressable>

            <View style={styles.guestWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.guestButton,
                  pressed && styles.guestButtonPressed,
                ]}
                onPress={handleGuestMode}
                accessibilityRole="button"
                accessibilityLabel="Continue as Guest"
              >
                <User color={themeColors.text.primary} size={18} strokeWidth={2.2} />
                <Text style={[styles.guestButtonText, { color: themeColors.text.primary }]}>
                  Continue as Guest
                </Text>
              </Pressable>
              <Text style={[styles.guestHint, { color: themeColors.text.secondary }]}>
                No account needed — start exploring instantly
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  smallLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 280,
    opacity: 0.85,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    width: 148,
    height: 148,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 25,
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.2)',
  },
  mainLogo: {
    width: 118,
    height: 118,
    resizeMode: 'contain',
    borderRadius: 24,
  },
  actionContainer: {
    gap: 14,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    height: 58,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    height: 58,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#6366F1',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  guestWrapper: {
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    backgroundColor: 'rgba(99, 102, 241, 0.07)',
    paddingHorizontal: 28,
  },
  guestButtonPressed: {
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
  },
  guestButtonText: {
    fontSize: 16.5,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  guestHint: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default WelcomeScreen;