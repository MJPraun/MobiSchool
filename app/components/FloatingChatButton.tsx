import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FloatingChatButtonProps {
  paiId?: string | null;
}

export default function FloatingChatButton({ paiId }: FloatingChatButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => {
        if (paiId) {
          router.push(`/chat/${paiId}`);
        }
      }}
    >
      <Ionicons name="chatbubbles-sharp" size={26} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 10,
    backgroundColor: '#8B5CF6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});