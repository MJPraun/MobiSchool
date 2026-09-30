import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Switch, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../context/ThemeContext';

export default function ConfiguracoesScreen() {
  const { modoEscuro, colors, alternarTema } = useTheme();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [manhaIdaInicio, setManhaIdaInicio] = useState('06:30');
  const [manhaIdaFim, setManhaIdaFim] = useState('07:30');
  const [manhaVoltaInicio, setManhaVoltaInicio] = useState('11:30');
  const [manhaVoltaFim, setManhaVoltaFim] = useState('12:30');

  const [tardeIdaInicio, setTardeIdaInicio] = useState('12:30');
  const [tardeIdaFim, setTardeIdaFim] = useState('13:30');
  const [tardeVoltaInicio, setTardeVoltaInicio] = useState('17:00');
  const [tardeVoltaFim, setTardeVoltaFim] = useState('18:00');

  useEffect(() => {
    carregarHorarios();
  }, []);

  const carregarHorarios = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('configuracoes_motorista')
        .select('*')
        .eq('motorista_id', user.id)
        .single();

      if (data) {
        setManhaIdaInicio(data.manha_ida_inicio || '06:30');
        setManhaIdaFim(data.manha_ida_fim || '07:30');
        setManhaVoltaInicio(data.manha_volta_inicio || '11:30');
        setManhaVoltaFim(data.manha_volta_fim || '12:30');
        setTardeIdaInicio(data.tarde_ida_inicio || '12:30');
        setTardeIdaFim(data.tarde_ida_fim || '13:30');
        setTardeVoltaInicio(data.tarde_volta_inicio || '17:00');
        setTardeVoltaFim(data.tarde_volta_fim || '18:00');
      }
    } catch (error) {
      console.log('Erro ao carregar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarTudo = async () => {
    try {
      setSalvando(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        motorista_id: user.id,
        manha_ida_inicio: manhaIdaInicio,
        manha_ida_fim: manhaIdaFim,
        manha_volta_inicio: manhaVoltaInicio,
        manha_volta_fim: manhaVoltaFim,
        tarde_ida_inicio: tardeIdaInicio,
        tarde_ida_fim: tardeIdaFim,
        tarde_volta_inicio: tardeVoltaInicio,
        tarde_volta_fim: tardeVoltaFim,
        modo_escuro: modoEscuro,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('configuracoes_motorista')
        .upsert(payload, { onConflict: 'motorista_id' });

      if (error) throw error;
      Alert.alert('Sucesso', 'Configurações e horários guardados com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível guardar.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações da Van ⚙️</Text>

      {/* APARÊNCIA */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Aparência e Tema</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.rowBetween}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name={modoEscuro ? "moon-outline" : "sunny-outline"} size={22} color={colors.primary} />
            <View>
              <Text style={[styles.cardLabel, { color: colors.text }]}>Modo Escuro / Claro</Text>
              <Text style={[styles.cardSublabel, { color: colors.subtext }]}>{modoEscuro ? 'Tema Escuro Ativo' : 'Tema Claro Ativo'}</Text>
            </View>
          </View>
          <Switch 
            value={modoEscuro}
            onValueChange={(val) => alternarTema(val)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* HORÁRIOS DAS ROTAS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Horários Automáticos das Rotas</Text>
      
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.routeTitle, { color: colors.text }]}>Manhã - Ida (Busca em casa)</Text>
        <View style={styles.timeRow}>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={manhaIdaInicio} onChangeText={setManhaIdaInicio} placeholder="06:30" placeholderTextColor={colors.subtext} />
          <Text style={{ color: colors.subtext }}>até</Text>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={manhaIdaFim} onChangeText={setManhaIdaFim} placeholder="07:30" placeholderTextColor={colors.subtext} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.routeTitle, { color: colors.text }]}>Manhã - Volta (Saída da escola)</Text>
        <View style={styles.timeRow}>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={manhaVoltaInicio} onChangeText={setManhaVoltaInicio} placeholder="11:30" placeholderTextColor={colors.subtext} />
          <Text style={{ color: colors.subtext }}>até</Text>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={manhaVoltaFim} onChangeText={setManhaVoltaFim} placeholder="12:30" placeholderTextColor={colors.subtext} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.routeTitle, { color: colors.text }]}>Tarde - Ida (Busca em casa)</Text>
        <View style={styles.timeRow}>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={tardeIdaInicio} onChangeText={setTardeIdaInicio} placeholder="12:30" placeholderTextColor={colors.subtext} />
          <Text style={{ color: colors.subtext }}>até</Text>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={tardeIdaFim} onChangeText={setTardeIdaFim} placeholder="13:30" placeholderTextColor={colors.subtext} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.routeTitle, { color: colors.text }]}>Tarde - Volta (Saída da escola)</Text>
        <View style={styles.timeRow}>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={tardeVoltaInicio} onChangeText={setTardeVoltaInicio} placeholder="17:00" placeholderTextColor={colors.subtext} />
          <Text style={{ color: colors.subtext }}>até</Text>
          <TextInput style={[styles.inputTime, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} value={tardeVoltaFim} onChangeText={setTardeVoltaFim} placeholder="18:00" placeholderTextColor={colors.subtext} />
        </View>
      </View>

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={salvando ? undefined : salvarTudo} disabled={salvando}>
        {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Guardar Alterações</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: 15, fontWeight: 'bold' },
  cardSublabel: { fontSize: 11, marginTop: 2 },
  routeTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  inputTime: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, textAlign: 'center', fontSize: 15 },
  saveButton: { padding: 16, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});