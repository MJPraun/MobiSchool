import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estados para o formulário de cadastro de aluno pelo motorista
  const [nome, setNome] = useState('');
  const [escola, setEscola] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState('Manhã');
  const [telefone, setTelefone] = useState('');

  const buscarAlunos = async () => {
    try {
      setLoading(true);
      // Remove o filtro restritivo .eq('motorista_id', ...) para garantir que exibe todos os alunos cadastrados
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setAlunos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log('Erro ao buscar alunos:', error.message);
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAlunos();
    }, [])
  );

  const handleCadastrarAluno = async () => {
    if (!nome.trim() || !escola.trim() || !turno.trim()) {
      Alert.alert('Atenção', 'Preencha o nome, escola e selecione o turno.');
      return;
    }

    try {
      setSalvando(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('alunos').insert([
        {
          motorista_id: user ? user.id : null,
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
      setNome('');
      setEscola('');
      setSerie('');
      setTurno('Manhã');
      setTelefone('');
      setShowForm(false);
      buscarAlunos();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar o aluno.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirAluno = (id: string, nomeAluno: string) => {
    Alert.alert(
      'Remover Aluno',
      `Tem certeza de que deseja remover ${nomeAluno}?`,
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

  // Função inteligente para classificar o turno independentemente de maiúsculas, minúsculas ou acentos
  const classificarTurno = (turnoStr: string) => {
    if (!turnoStr) return 'Manhã';
    const t = turnoStr.toLowerCase();
    if (t.includes('tard')) return 'Tarde';
    if (t.includes('integ')) return 'Integral';
    if (t.includes('manh')) return 'Manhã';
    return turnoStr;
  };

  const listaAlunos = Array.isArray(alunos) ? alunos : [];
  const alunosManha = listaAlunos.filter(a => classificarTurno(a.turno) === 'Manhã');
  const alunosTarde = listaAlunos.filter(a => classificarTurno(a.turno) === 'Tarde');
  const alunosIntegral = listaAlunos.filter(a => classificarTurno(a.turno) === 'Integral');
  const outrosAlunos = listaAlunos.filter(a => {
    const c = classificarTurno(a.turno);
    return c !== 'Manhã' && c !== 'Tarde' && c !== 'Integral';
  });

  const renderizarSecaoTurno = (titulo: string, lista: any[], corIndicador: string) => {
    if (lista.length === 0) return null;

    return (
      <View key={titulo} style={styles.turnoSection}>
        <View style={styles.turnoHeader}>
          <View style={[styles.turnoDot, { backgroundColor: corIndicador }]} />
          <Text style={styles.turnoTitle}>{titulo} ({lista.length})</Text>
        </View>

        {lista.map((aluno) => (
          <View key={aluno.id} style={styles.cardInfo}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={20} color={corIndicador} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardAlunoNome}>{aluno.nome}</Text>
                <Text style={styles.cardEscola}>{aluno.escola || 'Escola não informada'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleExcluirAluno(aluno.id, aluno.nome)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Série / Turma</Text>
                <Text style={styles.specValue}>{aluno.serie || aluno.turma_escola || '—'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Status Pagamento</Text>
                <Text style={[styles.specValue, { color: aluno.status_pagamento === 'Pago' ? '#34D399' : '#F87171' }]}>
                  {aluno.status_pagamento || 'Pendente'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Lista de Alunos 🚌</Text>
          <Text style={styles.headerSubtitle}>Alunos organizados por turno escolar</Text>
        </View>
        <TouchableOpacity 
          style={styles.addHeaderBtn} 
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? "close" : "add"} size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {showForm ? (
          <View style={styles.formContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="school-outline" size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>Cadastrar Novo Aluno</Text>
            <Text style={styles.emptySubtitle}>
              Insira os dados do aluno para o controlo da van.
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
              onPress={handleCadastrarAluno}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryAddButtonText}>Salvar Aluno</Text>
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
            {listaAlunos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="school-outline" size={48} color="#64748B" />
                </View>
                <Text style={styles.emptyTitleText}>Nenhum aluno cadastrado no sistema.</Text>
                <TouchableOpacity 
                  style={styles.primaryAddButton} 
                  onPress={() => setShowForm(true)}
                >
                  <Text style={styles.primaryAddButtonText}>Cadastrar Primeiro Aluno</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {renderizarSecaoTurno('Turno da Manhã', alunosManha, '#F59E0B')}
                {renderizarSecaoTurno('Turno da Tarde', alunosTarde, '#3B82F6')}
                {renderizarSecaoTurno('Turno Integral', alunosIntegral, '#8B5CF6')}
                {renderizarSecaoTurno('Outros Turnos', outrosAlunos, '#10B981')}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addHeaderBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  turnoSection: { marginBottom: 22 },
  turnoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  turnoDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  turnoTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  cardInfo: { backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 10 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(52, 211, 153, 0.15)', justifyContent: 'center', alignItems: 'center' },
  cardAlunoNome: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  cardEscola: { fontSize: 12, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 12 },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { flex: 1 },
  specLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  specValue: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  emptyContainer: { backgroundColor: '#131824', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center', marginTop: 20 },
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
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 12, marginTop: 10 },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelButtonText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});