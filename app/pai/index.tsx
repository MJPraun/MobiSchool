import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Modal, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../../lib/supabase';
import FloatingChatButton from '../components/FloatingChatButton';

interface AlunoPai {
  id: string;
  pai_id: string;
  nome: string;
  escola: string;
  endereco: string;
  telefone_contato: string;
  valor_mensalidade: number;
  status_pagamento: 'em_dia' | 'proximo' | 'atrasado';
  chave_pix: string;
  van_id?: string;
}

export default function DashboardPaiScreen() {
  const [aluno, setAluno] = useState<AlunoPai | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Edição de Contato
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [saving, setSaving] = useState(false);

  // Estados do Modal de Adicionar Novo Aluno
  const [isAddAlunoModalOpen, setIsAddAlunoModalOpen] = useState(false);
  const [nomeNovoAluno, setNomeNovoAluno] = useState('');
  const [escolaNovoAluno, setEscolaNovoAluno] = useState('');
  const [serieNovoAluno, setSerieNovoAluno] = useState('');
  const [enderecoNovoAluno, setEnderecoNovoAluno] = useState('');
  const [telefoneNovoAluno, setTelefoneNovoAluno] = useState('');
  const [codigoVanNovoAluno, setCodigoVanNovoAluno] = useState('');
  const [addingAluno, setAddingAluno] = useState(false);

  useEffect(() => {
    fetchAlunoData();
  }, []);

  async function fetchAlunoData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('pai_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAluno(data);
        setNovoEndereco(data.endereco || '');
        setNovoTelefone(data.telefone_contato || '');
      } else {
        setAluno(null);
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do aluno:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- ATUALIZAR CONTATO DO ALUNO ---
  async function handleUpdateContact() {
    if (!aluno) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          endereco: novoEndereco,
          endereco_embarque: novoEndereco,
          telefone_contato: novoTelefone,
        })
        .eq('id', aluno.id);

      if (error) throw error;

      setAluno((prev) => prev ? { ...prev, endereco: novoEndereco, telefone_contato: novoTelefone } : null);
      setIsModalOpen(false);
      Alert.alert('Sucesso', 'Endereço e telefone atualizados com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro ao atualizar', err.message);
    } finally {
      setSaving(false);
    }
  }

  // --- ADICIONAR NOVO ALUNO COMPLETO ---
  async function handleAddAluno() {
    if (!nomeNovoAluno.trim() || !escolaNovoAluno.trim() || !enderecoNovoAluno.trim()) {
      Alert.alert('Atenção', 'Preencha o nome do aluno, a escola e o endereço de embarque.');
      return;
    }

    setAddingAluno(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
        return;
      }

      let vanId = null;
      if (codigoVanNovoAluno.trim()) {
        const { data: vanData } = await supabase
          .from('vans')
          .select('id')
          .eq('id', codigoVanNovoAluno.trim())
          .maybeSingle();

        vanId = vanData?.id || null;
      }

      const { error } = await supabase.from('alunos').insert({
        nome: nomeNovoAluno.trim(),
        escola: escolaNovoAluno.trim(),
        turma_escola: escolaNovoAluno.trim(),
        serie: serieNovoAluno.trim(),
        pai_id: user.id,
        van_id: vanId,
        endereco: enderecoNovoAluno.trim(),
        endereco_embarque: enderecoNovoAluno.trim(),
        telefone_contato: telefoneNovoAluno.trim(),
        turno: 'manha',
      });

      if (error) throw error;

      Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
      setIsAddAlunoModalOpen(false);
      
      // Limpar campos após cadastro
      setNomeNovoAluno('');
      setEscolaNovoAluno('');
      setSerieNovoAluno('');
      setEnderecoNovoAluno('');
      setTelefoneNovoAluno('');
      setCodigoVanNovoAluno('');
      fetchAlunoData();
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err.message);
    } finally {
      setAddingAluno(false);
    }
  }

  // --- NAVEGAR PARA MONITORAMENTO EM TEMPO REAL ---
  function handleMonitorarAluno() {
    router.push('/pai/monitorar');
  }

  async function copyPixKey() {
    if (aluno?.chave_pix) {
      await Clipboard.setStringAsync(aluno.chave_pix);
      Alert.alert('PIX Copiado!', 'Chave PIX copiada para a área de transferência.');
    } else {
      Alert.alert('PIX Indisponível', 'Nenhuma chave PIX registrada pelo motorista.');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.mainWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Painel do Aluno 👦</Text>

        {/* --- BOTÕES PRINCIPAIS DE NAVEGAÇÃO / AÇÃO --- */}
        <View style={styles.actionGrid}>
          {/* Botão Monitorar Aluno */}
          <TouchableOpacity style={styles.primaryActionBtn} onPress={handleMonitorarAluno}>
            <View style={styles.actionIconWrapper}>
              <Ionicons name="location-sharp" size={26} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.primaryActionTitle}>Monitorar Aluno</Text>
              <Text style={styles.primaryActionSub}>Ver localização em tempo real no mapa</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#818CF8" />
          </TouchableOpacity>

          {/* Botão Adicionar Aluno */}
          <TouchableOpacity 
            style={styles.secondaryActionBtn} 
            onPress={() => setIsAddAlunoModalOpen(true)}
          >
            <Ionicons name="person-add-sharp" size={22} color="#38BDF8" />
            <Text style={styles.secondaryActionText}>Adicionar Aluno</Text>
          </TouchableOpacity>
        </View>

        {aluno ? (
          <>
            {/* Card com Informações do Filho */}
            <View style={styles.card}>
              <Text style={styles.studentName}>{aluno.nome}</Text>
              <Text style={styles.subText}>🏫 {aluno.escola}</Text>
              <Text style={styles.subText}>📍 {aluno.endereco || 'Endereço não informado'}</Text>
              <Text style={styles.subText}>📞 {aluno.telefone_contato || 'Telefone não informado'}</Text>
            </View>

            {/* Card de Mensalidade */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={22} color="#60A5FA" />
                <Text style={styles.cardTitle}>Mensalidade</Text>
              </View>

              <Text style={styles.priceText}>
                R$ {aluno.valor_mensalidade ? aluno.valor_mensalidade.toFixed(2) : '0,00'}
              </Text>

              <View style={[
                styles.badge, 
                aluno.status_pagamento === 'em_dia' ? styles.badgeSuccess : styles.badgeWarning
              ]}>
                <Text style={styles.badgeText}>
                  {aluno.status_pagamento === 'em_dia' ? 'Em Dia' : 'Pagamento Pendente / Próximo'}
                </Text>
              </View>

              <TouchableOpacity style={styles.pixButton} onPress={copyPixKey}>
                <Ionicons name="qr-code" size={18} color="#FFF" />
                <Text style={styles.pixText}>Copiar Chave PIX</Text>
              </TouchableOpacity>
            </View>

            {/* Botões de Ação Rápida Secundários */}
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.smallCard, { backgroundColor: '#1E1B4B' }]}
                onPress={() => router.push(`/chat/${aluno.pai_id}`)}
              >
                <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
                <Text style={styles.smallCardText}>Falar com Motorista</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.smallCard, { backgroundColor: '#064E3B' }]}
                onPress={() => setIsModalOpen(true)}
              >
                <Ionicons name="create" size={24} color="#34D399" />
                <Text style={styles.smallCardText}>Editar Contato / Endereço</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={48} color="#64748B" />
            <Text style={styles.emptyText}>Nenhum aluno associado à sua conta de Pai.</Text>
            <TouchableOpacity 
              style={styles.addFirstStudentBtn}
              onPress={() => setIsAddAlunoModalOpen(true)}
            >
              <Text style={styles.addFirstStudentBtnText}>Cadastrar Primeiro Filho</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- MODAL PARA EDITAR ENDEREÇO E TELEFONE --- */}
        <Modal visible={isModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Dados de Contato</Text>

              <Text style={styles.label}>Endereço Completo</Text>
              <TextInput 
                style={styles.modalInput}
                value={novoEndereco}
                onChangeText={setNovoEndereco}
                placeholder="Rua, número, bairro..."
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Telefone de Contato</Text>
              <TextInput 
                style={styles.modalInput}
                value={novoTelefone}
                onChangeText={setNovoTelefone}
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
                placeholderTextColor="#64748B"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#334155' }]} 
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#10B981' }]} 
                  onPress={handleUpdateContact}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalBtnText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- MODAL PARA ADICIONAR ALUNO COMPLETO --- */}
        <Modal visible={isAddAlunoModalOpen} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Cadastrar Novo Filho(a)</Text>

                <Text style={styles.label}>Nome do Aluno *</Text>
                <TextInput 
                  style={styles.modalInput}
                  value={nomeNovoAluno}
                  onChangeText={setNomeNovoAluno}
                  placeholder="Ex: Pedro Henrique"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.label}>Escola *</Text>
                <TextInput 
                  style={styles.modalInput}
                  value={escolaNovoAluno}
                  onChangeText={setEscolaNovoAluno}
                  placeholder="Ex: Colégio Santos"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.label}>Endereço do Aluno (Embarque) *</Text>
                <TextInput 
                  style={styles.modalInput}
                  value={enderecoNovoAluno}
                  onChangeText={setEnderecoNovoAluno}
                  placeholder="Rua, número, bairro..."
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.label}>Telefone de Contato</Text>
                <TextInput 
                  style={styles.modalInput}
                  value={telefoneNovoAluno}
                  onChangeText={setTelefoneNovoAluno}
                  keyboardType="phone-pad"
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.label}>Série / Ano</Text>
                <TextInput 
                  style={styles.modalInput}
                  value={serieNovoAluno}
                  onChangeText={setSerieNovoAluno}
                  placeholder="Ex: 5º Ano Fundamental"
                  placeholderTextColor="#64748B"
                />

                <Text style={styles.label}>Código / ID da Van (Opcional)</Text>
                <TextInput 
                  style={styles.modalInput}
                  value={codigoVanNovoAluno}
                  onChangeText={setCodigoVanNovoAluno}
                  placeholder="Fornecido pelo motorista"
                  placeholderTextColor="#64748B"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: '#334155' }]} 
                    onPress={() => setIsAddAlunoModalOpen(false)}
                  >
                    <Text style={styles.modalBtnText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: '#3B82F6' }]} 
                    onPress={handleAddAluno}
                    disabled={addingAluno}
                  >
                    {addingAluno ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.modalBtnText}>Cadastrar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

      </ScrollView>

      {/* 💬 Botão Flutuante de Chat */}
      {aluno && aluno.pai_id ? <FloatingChatButton paiId={aluno.pai_id} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#0B0D17' },
  container: { flex: 1, backgroundColor: '#0B0D17', padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
  
  // Ações Principais (Monitorar / Adicionar)
  actionGrid: { gap: 12, marginBottom: 20 },
  primaryActionBtn: { 
    backgroundColor: '#312E81', 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
    borderWidth: 1,
    borderColor: '#4338CA'
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryActionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  primaryActionSub: { color: '#A5B4FC', fontSize: 12, marginTop: 2 },
  
  secondaryActionBtn: {
    backgroundColor: '#131824',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  secondaryActionText: { color: '#38BDF8', fontWeight: 'bold', fontSize: 14 },

  // Cards
  card: { backgroundColor: '#131824', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', marginBottom: 16 },
  studentName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  subText: { color: '#94A3B8', fontSize: 14, marginBottom: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  priceText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginVertical: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  badgeSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeWarning: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  badgeText: { color: '#34D399', fontWeight: 'bold', fontSize: 12 },
  pixButton: { flexDirection: 'row', backgroundColor: '#3B82F6', padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 },
  pixText: { color: '#FFF', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 12 },
  smallCard: { flex: 1, padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  smallCardText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  
  // Estado sem Alunos
  emptyCard: { backgroundColor: '#131824', padding: 30, borderRadius: 16, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1E293B' },
  emptyText: { color: '#94A3B8', textAlign: 'center', fontSize: 14 },
  addFirstStudentBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  addFirstStudentBtnText: { color: '#FFF', fontWeight: 'bold' },

  // Modais
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#131824', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  modalInput: { backgroundColor: '#0B0D17', color: '#FFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#1E293B', marginBottom: 14 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold' }
});