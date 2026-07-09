# ARCHITECTURE.md

# Velness v1.0 Architecture

## Overview

Velness is a mobile-first AI wellness platform built using React Native and Expo.

The system is designed around a simple philosophy:

> Preserve the product. Replace the rendering engine.

Velness is **not** a chatbot.

Velness is **not** a mood tracker.

Velness is an AI-powered wellness platform that combines conversations, therapeutic journeys, emotional tracking, and community support into one cohesive experience.

---

# Architecture Goals

The architecture is designed to be:

* Mobile-first
* Modular
* Type-safe
* Scalable
* Maintainable
* Provider-agnostic
* Offline-capable
* AI-ready

---

# High-Level Architecture

```text
                   React Native (Expo)

                          UI

                           │

                    Feature Components

                           │

                     Feature Hooks

                           │

                     Repository Layer

                           │

                      Service Layer

         ┌─────────────────┼──────────────────┐

         │                 │                  │

     Firebase         Supabase          AI Service

         │                 │                  │

         └─────────────────┼──────────────────┘

                    Vercel Functions

                           │

                     NVIDIA NIM API
```

---

# Architectural Principles

## 1. Feature First

The application is organized by business domains.

Never organize by technology.

Good

```text
features/

auth/

chat/

home/

journey/

community/

profile/
```

Avoid

```text
components/

screens/

hooks/

utils/
```

at the top level as the primary organization.

---

## 2. Separation of Concerns

Every layer has one responsibility.

UI

↓

Feature Hook

↓

Repository

↓

Service

↓

Backend

The UI never talks directly to Firebase, Supabase, or AI providers.

---

## 3. Reusable Business Logic

Business logic belongs outside UI.

Reusable code includes:

* validation
* AI prompts
* repositories
* services
* state
* utilities

Business logic should be platform-independent whenever possible.

---

## 4. Rendering Independence

React Native is only responsible for presentation.

Business logic should not depend on React Native APIs unless absolutely necessary.

---

# Folder Structure

```text
src/

├── core/
│   ├── providers/
│   ├── navigation/
│   ├── theme/
│   └── config/
│
├── features/
│
│   ├── auth/
│   ├── home/
│   ├── chat/
│   ├── journey/
│   ├── community/
│   ├── profile/
│
├── shared/
│
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── repositories/
│   ├── utils/
│   ├── constants/
│   ├── assets/
│   └── types/
│
└── tests/
```

---

# Navigation

The navigation is permanently locked.

Bottom Navigation

* Home
* Chat
* Journey
* Community
* Profile

No additional root tabs without explicit approval.

---

# Design System

Velness Design System v1.0 is frozen.

Every screen must follow:

* Dark Theme
* Glassmorphism
* Purple/Cyan gradients
* Consistent spacing
* Consistent typography
* Consistent motion
* Reusable components

No screen-specific styling.

---

# State Management

Global state

Zustand

Use for:

* authentication
* theme
* session
* preferences
* lightweight UI state

Server state

TanStack Query

Use for:

* fetching
* caching
* mutations
* synchronization

Never duplicate server data inside Zustand.

---

# Forms

All forms use

* React Hook Form
* Zod

Validation rules belong inside schemas.

Never validate directly inside components.

---

# Authentication

Provider

Firebase Authentication

Supported methods

* Email
* Google
* Anonymous (optional)

Authentication state should be managed globally.

---

# Database

Primary database

Supabase PostgreSQL

Authentication

Firebase

Structured application data

Supabase

AI conversations

Stored according to feature requirements.

---

# AI Layer

The application must never depend directly on one AI provider.

Architecture

```text
Chat Screen

↓

AI Service

↓

Provider Adapter

↓

NVIDIA NIM
```

Future providers

* OpenAI
* Gemini
* Claude
* Local Models

should be interchangeable.

---

# API Layer

The client communicates only with backend APIs.

Never expose AI provider credentials.

Flow

```text
Mobile App

↓

Vercel API

↓

AI Provider
```

---

# Repository Pattern

Every feature owns its repository.

Example

```text
ChatRepository

MoodRepository

JourneyRepository

ProfileRepository
```

Repositories isolate data sources from business logic.

---

# Component System

Components are reusable.

Examples

* Button
* Card
* Avatar
* ChatBubble
* Input
* ProgressRing
* JourneyCard
* BottomNavigation
* Modal
* BottomSheet

Screens compose components.

Components never compose screens.

---

# Design Tokens

Never hardcode values.

Centralize

* colors
* spacing
* typography
* radius
* shadows
* gradients
* motion
* zIndex

---

# Performance

Use

* FlatList
* Memoization
* Lazy loading
* Optimized images
* Native animations

Avoid unnecessary re-renders.

---

# Security

Never store secrets in the client.

Use

* Secure Store
* Backend validation
* Server authorization
* Environment variables

---

# Accessibility

Support

* Screen readers
* Dynamic font scaling
* Accessible labels
* Proper touch targets
* Color contrast

Accessibility is part of the definition of done.

---

# Analytics

Track meaningful events only.

Examples

* Daily Check-in
* Mood Logged
* Journey Started
* Journey Completed
* AI Conversation
* Reflection Saved
* Meditation Completed
* Subscription Purchased

---

# Error Handling

Every feature should handle:

* Loading
* Empty
* Error
* Success

No silent failures.

---

# Testing Strategy

Unit Tests

* utilities
* repositories
* validation

Integration Tests

* features
* navigation

End-to-End Tests

* authentication
* onboarding
* AI chat
* journeys

---

# Engineering Rules

Prefer

* Composition
* Reusability
* Type safety
* Small focused files
* Clear naming

Avoid

* Massive files
* Duplicate logic
* Feature coupling
* Hardcoded values

---

# Product Rules

Migration must preserve

* Navigation
* User journeys
* Business logic
* Backend APIs
* AI architecture
* Design language

Do not redesign during migration.

Do not introduce feature creep.

Reach feature parity first.

---

# Definition of Done

A feature is complete only when:

* Functionality works.
* UI matches the design system.
* TypeScript has no errors.
* Accessibility is implemented.
* Analytics are added where appropriate.
* Error handling exists.
* Performance is acceptable.
* Code follows architecture rules.

---

# Long-Term Vision

Velness should evolve into a scalable AI wellness platform where:

* Features remain modular.
* AI providers remain interchangeable.
* Business logic remains reusable.
* The UI evolves independently of backend services.
* Mobile remains the primary experience.
* Future platforms (web, desktop, wearables) can reuse the shared architecture.

The architecture must always prioritize maintainability over short-term convenience.
