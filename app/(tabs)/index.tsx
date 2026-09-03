import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [atividades, setAtividades] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Motorista! 👋</Text>
          <Text style={styles.subtitle}>Resumo do seu dia</Text>
        </View>

        {/* --- BOTÕES DE TESTE TEMPORÁRIOS --- */}
        <View style={styles.testButtonsContainer}>
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#60A5FA' }]}
            onPress={() => router.push('/pai/carteira')}
          >
            <Text style={styles.testButtonText}>Testar Visão Pai</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push('/monitora/scanner')}
          >
            <Text style={styles.testButtonText}>Testar Scanner</Text>
          </TouchableOpacity>
        </View>
        {/* ----------------------------------- */}

        {/* Cards de Resumo Zerados */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#60A5FA" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Alunos hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bus" size={24} color="#34D399" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Rotas ativas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Próximas Paradas</Text>

        {atividades.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={40} color="#64748B" />
            <Text style={styles.emptyText}>Seu dia ainda não começou.</Text>
            <Text style={styles.emptySubText}>Inicie uma rota para ver as próximas paradas aqui.</Text>
          </View>
        ) : (
          <View>{/* Lista de atividades vira aqui futuramente */}</View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17' },
  content: { padding: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  testButtonsContainer: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  testButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  testButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#131824', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  statLabel: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  emptyState: { alignItems: 'center', backgroundColor: '#131824', padding: 32, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginTop: 12 },
  emptySubText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
});