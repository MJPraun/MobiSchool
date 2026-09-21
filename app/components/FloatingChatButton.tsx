import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useSegments } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function FloatingChatButton() {
  const segments = useSegments();
  const [userId, setUserId] = useState<string | null>(null);
  const [isPai, setIsPai] = useState(false);

  // Identifica se está na tela de Login / Inicial (app/index.tsx)
  const isTelaLogin = segments.length === 0 || (segments.length === 1 && segments[0] === 'index');
  
  // Identifica se já está dentro da tela de Chat (app/chat/...)
  const isTelaChat = segments[0] === 'chat';

  useEffect(() => {
    async function checkUser() {
      // Se for a tela de Login, não carrega nada
      if (isTelaLogin) {
        setUserId(null);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo')
          .eq('id', user.id)
          .single();

        if (profile?.tipo === 'pai') {
          setIsPai(true);
        }
      } else {
        // MODO DEMONSTRAÇÃO (Ativo quando navega para dentro do app)
        setUserId('demo-user');
        setIsPai(segments[0] === 'pai');
      }
    }

    checkUser();
  }, [segments, isTelaLogin]);

  // Oculta se estiver no Login ou dentro da tela de Chat
  if (isTelaLogin || isTelaChat) {
    return null;
  }

  function handlePress() {
    if (isPai) {
      router.push('/chat/demo-pai');
    } else {
      router.push('/chat');
    }
  }

  return (
    <TouchableOpacity 
      style={styles.fab} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubbles" size={26} color="#FFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90, 
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    zIndex: 99999,
  },
});