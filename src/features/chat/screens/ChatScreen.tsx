import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChatHeader } from '../components/ChatHeader';
import { ChatContainer } from '../components/ChatContainer';
import { AIMessageBubble } from '../components/AIMessageBubble';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { ChatInput } from '../components/ChatInput';

export function ChatScreen() {
  const [messages, setMessages] = React.useState<any[]>([]);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleSend = (text: string) => {
    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: formatTime(new Date()),
    };
    
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: "Thank you for sharing that with me. I'm here to listen and help you process whatever is on your mind.",
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickStarterPress = (text: string) => {
    handleSend(text);
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
            } else if (msg.sender === 'user') {
              return (
                <UserMessageBubble
                  key={msg.id}
                  message={msg.text}
                  timestamp={msg.timestamp}
                />
              );
            }
            return null;
          })}
        </ChatContainer>
        <ChatInput onSend={handleSend} />
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
