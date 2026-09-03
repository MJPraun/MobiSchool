import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function RotaDetalheScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>
            {id === 'manha' ? 'Rota Manhã' : 'Rota Tarde'}
          </Text>
          <Text style={styles.headerSubtitle}>Em tempo real · Van em deslocamento</Text>
        </View>
        <TouchableOpacity style={styles.mapOptionsButton}>
          <Ionicons name="options-outline" size={24} color="#60A5FA" />
        </TouchableOpacity>
      </View>

      {/* Simulação do Mapa GPS em Tempo Real */}
      <View style={styles.mapContainer}>
        <View style={styles.mapGridOverlay}>
          <Ionicons name="location" size={32} color="#EF4444" style={styles.vanIcon} />
          <Text style={styles.liveBadge}>● AO VIVO</Text>
        </View>
        
        <TouchableOpacity style={styles.gpsButton}>
          <Ionicons name="navigate" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.gpsButtonText}>Iniciar GPS (Waze / Maps)</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Trajeto e Próximas Paradas */}
      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>Próximas Paradas</Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineScroll}>
          
          {/* Parada Concluída */}
          <View style={styles.stopCard}>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, styles.dotCompleted]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.line, styles.lineCompleted]} />
            </View>
            <View style={[styles.stopContent, { opacity: 0.5 }]}>
              <Text style={styles.stopTime}>07:00</Text>
              <Text style={styles.studentName}>Ana Souza</Text>
              <Text style={styles.stopAddress}>Embarque realizado</Text>
            </View>
          </View>

          {/* Próxima Parada (Atual) */}
          <View style={styles.stopCard}>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, styles.dotCurrent]}>
                <View style={styles.dotCurrentInner} />
              </View>
              <View style={styles.line} />
            </View>
            <View style={[styles.stopContent, styles.currentStopContent]}>
              <View style={styles.currentHeader}>
                <Text style={[styles.stopTime, { color: '#60A5FA' }]}>07:15 — Próxima</Text>
              </View>
              <Text style={styles.studentName}>Lucas Silva</Text>
              <Text style={styles.stopAddress}>Rua das Flores, 142 · Teresópolis</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionBtn, styles.btnPresent]}>
                  <Text style={styles.btnText}>Embarcou</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.btnAbsent]}>
                  <Text style={styles.btnAbsentText}>Faltou</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Parada Futura */}
          <View style={styles.stopCard}>
            <View style={styles.timelineLine}>
              <View style={[styles.timelineDot, styles.dotPending]} />
            </View>
            <View style={styles.stopContent}>
              <Text style={styles.stopTime}>07:30</Text>
              <Text style={styles.studentName}>Colégio São Paulo</Text>
              <Text style={styles.stopAddress}>Desembarque final</Text>
            </View>
          </View>
          
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#131824',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#34D399',
    marginTop: 2,
  },
  mapOptionsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 220,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    position: 'relative',
  },
  mapGridOverlay: {
    alignItems: 'center',
  },
  vanIcon: {
    marginBottom: 8,
  },
  liveBadge: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  timelineContainer: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timelineScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stopCard: {
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineLine: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: '#10B981',
  },
  dotCurrent: {
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCurrentInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  dotPending: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#1E293B',
    marginTop: -2,
    marginBottom: -2,
  },
  lineCompleted: {
    backgroundColor: '#10B981',
  },
  stopContent: {
    flex: 1,
    paddingBottom: 20,
  },
  currentStopContent: {
    backgroundColor: '#131824',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    marginBottom: 16,
  },
  currentHeader: {
    marginBottom: 4,
  },
  stopTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  stopAddress: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPresent: {
    backgroundColor: '#10B981',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnAbsent: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  btnAbsentText: {
    color: '#F87171',
    fontWeight: 'bold',
    fontSize: 13,
  },
});