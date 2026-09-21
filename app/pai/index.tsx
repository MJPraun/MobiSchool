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
}

export default function DashboardPaiScreen() {
  const [aluno, setAluno] = useState<AlunoPai | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [saving, setSaving] = useState(false);

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
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAluno(data);
        setNovoEndereco(data.endereco || '');
        setNovoTelefone(data.telefone_contato || '');
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do aluno:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateContact() {
    if (!aluno) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          endereco: novoEndereco,
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

            {/* Botões de Ação Rápida */}
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
          <Text style={styles.subText}>Nenhum aluno associado à sua conta de Pai.</Text>
        )}

        {/* Modal para Editar Endereço e Telefone */}
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
      </ScrollView>

      {/* 💬 Botão Flutuante de Chat */}
      {aluno && <FloatingChatButton paiId={aluno.pai_id} />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#0B0D17' },
  container: { flex: 1, backgroundColor: '#0B0D17', padding: 20, paddingTop: 60 },
  loadingContainer: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 20 },
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#131824', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  label: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  modalInput: { backgroundColor: '#0B0D17', color: '#FFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#1E293B', marginBottom: 14 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontWeight: 'bold' }
});