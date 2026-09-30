import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function FinancasScreen() {
  const { colors, modoEscuro } = useTheme();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null);

  // Estados do formulário de edição financeira do aluno
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [statusPagamento, setStatusPagamento] = useState('Pendente');
  const [tipoPagamento, setTipoPagamento] = useState('Pix');
  const [salvando, setSalvando] = useState(false);

  const buscarAlunosFinancas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error: any) {
      console.log('Erro ao buscar finanças dos alunos:', error.message);
      setAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarAlunosFinancas();
    }, [])
  );

  const abrirModalEdicao = (aluno: any) => {
    setAlunoSelecionado(aluno);
    setValor(aluno.valor_mensalidade ? String(aluno.valor_mensalidade) : '');
    setVencimento(aluno.vencimento || 'Dia 10');
    setStatusPagamento(aluno.status_pagamento || 'Pendente');
    setTipoPagamento(aluno.tipo_pagamento || 'Pix');
    setModalVisible(true);
  };

  const handleSalvarFinanceiroAluno = async () => {
    if (!alunoSelecionado) return;

    try {
      setSalvando(true);
      const valorNumerico = parseFloat(valor.replace(',', '.')) || 0;

      const { error } = await supabase
        .from('alunos')
        .update({
          valor_mensalidade: valorNumerico,
          vencimento: vencimento.trim(),
          status_pagamento: statusPagamento,
          tipo_pagamento: tipoPagamento,
        })
        .eq('id', alunoSelecionado.id);

      if (error) throw error;

      Alert.alert('Sucesso!', 'Dados financeiros do aluno atualizados.');
      setModalVisible(false);
      buscarAlunosFinancas();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o registro.');
    } finally {
      setSalvando(false);
    }
  };

  // Cálculo de totais com base nas mensalidades dos alunos
  const totalRecebido = alunos
    .filter(a => a.status_pagamento === 'Pago')
    .reduce((acc, a) => acc + (Number(a.valor_mensalidade) || 0), 0);

  const totalPendente = alunos
    .filter(a => a.status_pagamento !== 'Pago')
    .reduce((acc, a) => acc + (Number(a.valor_mensalidade) || 0), 0);

  const previsaoTotal = totalRecebido + totalPendente;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Finanças 💰</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Mensalidades e controle por aluno</Text>
        </View>
      </View>

      {/* Resumo Financeiro */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Recebido</Text>
          <Text style={[styles.summaryValue, { color: '#34D399' }]}>
            R$ {totalRecebido.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Pendente</Text>
          <Text style={[styles.summaryValue, { color: '#F87171' }]}>
            R$ {totalPendente.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={[styles.saldoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.saldoLabel, { color: colors.subtext }]}>Previsão Total Mensal</Text>
        <Text style={[styles.saldoValue, { color: colors.primary }]}>
          R$ {previsaoTotal.toFixed(2)}
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Mensalidades dos Alunos</Text>
      <Text style={[styles.sectionSub, { color: colors.subtext }]}>Toque num aluno para configurar o valor e o status</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : alunos.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="wallet-outline" size={32} color={colors.subtext} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum aluno registrado no sistema.</Text>
        </View>
      ) : (
        alunos.map((aluno) => {
          const isPago = aluno.status_pagamento === 'Pago';
          return (
            <TouchableOpacity 
              key={aluno.id} 
              style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => abrirModalEdicao(aluno)}
            >
              <View style={[styles.transIconBox, { backgroundColor: isPago ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)' }]}>
                <Ionicons 
                  name={isPago ? "checkmark-circle" : "time-outline"} 
                  size={22} 
                  color={isPago ? "#34D399" : "#F87171"} 
                />
              </View>
              <View style={styles.transInfo}>
                <Text style={[styles.transDesc, { color: colors.text }]}>{aluno.nome}</Text>
                <Text style={[styles.transDate, { color: colors.subtext }]}>
                  Escola: {aluno.escola || 'Não informada'} • Venc: {aluno.vencimento || '—'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.transValor, { color: isPago ? '#34D399' : '#F87171' }]}>
                  R$ {Number(aluno.valor_mensalidade || 0).toFixed(2)}
                </Text>
                <Text style={[styles.badgeText, { color: isPago ? '#34D399' : '#F87171', marginTop: 2 }]}>
                  {aluno.status_pagamento || 'Pendente'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Modal para Editar Mensalidade do Aluno */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Gerir Mensalidade</Text>
            {alunoSelecionado && (
              <Text style={[styles.modalSubTitle, { color: colors.subtext }]}>Aluno: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{alunoSelecionado.nome}</Text></Text>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Valor da Mensalidade (R$)</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Ex: 250.00"
                placeholderTextColor={colors.subtext}
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Data / Vencimento</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Ex: Dia 10"
                placeholderTextColor={colors.subtext}
                value={vencimento}
                onChangeText={setVencimento}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Status do Pagamento</Text>
              <View style={styles.typeSelector}>
                {['Pendente', 'Pago'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.typeButton, 
                      { backgroundColor: colors.background, borderColor: colors.border }, 
                      statusPagamento === item && (item === 'Pago' ? styles.typeButtonReceitaActive : styles.typeButtonDespesaActive)
                    ]}
                    onPress={() => setStatusPagamento(item)}
                  >
                    <Text style={[styles.typeButtonText, { color: colors.subtext }, statusPagamento === item && { color: item === 'Pago' ? '#34D399' : '#F87171' }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Tipo de Pagamento</Text>
              <View style={styles.typeSelector}>
                {['Pix', 'Dinheiro', 'Cartão'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.typeButton, 
                      { backgroundColor: colors.background, borderColor: colors.border }, 
                      tipoPagamento === item && styles.typeButtonActive
                    ]}
                    onPress={() => setTipoPagamento(item)}
                  >
                    <Text style={[styles.typeButtonText, { color: colors.subtext }, tipoPagamento === item && { color: colors.primary }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.subtext }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSalvarFinanceiroAluno}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  summaryContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  summaryLabel: { fontSize: 13, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  saldoCard: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  saldoLabel: { fontSize: 13, marginBottom: 4 },
  saldoValue: { fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  sectionSub: { fontSize: 12, marginBottom: 12 },
  center: { padding: 20, alignItems: 'center' },
  emptyCard: { padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  transIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transInfo: { flex: 1 },
  transDesc: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  transDate: { fontSize: 11 },
  transValor: { fontSize: 15, fontWeight: 'bold' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  modalSubTitle: { fontSize: 13, marginBottom: 16 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  typeButtonReceitaActive: { backgroundColor: 'rgba(52, 211, 153, 0.1)', borderColor: '#34D399' },
  typeButtonDespesaActive: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: '#F87171' },
  typeButtonActive: { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: '#8B5CF6' },
  typeButtonText: { fontWeight: 'bold', fontSize: 13 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelButtonText: { fontWeight: 'bold' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold' }
});