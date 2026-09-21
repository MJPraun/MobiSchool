import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

type UserRole = 'pai' | 'motorista' | 'monitora';

export default function LoginScreen() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<UserRole>('pai');
  const [loading, setLoading] = useState(false);

  // Redireciona o usuário para a rota correta conforme o perfil de forma segura
  function redirectUser(userType?: string) {
    const formattedType = (userType || '').trim().toLowerCase();

    console.log('[NAVEGAÇÃO] Redirecionando perfil tipo:', formattedType);

    if (formattedType === 'motorista') {
      router.replace('/(tabs)');
    } else if (formattedType === 'monitora') {
      router.replace('/monitora');
    } else {
      router.replace('/pai');
    }
  }

  async function handleAuth() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (isSignUp && !nome) {
      Alert.alert('Atenção', 'Por favor, preencha o seu nome completo.');
      return;
    }

    setLoading(true);

    const tipoSanitizado = tipo.trim().toLowerCase() as UserRole;
    const emailSanitizado = email.trim();
    const nomeSanitizado = nome.trim();

    try {
      if (isSignUp) {
        // --- CRIAR NOVA CONTA ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailSanitizado,
          password: senha,
          options: {
            data: {
              nome: nomeSanitizado,
              tipo: tipoSanitizado,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Garante a gravação ou atualização do perfil na tabela 'profiles'
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              nome: nomeSanitizado,
              tipo: tipoSanitizado,
            });

          if (profileError) {
            console.log('Aviso ao salvar perfil na tabela:', profileError.message);
          }

          Alert.alert('Sucesso!', `Conta cadastrada como ${tipoSanitizado.toUpperCase()}.`);
          redirectUser(tipoSanitizado);
        }
      } else {
        // --- FAZER LOGIN ---
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: emailSanitizado,
            password: senha,
          });

        if (authError) throw authError;

        if (authData.user) {
          // 1. Consulta a tabela 'profiles'
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tipo')
            .eq('id', authData.user.id)
            .maybeSingle();

          if (profileError) {
            console.log('Aviso ao ler perfil:', profileError.message);
          }

          // 2. Prioridade: profiles.tipo -> metadata -> fallback 'pai'
          const userType =
            profile?.tipo || authData.user.user_metadata?.tipo || 'pai';

          console.log('[LOGIN SUCEsso] Tipo identificado:', userType);
          redirectUser(userType);
        }
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO E HEADER */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/MobiSchool_sem_fundo_3.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.form}>
          {isSignUp && (
            <>
              <Text style={styles.label}>NOME COMPLETO</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: João da Silva"
                placeholderTextColor="#666"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>E-MAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>SENHA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#666"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          {/* SELETOR DE TIPO DE CONTA (Visível no cadastro) */}
          {isSignUp && (
            <>
              <Text style={styles.label}>TIPO DE CONTA</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    tipo === 'pai' && styles.roleButtonActive,
                  ]}
                  onPress={() => setTipo('pai')}
                >
                  <Text
                    style={[
                      styles.roleText,
                      tipo === 'pai' && styles.roleTextActive,
                    ]}
                  >
                    Pai
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    tipo === 'motorista' && styles.roleButtonActive,
                  ]}
                  onPress={() => setTipo('motorista')}
                >
                  <Text
                    style={[
                      styles.roleText,
                      tipo === 'motorista' && styles.roleTextActive,
                    ]}
                  >
                    Motorista
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    tipo === 'monitora' && styles.roleButtonActive,
                  ]}
                  onPress={() => setTipo('monitora')}
                >
                  <Text
                    style={[
                      styles.roleText,
                      tipo === 'monitora' && styles.roleTextActive,
                    ]}
                  >
                    Monitora
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* BOTÃO PRINCIPAL */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </Text>
            )}
          </TouchableOpacity>

          {/* TROCAR ENTRE LOGIN E CADASTRO */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.toggleButtonText}>
              {isSignUp
                ? 'Já tem uma conta? Faça Login'
                : 'Não tem uma conta? Cadastre-se'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RODAPÉ */}
        <Text style={styles.footerText}>versão 1.0.0 · MobiSchool</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 320,
    height: 130,
  },
  form: {
    width: '100%',
    backgroundColor: '#121826',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F293D',
  },
  label: {
    color: '#8A99AD',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0B0F19',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2A364F',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#0B0F19',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A364F',
  },
  roleButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#3B82F6',
  },
  roleText: {
    color: '#8A99AD',
    fontSize: 13,
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#60A5FA',
    fontSize: 14,
  },
  footerText: {
    color: '#4B5563',
    fontSize: 12,
    marginTop: 32,
  },
});