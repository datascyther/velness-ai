import type { ComponentType } from 'react';
import { Heart, Wind, Sparkles, Moon } from 'lucide-react-native';

export interface ChatStarter {
  icon: ComponentType<{ size: number; color: string }>;
  text: string;
}

export const CHAT_STARTERS: ChatStarter[] = [
  { icon: Heart, text: "I'm feeling overwhelmed" },
  { icon: Wind, text: 'Help me calm racing thoughts' },
  { icon: Sparkles, text: 'Reflect on today' },
  { icon: Moon, text: "I can't sleep tonight" },
];
