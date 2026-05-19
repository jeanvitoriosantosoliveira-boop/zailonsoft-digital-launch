import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/services/supabaseClient';
import { User } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';
import { provisionUserAccount } from '@/lib/accountProvisioning';

interface Subscription {
  status: 'active' | 'pending_payment' | 'incomplete' | 'canceled' | 'unpaid' | 'past_due' | 'trialing' | null;
}

interface LojaInfo {
  id: string;
  slug: string;
  nome: string;
  logo_url: string | null;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  lojaId: string | null;
  lojaSlug: string | null;
  lojaInfo: LojaInfo | null;
  lojaLoading: boolean;
  login?: (email: string, password: string) => Promise<boolean>;
  signup?: (email: string, password: string, meta?: Record<string, unknown>) => Promise<boolean>;
  isLoggedIn?: boolean;
  isActive?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, queryClient }: { children: ReactNode; queryClient?: QueryClient }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [lojaInfo, setLojaInfo] = useState<LojaInfo | null>(null);
  const [lojaLoading, setLojaLoading] = useState(true);

  // Token incremental para invalidar respostas antigas e prevenir race conditions
  const reqIdRef = useRef(0);

  const loadSubscription = async (currentUserId: string | undefined, reqId: number) => {
    if (!currentUserId) {
      if (reqId !== reqIdRef.current) return;
      setSubscription(null);
      setSubLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', currentUserId)
        .maybeSingle();
      if (error) throw error;
      if (reqId !== reqIdRef.current) return; // resposta obsoleta
      setSubscription(data as Subscription | null);
    } catch (err: unknown) {
      console.error('Erro ao carregar assinatura:', err instanceof Error ? err.message : err);
      if (reqId !== reqIdRef.current) return;
      setSubscription(null);
    } finally {
      if (reqId === reqIdRef.current) setSubLoading(false);
    }
  };

  const ensureAccountRows = async (currentUser: User) => {
    const results = await Promise.allSettled([
      supabase.from('profiles').select('id').eq('id', currentUser.id).maybeSingle(),
      supabase.from('lojas').select('id').eq('user_id', currentUser.id).limit(1),
      supabase.from('subscriptions').select('id').eq('user_id', currentUser.id).limit(1),
    ]);

    const missingProfile = results[0].status === 'fulfilled' && !results[0].value.data;
    const missingStore = results[1].status === 'fulfilled' && !results[1].value.data?.length;
    const missingSubscription = results[2].status === 'fulfilled' && !results[2].value.data?.length;

    if (missingProfile || missingStore || missingSubscription) {
      await provisionUserAccount({ user: currentUser });
    }
  };

  const loadLojaInfo = async (currentUserId: string | undefined, reqId: number) => {
    if (!currentUserId) {
      if (reqId !== reqIdRef.current) return;
      setLojaInfo(null);
      setLojaLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('id, slug, nome, logo_url')
        .eq('user_id', currentUserId)
        .maybeSingle();
      if (error) throw error;
      if (reqId !== reqIdRef.current) return;
      setLojaInfo(data as LojaInfo | null);
    } catch (err: unknown) {
      console.error('Erro ao carregar loja:', err instanceof Error ? err.message : err);
      if (reqId !== reqIdRef.current) return;
      setLojaInfo(null);
    } finally {
      if (reqId === reqIdRef.current) setLojaLoading(false);
    }
  };

  // Aplica novo usuário de forma atômica: trava loading antes do fetch async
  const applyUser = (currentUser: User | null) => {
    const reqId = ++reqIdRef.current;
    setUser(currentUser);
    setAuthLoading(false);

    if (currentUser) {
      setSubLoading(true);
      setLojaLoading(true);
      ensureAccountRows(currentUser)
        .catch((err: unknown) => console.error('Erro ao garantir cadastro completo:', err instanceof Error ? err.message : err))
        .finally(() => {
          if (reqId !== reqIdRef.current) return;
          loadSubscription(currentUser.id, reqId);
          loadLojaInfo(currentUser.id, reqId);
        });
    } else {
      setSubscription(null);
      setLojaInfo(null);
      setSubLoading(false);
      setLojaLoading(false);
    }
  };

  useEffect(() => {
    // 1) Listener primeiro (recomendação Supabase)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    // 2) Sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      applyUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSubscription = async () => {
    if (user?.id) {
      setSubLoading(true);
      await loadSubscription(user.id, reqIdRef.current);
      setLojaLoading(true);
      await loadLojaInfo(user.id, reqIdRef.current);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Trava loading antes da troca de sessão p/ evitar flash de "sem assinatura"
    setSubLoading(true);
    setLojaLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Erro no login:', error.message);
      setSubLoading(false);
      setLojaLoading(false);
      return false;
    }
    // applyUser será chamado pelo listener; aguardamos a propagação
    return true;
  };

  const signup = async (email: string, password: string, meta: Record<string, unknown> = {}): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: meta } });
    if (error) {
      console.error('Erro no signup:', error.message);
      return false;
    }
    return !!data.user;
  };

  const logout = async () => {
    reqIdRef.current++; // invalida fetches em voo
    await supabase.auth.signOut();
    if (queryClient) queryClient.clear();
    setUser(null);
    setSubscription(null);
    setLojaInfo(null);
    window.location.href = '/login';
  };

  const loading = authLoading || (!!user && (subLoading || lojaLoading));
  const isLoggedIn = !!user;
  const isActive = loading ? false : subscription?.status === 'active';

  const value = {
    user,
    subscription,
    loading,
    logout,
    refreshSubscription,
    lojaId: lojaInfo?.id ?? null,
    lojaSlug: lojaInfo?.slug ?? null,
    lojaInfo,
    lojaLoading,
    login,
    signup,
    isLoggedIn,
    isActive,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
