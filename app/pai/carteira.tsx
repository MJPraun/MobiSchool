import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function CarteiraPaiScreen() {
  const { colors, modoEscuro } = useTheme();
  const [alunosComHistorico, setAlunosComHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para verificar se uma data de vencimento já passou
  const verificarSeEstaAtrasado = (vencimentoStr: string) => {
    try {
      const partes = vencimentoStr.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1;
        const ano = parseInt(partes[2], 10);
        const dataVencimento = new Date(ano, mes, dia);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return dataVencimento < hoje;
      }
    } catch (e) {
      // Ignora se o formato for textual (ex: "Dia 10")
    }
    return false;
  };

  const buscarCarteiraEHistorico = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setAlunosComHistorico([]);
        setLoading(false);
        return;
      }

      // 1. Busca os alunos do pai logado
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('*')
        .eq('pai_id', user.id);

      if (alunosError) throw alunosError;
      if (!alunosData || alunosData.length === 0) {
        setAlunosComHistorico([]);
        setLoading(false);
        return;
      }

      // 2. Para cada aluno, junta o histórico da tabela 'historico_pagamentos' e os dados diretos da tabela 'alunos'
      const listaCompleta = await Promise.all(
        alunosData.map(async (aluno) => {
          // Busca histórico detalhado
          const { data: historicoData } = await supabase
            .from('historico_pagamentos')
            .select('*')
            .eq('aluno_id', aluno.id)
            .order('created_at', { ascending: false });

          let listaFaturas = historicoData || [];

          // Se o aluno tiver uma mensalidade principal cadastrada na tabela 'alunos' e ela não estiver já no histórico, incluímos-a
          if (aluno.valor_mensalidade && aluno.valor_mensalidade > 0) {
            const jaExisteNoHistorico = listaFaturas.some(
              (f: any) => f.valor === aluno.valor_mensalidade && f.status === aluno.status_pagamento
            );

            if (!jaExisteNoHistorico) {
              listaFaturas.unshift({
                id: 'aluno-principal-' + aluno.id,
                mes_referencia: 'Mensalidade Atual',
                valor: aluno.valor_mensalidade,
                vencimento: aluno.vencimento || 'Dia 10',
                status: aluno.status_pagamento || 'Pendente',
                tipo_pagamento: aluno.tipo_pagamento || 'Pix'
              });
            }
          }

          return {
            ...aluno,
            historico: listaFaturas
          };
        })
      );

      setAlunosComHistorico(listaCompleta);
    } catch (error: any) {
      console.log('Erro ao buscar carteira:', error.message);
      setAlunosComHistorico([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarCarteiraEHistorico();
    }, [])
  );

  const handleCopiarPix = (tipoPagamento: string) => {
    Alert.alert('PIX Copiado!', `Chave PIX (${tipoPagamento || 'Pix'}) copiada com sucesso. Cole no aplicativo do seu banco para pagar.`);
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={modoEscuro ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Carteira & Mensalidades 💳</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {alunosComHistorico.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum aluno encontrado.</Text>
            <Text style={[styles.emptySubText, { color: colors.subtext }]}>Cadastre um educando no seu painel principal.</Text>
          </View>
        ) : (
          alunosComHistorico.map((aluno) => {
            const aPagar = aluno.historico.filter((h: any) => h.status !== 'Pago');

            return (
              <View key={aluno.id} style={[styles.cardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Header do Aluno */}
                <View style={styles.cardHeader}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>{aluno.nome.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{aluno.nome}</Text>
                    <Text style={[styles.studentClass, { color: colors.subtext }]}>{aluno.escola || aluno.turma_escola || 'Escola não informada'}</Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Card de Destaque: Mensalidades a Pagar */}
                <View style={styles.sectionBox}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Mensalidades a Pagar 📌</Text>
                  
                  {aPagar.length === 0 ? (
                    <Text style={[styles.noDataText, { color: colors.subtext }]}>Nenhuma mensalidade pendente. Tudo em dia! 🎉</Text>
                  ) : (
                    aPagar.map((item: any) => {
                      const atrasado = verificarSeEstaAtrasado(item.vencimento);
                      const corBorda = atrasado ? '#EF4444' : '#F59E0B'; 
                      const textoStatus = atrasado ? 'Atrasada' : 'Próxima';

                      return (
                        <View key={item.id} style={[styles.itemCardDestaque, { backgroundColor: colors.background, borderColor: corBorda }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.itemMes, { color: colors.text }]}>{item.mes_referencia}</Text>
                            <Text style={[styles.itemDet, { color: colors.subtext }]}>Vencimento: {item.vencimento}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                            <Text style={[styles.itemValor, { color: colors.text }]}>R$ {Number(item.valor).toFixed(2)}</Text>
                            <Text style={[styles.statusTag, { color: corBorda }]}>{textoStatus}</Text>
                          </View>
                          <TouchableOpacity style={[styles.pixBtnMini, { backgroundColor: colors.primary }]} onPress={() => handleCopiarPix(item.tipo_pagamento)}>
                            <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Lista Completa com Sinalização */}
                <View style={styles.sectionBox}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico Geral e Sinalizações</Text>
                  
                  {aluno.historico.length === 0 ? (
                    <Text style={[styles.noDataText, { color: colors.subtext }]}>Nenhum registro encontrado.</Text>
                  ) : (
                    aluno.historico.map((item: any) => {
                      let corSinal = '#10B981'; 
                      let textoSinal = 'Efetuado';
                      let iconeSinal = 'checkmark-circle';

                      if (item.status === 'Pago') {
                        corSinal = '#10B981';
                        textoSinal = 'Efetuado';
                        iconeSinal = 'checkmark-circle';
                      } else {
                        const atrasado = verificarSeEstaAtrasado(item.vencimento);
                        if (atrasado) {
                          corSinal = '#EF4444';
                          textoSinal = 'Atrasada';
                          iconeSinal = 'alert-circle';
                        } else {
                          corSinal = '#F59E0B';
                          textoSinal = 'Próxima';
                          iconeSinal = 'time';
                        }
                      }

                      return (
                        <View key={item.id} style={[styles.historyItemRow, { backgroundColor: colors.background, borderColor: colors.border, borderLeftColor: corSinal, borderLeftWidth: 4 }]}>
                          <View style={{ marginRight: 10 }}>
                            <Ionicons name={iconeSinal as any} size={20} color={corSinal} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.itemMes, { color: colors.text }]}>{item.mes_referencia}</Text>
                            <Text style={[styles.itemDet, { color: colors.subtext }]}>Venc: {item.vencimento} • {item.tipo_pagamento || 'Pix'}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[styles.itemValor, { color: colors.text }]}>R$ {Number(item.valor).toFixed(2)}</Text>
                            <Text style={[styles.statusTag, { color: corSinal }]}>{textoSinal}</Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1 },
  backButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyCard: { padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, marginTop: 40 },
  emptyText: { fontSize: 16, fontWeight: 'bold', marginTop: 12 },
  emptySubText: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  cardContainer: { borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  studentClass: { fontSize: 12 },
  divider: { height: 1, marginVertical: 14 },
  sectionBox: { width: '100%' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  noDataText: { fontSize: 12, fontStyle: 'italic', marginBottom: 6 },
  itemCardDestaque: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  historyItemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1 },
  itemMes: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  itemDet: { fontSize: 11 },
  itemValor: { fontSize: 14, fontWeight: 'bold' },
  statusTag: { fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  pixBtnMini: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});