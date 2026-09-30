import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function VeiculoScreen() {
  const { colors, modoEscuro } = useTheme();
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meu Veículo</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Gerencie sua van escolar</Text>
        </View>
        {veiculo && !showForm && (
          <TouchableOpacity style={[styles.addHeaderBtn, { backgroundColor: colors.primary }]} onPress={abrirAdicionar}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {veiculo && !showForm ? (
        <View>
          <View style={[styles.cardInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                <Ionicons name="bus" size={28} color="#34D399" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.cardPlaca, { color: colors.text }]}>{veiculo.placa}</Text>
                <Text style={[styles.cardModelo, { color: colors.subtext }]}>{veiculo.modelo}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.specsRow}>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: colors.subtext }]}>Capacidade</Text>
                <Text style={[styles.specValue, { color: colors.text }]}>{veiculo.capacidade_total || '—'} lugares</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={[styles.specLabel, { color: colors.subtext }]}>Status</Text>
                <Text style={[styles.specValue, { color: '#34D399' }]}>Ativo na Frota</Text>
              </View>
            </View>
          </View>

          {/* Botão de Adicionar Novo Veículo */}
          <TouchableOpacity style={[styles.addButtonFull, { backgroundColor: colors.primary }]} onPress={abrirAdicionar}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonFullText}>Adicionar Novo Veículo</Text>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={iniciarEdicao}>
              <Ionicons name="create-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={[styles.editButtonText, { color: colors.text }]}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleExcluirVeiculo}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.border }]}>
            <Ionicons name={isEditing ? "create-outline" : "bus-outline"} size={48} color={colors.subtext} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{isEditing ? 'Editar Veículo' : 'Cadastre sua Van'}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
            {isEditing 
              ? 'Atualize os dados da sua van escolar abaixo.' 
              : 'Informe os dados do veículo para vincular às rotas e monitorar o transporte.'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Placa do Veículo</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: ABC-1234"
              placeholderTextColor={colors.subtext}
              value={placa}
              onChangeText={setPlaca}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Modelo / Marca</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: Renault Master 16L"
              placeholderTextColor={colors.subtext}
              value={modelo}
              onChangeText={setModelo}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Capacidade de Passageiros</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Ex: 15"
              placeholderTextColor={colors.subtext}
              keyboardType="numeric"
              value={capacidade}
              onChangeText={setCapacidade}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryAddButton, { backgroundColor: colors.primary }]}
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
              <Text style={[styles.cancelButtonText, { color: colors.subtext }]}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  addHeaderBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  cardInfo: { padding: 20, borderRadius: 16, borderWidth: 1 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardPlaca: { fontSize: 20, fontWeight: 'bold' },
  cardModelo: { fontSize: 14, marginTop: 2 },
  divider: { height: 1, marginVertical: 16 },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specItem: { flex: 1 },
  specLabel: { fontSize: 12, marginBottom: 4 },
  specValue: { fontSize: 15, fontWeight: 'bold' },
  addButtonFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  addButtonFullText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  actionsRow: { flexDirection: 'row', marginTop: 12, gap: 12 },
  editButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  editButtonText: { fontSize: 15, fontWeight: 'bold' },
  deleteButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', paddingVertical: 14, borderRadius: 12 },
  deleteButtonText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
  formContainer: { padding: 24, borderRadius: 16, borderWidth: 1 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, marginTop: 10 },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 8 },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
});