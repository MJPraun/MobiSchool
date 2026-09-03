import * as Location from 'expo-location';
import { supabase } from './supabase';

// Fórmula de Haversine para calcular distância em metros
function calcularDistanciaEmMetros(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function iniciarRastreamentoVan() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  // Inicia envio periódico da localização GPS
  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Atualiza a cada 5 segundos
      distanceInterval: 10, // Ou a cada 10 metros
    },
    async (location) => {
      const { latitude, longitude } = location.coords;

      // 1. Atualizar posição da van no Supabase
      await supabase.from('localizacao_van').upsert([
        {
          veiculo_id: 'SPRINTER-01',
          latitude,
          longitude,
          updated_at: new Date().toISOString(),
        },
      ]);

      // 2. Buscar alunos para checar geofencing de 300m
      const { data: alunos } = await supabase.from('alunos').select('*');

      if (alunos) {
        alunos.forEach((aluno) => {
          if (aluno.latitude && aluno.longitude) {
            const dist = calcularDistanciaEmMetros(
              latitude,
              longitude,
              Number(aluno.latitude),
              Number(aluno.longitude)
            );

            // Se estiver a menos de 300m da casa do aluno
            if (dist <= 300) {
              console.log(`ALERTA: Van está a ${Math.round(dist)}m do aluno ${aluno.nome}!`);
              // Aqui dispara o envio de Push Notification via Expo Push Tokens
            }
          }
        });
      }
    }
  );
}