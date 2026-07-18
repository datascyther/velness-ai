import React from 'react';
import SendButton from './features/chat/components/SendButton';
import { ThemeContext } from './providers/ThemeProvider';

const lightCtx = {
  mode: 'light', theme: 'light', colors: {}, setMode: () => {}, toggleTheme: () => {}, isDark: false, systemTheme: 'light',
} as any;

export default function Repro() {
  return (
    <ThemeContext.Provider value={lightCtx}>
      <div style={{ padding: 40, background: '#FFFFFF' }}>
        <div style={{ marginBottom: 8, fontSize: 12 }}>ENABLED (light)</div>
        <SendButton onPress={() => {}} disabled={false} />
        <div style={{ marginTop: 24, fontSize: 12 }}>DISABLED (light)</div>
        <SendButton onPress={() => {}} disabled={true} />
      </div>
    </ThemeContext.Provider>
  );
}
