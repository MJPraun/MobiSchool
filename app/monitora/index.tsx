import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

interface Aluno {
  id: string;
  nome: string;
  escola: string;
  turno: 'manha' | 'tarde';
}

export default function MonitoraScreen() {
  const { colors, modoEscuro, toggleModoEscuro } = useTheme();
  const [turno, setTurno] = useState<'manha' | 'tarde'>('manha');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlunosByTurno();
  }, [turno]);

  async function fetchAlunosByTurno() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, escola, turno')
        .eq('turno', turno);

      if (error) throw error;
      setAlunos(data || []);
    } catch (err: any) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos do turno.');
    } finally {
      setLoading(false);
    }
  }

  async function registrarEmbarque(alunoId: string, tipo: 'embarque_casa' | 'desembarque_escola' | 'embarque_escola' | 'desembarque_casa') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('embarques').insert([{
        aluno_id: alunoId,
        tipo,
        registrado_por: user.id,
      }]);

      if (error) throw error;

      Alert.alert('Sucesso', 'Registo de embarque guardado!');
    } catch (err: any) {
      Alert.alert('Erro ao registar', err.message);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Cabeçalho Padronizado com Botão de Tema e Chat */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeSub, { color: colors.subtext }]}>Painel da Monitora</Text>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>MobiSchool</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Botão de Modo Claro / Escuro */}
          <TouchableOpacity 
            style={[styles.themeToggleBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={toggleModoEscuro}
          >
            <Ionicons name={modoEscuro ? "sunny" : "moon"} size={18} color={modoEscuro ? "#F59E0B" : "#4F46E5"} />
          </TouchableOpacity>

          {/* Botão de Chat */}
          <TouchableOpacity 
            style={styles.chatIconBtn}
            onPress={() => router.push('/chat' as any)}
          >
            <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Selector de Turno */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <TouchableOpacity 
            style={[styles.tab, turno === 'manha' && { backgroundColor: colors.primary }]}
            onPress={() => setTurno('manha')}
          >
            <Text style={[styles.tabText, { color: turno === 'manha' ? '#FFF' : colors.text }]}>☀️ Manhã</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, turno === 'tarde' && { backgroundColor: colors.primary }]}
            onPress={() => setTurno('tarde')}
          >
            <Text style={[styles.tabText, { color: turno === 'tarde' ? '#FFF' : colors.text }]}>⛅ Tarde</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={alunos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.subtext }]}>Nenhum aluno registado neste turno.</Text>
            }
            renderItem={({ item }) => (
              <View style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.studentName, { color: colors.text }]}>{item.nome}</Text>
                <Text style={[styles.schoolText, { color: colors.subtext }]}>{item.escola}</Text>

                <View style={styles.actionGrid}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => registrarEmbarque(item.id, 'embarque_casa')}
                  >
                    <Ionicons name="home" size={16} color="#FFF" />
                    <Text style={styles.btnText}>Embarcou (Casa)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
                    onPress={() => registrarEmbarque(item.id, 'desembarque_escola')}
                  >
                    <Ionicons name="school" size={16} color="#FFF" />
                    <Text style={styles.btnText}>Escola</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
                    onPress={() => registrarEmbarque(item.id, 'embarque_escola')}
                  >
                    <Ionicons name="bus" size={16} color="#FFF" />
                    <Text style={styles.btnText}>Volta (Escola)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#6366F1' }]}
                    onPress={() => registrarEmbarque(item.id, 'desembarque_casa')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                    <Text style={styles.btnText}>Entregue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
  welcomeSub: { fontSize: 12 },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  themeToggleBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderWidth: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  chatIconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#3B82F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2 
  },
  content: { flex: 1, padding: 20 },
  tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabText: { fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 30 },
  studentCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  studentName: { fontSize: 18, fontWeight: 'bold' },
  schoolText: { fontSize: 14, marginBottom: 12 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { width: '48%', flexDirection: 'row', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 }
});