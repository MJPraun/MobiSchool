import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AlunosScreen() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar os alunos cadastrados no Supabase
  async function buscarAlunos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.log('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  }

  // Toda vez que a tela focar ou for aberta, busca os dados atualizados
  useEffect(() => {
    buscarAlunos();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alunos</Text>
          <Text style={styles.headerSubtitle}>Gerenciamento de passageiros</Text>
        </View>
        
        {/* Botão de + no topo se já houver alunos */}
        {alunos.length > 0 && (
          <TouchableOpacity 
            style={styles.headerAddButton}
            onPress={() => router.push('/alunos/cadastro')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : alunos.length === 0 ? (
        // Estado Vazio (Empty State)
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people-outline" size={48} color="#64748B" />
          </View>
          <Text style={styles.emptyTitle}>Nenhum aluno ainda</Text>
          <Text style={styles.emptySubtitle}>
            Seu veículo está vazio. Cadastre seu primeiro aluno para gerar o QR Code e começar as rotas.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryAddButton}
            onPress={() => router.push('/alunos/cadastro')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryAddButtonText}>Cadastrar Primeiro Aluno</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Lista com os Alunos Cadastrados
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.alunoCard}>
              <View style={styles.alunoInfo}>
                <Text style={styles.alunoNome}>{item.nome}</Text>
                <Text style={styles.alunoTurma}>{item.turma_escola}</Text>
                <Text style={styles.alunoEndereco} numberOfLines={1}>📍 {item.endereco_embarque}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D17',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerAddButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -50,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#131824',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  primaryAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  alunoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131824',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  alunoInfo: {
    flex: 1,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  alunoTurma: {
    fontSize: 13,
    color: '#8B5CF6',
    marginBottom: 4,
    fontWeight: '600',
  },
  alunoEndereco: {
    fontSize: 12,
    color: '#64748B',
  }
});