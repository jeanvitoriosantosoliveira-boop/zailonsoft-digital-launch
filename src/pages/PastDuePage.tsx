import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const SUPPORT_PHONE = '5546991163405';

const PastDuePage = () => {
  const { logout, user, subscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || data?.error) throw new Error(error?.message || data?.error);
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const waUrl = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(
    `Olá! Minha mensalidade do Zailon está em atraso (${user?.email || ''}). Preciso de ajuda para regularizar.`,
  )}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-sm font-medium text-red-400">Mensalidade em atraso</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Acesso bloqueado temporariamente
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Identificamos uma pendência no pagamento da sua assinatura
          de <strong className="text-foreground">R$ 99,00/mês</strong>.
          Regularize agora para liberar imediatamente o acesso à plataforma.
        </p>

        {user?.email && (
          <div className="p-3 rounded-xl bg-muted/30 mb-6">
            <p className="text-xs text-muted-foreground">Conta</p>
            <p className="text-foreground font-medium truncate">{user.email}</p>
            {subscription?.status && (
              <p className="text-xs text-red-400 mt-1">Status: {subscription.status}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button variant="premium" size="lg" className="w-full" onClick={handlePortal} disabled={loading}>
            <CreditCard className="w-5 h-5" />
            {loading ? 'Abrindo...' : 'Regularizar pagamento'}
          </Button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="lg" className="w-full">
              <MessageCircle className="w-4 h-4" /> Falar com o suporte
            </Button>
          </a>
          <Button variant="ghost" size="lg" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4" /> Sair da conta
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PastDuePage;
