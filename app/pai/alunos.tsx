import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function AlunosScreen() {
  const { colors, modoEscuro } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meus Filhos</Text>
        <Text style={[styles.headerSub, { color: colors.subtext }]}>Gerencie os alunos cadastrados</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Botão Adicionar Aluno */}
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="person-add-outline" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Adicionar Aluno</Text>
        </TouchableOpacity>

        {/* Card Aluno 1 */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatarBox, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="person" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.studentName, { color: colors.text }]}>Letícia Praun</Text>
              <Text style={[styles.schoolName, { color: colors.subtext }]}>Colégio Santo Antônio</Text>
            </View>
            <TouchableOpacity style={styles.actionIconBtn}>
              <Ionicons name="pencil" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconBtn}>
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.label, { color: colors.subtext }]}>Série</Text>
              <Text style={[styles.value, { color: colors.text }]}>5º ano fundamental</Text>
            </View>
            <View>
              <Text style={[styles.label, { color: colors.subtext }]}>Turno</Text>
              <Text style={[styles.value, { color: '#10B981', fontWeight: 'bold' }]}>manhã</Text>
            </View>
          </View>
        </View>

        {/* Card Aluno 2 */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatarBox, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="person" size={20} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.studentName, { color: colors.text }]}>Rayan Bernard Praun</Text>
              <Text style={[styles.schoolName, { color: colors.subtext }]}>Colégio Santo Antônio</Text>
            </View>
            <TouchableOpacity style={styles.actionIconBtn}>
              <Ionicons name="pencil" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconBtn}>
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.label, { color: colors.subtext }]}>Série</Text>
              <Text style={[styles.value, { color: colors.text }]}>2º ano fundamental</Text>
            </View>
            <View>
              <Text style={[styles.label, { color: colors.subtext }]}>Turno</Text>
              <Text style={[styles.value, { color: '#10B981', fontWeight: 'bold' }]}>manhã</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSub: { fontSize: 13, marginTop: 2 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, marginBottom: 20 },
  addBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatarBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  studentName: { fontSize: 15, fontWeight: 'bold' },
  schoolName: { fontSize: 12, marginTop: 2 },
  actionIconBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 6, backgroundColor: 'rgba(0,0,0,0.05)' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, backgroundColor: 'rgba(0,0,0,0.02)' },
  label: { fontSize: 11, marginBottom: 2 },
  value: { fontSize: 13 }
});