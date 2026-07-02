import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface MessageTimestampProps {
  timestamp: string;
  style?: any;
}

export function MessageTimestamp({ timestamp, style }: MessageTimestampProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        styles.timestamp,
        { color: colors.text.secondary, opacity: 0.6 },
        style,
      ]}
    >
      {timestamp}
    </Text>
  );
}

const styles = StyleSheet.create({
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default MessageTimestamp;
