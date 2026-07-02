import React from 'react';
import { View } from 'react-native';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ReflectionCard } from './ReflectionCard';
import { ExerciseCard } from './ExerciseCard';
import { CBTExerciseCard } from './CBTExerciseCard';
import { BreathingExerciseCard } from './BreathingExerciseCard';
import { JournalPromptCard } from './JournalPromptCard';
import { WellnessRecommendationCard } from './WellnessRecommendationCard';
import { DailyInsightCard } from './DailyInsightCard';
import type { Message } from '../types/Message';

interface MessageRendererProps {
  message: Message;
  baseStyle: {
    fontSize: number;
    lineHeight: number;
    color: string;
  };
  codeBackground: string;
  linkColor: string;
  blockquoteBackground: string;
  blockquoteBorder: string;
}

export const MessageRenderer = React.memo(function MessageRenderer(props: MessageRendererProps) {
  const { message, ...styleProps } = props;

  switch (message.type) {
    case 'reflection': {
      const lines = message.content.split('\n').filter(Boolean);
      const title = lines[0] || undefined;
      const description = lines.slice(1).join('\n').trim() || undefined;
      return <ReflectionCard title={title} description={description} />;
    }
    case 'exercise': {
      const lines = message.content.split('\n').filter(Boolean);
      const title = lines[0] || undefined;
      const duration = lines[1]?.replace(/^duration:?\s*/i, '') || undefined;
      return <ExerciseCard title={title} duration={duration} />;
    }
    case 'cbt-exercise':
      return <CBTExerciseCard content={message.content} />;
    case 'breathing':
      return <BreathingExerciseCard content={message.content} />;
    case 'journal':
      return <JournalPromptCard content={message.content} />;
    case 'wellness':
      return <WellnessRecommendationCard content={message.content} />;
    case 'insight':
      return <DailyInsightCard content={message.content} />;
    default:
      return (
        <View>
          <MarkdownRenderer {...styleProps} text={message.content} />
        </View>
      );
  }
});

export default MessageRenderer;
