import { Stack } from 'expo-router';
import { View } from 'react-native';
import FloatingChatButton from './components/FloatingChatButton';

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0D17' }}>
      {/* Gestão de rotas principal */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* 💬 Botão Flutuante Global */}
      <FloatingChatButton />
    </View>
  );
}