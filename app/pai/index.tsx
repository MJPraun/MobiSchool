import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function PaiDashboardScreen() {
  const { colors, modoEscuro } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Cabeçalho Padronizado */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.welcomeSub, { color: colors.subtext }]}>Painel do Responsável</Text>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>MobiSchool</Text>
        </View>

        <TouchableOpacity 
          style={styles.chatIconBtn}
          onPress={() => router.push('/chat' as any)}
        >
          <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Card Resumo: Van em Tempo Real */}
        <TouchableOpacity 
          style={[styles.bannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/pai/monitorar')}
        >
          <View style={styles.bannerHeader}>
            <View style={styles.liveIndicator} />
            <Text style={[styles.bannerTag, { color: '#10B981' }]}>EM ROTA AGORA</Text>
          </View>
          <Text style={[styles.bannerTitle, { color: colors.text }]}>Acompanhar Transporte Escolar</Text>
          <Text style={[styles.bannerDesc, { color: colors.subtext }]}>
            Toque para ver a localização exata da van no mapa em tempo real.
          </Text>
        </TouchableOpacity>

        {/* Resumo de Alunos Cadastrados */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alunos Vinculados</Text>
          <TouchableOpacity onPress={() => router.push('/pai/alunos')}>
            <Text style={[styles.seeMore, { color: colors.primary }]}>Gerir</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.studentRow}>
            <View style={[styles.studentAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.studentName, { color: colors.text }]}>Letícia Praun</Text>
              <Text style={[styles.studentDetails, { color: colors.subtext }]}>5º ano fundamental • Manhã</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.studentRow}>
            <View style={[styles.studentAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.studentName, { color: colors.text }]}>Rayan Bernard Praun</Text>
              <Text style={[styles.studentDetails, { color: colors.subtext }]}>2º ano fundamental • Manhã</Text>
            </View>
          </View>
        </View>

        {/* Resumo Financeiro / Mensalidade */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estado Financeiro</Text>
          <TouchableOpacity onPress={() => router.push('/pai/carteira')}>
            <Text style={[styles.seeMore, { color: colors.primary }]}>Ver Carteira</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.financeInfo}>
            <Ionicons name="wallet-outline" size={24} color="#10B981" />
            <View>
              <Text style={[styles.financeTitle, { color: colors.text }]}>Mensalidade Atual</Text>
              <Text style={[styles.financeStatus, { color: '#10B981' }]}>Regular / Em dia</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </View>

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
  bannerCard: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  bannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  bannerTag: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  bannerTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  bannerDesc: { fontSize: 13, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold' },
  seeMore: { fontSize: 13, fontWeight: '600' },
  summaryBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24, gap: 14 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  studentName: { fontSize: 14, fontWeight: 'bold' },
  studentDetails: { fontSize: 12 },
  divider: { height: 1, width: '100%' },
  financeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  financeInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  financeTitle: { fontSize: 14, fontWeight: 'bold' },
  financeStatus: { fontSize: 12, fontWeight: '600', marginTop: 2 }
});