import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function PaiIndexScreen() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [alunoEmEdicaoId, setAlunoEmEdicaoId] = useState<string | null>(null);

  // Estados para o formulário de cadastro/edição
  const [nome, setNome] = useState('');
  const [escola, setEscola] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState('Manhã');
  const [telefone, setTelefone] = useState('');

  const buscarAlunos = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setAlunos([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('pai_id', user.id);

      if (error) throw error;
      setAlunos(data || []);
    } catch (error: any) {
      console.log('Erro ao buscar alunos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAlunos();
    }, [])
  );

  const abrirFormularioNovo = () => {
    setAlunoEmEdicaoId(null);
    setNome('');
    setEscola('');
    setSerie('');
    setTurno('Manhã');
    setTelefone('');
    setShowForm(true);
  };

  const abrirFormularioEdicao = (aluno: any) => {
    setAlunoEmEdicaoId(aluno.id);
    setNome(aluno.nome || '');
    setEscola(aluno.escola || '');
    setSerie(aluno.serie || aluno.turma_escola || '');
    setTurno(aluno.turno || 'Manhã');
    setTelefone(aluno.telefone_contato || aluno.telefone || '');
    setShowForm(true);
  };

  const handleSalvarAluno = async () => {
    if (!nome.trim() || !escola.trim() || !turno.trim()) {
      Alert.alert('Atenção', 'Preencha o nome, escola e selecione o turno.');
      return;
    }

    try {
      setSalvando(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Sessão expirada', 'Faça login novamente.');
        return;
      }

      if (alunoEmEdicaoId) {
        // Atualizar aluno existente
        const { error } = await supabase
          .from('alunos')
          .update({
            nome: nome.trim(),
            escola: escola.trim(),
            turma_escola: serie.trim(),
            serie: serie.trim(),
            turno: turno.trim(),
            telefone_contato: telefone.trim(),
          })
          .eq('id', alunoEmEdicaoId);

        if (error) throw error;
        Alert.alert('Sucesso!', 'Dados do aluno atualizados com sucesso.');
      } else {
        // Inserir novo aluno
        const { error } = await supabase.from('alunos').insert([
          {
            pai_id: user.id,
            nome: nome.trim(),
            escola: escola.trim(),
            turma_escola: serie.trim(),
            serie: serie.trim(),
            turno: turno.trim(),
            telefone_contato: telefone.trim(),
            status_embarque: 'Aguardando',
            status_pagamento: 'Pendente',
            tipo_pagamento: 'Pix',
          }
        ]);

        if (error) throw error;
        Alert.alert('Sucesso!', 'Aluno cadastrado com sucesso.');
      }

      setAlunoEmEdicaoId(null);
      setNome('');
      setEscola('');
      setSerie('');
      setTurno('Manhã');
      setTelefone('');
      setShowForm(false);
      buscarAlunos();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o aluno.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirAluno = (id: string) => {
    Alert.alert(
      'Remover Aluno',
      'Tem certeza de que deseja remover este aluno?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('alunos').delete().eq('id', id);
              if (error) throw error;
              buscarAlunos();
            } catch (err: any) {
              Alert.alert('Erro', err.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Painel do Aluno 👦</Text>
          <Text style={styles.headerSubtitle}>Gerencie os seus filhos e pagamentos</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Cartão de Monitorar Aluno */}
        <TouchableOpacity 
          style={styles.monitorCard}
          onPress={() => router.push('/pai/monitorar')}
        >
          <View style={styles.monitorIconCircle}>
            <Ionicons name="location" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.monitorTitle}>Monitorar Aluno</Text>
            <Text style={styles.monitorSubtitle}>Ver localização em tempo real no mapa</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        {/* Cartão de Acesso à Carteira / Mensalidade */}
        <TouchableOpacity 
          style={[styles.monitorCard, { borderColor: '#4C1D95', backgroundColor: '#13112E' }]}
          onPress={() => router.push('/pai/carteira' as any)}
        >
          <View style={[styles.monitorIconCircle, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.monitorTitle}>Carteira & Mensalidade</Text>
            <Text style={styles.monitorSubtitle}>Status financeiro</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>

        {showForm ? (
          <View style={styles.formContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="school-outline" size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>{alunoEmEdicaoId ? 'Editar Aluno' : 'Cadastrar Filho(a)'}</Text>
            <Text style={styles.emptySubtitle}>
              Informe os dados escolares para o cálculo automático das rotas.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo do Aluno</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: João da Silva"
                placeholderTextColor="#64748B"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome da Escola</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: Colégio Santa Maria"
                placeholderTextColor="#64748B"
                value={escola}
                onChangeText={setEscola}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Série / Ano</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: 5º Ano Fundamental"
                placeholderTextColor="#64748B"
                value={serie}
                onChangeText={setSerie}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Turno Escolar</Text>
              <View style={styles.turnoRow}>
                {['Manhã', 'Tarde', 'Integral'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.turnoOption, turno === item && styles.turnoOptionActive]}
                    onPress={() => setTurno(item)}
                  >
                    <Text style={[styles.turnoText, turno === item && styles.turnoTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone de Contato (Responsável)</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: (21) 99999-9999"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryAddButton}
              onPress={handleSalvarAluno}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryAddButtonText}>{alunoEmEdicaoId ? 'Salvar Alterações' : 'Salvar Aluno'}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {alunos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="school-outline" size={48} color="#64748B" />
                </View>
                <Text style={styles.emptyTitleText}>Nenhum aluno associado à sua conta de Pai.</Text>
                <TouchableOpacity 
                  style={styles.primaryAddButton} 
                  onPress={abrirFormularioNovo}
                >
                  <Text style={styles.primaryAddButtonText}>Cadastrar Primeiro Filho</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <TouchableOpacity 
                  style={styles.addBarButton} 
                  onPress={abrirFormularioNovo}
                >
                  <Ionicons name="person-add-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.addBarButtonText}>Adicionar Aluno</Text>
                </TouchableOpacity>

                {alunos.map((aluno) => (
                  <View key={aluno.id} style={styles.cardInfo}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="person" size={24} color="#34D399" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.cardAlunoNome}>{aluno.nome}</Text>
                        <Text style={styles.cardEscola}>{aluno.escola || aluno.turma_escola || 'Escola não informada'}</Text>
                      </View>
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity onPress={() => abrirFormularioEdicao(aluno)} style={styles.actionIconBtn}>
                          <Ionicons name="pencil-outline" size={18} color="#8B5CF6" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleExcluirAluno(aluno.id)} style={styles.actionIconBtn}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.specsRow}>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Série</Text>
                        <Text style={styles.specValue}>{aluno.serie || aluno.turma_escola || '—'}</Text>
                      </View>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Turno</Text>
                        <Text style={[styles.specValue, { color: '#34D399' }]}>{aluno.turno || 'Manhã'}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', paddingTop: 50 },
  centerContainer: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  content: { padding: 20, paddingBottom: 40 },
  monitorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1B4B', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#312E81', marginBottom: 14 },
  monitorIconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  monitorTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  monitorSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  addBarButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
  addBarButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  cardInfo: { backgroundColor: '#131824', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(52, 211, 153, 0.15)', justifyContent: 'center', alignItems: 'center' },
  cardAlunoNome: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  cardEscola: { fontSize: 13, color: '#64748B', marginTop: 2 },
  actionButtonsRow: { flexDirection: 'row', gap: 8 },
  actionIconBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 14 },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { flex: 1 },
  specLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  specValue: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  emptyContainer: { backgroundColor: '#131824', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  emptyTitleText: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  formContainer: { backgroundColor: '#131824', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  inputGroup: { marginBottom: 16 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#0B0D17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15 },
  turnoRow: { flexDirection: 'row', gap: 10 },
  turnoOption: { flex: 1, backgroundColor: '#0B0D17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  turnoOptionActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  turnoText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  turnoTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 12, marginTop: 10, width: '100%' },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelButtonText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});