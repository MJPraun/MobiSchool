import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const darkColors = {
  background: '#0B0D17',
  card: '#131824',
  text: '#FFFFFF',
  subtext: '#64748B',
  border: '#1E293B',
  primary: '#8B5CF6',
};

export const lightColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E2E8F0',
  primary: '#8B5CF6',
};

interface ThemeContextData {
  modoEscuro: boolean;
  colors: typeof darkColors;
  alternarTema: (valor: boolean) => Promise<void>;
  carregarTema: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [modoEscuro, setModoEscuro] = useState(true);
  const colors = modoEscuro ? darkColors : lightColors;

  useEffect(() => {
    carregarTema();
  }, []);

  const carregarTema = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('configuracoes_motorista')
        .select('modo_escuro')
        .eq('motorista_id', user.id)
        .single();

      if (data && typeof data.modo_escuro === 'boolean') {
        setModoEscuro(data.modo_escuro);
      }
    } catch (e) {
      console.log('Erro ao carregar tema:', e);
    }
  };

  const alternarTema = async (valor: boolean) => {
    setModoEscuro(valor);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('configuracoes_motorista')
        .upsert({ motorista_id: user.id, modo_escuro: valor, updated_at: new Date() }, { onConflict: 'motorista_id' });
    } catch (e) {
      console.log('Erro ao salvar tema:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ modoEscuro, colors, alternarTema, carregarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);