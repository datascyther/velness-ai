Velness - Complete Project Analysis

  Project Overview

  Velness is a cross-platform mental wellness application built with React Native + Expo Router
  + TypeScript that provides an AI-powered conversational companion for mood tracking,
  reflective journaling, and CBT-inspired exercises.

  Core Philosophy: "Empowering minds through AI-driven mental wellness – where technology meets
  compassion" — a behavioral awareness tool, NOT a medical product, therapist, or crisis
  intervention service.

  ---
  Tech Stack Architecture

  ┌─────────────────┬────────────────────────────────────┬──────────────────────────────────┐
  │      Layer      │             Technology             │             Purpose              │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Framework       │ Expo SDK 54, React Native 0.81,    │ Cross-platform (iOS, Android,    │
  │                 │ React 19                           │ Web)                             │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Routing         │ Expo Router 6 (file-based)         │ Native navigation with deep      │
  │                 │                                    │ linking                          │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ State           │ Zustand (persisted) + TanStack     │ UI state + Server state          │
  │ Management      │ Query v5                           │ separation                       │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Auth/Database   │ Firebase Auth + Firestore          │ Real-time sync, offline-first    │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ AI/Backend      │ NVIDIA NIM API (Llama 3.3          │ Streaming chat, memory           │
  │                 │ Nemotron)                          │ summarization                    │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Styling         │ NativeWind 4 (Tailwind) + Custom   │ Design system, dark/light themes │
  │                 │ tokens                             │                                  │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Animations      │ Reanimated 4 + Gesture Handler     │ 60fps native animations          │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Speech          │ Expo Speech Recognition            │ Voice typing with waveform viz   │
  ├─────────────────┼────────────────────────────────────┼──────────────────────────────────┤
  │ Testing         │ Vitest + React Native Testing      │ Unit/integration tests           │
  │                 │ Library                            │                                  │
  └─────────────────┴────────────────────────────────────┴──────────────────────────────────┘

  ---
  Project Structure

  Velness/
  ├── app/                          # Expo Router file-based routes
  │   ├── index.tsx                 # Entry gateway (auth → onboarding → tabs)
  │   ├── onboarding.tsx            # Onboarding flow entry
  │   └── (tabs)/                   # Main tab navigator
  │       ├── index.tsx             # Home screen
  │       ├── chat.tsx              # AI chat screen
  │       └── journey.tsx           # Guided progression
  │
  ├── src/
  │   ├── core/                     # Core infrastructure
  │   │   ├── config/               # Routes, env, features flags
  │   │   ├── providers/            # VelnessProvider (Auth, Theme, Query)
  │   │   ├── queryClient.ts        # TanStack Query setup
  │   │   ├── store/                # Zustand stores (app + sync)
  │   │   └── theme/                # Theme system
  │   │
  │   ├── features/                 # Feature modules (colocated)
  │   │   ├── auth/                 # Authentication flow
  │   │   │   ├── screens/          # Welcome, Login, Signup, Onboarding, etc.
  │   │   │   ├── components/       # PasswordStrengthMeter, GoogleSignInButton
  │   │   │   └── validators/       # Zod schemas
  │   │   │
  │   │   ├── home/                 # Daily check-in, mood tracking
  │   │   │   ├── screens/HomeScreen.tsx
  │   │   │   └── components/       # 25+ micro-components
  │   │   │
  │   │   ├── chat/                 # Conversational AI
  │   │   │   ├── screens/ChatScreen.tsx
  │   │   │   ├── components/       # MessageBubble, ChatInput, ChatHeader
  │   │   │   ├── hooks/useChatStream.ts (core streaming logic)
  │   │   │   ├── conversation/     # Conversation state machine
  │   │   │   └── persistence/      # Draft/Session storage
  │   │   │
  │   │   ├── journey/              # Guided progression (Duolingo-style)
  │   │   │   ├── screens/JourneyScreen.tsx
  │   │   │   ├── components/       # Practice cards, progress tracker
  │   │   │   └── hooks/useActiveJourney.ts
  │   │   │
  │   │   └── onboarding/           # 7-step personalized setup
  │   │       ├── screens/OnboardingFlow.tsx
  │   │       └── hooks/useOnboarding.ts
  │   │
  │   ├── shared/                   # Cross-feature utilities
  │   │   ├── components/           # 30+ reusable UI primitives
  │   │   ├── hooks/                # useAuth, useMood, useTheme
  │   │   ├── types/                # Shared type definitions
  │   │   └── constants/            # Layout, breakpoints
  │   │
  │   ├── services/                 # Business logic layer
  │   │   ├── auth/                 # AuthService (Firebase wrapper)
  │   │   ├── ai/                   # AI streaming + error handling
  │   │   ├── analytics/            # Event tracking
  │   │   ├── memory/               # Conversation summarization
  │   │   ├── speech/               # Speech recognition wrapper
  │   │   └── storage/              # AsyncStorage + SecureStore
  │   │
  │   ├── repositories/             # Data access (Firestore)
  │   │   ├── ChatRepository.ts
  │   │   ├── MoodRepository.ts
  │   │   ├── ProfileRepository.ts
  │   │   └── AuthRepository.ts
  │   │
  │   ├── lib/                      # External SDK configs
  │   │   ├── firebase.ts
  │   │   └── auth.ts
  │   │
  │   ├── utils/                    # Helper functions
  │   └── prompts/                  # AI system prompts
  │
  ├── Full Tech Stack/ARCHITECTURE.md  # Detailed architecture docs
  └── package.json                   # Dependencies & scripts

  ---
  Key Architectural Patterns

  1. State Separation (Strict)

  // zustand → UI STATE ONLY (theme, tabs, toasts, modals, session flags)
  // TanStack Query → SERVER STATE (moods, chats, profile, journeys)
  // NEVER duplicate server data in Zustand

  2. Repository Pattern

  - All Firestore access through typed repositories (ChatRepository, MoodRepository, etc.)
  - Screens never import Firebase directly
  - Enables testing with mocks

  3. Provider Composition

  <VelnessProvider>                    // GestureHandler + SafeArea + QueryClient
    <AuthProvider>                   // Firebase auth state → Zustand sync
      <ThemeProvider>               // Dark/Light/Auto + NativeWind sync
        {children}
      </ThemeProvider>
    </AuthProvider>
  </VelnessProvider>

  4. Offline-First with Sync Queue

  - useSyncStore + useSyncRefresh background processor
  - Mutations queued locally → synced when online
  - Home screen shows sync status banner with retry

  ---
  Feature Deep Dives

  ---
  Feature Deep Dives

  Authentication Flow

  App Launch (index.tsx)
      │
      ├─► Not authenticated → /auth/welcome
      │       ├─► Sign In → /auth/login
      │       ├─► Sign Up → /auth/signup → /auth/email-verification
      │       └─► Guest Mode → bypass auth, create mock profile
      │
      ├─► Authenticated, onboarding incomplete → /onboarding (7 steps)
      │
      └─► Authenticated, onboarded → /(tabs) (Home, Chat, Journey, Community, Profile)

  AuthService wraps Firebase, handles:
  - Email/password + Google OAuth
  - Email verification flow
  - Token storage (SecureStore / localStorage)
  - Profile hydration from Firestore
  - onAuthStateChanged → Zustand sync

  ---
  AI Chat System (useChatStream.ts — Core Hook)

  // Streaming architecture with robust error handling
  1. User input → generateId() message (user, status: 'complete')
  2. Build history (last 40 msgs + MemoryManager summarization)

  // Streaming architecture with robust error handling
  1. User input → generateId() message (user, status: 'complete')
  2. Build history (last 40 msgs + MemoryManager summarization)
  3. executeStream() → generateResponse() → NVIDIA API (non-streaming)
  4. Assistant response → Message (assistant, status: 'complete')
  5. Auto-save to Firestore via ChatRepository
  // Streaming architecture with robust error handling
  1. User input → generateId() message (user, status: 'complete')
  2. Build history (last 40 msgs + MemoryManager summarization)
  3. executeStream() → generateResponse() → NVIDIA API (non-streaming)
  4. Assistant response → Message (assistant, status: 'complete')
  5. Auto-save to Firestore via ChatRepository
  2. Build history (last 40 msgs + MemoryManager summarization)
  3. executeStream() → generateResponse() → NVIDIA API (non-streaming)
  4. Assistant response → Message (assistant, status: 'complete')
  5. Auto-save to Firestore via ChatRepository
  4. Assistant response → Message (assistant, status: 'complete')
  5. Auto-save to Firestore via ChatRepository
  5. Auto-save to Firestore via ChatRepository

  Key features:
  - AbortController + 60s timeout + 90s fail-safe
  - Retry logic for 503 (service busy) with 2s backoff
  - MemoryManager condenses history (removes old, keeps summary)
  - Multi-message-type support: markdown, reflection, insight, exercise, breathing
  - Phase 6 Velness-native actions: Save, Later, Share, Follow-up, Regenerate

  ---
  Home Screen (Daily Check-in)

  - Mood tracking: 5-point emoji scale + optional reflection note
  - Weekly history: Visual mood timeline
  - Journey integration: Continue current program card
  - Sync status banner: Shows pending queue, online/offline, retry

  ---
  Journey Screen (Guided Progression)

  ▎ "Think less like Netflix. Think more like Duolingo."

  Information hierarchy:
  1. Header — Identity + streak
  2. JourneyHero — Motivation + stats (weekly %, exercises completed)
  3. Continue Current Journey — Primary CTA (highest priority)
  4. Explore Practices — Horizontal scroll: CBT, Breathing, Meditation, Wellness
  5. Recommended Today — Personalized activity
  6. Your Progress — Weekly tracker

  ---
  Onboarding Flow (7 Steps)

  Welcome → Goals (multi-select, max 5) → Mood (single select)
      → Display Name → Reminder Time → Notifications Permission → Privacy
  Data saved via useOnboarding hook → AuthService.markOnboardingCompleted() + profile update.

  ---
  Voice Typing (ChatInput.tsx)

  - Expo Speech Recognition with contextual strings for mental health terms
  - Real-time waveform visualization (4 animated bars)
  - Interim results + continuous dictation mode
  - Accept/Cancel flow with haptic feedback

  ---
  Design System

  Theme Tokens (src/theme/tokens.ts + src/core/theme/tokens.ts)

  spacing: { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }
  borderRadius: { sm:4, md:8, lg:12, pill:9999 }
  typography: { textPrimary, textSecondary, headingLarge, buttonPrimary... }
  colors: {
    background: { primary, secondary },
    surface: { primary, secondary },
    text: { primary, secondary },
    border: { default },
    brand: { primary: '#6C4CF1', secondary: '#8B5CF6', contrastText: '#FFFFFF' },
    success, warning, danger
  }

  NativeWind Integration

  - ThemeProvider syncs data-theme attribute + color-scheme meta
  - Calls nativewind.colorScheme.set(theme) for RN
  - Supports dark, light, auto (system)

  ---
  Data Models

  UserProfile (Firestore: users/{uid})

  {
    uid, name, email, phoneNumber?, photoURL?,
    createdAt, updatedAt, lastLoginAt,
    preferences: { theme, notifications, language, tone },
    stats: { totalSessions, totalMinutes, streakDays, lastActivityDate },
    onboardingCompleted?, displayName?, primaryGoals?, initialMood?, reminderPreference?, notificationsEnabled?
  }

  Mood (Firestore: users/{uid}/moods/{id})

  { id, rating: 1|2|3|4|5, note, timestamp }

  Message (Firestore: users/{uid}/chats/{messageId})

  { id, content, isUser, timestamp, conversationId, reasoning? }

  Conversation (in-memory + sessionStorage)

  - conversationId groups messages
  - MemoryManager per conversation handles summarization

  ---
  Key Configuration

  Environment Variables (.env via env.ts)

  ┌────────────────────────────────────┬──────────────────────────────────────────┐
  │              Variable              │               Description                │
  ├────────────────────────────────────┼──────────────────────────────────────────┤
  │ EXPO_PUBLIC_FIREBASE_API_KEY       │ Firebase config                          │
  ├────────────────────────────────────┼──────────────────────────────────────────┤
  │ EXPO_PUBLIC_NVIDIA_API_KEY         │ NVIDIA NIM API                           │
  ├────────────────────────────────────┼──────────────────────────────────────────┤
  │ EXPO_PUBLIC_NVIDIA_MODEL           │ Model name (default: Llama 3.3 Nemotron) │
  ├────────────────────────────────────┼──────────────────────────────────────────┤
  │ EXPO_PUBLIC_API_BASE_URL           │ Backend API (defaults to localhost:5173) │
  ├────────────────────────────────────┼──────────────────────────────────────────┤
  │ EXPO_PUBLIC_USE_FIREBASE_EMULATORS │ Dev emulator flag                        │
  └────────────────────────────────────┴──────────────────────────────────────────┘

  Scripts

  "dev": "vite",
  "dev:expo": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "test": "vitest run",
  "firebase:sync-env": "node scripts/sync-firebase-env.mjs"

  ---
  Current State Assessment

  ✅ Implemented & Working

  - Complete auth flow (email, Google, guest, verification)
  - 7-step onboarding with analytics tracking
  - Mood check-in with weekly visualization
  - AI chat with streaming, history, memory summarization
  - Journey guided progression (mock data, ready for backend)
  - Voice typing with waveform
  - Offline-first sync queue
  - Theme system (dark/light/auto) with NativeWind
  - Comprehensive component library (30+ shared components)
  - TanStack Query + Zustand architecture

  🚧 In Progress / Placeholders

  - Journey content (currently mock categories)
  - Community tab (placeholder screen)
  - Profile tab (placeholder screen)
