import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

const VAN_ID_TESTE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function FinancasScreen() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados do formulário de nova transação
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [salvando, setSalvando] = useState(false);

  const buscarTransacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('van_id', VAN_ID_TESTE)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existir ou outro erro estrutural, tratamos de forma amigável
        console.log('Erro ao buscar transações (tabela pode não existir ainda):', error.message);
        setTransacoes([]);
      } else {
        setTransacoes(data || []);
      }
    } catch (error: any) {
      console.log('Erro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarTransacoes();
    }, [])
  );

  const handleSalvarTransacao = async () => {
    if (!descricao || !valor) {
      Alert.alert('Atenção', 'Preencha a descrição e o valor.');
      return;
    }

    try {
      setSalvando(true);
      const valorNumerico = parseFloat(valor.replace(',', '.')) || 0;

      const { error } = await supabase.from('transacoes').insert([
        {
          van_id: VAN_ID_TESTE,
          descricao,
          valor: valorNumerico,
          tipo, // 'receita' ou 'despesa'
        }
      ]);

      if (error) throw error;

      Alert.alert('Sucesso!', 'Registro financeiro salvo.');
      setDescricao('');
      setValor('');
      setModalVisible(false);
      buscarTransacoes();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o registro. Verifique se a tabela "transacoes" foi criada no Supabase.');
    } finally {
      setSalvando(false);
    }
  };

  // Cálculo de totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Finanças</Text>
          <Text style={styles.headerSubtitle}>Controle de mensalidades e despesas</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Resumo Financeiro */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, { color: '#34D399' }]}>
              R$ {totalReceitas.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, { color: '#F87171' }]}>
              R$ {totalDespesas.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.saldoCard}>
          <Text style={styles.saldoLabel}>Saldo Líquido</Text>
          <Text style={[styles.saldoValue, { color: saldoLiquido >= 0 ? '#34D399' : '#F87171' }]}>
            R$ {saldoLiquido.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Histórico de Lançamentos</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        ) : transacoes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={32} color="#64748B" />
            <Text style={styles.emptyText}>Nenhuma transação registrada ainda.</Text>
            <Text style={styles.emptySubText}>Toque no botão "+" no topo para adicionar.</Text>
          </View>
        ) : (
          transacoes.map((item) => {
            const isReceita = item.tipo === 'receita';
            return (
              <View key={item.id} style={styles.transactionCard}>
                <View style={[styles.transIconBox, { backgroundColor: isReceita ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)' }]}>
                  <Ionicons 
                    name={isReceita ? "arrow-down" : "arrow-up"} 
                    size={20} 
                    color={isReceita ? "#34D399" : "#F87171"} 
                  />
                </View>
                <View style={styles.transInfo}>
                  <Text style={styles.transDesc}>{item.descricao}</Text>
                  <Text style={styles.transDate}>
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={[styles.transValor, { color: isReceita ? '#34D399' : '#F87171' }]}>
                  {isReceita ? '+ ' : '- '}R$ {Number(item.valor).toFixed(2)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal para Adicionar Transação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Lançamento</Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeButton, tipo === 'receita' && styles.typeButtonReceitaActive]}
                onPress={() => setTipo('receita')}
              >
                <Text style={[styles.typeButtonText, tipo === 'receita' && { color: '#34D399' }]}>Receita</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, tipo === 'despesa' && styles.typeButtonDespesaActive]}
                onPress={() => setTipo('despesa')}
              >
                <Text style={[styles.typeButtonText, tipo === 'despesa' && { color: '#F87171' }]}>Despesa</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: Mensalidade João / Combustível"
                placeholderTextColor="#64748B"
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valor (R$)</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: 250.00"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
              />
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
                onPress={handleSalvarTransacao}
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
  addButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  summaryContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  summaryLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  saldoCard: { backgroundColor: '#131824', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 24 },
  saldoLabel: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  saldoValue: { fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  center: { padding: 20, alignItems: 'center' },
  emptyCard: { backgroundColor: '#131824', padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  emptyText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  emptySubText: { color: '#64748B', fontSize: 13, marginTop: 4 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131824', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  transIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transInfo: { flex: 1 },
  transDesc: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  transDate: { fontSize: 12, color: '#64748B' },
  transValor: { fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#131824', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  typeButtonReceitaActive: { backgroundColor: 'rgba(52, 211, 153, 0.1)', borderColor: '#34D399' },
  typeButtonDespesaActive: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: '#F87171' },
  typeButtonText: { color: '#64748B', fontWeight: 'bold', fontSize: 14 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#0B0D17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B', alignItems: 'center' },
  cancelButtonText: { color: '#94A3B8', fontWeight: 'bold' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#8B5CF6', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: 'bold' }
});