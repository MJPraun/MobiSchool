import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RotasScreen() {
  const [rotas, setRotas] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rotas</Text>
        <Text style={styles.headerSubtitle}>Gerencie seus trajetos</Text>
      </View>

      {rotas.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="git-network-outline" size={48} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma rota configurada</Text>
          <Text style={styles.emptySubtitle}>
            Crie sua primeira rota (ex: Escolas - Turno da Manhã) para organizar o embarque dos alunos.
          </Text>
          
          <TouchableOpacity style={styles.primaryAddButton}>
            <Ionicons name="add" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryAddButtonText}>Criar Primeira Rota</Text>
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