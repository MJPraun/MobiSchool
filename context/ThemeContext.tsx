import React, { createContext, useContext, useState } from 'react';

const coresClaras = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E2E8F0',
  primary: '#3B82F6',
};

const coresEscuras = {
  background: '#0F172A', // Fundo azul-escuro/ardósia suave e confortável
  card: '#1E293B',       // Cartões elegantes com excelente contraste
  text: '#F8FAFC',       // Texto claro
  subtext: '#94A3B8',    // Subtexto suave
  border: '#334155',     // Bordas discretas
  primary: '#3B82F6',
};

interface ThemeContextData {
  modoEscuro: boolean;
  toggleModoEscuro: () => void;
  colors: typeof coresClaras;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Inicia obrigatoriamente no modo claro por padrão
  const [modoEscuro, setModoEscuro] = useState(false);

  const toggleModoEscuro = () => setModoEscuro((prev) => !prev);

  const colors = modoEscuro ? coresEscuras : coresClaras;

  return (
    <ThemeContext.Provider value={{ modoEscuro, toggleModoEscuro, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}