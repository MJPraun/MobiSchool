import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '@/lib/supabase';

export default function MonitorarAlunoScreen() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Busca localização inicial
    const fetchInicial = async () => {
      const { data } = await supabase
        .from('localizacao_van')
        .select('latitude, longitude')
        .limit(1)
        .maybeSingle();

      if (data) {
        setCoords({ latitude: data.latitude, longitude: data.longitude });
      }
      setLoading(false);
    };

    fetchInicial();

    // 2. Inscreve no canal em tempo real das atualizações de GPS da van
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'localizacao_van' },
        (payload) => {
          if (payload.new?.latitude && payload.new?.longitude) {
            setCoords({
              latitude: payload.new.latitude,
              longitude: payload.new.longitude,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {coords ? (
        <MapView
          style={styles.map}
          initialRegion={{
            ...coords,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={coords} title="Van Escolar 🚌" description="Localização em tempo real" />
        </MapView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.infoText}>A van não está transmitindo no momento.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  infoText: { color: '#FFF', fontSize: 16 },
});