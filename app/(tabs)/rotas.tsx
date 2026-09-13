import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  ActivityIndicator,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

const VAN_ID_TESTE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function RotasScreen() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlunosRota = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('van_id', VAN_ID_TESTE)
        .order('ordem_rota', { ascending: true });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error: any) {
      console.log('Erro ao buscar rota:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunosRota();

    const subscription = supabase
      .channel('public:alunos_rotas')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alunos' },
        (payload) => {
          setAlunos((prevAlunos) =>
            prevAlunos.map((aluno) =>
              aluno.id === payload.new.id ? { ...aluno, ...payload.new } : aluno
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'embarcado': return '#34D399';
      case 'entregue': return '#60A5FA';
      case 'embarcado_volta': return '#C084FC';
      default: return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel de Rotas</Text>
        <Text style={styles.headerSubtitle}>Gerenciamento de trajeto e embarques em tempo real</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cards de Seleção de Turno */}
        <View style={styles.routesGrid}>
          <TouchableOpacity 
            style={styles.routeCard}
            onPress={() => router.push('/rota/manha')}
          >
            <View style={[styles.routeIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="sunny" size={24} color="#60A5FA" />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeCardTitle}>Rota Manhã</Text>
              <Text style={styles.routeCardSub}>Ida para a escola</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.routeCard}
            onPress={() => router.push('/rota/tarde')}
          >
            <View style={[styles.routeIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="moon" size={24} color="#C084FC" />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeCardTitle}>Rota Tarde</Text>
              <Text style={styles.routeCardSub}>Retorno para casa</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ordem de Paradas da Van</Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        ) : alunos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="map-outline" size={32} color="#64748B" />
            <Text style={styles.emptyText}>Nenhum aluno vinculado a esta van.</Text>
          </View>
        ) : (
          alunos.map((item) => {
            const corStatus = getStatusColor(item.status_embarque);
            return (
              <View key={item.id} style={[styles.studentCard, { borderLeftColor: corStatus }]}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item.ordem_rota || '—'}º</Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{item.nome}</Text>
                  <Text style={styles.studentAddress} numberOfLines={1}>📍 {item.endereco_embarque || item.turma_escola}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: corStatus + '20', borderColor: corStatus }]}>
                  <Text style={[styles.statusText, { color: corStatus }]}>
                    {item.status_embarque ? item.status_embarque.toUpperCase() : 'FORA'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  routesGrid: { gap: 12, marginBottom: 28 },
  routeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  routeIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  routeInfo: { flex: 1 },
  routeCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  routeCardSub: { fontSize: 13, color: '#64748B' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  centerContainer: { padding: 20, alignItems: 'center' },
  emptyCard: { backgroundColor: '#131824', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  emptyText: { color: '#64748B', fontSize: 14, marginTop: 8 },
  studentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131824', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B', borderLeftWidth: 5 },
  badgeContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  badgeText: { fontWeight: 'bold', color: '#FFFFFF', fontSize: 12 },
  studentDetails: { flex: 1, marginRight: 8 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  studentAddress: { fontSize: 12, color: '#64748B' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: 'bold' }
});