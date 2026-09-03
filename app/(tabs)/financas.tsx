import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FinancasScreen() {
  const [transacoes, setTransacoes] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finanças</Text>
        <Text style={styles.headerSubtitle}>Controle de caixa zerado</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo atual</Text>
        <Text style={styles.balanceValue}>R$ 0,00</Text>
      </View>

      {transacoes.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="wallet-outline" size={48} color="#64748B" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Sem movimentações</Text>
          <Text style={styles.emptySubtitle}>
            Cadastre o pagamento de mensalidades ou os gastos com sua van (combustível, manutenção) aqui.
          </Text>
          <TouchableOpacity style={styles.primaryAddButton}>
            <Text style={styles.primaryAddButtonText}>Registrar Transação</Text>
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
  balanceCard: { backgroundColor: '#8B5CF6', marginHorizontal: 20, padding: 24, borderRadius: 16, marginBottom: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  balanceValue: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  emptyStateContainer: { alignItems: 'center', paddingHorizontal: 32, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24 },
  primaryAddButton: { backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  primaryAddButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});