/**
 * MessageList
 *
 * FlatList-based message list with:
 *   - Virtualization (handles 1000+ messages efficiently)
 *   - Smart auto-scroll: snaps to bottom only when user is near the bottom
 *     (within SCROLL_THRESHOLD). Never yanks users who've scrolled up.
 *   - Scrolls to bottom when keyboard opens (via onLayout)
 *   - Shows EmptyConversation when there are no messages
 *
 * Scroll strategy:
 *   We track the user's scroll position via onScroll. When a new message
 *   arrives (onContentSizeChange), we auto-scroll only if the user is
 *   near the bottom. This is the standard production chat pattern.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItem,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { EmptyConversation } from './EmptyConversation';
import { MessageBubble } from './MessageBubble';
import { ConversationSkeleton } from './ConversationSkeleton';
import type { ChatMessage, ChatViewState } from '../types';

/**
 * Distance from the bottom (in pixels) within which we consider
 * the user to be "at the bottom" and will auto-scroll.
 */
const SCROLL_THRESHOLD = 80;

interface MessageListProps {
  messages: ChatMessage[];
  refreshing: boolean;
  viewState: ChatViewState;
  onRefresh: () => void;
  onQuickStarterSelect?: (text: string) => void;
  onRetry: () => void;
  onDismiss: (id: string) => void;
}

export function MessageList({
  messages,
  refreshing,
  viewState,
  onRefresh,
  onQuickStarterSelect,
  onRetry,
  onDismiss,
}: MessageListProps) {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  /**
   * Track whether the user is near the bottom of the list.
   * We use a ref (not state) to avoid triggering re-renders on every scroll.
   */
  const isNearBottomRef = useRef(true);

  /**
   * The current content height and scroll offset — needed to compute
   * whether we're near the bottom in onScroll.
   */
  const scrollMetrics = useRef({
    contentHeight: 0,
    layoutHeight: 0,
    scrollY: 0,
  });

  const scrollToEnd = useCallback((animated = true) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  const prevMessagesLength = useRef(0);

  useEffect(() => {
    if (prevMessagesLength.current === 0 && messages.length > 0) {
      scrollToEnd(false);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, scrollToEnd]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      scrollMetrics.current = {
        contentHeight: contentSize.height,
        layoutHeight: layoutMeasurement.height,
        scrollY: contentOffset.y,
      };

      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      isNearBottomRef.current = distanceFromBottom < SCROLL_THRESHOLD;
    },
    []
  );

  /**
   * Called whenever the content size changes (new messages, token appended).
   * Only auto-scroll if the user is near the bottom.
   */
  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      scrollMetrics.current.contentHeight = height;
      if (isNearBottomRef.current) {
        scrollToEnd(true);
      }
    },
    [scrollToEnd]
  );

  /**
   * When the list layout changes (keyboard open/close, orientation change),
   * scroll to end if near bottom.
   */
  const handleLayout = useCallback(() => {
    if (isNearBottomRef.current) {
      scrollToEnd(false);
    }
  }, [scrollToEnd]);

  const renderItem: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => (
      <MessageBubble
        message={item}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    ),
    [onRetry, onDismiss]
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  if (viewState === 'loading') {
    return <View style={{ flex: 1 }}><ConversationSkeleton /></View>;
  }

  const isEmpty = messages.length === 0;

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[styles.list, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={[
        styles.contentContainer,
        isEmpty && styles.emptyContent,
      ]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onContentSizeChange={handleContentSizeChange}
      onLayout={handleLayout}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      // Performance tuning
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={20}
      // Maintain scroll position when new items are prepended (not used here
      // but good practice for future pagination)
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      ListEmptyComponent={
        viewState === 'empty' ? (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(200)}
            style={styles.emptyContainer}
          >
            <EmptyConversation onQuickStarterSelect={onQuickStarterSelect} />
          </Animated.View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.brand.primary}
          colors={[colors.brand.primary]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 0, // gap between items is handled by MessageBubble marginVertical
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default MessageList;
