import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from './../context/ThemeContext';
import { supabase } from '../lib/supabase';
//import { usePushNotifications } from '../hooks/usePushNotifications';

export default function RootLayout() {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    // Obter o utilizador atual autenticado no Supabase
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // DESATIVADO TEMPORARIAMENTE: A funcionalidade de notificações push está desativada devido a problemas com o Supabase Edge Functions. A função `usePushNotifications` foi comentada para evitar erros durante a execução da aplicação.
  //usePushNotifications(userId);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}