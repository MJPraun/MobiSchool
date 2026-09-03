import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function CadastroAlunoScreen() {
  const [nome, setNome] = useState('');
  const [turma, setTurma] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSalvarAluno() {
    if (!nome || !turma || !endereco) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      // Inserindo o aluno no Supabase. 
      // Usamos o ID fixo do "Responsável Teste" que criamos no SQL
      const { error } = await supabase.from('alunos').insert([
        {
          pai_id: '11111111-1111-1111-1111-111111111111',
          nome: nome,
          turma_escola: turma,
          endereco_embarque: endereco,
          // Coordenadas padrão temporárias (poderemos usar o GPS depois)
          latitude: -22.4122, 
          longitude: -42.9655,
          status_embarque: 'fora'
        }
      ]);

      if (error) throw error;

      Alert.alert('Sucesso!', 'Aluno cadastrado e QR Code gerado com sucesso.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível cadastrar o aluno.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Novo Aluno</Text>
          <Text style={styles.headerSubtitle}>Cadastre para gerar a carteira</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: Enzo Gabriel"
            placeholderTextColor="#64748B"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Escola / Turma</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: Colégio São Paulo - 5º Ano B"
            placeholderTextColor="#64748B"
            value={turma}
            onChangeText={setTurma}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Endereço de Embarque</Text>
          <TextInput 
            style={styles.input}
            placeholder="Ex: Rua Direita, Centro, Teresópolis"
            placeholderTextColor="#64748B"
            value={endereco}
            onChangeText={setEndereco}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSalvarAluno}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Salvar Aluno</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, marginBottom: 30 },
  backButton: { width: 44, height: 44, backgroundColor: '#131824', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#1E293B' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#131824', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 16 },
  saveButton: { flexDirection: 'row', backgroundColor: '#8B5CF6', paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});