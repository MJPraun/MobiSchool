import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

const VAN_ID_TESTE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function RotasScreen() {
  const { colors, modoEscuro } = useTheme();
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
      default: return colors.subtext;
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Painel de Rotas</Text>
        <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Gerenciamento de trajeto e embarques em tempo real</Text>
      </View>

      {/* Cards de Seleção de Turno */}
      <View style={styles.routesGrid}>
        <TouchableOpacity 
          style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/rota/manha')}
        >
          <View style={[styles.routeIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Ionicons name="sunny" size={24} color="#60A5FA" />
          </View>
          <View style={styles.routeInfo}>
            <Text style={[styles.routeCardTitle, { color: colors.text }]}>Rota Manhã</Text>
            <Text style={[styles.routeCardSub, { color: colors.subtext }]}>Ida para a escola</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/rota/tarde')}
        >
          <View style={[styles.routeIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Ionicons name="moon" size={24} color="#C084FC" />
          </View>
          <View style={styles.routeInfo}>
            <Text style={[styles.routeCardTitle, { color: colors.text }]}>Rota Tarde</Text>
            <Text style={[styles.routeCardSub, { color: colors.subtext }]}>Retorno para casa</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ordem de Paradas da Van</Text>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : alunos.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="map-outline" size={32} color={colors.subtext} />
          <Text style={[styles.emptyText, { color: colors.subtext }]}>Nenhum aluno vinculado a esta van.</Text>
        </View>
      ) : (
        alunos.map((item) => {
          const corStatus = getStatusColor(item.status_embarque);
          return (
            <View key={item.id} style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: corStatus }]}>
              <View style={[styles.badgeContainer, { backgroundColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>{item.ordem_rota || '—'}º</Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={[styles.studentName, { color: colors.text }]}>{item.nome}</Text>
                <Text style={[styles.studentAddress, { color: colors.subtext }]} numberOfLines={1}>📍 {item.endereco_embarque || item.turma_escola}</Text>
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
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  routesGrid: { gap: 12, marginBottom: 28 },
  routeCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  routeIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  routeInfo: { flex: 1 },
  routeCardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  routeCardSub: { fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  centerContainer: { padding: 20, alignItems: 'center' },
  emptyCard: { padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 14, marginTop: 8 },
  studentCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderLeftWidth: 5 },
  badgeContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  studentDetails: { flex: 1, marginRight: 8 },
  studentName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  studentAddress: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: 'bold' }
});