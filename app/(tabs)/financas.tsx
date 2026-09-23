import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function FinancasScreen() {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Finanças 💰</Text>
          <Text style={styles.headerSubtitle}>Mensalidades e controle por aluno</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo Financeiro */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Recebido</Text>
            <Text style={[styles.summaryValue, { color: '#34D399' }]}>
              R$ {totalRecebido.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pendente</Text>
            <Text style={[styles.summaryValue, { color: '#F87171' }]}>
              R$ {totalPendente.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>Previsão Total Mensal</Text>
          <Text style={[styles.saldoValue, { color: '#8B5CF6' }]}>
            R$ {previsaoTotal.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Mensalidades dos Alunos</Text>
        <Text style={styles.sectionSub}>Toque num aluno para configurar o valor e o status</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        ) : alunos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={32} color="#64748B" />
            <Text style={styles.emptyText}>Nenhum aluno registrado no sistema.</Text>
          </View>
        ) : (
          alunos.map((aluno) => {
            const isPago = aluno.status_pagamento === 'Pago';
            return (
              <TouchableOpacity 
                key={aluno.id} 
                style={styles.transactionCard}
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
                  <Text style={styles.transDesc}>{aluno.nome}</Text>
                  <Text style={styles.transDate}>
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
      </ScrollView>

      {/* Modal para Editar Mensalidade do Aluno */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gerir Mensalidade</Text>
            {alunoSelecionado && (
              <Text style={styles.modalSubTitle}>Aluno: <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{alunoSelecionado.nome}</Text></Text>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor da Mensalidade (R$)</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: 250.00"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data / Vencimento</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: Dia 10"
                placeholderTextColor="#64748B"
                value={vencimento}
                onChangeText={setVencimento}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status do Pagamento</Text>
              <View style={styles.typeSelector}>
                {['Pendente', 'Pago'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.typeButton, statusPagamento === item && (item === 'Pago' ? styles.typeButtonReceitaActive : styles.typeButtonDespesaActive)]}
                    onPress={() => setStatusPagamento(item)}
                  >
                    <Text style={[styles.typeButtonText, statusPagamento === item && { color: item === 'Pago' ? '#34D399' : '#F87171' }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Pagamento</Text>
              <View style={styles.typeSelector}>
                {['Pix', 'Dinheiro', 'Cartão'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.typeButton, tipoPagamento === item && styles.typeButtonActive]}
                    onPress={() => setTipoPagamento(item)}
                  >
                    <Text style={[styles.typeButtonText, tipoPagamento === item && { color: '#8B5CF6' }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  summaryContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  summaryLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  saldoCard: { backgroundColor: '#131824', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 20 },
  saldoLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  saldoValue: { fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  center: { padding: 20, alignItems: 'center' },
  emptyCard: { backgroundColor: '#131824', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  emptyText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131824', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  transIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transInfo: { flex: 1 },
  transDesc: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  transDate: { fontSize: 11, color: '#64748B' },
  transValor: { fontSize: 15, fontWeight: 'bold' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#131824', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  modalSubTitle: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  typeButtonReceitaActive: { backgroundColor: 'rgba(52, 211, 153, 0.1)', borderColor: '#34D399' },
  typeButtonDespesaActive: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: '#F87171' },
  typeButtonActive: { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: '#8B5CF6' },
  typeButtonText: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  inputGroup: { marginBottom: 14 },
  label: { color: '#E2E8F0', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#0B0D17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#FFFFFF', fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  cancelButtonText: { color: '#94A3B8', fontWeight: 'bold' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#8B5CF6', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold' }
});