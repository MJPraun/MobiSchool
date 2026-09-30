import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Switch, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../hooks/useProfile';
import { useTheme } from '../../context/ThemeContext';

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
  const { colors, modoEscuro } = useTheme();
  const { id: paiIdParam } = useLocalSearchParams<{ id: string }>();
  const { role, isMotorista, isMonitor, isPai, loading: profileLoading } = useProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [msgType, setMsgType] = useState<'informacao' | 'pagamento'>('informacao');
  const [monitoraPodeResponder, setMonitoraPodeResponder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const activePaiId = isPai ? currentUserId : paiIdParam;

  useEffect(() => {
    let channel: any;

    async function initChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const targetPaiId = isPai ? user.id : paiIdParam;
      if (!targetPaiId) return;

      await fetchMessages(targetPaiId);
      await fetchConfig();

      // Configuração do canal Realtime do Supabase
      channel = supabase
        .channel(`chat_room_${targetPaiId}_${Date.now()}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_mensagens', 
            filter: `pai_id=eq.${targetPaiId}` 
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMsg.id)) return prev;
              const updated = [...prev, newMsg];
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
              return updated;
            });
          }
        )
        .subscribe();
    }

    if (!profileLoading) {
      initChat();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    } catch (err: any) {
      console.error('Erro ao carregar mensagens:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    try {
      const { data } = await supabase
        .from('configuracoes_van')
        .select('monitora_pode_responder')
        .eq('id', 1)
        .single();

      if (data) {
        setMonitoraPodeResponder(data.monitora_pode_responder);
      }
    } catch {
      // Tabela opcional
    }
  }

  async function toggleMonitoraAccess(value: boolean) {
    setMonitoraPodeResponder(value);
    try {
      await supabase
        .from('configuracoes_van')
        .update({ monitora_pode_responder: value })
        .eq('id', 1);
    } catch {
      Alert.alert('Aviso', 'Configuração guardada localmente.');
    }
  }

  async function sendMessage() {
    if (!inputText.trim() || !activePaiId || !currentUserId || !role) return;

    const conteudoEnvio = inputText.trim();
    setInputText('');

    const newMsg = {
      pai_id: activePaiId,
      sender_id: currentUserId,
      sender_role: role,
      conteudo: conteudoEnvio,
      // Agora o motorista também pode enviar mensagens do tipo pagamento/privado
      tipo: (isPai || isMotorista) ? msgType : 'informacao',
    };

    const { error } = await supabase.from('chat_mensagens').insert([newMsg]);
    if (error) {
      Alert.alert('Erro ao enviar', error.message);
    }
  }

  if (loading || profileLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Conversa</Text>
      </View>

      {/* Barra de Controlo Exclusiva do Motorista */}
      {isMotorista && (
        <View style={[styles.configBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.configText, { color: colors.subtext }]}>Permitir respostas da Monitora:</Text>
          <Switch 
            value={monitoraPodeResponder} 
            onValueChange={toggleMonitoraAccess} 
            thumbColor={monitoraPodeResponder ? '#10B981' : colors.subtext}
          />
        </View>
      )}

      {/* Lista de Mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMyMsg = item.sender_id === currentUserId;

          return (
            <View style={[
              styles.msgBubble, 
              isMyMsg ? [styles.myMsg, { backgroundColor: colors.primary }] : [styles.otherMsg, { backgroundColor: colors.card, borderColor: colors.border }]
            ]}>
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
                  <Text style={[styles.senderRoleText, { color: colors.subtext }]}>PAI</Text>
                )}

                {item.tipo === 'pagamento' && (
                  <Ionicons name="lock-closed" size={12} color="#F59E0B" style={{ marginLeft: 'auto' }} />
                )}
              </View>

              <Text style={[styles.msgText, { color: isMyMsg ? '#FFFFFF' : colors.text }]}>
                {item.conteudo}
              </Text>
            </View>
          );
        }}
      />

      {/* Seletor de Tipo de Mensagem (Liberado para Pai e Motorista) */}
      {(isPai || isMotorista) && (
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeBtn, { backgroundColor: colors.card, borderColor: colors.border }, msgType === 'informacao' && styles.typeBtnActive]}
            onPress={() => setMsgType('informacao')}
          >
            <Text style={[styles.typeBtnText, { color: colors.text }]}>💬 Informação</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.typeBtn, { backgroundColor: colors.card, borderColor: colors.border }, msgType === 'pagamento' && styles.typeBtnPayActive]}
            onPress={() => setMsgType('pagamento')}
          >
            <Text style={[styles.typeBtnText, { color: colors.text }]}>🔒 Pagamento (Privado)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Área de Entrada / Bloqueio da Monitora */}
      {isMonitor && !monitoraPodeResponder ? (
        <View style={[styles.disabledInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.subtext} />
          <Text style={[styles.disabledInputText, { color: colors.subtext }]}>O motorista desativou as respostas da monitora no momento.</Text>
        </View>
      ) : (
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            placeholder={
              (isPai || isMotorista) && msgType === 'pagamento' 
                ? "Mensagem de pagamento / privada..." 
                : "Escreva a sua mensagem..."
            }
            placeholderTextColor={colors.subtext}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, gap: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  configBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, margin: 16, marginBottom: 0, borderRadius: 12, borderWidth: 1 },
  configText: { fontSize: 13, fontWeight: '600' },
  msgBubble: { padding: 12, borderRadius: 14, marginBottom: 10, maxWidth: '80%' },
  myMsg: { alignSelf: 'flex-end' },
  otherMsg: { alignSelf: 'flex-start', borderWidth: 1 },
  senderHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  badgeMonitor: { backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeMotorista: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  senderRoleText: { fontSize: 10, fontWeight: 'bold' },
  msgText: { fontSize: 15 },
  typeSelector: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  typeBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  typeBtnPayActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  typeBtnText: { fontSize: 12, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  disabledInput: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, margin: 16, borderRadius: 12, borderWidth: 1 },
  disabledInputText: { fontSize: 12, flex: 1 }
});