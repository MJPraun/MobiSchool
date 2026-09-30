import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export default function ConfiguraçõesScreen() {
  const { colors, modoEscuro, toggleModoEscuro } = useTheme();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login' as any); // Ajuste conforme a sua rota de login
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>
      </View>

      <View style={styles.content}>
        
        {/* Opção de Modo Escuro */}
        <View style={[styles.optionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.optionInfo}>
            <Ionicons name="moon-outline" size={22} color={colors.primary} />
            <Text style={[styles.optionText, { color: colors.text }]}>Modo Escuro</Text>
          </View>
          <Switch 
            value={modoEscuro} 
            onValueChange={toggleModoEscuro}
            thumbColor={modoEscuro ? colors.primary : '#f4f3f4'}
          />
        </View>

        {/* Botão de Terminar Sessão */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, gap: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20, gap: 16 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  optionInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { fontSize: 15, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' }
});