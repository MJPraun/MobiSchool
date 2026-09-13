import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

const MOTORISTA_ID_TESTE = '11111111-1111-1111-1111-111111111111'; // ID temporário para testes

export default function VeiculoScreen() {
  const [veiculo, setVeiculo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cadastrando, setCadastrando] = useState(false);

  // Estados para o formulário de cadastro caso não exista veículo
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [capacidade, setCapacidade] = useState('');

  const buscarVeiculo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('motorista_id', MOTORISTA_ID_TESTE)
        .maybeSingle();

      if (error) throw error;
      setVeiculo(data);
    } catch (error: any) {
      console.log('Erro ao buscar veículo:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarVeiculo();
    }, [])
  );

  const handleCadastrarVeiculo = async () => {
    if (!placa || !modelo || !capacidade) {
      Alert.alert('Atenção', 'Preencha todos os campos do veículo.');
      return;
    }

    try {
      setCadastrando(true);
      const { error } = await supabase.from('veiculos').insert([
        {
          motorista_id: MOTORISTA_ID_TESTE,
          placa: placa.toUpperCase(),
          modelo,
          capacidade_total: parseInt(capacidade, 10) || 0,
        }
      ]);

      if (error) throw error;

      Alert.alert('Sucesso!', 'Veículo cadastrado com sucesso.');
      setPlaca('');
      setModelo('');
      setCapacidade('');
      buscarVeiculo();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar o veículo.');
    } finally {
      setCadastrando(false);
    }
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Veículo</Text>
        <Text style={styles.headerSubtitle}>Gerencie sua van escolar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {veiculo ? (
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
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bus-outline" size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>Cadastre sua Van</Text>
            <Text style={styles.emptySubtitle}>
              Informe os dados do veículo para vincular às rotas e monitorar o transporte.
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
              onPress={handleCadastrarVeiculo}
              disabled={cadastrando}
            >
              {cadastrando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryAddButtonText}>Salvar Veículo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', paddingTop: 50 },
  centerContainer: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
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
  formContainer: { backgroundColor: '#131824', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#0B0D17', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15 },
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 12, marginTop: 10 },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});