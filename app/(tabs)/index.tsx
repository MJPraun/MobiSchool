import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, 
  RefreshControl, Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

const VAN_ID_TESTE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function HomeScreen() {
  const [nomeMotorista, setNomeMotorista] = useState<string>('Motorista');
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [rotasAtivas, setRotasAtivas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentVanId, setCurrentVanId] = useState<string>(VAN_ID_TESTE);

  // --- Estados do Modal: Adicionar Monitora ---
  const [isAddMonitoraOpen, setIsAddMonitoraOpen] = useState(false);
  const [emailMonitora, setEmailMonitora] = useState('');
  const [addingMonitora, setAddingMonitora] = useState(false);

  // --- Estados do Modal: Adicionar Pai & Aluno ---
  const [isAddPaiOpen, setIsAddPaiOpen] = useState(false);
  const [emailPai, setEmailPai] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [escolaAluno, setEscolaAluno] = useState('');
  const [serieAluno, setSerieAluno] = useState('');
  const [turnoAluno, setTurnoAluno] = useState<'manha' | 'tarde'>('manha');
  const [addingPai, setAddingPai] = useState(false);

  const carregarResumo = async (isActive = true) => {
    try {
      if (isActive) setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      let activeVanId = VAN_ID_TESTE;
      if (user) {
        // 1. Busca o nome do motorista no perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('nome')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData?.nome && isActive) {
          setNomeMotorista(profileData.nome);
        }

        // 2. Busca a van vinculada ao motorista logado
        const { data: vanData } = await supabase
          .from('vans')
          .select('id')
          .eq('motorista_id', user.id)
          .maybeSingle();

        if (vanData?.id) {
          activeVanId = vanData.id;
          if (isActive) setCurrentVanId(vanData.id);
        }
      }

      // Busca contagem total de alunos vinculados à van
      const { count: countAlunos, error: errorAlunos } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('van_id', activeVanId);

      if (errorAlunos) throw errorAlunos;

      if (isActive) {
        setTotalAlunos(countAlunos || 0);
        setRotasAtivas(countAlunos && countAlunos > 0 ? 2 : 0);
      }

    } catch (error) {
      console.log('Erro ao carregar resumo da home:', error);
    } finally {
      if (isActive) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      carregarResumo(isActive);
      return () => {
        isActive = false;
      };
    }, [])
  );

  // --- LÓGICA: ADICIONAR MONITORA À VAN ---
  const handleAddMonitora = async () => {
    if (!emailMonitora.trim()) {
      Alert.alert('Atenção', 'Informe o e-mail da monitora.');
      return;
    }

    setAddingMonitora(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', emailMonitora.trim())
        .maybeSingle();

      if (profileError || !profileData) {
        Alert.alert(
          'Monitora não encontrada',
          'Não encontramos uma conta com este e-mail. Peça à monitora para se cadastrar no aplicativo primeiro.'
        );
        return;
      }

      const { error: equipeError } = await supabase.from('equipe').insert({
        van_id: currentVanId,
        user_id: profileData.id,
        cargo: 'monitora',
      });

      if (equipeError) {
        if (equipeError.code === '23505') {
          Alert.alert('Aviso', 'Esta monitora já está vinculada à sua van.');
        } else {
          throw equipeError;
        }
        return;
      }

      Alert.alert('Sucesso', 'Monitora vinculada à van com sucesso!');
      setIsAddMonitoraOpen(false);
      setEmailMonitora('');
    } catch (err: any) {
      Alert.alert('Erro ao vincular monitora', err.message);
    } finally {
      setAddingMonitora(false);
    }
  };

  // --- LÓGICA: ADICIONAR PAI E CADASTRAR ALUNO ---
  const handleAddPaiEAluno = async () => {
    if (!nomeAluno.trim() || !escolaAluno.trim() || !emailPai.trim()) {
      Alert.alert('Atenção', 'Preencha o e-mail do pai, nome do aluno e escola.');
      return;
    }

    setAddingPai(true);
    try {
      const { data: paiData } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', emailPai.trim())
        .maybeSingle();

      const paiId = paiData?.id || null;

      if (!paiId) {
        Alert.alert(
          'Aviso',
          'Ainda não existe conta com este e-mail. O aluno será cadastrado na van e o pai poderá ver o filho assim que se cadastrar com este e-mail.'
        );
      }

      const { error: alunoError } = await supabase.from('alunos').insert({
        nome: nomeAluno.trim(),
        escola: escolaAluno.trim(),
        turma_escola: escolaAluno.trim(),
        serie: serieAluno.trim(),
        turno: turnoAluno,
        van_id: currentVanId,
        pai_id: paiId,
      });

      if (alunoError) throw alunoError;

      Alert.alert('Sucesso', 'Aluno cadastrado na van com sucesso!');
      setIsAddPaiOpen(false);
      setEmailPai('');
      setNomeAluno('');
      setEscolaAluno('');
      setSerieAluno('');
      carregarResumo(true);
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar aluno', err.message);
    } finally {
      setAddingPai(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => carregarResumo(true)} tintColor="#8B5CF6" />
        }
      >
        {/* Header com Nome do Motorista */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {nomeMotorista}! 👋</Text>
          <Text style={styles.subtitle}>Resumo do seu dia</Text>
        </View>

        {/* Cards de Resumo Dinâmicos */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#60A5FA" />
            <Text style={styles.statValue}>{totalAlunos}</Text>
            <Text style={styles.statLabel}>Alunos hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bus" size={24} color="#34D399" />
            <Text style={styles.statValue}>{rotasAtivas}</Text>
            <Text style={styles.statLabel}>Rotas ativas</Text>
          </View>
        </View>

        {/* --- SEÇÃO DE GESTÃO DA VAN --- */}
        <Text style={styles.sectionTitle}>Gestão da Van</Text>
        <View style={styles.managementGrid}>
          <TouchableOpacity 
            style={styles.managementCard}
            onPress={() => setIsAddMonitoraOpen(true)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="person-add" size={20} color="#FFF" />
            </View>
            <Text style={styles.managementTitle}>Adicionar Monitora</Text>
            <Text style={styles.managementSub}>Vincular à van</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.managementCard}
            onPress={() => setIsAddPaiOpen(true)}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
              <Ionicons name="people" size={20} color="#FFF" />
            </View>
            <Text style={styles.managementTitle}>Adicionar Pai / Aluno</Text>
            <Text style={styles.managementSub}>Integrar alunos</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Acesso Rápido</Text>

        <TouchableOpacity 
          style={styles.quickAccessCard}
          onPress={() => router.push('/(tabs)/rotas')}
        >
          <View style={styles.quickAccessIcon}>
            <Ionicons name="map" size={22} color="#8B5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickAccessTitle}>Acompanhar Trajeto</Text>
            <Text style={styles.quickAccessSub}>Ver ordem de embarque e status dos alunos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        {/* --- MODAL ADICIONAR MONITORA --- */}
        <Modal visible={isAddMonitoraOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Monitora</Text>
              <Text style={styles.modalSub}>
                Informe o e-mail da monitora cadastrada para dar acesso à chamada da van.
              </Text>

              <Text style={styles.label}>E-mail da Monitora *</Text>
              <TextInput
                style={styles.modalInput}
                value={emailMonitora}
                onChangeText={setEmailMonitora}
                placeholder="monitora@email.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#334155' }]}
                  onPress={() => setIsAddMonitoraOpen(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#8B5CF6' }]}
                  onPress={handleAddMonitora}
                  disabled={addingMonitora}
                >
                  {addingMonitora ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalBtnText}>Vincular</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- MODAL ADICIONAR PAI E ALUNO --- */}
        <Modal visible={isAddPaiOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cadastrar Aluno & Pai</Text>

              <Text style={styles.label}>E-mail do Responsável *</Text>
              <TextInput
                style={styles.modalInput}
                value={emailPai}
                onChangeText={setEmailPai}
                placeholder="pai@email.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Nome do Aluno *</Text>
              <TextInput
                style={styles.modalInput}
                value={nomeAluno}
                onChangeText={setNomeAluno}
                placeholder="Ex: Lucas Silva"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Escola *</Text>
              <TextInput
                style={styles.modalInput}
                value={escolaAluno}
                onChangeText={setEscolaAluno}
                placeholder="Ex: Colégio Pedro II"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Série / Ano</Text>
              <TextInput
                style={styles.modalInput}
                value={serieAluno}
                onChangeText={setSerieAluno}
                placeholder="Ex: 6º Ano"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Turno</Text>
              <View style={styles.turnoRow}>
                <TouchableOpacity
                  style={[
                    styles.turnoBtn,
                    turnoAluno === 'manha' && styles.turnoBtnActive,
                  ]}
                  onPress={() => setTurnoAluno('manha')}
                >
                  <Text style={styles.turnoBtnText}>☀️ Manhã</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.turnoBtn,
                    turnoAluno === 'tarde' && styles.turnoBtnActive,
                  ]}
                  onPress={() => setTurnoAluno('tarde')}
                >
                  <Text style={styles.turnoBtnText}>🌤️ Tarde</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#334155' }]}
                  onPress={() => setIsAddPaiOpen(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#10B981' }]}
                  onPress={handleAddPaiEAluno}
                  disabled={addingPai}
                >
                  {addingPai ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalBtnText}>Cadastrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#131824', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  statLabel: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  
  // Gestão da Van Cards
  managementGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  managementCard: {
    flex: 1,
    backgroundColor: '#131824',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  managementTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  managementSub: { color: '#64748B', fontSize: 11 },

  // Acesso Rápido
  quickAccessCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', gap: 14 },
  quickAccessIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.15)', justifyContent: 'center', alignItems: 'center' },
  quickAccessTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  quickAccessSub: { fontSize: 13, color: '#64748B' },

  // Modais
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#131824', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalSub: { color: '#94A3B8', fontSize: 12, marginBottom: 12 },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 6, marginTop: 8 },
  modalInput: { backgroundColor: '#0B0D17', color: '#FFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#1E293B' },
  
  turnoRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  turnoBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#0B0D17', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  turnoBtnActive: { backgroundColor: '#1E293B', borderColor: '#3B82F6' },
  turnoBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold' }
});