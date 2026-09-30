import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function ChatIndexScreen() {
  const { colors, modoEscuro } = useTheme();
  const [loading, setLoading] = useState(true);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);

  useEffect(() => {
    carregarResponsaveis();
  }, []);

  async function carregarResponsaveis() {
    try {
      setLoading(true);
      // Consulta diretamente a tabela profiles onde o papel (role) é 'pai'
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email, role')
        .eq('role', 'pai');

      if (error) throw error;
      setResponsaveis(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar responsáveis:', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Mensagens</Text>
      </View>
      
      {/* Lista de Conversas */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={responsaveis}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.subtext} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum responsável encontrado</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chatCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.chatInfo}>
                <Text style={[styles.chatName, { color: colors.text }]}>
                  {item.nome || 'Responsável'}
                </Text>
                <Text style={[styles.chatSub, { color: colors.subtext }]}>
                  {item.email || 'Toque para conversar'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, gap: 15 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  chatCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  chatSub: { fontSize: 13 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: 10 }
});