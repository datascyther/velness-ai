import React from 'react';
import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';

interface CreatePostFABProps {
  onPress: () => void;
}

export function CreatePostFAB({ onPress }: CreatePostFABProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 bg-neeva-purple-600 rounded-full items-center justify-center active:opacity-70 shadow-lg shadow-black/40"
    >
      <Plus size={26} color="white" />
    </Pressable>
  );
}
