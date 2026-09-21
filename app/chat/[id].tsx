import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Switch, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../hooks/useProfile';

interface Message {
  id: string;
  pai_id: string;
  sender_id: string;
  sender_role: 'motorista' | 'monitor' | 'pai';
  conteudo: string;
  tipo: 'informacao' | 'pagamento';
  created_at: string;
}

export default function ChatScreen() {
  const { id: paiIdParam } = useLocalSearchParams<{ id: string }>();
  const { role, isMotorista, isMonitor, isPai, loading: profileLoading } = useProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [msgType, setMsgType] = useState<'informacao' | 'pagamento'>('informacao');
  const [monitoraPodeResponder, setMonitoraPodeResponder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // O ID da conversa será o ID do pai atual (se for pai) ou o ID passado via rota (se for motorista/monitora)
  const activePaiId = isPai ? currentUserId : paiIdParam;

  useEffect(() => {
    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const targetPaiId = isPai ? user.id : paiIdParam;
      if (!targetPaiId) return;

      // 1. Carregar mensagens existentes
      fetchMessages(targetPaiId);

      // 2. Carregar configuração do chat (se a monitora pode responder)
      fetchConfig();

      // 3. Subscrição em Tempo Real (Realtime)
      const channel = supabase
        .channel(`chat_${targetPaiId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_mensagens', filter: `pai_id=eq.${targetPaiId}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'configuracoes_van', filter: 'id=eq.1' },
          (payload) => {
            setMonitoraPodeResponder(payload.new.monitora_pode_responder);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    if (!profileLoading) {
      initChat();
    }
  }, [profileLoading, paiIdParam]);

  async function fetchMessages(targetPaiId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_mensagens')
        .select('*')
        .eq('pai_id', targetPaiId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar mensagens:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    const { data } = await supabase
      .from('configuracoes_van')
      .select('monitora_pode_responder')
      .eq('id', 1)
      .single();

    if (data) {
      setMonitoraPodeResponder(data.monitora_pode_responder);
    }
  }

  async function toggleMonitoraAccess(value: boolean) {
    setMonitoraPodeResponder(value);
    const { error } = await supabase
      .from('configuracoes_van')
      .update({ monitora_pode_responder: value })
      .eq('id', 1);

    if (error) {
      Alert.alert('Erro', 'Não foi possível alterar a permissão da monitora.');
      setMonitoraPodeResponder(!value);
    }
  }

  async function sendMessage() {
    if (!inputText.trim() || !activePaiId || !currentUserId || !role) return;

    const newMsg = {
      pai_id: activePaiId,
      sender_id: currentUserId,
      sender_role: role,
      conteudo: inputText.trim(),
      tipo: isPai ? msgType : 'informacao',
    };

    setInputText('');

    const { error } = await supabase.from('chat_mensagens').insert([newMsg]);
    if (error) {
      Alert.alert('Erro ao enviar', error.message);
    }
  }

  if (loading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Barra de Controlo Exclusiva do Motorista */}
      {isMotorista && (
        <View style={styles.configBar}>
          <Text style={styles.configText}>Permitir respostas da Monitora:</Text>
          <Switch 
            value={monitoraPodeResponder} 
            onValueChange={toggleMonitoraAccess} 
            thumbColor={monitoraPodeResponder ? '#10B981' : '#64748B'}
          />
        </View>
      )}

      {/* Lista de Mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => {
          const isMyMsg = item.sender_id === currentUserId;

          return (
            <View style={[styles.msgBubble, isMyMsg ? styles.myMsg : styles.otherMsg]}>
              <View style={styles.senderHeader}>
                {item.sender_role === 'monitor' && (
                  <View style={styles.badgeMonitor}>
                    <Text style={styles.badgeText}>MONITORA</Text>
                  </View>
                )}
                {item.sender_role === 'motorista' && (
                  <View style={styles.badgeMotorista}>
                    <Text style={styles.badgeText}>MOTORISTA</Text>
                  </View>
                )}
                {item.sender_role === 'pai' && (
                  <Text style={styles.senderRoleText}>PAI</Text>
                )}

                {item.tipo === 'pagamento' && (
                  <Ionicons name="lock-closed" size={12} color="#F59E0B" style={{ marginLeft: 'auto' }} />
                )}
              </View>

              <Text style={styles.msgText}>{item.conteudo}</Text>
            </View>
          );
        }}
      />

      {/* Selector de Tipo de Mensagem (Apenas para o Pai) */}
      {isPai && (
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, msgType === 'informacao' && styles.typeBtnActive]}
            onPress={() => setMsgType('informacao')}
          >
            <Text style={styles.typeBtnText}>💬 Informação</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.typeBtn, msgType === 'pagamento' && styles.typeBtnPayActive]}
            onPress={() => setMsgType('pagamento')}
          >
            <Text style={styles.typeBtnText}>🔒 Pagamento (Privado)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Área de Entrada / Bloqueio da Monitora */}
      {isMonitor && !monitoraPodeResponder ? (
        <View style={styles.disabledInput}>
          <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
          <Text style={styles.disabledInputText}>O motorista desativou as respostas da monitora no momento.</Text>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput 
            style={styles.input}
            placeholder={
              isPai && msgType === 'pagamento' 
                ? "Mensagem visível APENAS para o Motorista..." 
                : "Escreva a sua mensagem..."
            }
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17', padding: 16, paddingTop: 50 },
  loadingContainer: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center' },
  configBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#131824', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  configText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  msgBubble: { padding: 12, borderRadius: 14, marginBottom: 10, maxWidth: '80%' },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#2563EB' },
  otherMsg: { alignSelf: 'flex-start', backgroundColor: '#131824', borderWidth: 1, borderColor: '#1E293B' },
  senderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  badgeMonitor: { backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeMotorista: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  senderRoleText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  msgText: { color: '#FFF', fontSize: 15 },
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#131824', borderRadius: 8, borderWidth: 1, borderColor: '#1E293B' },
  typeBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  typeBtnPayActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  typeBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#131824', color: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#1E293B' },
  sendBtn: { backgroundColor: '#3B82F6', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  disabledInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#131824', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1E293B' },
  disabledInputText: { color: '#94A3B8', fontSize: 12, flex: 1 }
});