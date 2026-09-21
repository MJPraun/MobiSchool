import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Aluno {
  id: string;
  nome: string;
  escola: string;
  turno: 'manha' | 'tarde';
}

export default function MonitoraScreen() {
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
    <View style={styles.container}>
      <Text style={styles.title}>Chamada da Van 🚐</Text>

      {/* Selector de Turno */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, turno === 'manha' && styles.activeTab]}
          onPress={() => setTurno('manha')}
        >
          <Text style={styles.tabText}>☀️ Manhã</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, turno === 'tarde' && styles.activeTab]}
          onPress={() => setTurno('tarde')}
        >
          <Text style={styles.tabText}>⛅ Tarde</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum aluno registado neste turno.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.studentCard}>
              <Text style={styles.studentName}>{item.nome}</Text>
              <Text style={styles.schoolText}>{item.escola}</Text>

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#131824', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#8B5CF6' },
  tabText: { color: '#FFF', fontWeight: 'bold' },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 30 },
  studentCard: { backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 12 },
  studentName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  schoolText: { color: '#94A3B8', fontSize: 14, marginBottom: 12 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: { width: '48%', flexDirection: 'row', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 }
});