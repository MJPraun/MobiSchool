import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho padrão
        tabBarStyle: {
          backgroundColor: '#0B0D17', // Cor de fundo do menu igual ao design
          borderTopWidth: 1,
          borderTopColor: '#1E293B',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3B82F6', // Azul quando selecionado
        tabBarInactiveTintColor: '#475569', // Cinza quando inativo
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alunos"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="financas"
        options={{
          title: 'Finanças',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rotas"
        options={{
          title: 'Rotas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="veiculo"
        options={{
          title: 'Veículo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="build" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}