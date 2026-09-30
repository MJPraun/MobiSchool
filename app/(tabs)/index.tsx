import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, modoEscuro } = useTheme();
  const [totalManha, setTotalManha] = useState(0);
  const [totalTarde, setTotalTarde] = useState(0);
  const [rotaAtiva, setRotaAtiva] = useState('Nenhuma no momento');
  const [corRota, setCorRota] = useState('#64748B');

  const carregarDadosPainel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: alunos, error } = await supabase
        .from('alunos')
        .select('*');

      if (error) throw error;

      const lista = Array.isArray(alunos) ? alunos : [];
      
      const classificarTurno = (t: string) => {
        if (!t) return 'Manhã';
        const str = t.toLowerCase();
        if (str.includes('tard')) return 'Tarde';
        if (str.includes('integ')) return 'Integral';
        return 'Manhã';
      };

      const manha = lista.filter(a => classificarTurno(a.turno) === 'Manhã' || classificarTurno(a.turno) === 'Integral').length;
      const tarde = lista.filter(a => classificarTurno(a.turno) === 'Tarde' || classificarTurno(a.turno) === 'Integral').length;

      setTotalManha(manha);
      setTotalTarde(tarde);

      let horarios = {
        manha_ida_inicio: '06:30', manha_ida_fim: '07:30',
        manha_volta_inicio: '11:30', manha_volta_fim: '12:30',
        tarde_ida_inicio: '12:30', tarde_ida_fim: '13:30',
        tarde_volta_inicio: '17:00', tarde_volta_fim: '18:00',
      };

      if (user) {
        const { data: config } = await supabase
          .from('configuracoes_motorista')
          .select('*')
          .eq('motorista_id', user.id)
          .single();

        if (config) {
          horarios = { ...horarios, ...config };
        }
      }

      const agora = new Date();
      const horaAtualStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

      const estaNoIntervalo = (inicio: string, fim: string) => {
        return horaAtualStr >= inicio && horaAtualStr <= fim;
      };

      if (estaNoIntervalo(horarios.manha_ida_inicio, horarios.manha_ida_fim)) {
        setRotaAtiva('Manhã - Ida (Busca em casa)');
        setCorRota('#F59E0B');
      } else if (estaNoIntervalo(horarios.manha_volta_inicio, horarios.manha_volta_fim)) {
        setRotaAtiva('Manhã - Volta (Saída da escola)');
        setCorRota('#3B82F6');
      } else if (estaNoIntervalo(horarios.tarde_ida_inicio, horarios.tarde_ida_fim)) {
        setRotaAtiva('Tarde - Ida (Busca em casa)');
        setCorRota('#10B981');
      } else if (estaNoIntervalo(horarios.tarde_volta_inicio, horarios.tarde_volta_fim)) {
        setRotaAtiva('Tarde - Volta (Saída da escola)');
        setCorRota('#8B5CF6');
      } else {
        setRotaAtiva('Nenhuma rota ativa no momento');
        setCorRota('#64748B');
      }

    } catch (err) {
      console.log('Erro ao carregar painel:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDadosPainel();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Cabeçalho Padronizado */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeSub, { color: colors.subtext }]}>Resumo do seu dia</Text>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Olá, Luana Silva! 👋</Text>
        </View>

        <TouchableOpacity 
          style={styles.chatIconBtn}
          onPress={() => router.push('/chat' as any)}
        >
          <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* CARDS DE RESUMO (ALUNOS MANHÃ E TARDE) */}
        <View style={styles.cardsRow}>
          <TouchableOpacity style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/alunos')}>
            <View style={styles.metricIconCircle}>
              <Ionicons name="sunny-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.metricNumber, { color: colors.text }]}>{totalManha}</Text>
            <Text style={[styles.metricLabel, { color: colors.subtext }]}>Alunos Manhã</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/alunos')}>
            <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="moon-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.metricNumber, { color: colors.text }]}>{totalTarde}</Text>
            <Text style={[styles.metricLabel, { color: colors.subtext }]}>Alunos Tarde</Text>
          </TouchableOpacity>
        </View>

        {/* CARD DE ROTA ATIVA (AUTOMÁTICA) */}
        <TouchableOpacity style={[styles.routeActiveCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/alunos')}>
          <View style={styles.routeActiveHeader}>
            <View style={[styles.activeDot, { backgroundColor: corRota }]} />
            <Text style={[styles.routeActiveTitle, { color: colors.subtext }]}>Rota Ativa no Momento</Text>
          </View>
          <Text style={[styles.routeActiveValue, { color: colors.text }]}>{rotaAtiva}</Text>
          <Text style={[styles.routeActiveSub, { color: colors.subtext }]}>Toque para ver a lista de alunos por turno.</Text>
        </TouchableOpacity>

        {/* GESTÃO DA VAN */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Gestão da Van</Text>
        <View style={styles.gridRow}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => Alert.alert('Monitora', 'Funcionalidade em desenvolvimento')}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Adicionar Monitora</Text>
            <Text style={[styles.actionSub, { color: colors.subtext }]}>Vincular à van</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/alunos')}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="people-outline" size={20} color="#34D399" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Adicionar Pai / Aluno</Text>
            <Text style={[styles.actionSub, { color: colors.subtext }]}>Gerir alunos</Text>
          </TouchableOpacity>
        </View>

        {/* ACESSO RÁPIDO */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acesso Rápido</Text>
        <TouchableOpacity style={[styles.quickAccessCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/rotas')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
            <View style={styles.quickIconCircle}>
              <Ionicons name="map-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quickTitle, { color: colors.text }]}>Acompanhar Trajeto</Text>
              <Text style={[styles.quickSub, { color: colors.subtext }]}>Ver ordem de embarque e status dos alunos</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
  welcomeSub: { fontSize: 12 },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold' },
  chatIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metricCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  metricIconCircle: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(245, 158, 11, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  metricLabel: { fontSize: 12 },
  routeActiveCard: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  routeActiveHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  activeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  routeActiveTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  routeActiveValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  routeActiveSub: { fontSize: 11 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  actionIconCircle: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  actionSub: { fontSize: 11 },
  quickAccessCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  quickIconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.15)', justifyContent: 'center', alignItems: 'center' },
  quickTitle: { fontSize: 15, fontWeight: 'bold' },
  quickSub: { fontSize: 11, marginTop: 2 }
});