import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

const VAN_ID_TESTE = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function HomeScreen() {
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [rotasAtivas, setRotasAtivas] = useState(0);
  const [loading, setLoading] = useState(false);

  const carregarResumo = async (isActive = true) => {
    try {
      if (isActive) setLoading(true);

      // Busca contagem total de alunos vinculados à van
      const { count: countAlunos, error: errorAlunos } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true })
        .eq('van_id', VAN_ID_TESTE);

      if (errorAlunos) throw errorAlunos;

      if (isActive) {
        setTotalAlunos(countAlunos || 0);
        setRotasAtivas(countAlunos && countAlunos > 0 ? 2 : 0);
      }

    } catch (error) {
      console.log('Erro ao carregar resumo da home:', error);
    } finally {
      if (isActive) setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      // Executa a busca garantindo a verificação de montagem
      carregarResumo(isActive);

      return () => {
        isActive = false; // Cancela atualizações de estado se a tela desmontar
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => carregarResumo(true)} tintColor="#8B5CF6" />
        }
      >
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

        {/* Cards de Resumo Dinâmicos */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#60A5FA" />
            <Text style={styles.statValue}>{totalAlunos}</Text>
            <Text style={styles.statLabel}>Alunos hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bus" size={24} color="#34D399" />
            <Text style={styles.statValue}>{rotasAtivas}</Text>
            <Text style={styles.statLabel}>Rotas ativas</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acesso Rápido</Text>

        <TouchableOpacity 
          style={styles.quickAccessCard}
          onPress={() => router.push('/(tabs)/rotas')}
        >
          <View style={styles.quickAccessIcon}>
            <Ionicons name="map" size={22} color="#8B5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickAccessTitle}>Acompanhar Trajeto</Text>
            <Text style={styles.quickAccessSub}>Ver ordem de embarque e status dos alunos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
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
  quickAccessCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B', gap: 14 },
  quickAccessIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.15)', justifyContent: 'center', alignItems: 'center' },
  quickAccessTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  quickAccessSub: { fontSize: 13, color: '#64748B' }
});