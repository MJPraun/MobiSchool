import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VeiculoScreen() {
  const [veiculo, setVeiculo] = useState(null); // null indica que não há veículo cadastrado

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Veículo</Text>
        <Text style={styles.headerSubtitle}>Gerencie sua van escolar</Text>
      </View>

      {!veiculo && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bus-outline" size={48} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>Nenhum veículo cadastrado</Text>
          <Text style={styles.emptySubtitle}>
            Adicione os dados da sua van (placa, modelo, capacidade) para iniciar o rastreamento e vincular às rotas.
          </Text>
          
          <TouchableOpacity style={styles.primaryAddButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryAddButtonText}>Cadastrar Van</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', paddingTop: 50 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, marginTop: -50 },
  emptyIconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#131824', borderWidth: 1, borderColor: '#1E293B', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  primaryAddButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16 },
  primaryAddButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});