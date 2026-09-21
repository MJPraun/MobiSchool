import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';


export type UserRole = 'motorista' | 'monitor' | 'pai' | null;

export function useProfile() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) {
            setRole(null);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (isMounted && data) {
          setRole(data.role as UserRole);
        }
      } catch (err) {
        console.log('Erro ao carregar perfil do usuário:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    role,
    isMotorista: role === 'motorista',
    isMonitor: role === 'monitor',
    isPai: role === 'pai',
    loading,
  };
}