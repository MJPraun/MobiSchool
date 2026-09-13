import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, StatusBar, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

const VAN_ID_TESTE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function DriverRouteScreen() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlunosRota = async () => {
    try {
      setLoading(true);
      console.log('Buscando van ID:', VAN_ID_TESTE);

      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Sessão atual:', sessionData?.session?.user?.id || 'Nenhum usuário logado');

      const { data, error, status } = await supabase
        .from('alunos')
        .select('*')
        .eq('van_id', VAN_ID_TESTE)
        .order('ordem_rota', { ascending: true });

      console.log('Status HTTP Supabase:', status);
      console.log('Erro retornado:', error);
      console.log('Dados brutos retornados:', data);

      if (error) throw error;
      setAlunos(data || []);
    } catch (error: any) {
      console.error('Erro detalhado:', error.message);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunosRota();

    const subscription = supabase
      .channel('public:alunos')
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
      case 'embarcado': return '#27ae60';
      case 'entregue': return '#2980b9';
      default: return '#7f8c8d';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { borderLeftColor: getStatusColor(item.status_embarque) }]}>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{item.ordem_rota}º</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.nomeAluno}>{item.nome}</Text>
        <Text style={styles.escolaText}>{item.turma_escola}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status_embarque) }]}>
        <Text style={styles.statusText}>{item.status_embarque ? item.status_embarque.toUpperCase() : 'FORA'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel do Motorista — Rota</Text>
        <Text style={styles.headerSubtitle}>Van: ABC-1234 (Acompanhamento em Tempo Real)</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Carregando rota...</Text>
        </View>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhuma rota configurada ou alunos não encontrados.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17' },
  header: { padding: 20, paddingTop: 40 },
  headerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  listContainer: { padding: 16, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: '#94a3b8', fontSize: 16 },
  emptyText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#161b22', borderRadius: 8, padding: 14, marginBottom: 12, alignItems: 'center', borderLeftWidth: 6 },
  badgeContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#21262d', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  badgeText: { fontWeight: 'bold', color: '#ffffff', fontSize: 12 },
  infoContainer: { flex: 1 },
  nomeAluno: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
  escolaText: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  statusText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
});