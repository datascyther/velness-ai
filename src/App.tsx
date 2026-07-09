import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MessageSquare, LogOut } from 'lucide-react';
import { ImHome } from '@react-icons/all-files/im/ImHome';
import { useAppStore } from '@/core/store/useAppStore';
import { useTheme } from '@/hooks/useTheme';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import SignupScreen from '@/features/auth/screens/SignupScreen';
import ForgotPasswordScreen from '@/features/auth/screens/ForgotPasswordScreen';
import EmailVerificationScreen from '@/features/auth/screens/EmailVerificationScreen';
import OnboardingFlow from '@/features/onboarding/screens/OnboardingFlow';
import { ToastContainer } from '@/shared/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';

function AppContent() {
  const initialize = useAppStore((state) => state.initialize);
  const session = useAppStore((state) => state.session);
  const currentTab = useAppStore((state) => state.ui.currentTab);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const logout = useAppStore((state) => state.logout);
  const { colors } = useTheme();

  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle Supabase OAuth callback hash (access_token in URL fragment)
  const isOAuthCallback = hash.startsWith('#access_token=') || hash.startsWith('#error=');

  // Show loading screen while store is initializing or during OAuth callback processing
  if (!session.initialized || isOAuthCallback) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center">
        <Text className="text-text-primary text-lg font-semibold animate-pulse">
          {isOAuthCallback ? 'Completing sign in...' : 'Loading Velness...'}
        </Text>
      </View>
    );
  }

  // Auth routing logic
  if (!session.isAuthenticated) {
    if (hash === '#/auth/signup') {
      return <SignupScreen />;
    }
    if (hash === '#/auth/forgot-password') {
      return <ForgotPasswordScreen />;
    }
    if (hash === '#/auth/email-verification') {
      return <EmailVerificationScreen />;
    }
    return <LoginScreen />;
  }

  // Onboarding check
  if (!session.onboardingCompleted || hash === '#/onboarding') {
    return <OnboardingFlow />;
  }

  // Main Authenticated Dashboard Layout
  const renderTabContent = () => {
    switch (currentTab) {
      case 'chat':
        return <ChatScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View className="flex-1 flex-row h-screen w-full bg-background-primary text-text-primary overflow-hidden">
      {/* Sidebar Navigation */}
      <View className="w-[260px] h-full bg-surface-primary border-r border-border-default/50 flex flex-col justify-between py-8 px-5">
        <View className="space-y-8">
          {/* Header/Logo */}
          <View className="flex-row items-center gap-3 px-3 mb-6">
            <View className="w-9 h-9 rounded-xl bg-brand-primary items-center justify-center">
              <Text className="text-white font-bold text-lg">N</Text>
            </View>
            <Text className="text-text-primary font-bold text-xl font-display">
              Velness
            </Text>
          </View>

          {/* Navigation Items */}
          <View className="gap-1.5">
            <Pressable
              onPress={() => {
                setCurrentTab('home');
                window.location.hash = '#/home';
              }}
              className={`flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${
                currentTab === 'home'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-secondary hover:bg-surface-secondary/70 hover:text-text-primary'
              }`}
            >
              <ImHome size={20} color={currentTab === 'home' ? colors.brand.primary : colors.text.secondary} />
              <Text className={`font-semibold text-sm ${
                currentTab === 'home' ? 'text-brand-primary' : 'text-text-secondary'
              }`}>
                Home
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setCurrentTab('chat');
                window.location.hash = '#/chat';
              }}
              className={`flex-row items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all ${
                currentTab === 'chat'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-text-secondary hover:bg-surface-secondary/70 hover:text-text-primary'
              }`}
            >
              <MessageSquare size={20} color={currentTab === 'chat' ? colors.brand.primary : colors.text.secondary} />
              <Text className={`font-semibold text-sm ${
                currentTab === 'chat' ? 'text-brand-primary' : 'text-text-secondary'
              }`}>
                Velness Chat
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer Actions */}
        <View className="gap-4">
          <View className="flex-row items-center justify-between px-3 py-2 border-t border-border-default/40 pt-4">
            <Text className="text-text-secondary text-xs font-semibold">Theme</Text>
            <ThemeToggle />
          </View>

          <Pressable
            onPress={() => logout()}
            className="flex-row items-center gap-3 px-4 py-3.5 rounded-xl text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut size={20} color={colors.danger} />
            <Text className="font-semibold text-sm text-danger">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Screen Content */}
      <View className="flex-1 h-full bg-background-primary">
        {renderTabContent()}
      </View>

      <ToastContainer />
    </View>
  );
}

export default function App() {
  return <AppContent />;
}