❯ 
❯ 
❯ 
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ 
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ 
❯ 
❯ 
❯ 
❯ 

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 
❯ 

──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ 
❯ 
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ 
  - Mood check-in with weekly visualization
  - AI chat with streaming, history, memory summarization
  - Journey guided progression (mock data, ready for backend)
  - Voice typing with waveform
  - Offline-first sync queue
  - Theme system (dark/light/auto) with NativeWind
  - Comprehensive component library (30+ shared components)
  - TanStack Query + Zustand architecture

  🚧 In Progress / Placeholders

  - Journey content (currently mock categories)
  - Community tab (placeholder screen)
  - Profile tab (placeholder screen)
  - Backend API for AI (/api/ai/chat endpoint)
  - Crisis detection system
  - Long-term memory summarization
  - Habit correlation detection

  🏗 Architecture Ready For

  - Real journey content from backend
  - Community features (groups, peer support)
  - Subscription/payment integration
  - Push notifications
  - Advanced analytics dashboard

  ---
  Notable Design Decisions

  1. React 19 + Expo Router — Modern, file-based routing with type safety
  2. Non-streaming AI by default — generateResponse used over streamAIChat for reliability
  3. MemoryManager per conversation — Local-first summarization, no server dependency
  4. Phase 6 Action Buttons — Velness-native interactions (Save/Later/Share/Follow-up) instead of generic 👍/👎
  5. Strict state separation — Prevents sync bugs between client/server state
  6. Repository abstraction — Enables unit testing and future backend swap
  7. Guest Mode — Zero-friction trial without auth

  ---
  This is a production-grade architecture for a mental wellness AI app with thoughtful separation of concerns, offline-first design, and a clear path to
  scale. The codebase demonstrates senior-level React Native patterns and is well-positioned for feature expansion.
