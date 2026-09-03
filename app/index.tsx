import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Redireciona para o grupo de telas com o menu inferior (Bottom Tabs)
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B0D17" />
      
      {/* Ícone e Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>🚐</Text>
        </View>
        <Text style={styles.logoText}>MobiSchool</Text>
        <Text style={styles.subtitle}>Transporte escolar inteligente</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Campo E-mail */}
        <Text style={styles.label}>E-MAIL</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#475569"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Campo Senha */}
        <Text style={styles.label}>SENHA</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#475569"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Esqueci a senha */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {/* Botão Principal */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Divisor */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Botão Secundário (Demonstração) */}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
          <Ionicons name="search" size={18} color="#60A5FA" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>Entrar como demonstração</Text>
        </TouchableOpacity>

        {/* Cadastro */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.versionText}>versão 1.0.0 · MobiSchool</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D17',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  iconText: {
    fontSize: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131824',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#3B82F6', // Atualizado para azul ativo para dar destaque de clique
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: '#475569',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F131F',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  registerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  registerLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  versionText: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    color: '#475569',
    fontSize: 12,
  },
});