import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChatHeader } from '../components/ChatHeader';
import { ChatContainer } from '../components/ChatContainer';
import { AIMessageBubble } from '../components/AIMessageBubble';

export function ChatScreen() {
  const [messages, setMessages] = React.useState<any[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm Neeva. I'm here to support you. Let's take a moment together to check in on how you're feeling today.",
      timestamp: '2:15 PM',
    },
  ]);

  const handleQuickStarterPress = (text: string) => {
    console.log('Quick starter pressed:', text);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ChatHeader />
      <View style={styles.content}>
        <ChatContainer
          messages={messages}
          onQuickStarterPress={handleQuickStarterPress}
        >
          {messages.map((msg) => {
            if (msg.sender === 'ai') {
              return (
                <AIMessageBubble
                  key={msg.id}
                  message={msg.text}
                  timestamp={msg.timestamp}
                />
              );
            }
            return null;
          })}
        </ChatContainer>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B12',
  },
  content: {
    flex: 1,
  },
});

export default ChatScreen;
