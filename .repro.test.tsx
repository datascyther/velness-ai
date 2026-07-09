import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function render(ui) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let err = null;
  try {
    act(() => {
      root.render(ui);
    });
  } catch (e) {
    err = e;
  }
  return {
    container,
    root,
    error: err,
    unmount: () => act(() => root.unmount()),
  };
}

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {}, canGoBack: () => false }),
  Stack: ({ children }) => React.createElement(React.Fragment, null, children),
  Redirect: () => null,
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
  usePathname: () => '/auth/login',
  useLocalSearchParams: () => ({}),
  useSegments: () => ['auth', 'login'],
  router: { push: () => {}, replace: () => {}, back: () => {} },
}));
vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));
vi.mock('expo-blur', () => ({ BlurView: ({ children }) => React.createElement(React.Fragment, null, children) }));
vi.mock('expo-linear-gradient', () => ({ LinearGradient: (p) => React.createElement('div', p) }));
vi.mock('expo-web-browser', () => ({ openAuthSessionAsync: () => Promise.resolve({ type: 'cancel' }) }));
vi.mock('expo-linking', () => ({ createURL: () => 'velness://' }));
vi.mock('expo-haptics', () => ({ impactAsync: () => Promise.resolve(), ImpactFeedbackStyle: {} }));
vi.mock('react-native-svg', () => {
  const C = (props) => React.createElement('div', props);
  return { Svg: C, Path: C, Circle: C, Defs: C, RadialGradient: C, Stop: C, Rect: C, G: C, default: C };
});
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  SafeAreaView: ({ children, ...p }) => React.createElement('div', p, children),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 400, height: 800 }),
}));
vi.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => React.createElement(React.Fragment, null, children),
}));
vi.mock('@react-navigation/bottom-tabs', () => ({
  Tabs: ({ children }) => React.createElement(React.Fragment, null, children),
  BottomTabBarProps: {},
}));

import { VelnessProvider } from '@/core/providers/VelnessProvider';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { SignupScreen } from '@/features/auth/screens/SignupScreen';
import { WelcomeScreen } from '@/features/auth/screens/WelcomeScreen';
import { EmailVerificationScreen } from '@/features/auth/screens/EmailVerificationScreen';
import { HomeScreen } from '@/features/home/screens/HomeScreen';

const screens = {
  LoginScreen,
  ForgotPasswordScreen,
  SignupScreen,
  WelcomeScreen,
  EmailVerificationScreen,
  HomeScreen,
};

describe('isAnimated recursion reproduction', () => {
  for (const [name, Screen] of Object.entries(screens)) {
    it('mounts ' + name, () => {
      const r = render(React.createElement(VelnessProvider, null, React.createElement(Screen)));
      if (r.error) {
        console.log('=== RECURSION in ' + name + ' ===');
        console.log(r.error.message);
        console.log(r.error.stack && r.error.stack.split('\n').slice(0, 12).join('\n'));
      }
      expect(r.error).toBeNull();
      r.unmount();
    });
  }
});
