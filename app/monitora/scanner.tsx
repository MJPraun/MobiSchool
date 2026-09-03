import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.textMessage}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true); 

    try {
      const qrData = JSON.parse(data);

      if (!qrData.aluno_id) {
        Alert.alert('Erro', 'QR Code inválido para o MobiSchool.', [{ text: 'OK', onPress: () => setScanned(false) }]);
        return;
      }

      // 1. Consulta o estado atual
      const { data: alunoData, error: fetchError } = await supabase
        .from('alunos')
        .select('nome, status_embarque')
        .eq('id', qrData.aluno_id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Máquina de Estados Completa (Ida e Volta)
      let novoStatus = 'embarcado';
      let tituloAlerta = 'Embarque Confirmado! 🚌';

      if (alunoData.status_embarque === 'embarcado') {
        novoStatus = 'entregue';
        tituloAlerta = 'Entregue na Escola! 🏫';
      } else if (alunoData.status_embarque === 'entregue') {
        novoStatus = 'embarcado_volta'; // NOVO STATUS!
        tituloAlerta = 'Embarque para Casa! 🚌';
      } else if (alunoData.status_embarque === 'embarcado_volta') {
        novoStatus = 'fora';
        tituloAlerta = 'Entregue em Casa! 🏠';
      }

      // 3. Atualiza o banco
      const { error: updateError } = await supabase
        .from('alunos')
        .update({ status_embarque: novoStatus })
        .eq('id', qrData.aluno_id);

      if (updateError) throw updateError;

      Alert.alert(tituloAlerta, `Status de ${alunoData.nome} atualizado.`, [
        { text: 'Escanear Próximo', onPress: () => setScanned(false) },
        { text: 'Voltar', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.log('Erro na leitura:', error);
      Alert.alert('Erro', 'Não foi possível processar a leitura.', [{ text: 'OK', onPress: () => setScanned(false) }]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leitor de Embarque</Text>
        <View style={{ width: 44 }} />
      </View>
      <CameraView 
        style={styles.camera} 
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </CameraView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Aponte a câmera para a carteirinha do aluno.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D17' },
  containerCenter: { flex: 1, backgroundColor: '#0B0D17', justifyContent: 'center', alignItems: 'center', padding: 20 },
  textMessage: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#8B5CF6', padding: 15, borderRadius: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#0B0D17', zIndex: 10 },
  backButton: { width: 44, height: 44, backgroundColor: '#131824', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: '#34D399', backgroundColor: 'transparent', borderRadius: 20 },
  footer: { padding: 30, backgroundColor: '#0B0D17', alignItems: 'center' },
  footerText: { color: '#64748B', fontSize: 16 }
});