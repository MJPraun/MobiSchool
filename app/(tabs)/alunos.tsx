import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../context/ThemeContext';

export default function AlunosScreen() {
  const { colors, modoEscuro } = useTheme();
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <Text style={[styles.turnoTitle, { color: colors.text }]}>{titulo} ({lista.length})</Text>
        </View>

        {lista.map((aluno) => (
          <View key={aluno.id} style={[styles.cardInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                <Ionicons name="person" size={20} color={corIndicador} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.cardAlunoNome, { color: colors.text }]}>{aluno.nome}</Text>
                <Text style={[styles.cardEscola, { color: colors.subtext }]}>{aluno.escola || 'Escola não informada'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleExcluirAluno(aluno.id, aluno.nome)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: colors.subtext }]}>Série / Turma</Text>
                <Text style={[styles.specValue, { color: colors.text }]}>{aluno.serie || aluno.turma_escola || '—'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: colors.subtext }]}>Status Pagamento</Text>
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
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Lista de Alunos 🎒</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Alunos organizados por turno escolar</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]} 
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? "close" : "add"} size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {showForm ? (
        <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.border }]}>
            <Ionicons name="school-outline" size={48} color={colors.subtext} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Cadastrar Novo Aluno</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
            Insira os dados do aluno para o controlo da van.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nome Completo do Aluno</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: João da Silva"
              placeholderTextColor={colors.subtext}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nome da Escola</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: Colégio Santa Maria"
              placeholderTextColor={colors.subtext}
              value={escola}
              onChangeText={setEscola}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Série / Ano</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: 5º Ano Fundamental"
              placeholderTextColor={colors.subtext}
              value={serie}
              onChangeText={setSerie}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Turno Escolar</Text>
            <View style={styles.turnoRow}>
              {['Manhã', 'Tarde', 'Integral'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.turnoOption, 
                    { backgroundColor: colors.background, borderColor: colors.border }, 
                    turno === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setTurno(item)}
                >
                  <Text style={[styles.turnoText, { color: colors.subtext }, turno === item && styles.turnoTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Telefone de Contato (Responsável)</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: (21) 99999-9999"
              placeholderTextColor={colors.subtext}
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryAddButton, { backgroundColor: colors.primary }]}
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
            <Text style={[styles.cancelButtonText, { color: colors.subtext }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {listaAlunos.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.border }]}>
                <Ionicons name="school-outline" size={48} color={colors.subtext} />
              </View>
              <Text style={[styles.emptyTitleText, { color: colors.subtext }]}>Nenhum aluno cadastrado no sistema.</Text>
              <TouchableOpacity 
                style={[styles.primaryAddButton, { backgroundColor: colors.primary }]} 
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
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addHeaderBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40, flexGrow: 1 },
  turnoSection: { marginBottom: 22 },
  turnoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  turnoDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  turnoTitle: { fontSize: 16, fontWeight: 'bold' },
  cardInfo: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardAlunoNome: { fontSize: 16, fontWeight: 'bold' },
  cardEscola: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 12 },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { flex: 1 },
  specLabel: { fontSize: 11, marginBottom: 2 },
  specValue: { fontSize: 13, fontWeight: 'bold' },
  emptyContainer: { padding: 24, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginTop: 20 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  emptyTitleText: { fontSize: 15, textAlign: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  formContainer: { padding: 24, borderRadius: 16, borderWidth: 1 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  turnoRow: { flexDirection: 'row', gap: 10 },
  turnoOption: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  turnoText: { fontSize: 14, fontWeight: '600' },
  turnoTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, marginTop: 10 },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
});