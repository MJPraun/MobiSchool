import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../lib/supabase';

export default function CarteiraPaiScreen() {
  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Busca o aluno vinculado ao nosso "Pai Teste"
  async function buscarAluno() {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('pai_id', '11111111-1111-1111-1111-111111111111')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setAluno(data);
    } catch (error) {
      console.log('Erro ao buscar aluno:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarAluno();
  }, []);

  // 2. Fica "ouvindo" o banco de dados em tempo real via WebSockets
  useEffect(() => {
    if (!aluno) return;

    const subscription = supabase
      .channel('mudancas_status_aluno')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alunos',
          filter: `id=eq.${aluno.id}`,
        },
        (payload) => {
          // Quando o scanner da monitora atualizar o banco, a tela do pai muda na hora!
          setAluno((prev: any) => ({ ...prev, status_embarque: payload.new.status_embarque }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [aluno?.id]);

 // Função para definir a cor e o texto baseado no status do banco
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'embarcado': return { color: '#34D399', text: 'Indo para a Escola 🚌' };
      case 'entregue': return { color: '#60A5FA', text: 'Na Escola 🏫' };
      case 'embarcado_volta': return { color: '#C084FC', text: 'Voltando para Casa 🚌' };
      default: return { color: '#F59E0B', text: 'Em casa / Aguardando 🏠' };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!aluno) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#FFF' }}>Nenhum aluno encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#8B5CF6' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusProps = getStatusProps(aluno.status_embarque);
  
  // O QR Code guarda o ID único do aluno em formato JSON para o Scanner ler
  const qrCodeData = JSON.stringify({ aluno_id: aluno.id });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carteira Digital</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{aluno.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{aluno.nome}</Text>
            <Text style={styles.studentClass}>{aluno.turma_escola}</Text>
          </View>
        </View>

        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={qrCodeData}
            size={220}
            color="#0B0D17"
            backgroundColor="#FFFFFF"
          />
        </View>
        <Text style={styles.instruction}>
          Aponte este código para a câmera da monitora no embarque.
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: statusProps.color + '20', borderColor: statusProps.color }]}>
          <Text style={[styles.statusText, { color: statusProps.color }]}>
            {statusProps.text}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8B5CF6' },
  centerContainer: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  cardContainer: { flex: 1, backgroundColor: '#0B0D17', marginTop: 20, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, alignItems: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 40, backgroundColor: '#131824', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#1E293B' },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  studentClass: { fontSize: 14, color: '#64748B' },
  qrCodeWrapper: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 24 },
  instruction: { color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
  statusBadge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 16, fontWeight: 'bold' }
});