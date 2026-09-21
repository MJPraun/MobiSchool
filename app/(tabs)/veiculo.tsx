import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function VeiculoScreen() {
  const [veiculo, setVeiculo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para o formulário
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState('');

  const buscarVeiculo = async () => {
    try {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setVeiculo(null);
        return;
      }

      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('motorista_id', user.id);

      if (error) {
        console.error('Erro ao buscar veículo:', error.message);
        setVeiculo(null);
        return;
      }

      if (data && data.length > 0) {
        const ultimoVeiculo = data[data.length - 1];
        setVeiculo(ultimoVeiculo);
        setShowForm(false);
      } else {
        setVeiculo(null);
        setShowForm(true); // Se não houver veículo, mostra o formulário diretamente
      }
    } catch (error: any) {
      console.log('Erro inesperado ao buscar veículo:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarVeiculo();
    }, [])
  );

  const handleSalvarVeiculo = async () => {
    if (!placa || !modelo || !capacidade) {
      Alert.alert('Atenção', 'Preencha todos os campos do veículo.');
      return;
    }

    try {
      setSalvando(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Sessão expirada', 'Utilizador não autenticado. Faça login novamente.');
        return;
      }

      if (isEditing && veiculo) {
        // Atualizar veículo existente
        const { error } = await supabase
          .from('veiculos')
          .update({
            placa: placa.toUpperCase().trim(),
            modelo: modelo.trim(),
            capacidade_total: parseInt(capacidade, 10) || 0,
          })
          .eq('id', veiculo.id);

        if (error) throw error;
        Alert.alert('Sucesso!', 'Veículo atualizado com sucesso.');
      } else {
        // Inserir novo veículo
        const { error } = await supabase.from('veiculos').insert([
          {
            motorista_id: user.id,
            placa: placa.toUpperCase().trim(),
            modelo: modelo.trim(),
            capacidade_total: parseInt(capacidade, 10) || 0,
          }
        ]);

        if (error) throw error;
        Alert.alert('Sucesso!', 'Veículo cadastrado com sucesso.');
      }

      setPlaca('');
      setModelo('');
      setCapacidade('');
      setIsEditing(false);
      setShowForm(false);
      buscarVeiculo();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível salvar o veículo.');
    } finally {
      setSalvando(false);
    }
  };

  const abrirAdicionar = () => {
    setPlaca('');
    setModelo('');
    setCapacidade('');
    setIsEditing(false);
    setShowForm(true);
  };

  const iniciarEdicao = () => {
    if (veiculo) {
      setPlaca(veiculo.placa || '');
      setModelo(veiculo.modelo || '');
      setCapacidade(String(veiculo.capacidade_total || ''));
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const cancelarFormulario = () => {
    setShowForm(false);
    setIsEditing(false);
    setPlaca('');
    setModelo('');
    setCapacidade('');
  };

  const handleExcluirVeiculo = () => {
    if (!veiculo) return;

    Alert.alert(
      'Excluir Veículo',
      'Tem certeza de que deseja remover este veículo da frota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('veiculos')
                .delete()
                .eq('id', veiculo.id);

              if (error) throw error;

              Alert.alert('Sucesso', 'Veículo removido com sucesso.');
              setVeiculo(null);
              setShowForm(true);
              buscarVeiculo();
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Não foi possível excluir o veículo.');
              setLoading(false);
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
          <Text style={styles.headerTitle}>Meu Veículo</Text>
          <Text style={styles.headerSubtitle}>Gerencie sua van escolar</Text>
        </View>
        {veiculo && !showForm && (
          <TouchableOpacity style={styles.addHeaderBtn} onPress={abrirAdicionar}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {veiculo && !showForm ? (
          <View>
            <View style={styles.cardInfo}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="bus" size={28} color="#34D399" />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={styles.cardPlaca}>{veiculo.placa}</Text>
                  <Text style={styles.cardModelo}>{veiculo.modelo}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.specsRow}>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Capacidade</Text>
                  <Text style={styles.specValue}>{veiculo.capacidade_total || '—'} lugares</Text>
                </View>
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Status</Text>
                  <Text style={[styles.specValue, { color: '#34D399' }]}>Ativo na Frota</Text>
                </View>
              </View>
            </View>

            {/* Botão de Adicionar Novo Veículo */}
            <TouchableOpacity style={styles.addButtonFull} onPress={abrirAdicionar}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.addButtonFullText}>Adicionar Novo Veículo</Text>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.editButton} onPress={iniciarEdicao}>
                <Ionicons name="create-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleExcluirVeiculo}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name={isEditing ? "create-outline" : "bus-outline"} size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>{isEditing ? 'Editar Veículo' : 'Cadastre sua Van'}</Text>
            <Text style={styles.emptySubtitle}>
              {isEditing 
                ? 'Atualize os dados da sua van escolar abaixo.' 
                : 'Informe os dados do veículo para vincular às rotas e monitorar o transporte.'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Placa do Veículo</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: ABC-1234"
                placeholderTextColor="#64748B"
                value={placa}
                onChangeText={setPlaca}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modelo / Marca</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: Renault Master 16L"
                placeholderTextColor="#64748B"
                value={modelo}
                onChangeText={setModelo}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Capacidade de Passageiros</Text>
              <TextInput 
                style={styles.input}
                placeholder="Ex: 15"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={capacidade}
                onChangeText={setCapacidade}
              />
            </View>

            <TouchableOpacity 
              style={styles.primaryAddButton}
              onPress={handleSalvarVeiculo}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryAddButtonText}>{isEditing ? 'Salvar Alterações' : 'Salvar Veículo'}</Text>
                </>
              )}
            </TouchableOpacity>

            {(isEditing || veiculo) && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelarFormulario}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  addHeaderBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  cardInfo: { backgroundColor: '#131824', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(52, 211, 153, 0.15)', justifyContent: 'center', alignItems: 'center' },
  cardPlaca: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  cardModelo: { fontSize: 14, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 16 },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { flex: 1 },
  specLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  specValue: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  addButtonFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  addButtonFullText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 12 },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#334155', paddingVertical: 14, borderRadius: 12 },
  editButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', paddingVertical: 14, borderRadius: 12 },
  deleteButtonText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
  formContainer: { backgroundColor: '#131824', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#0B0D17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15 },
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 12, marginTop: 10 },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelButtonText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});