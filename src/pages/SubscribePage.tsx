import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Rocket, MessageCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/services/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const SUPPORT_PHONE = '5546991163405';

const features = [
  'Catálogo público com link exclusivo',
  'CRM Kanban completo com leads e tarefas',
  'Dashboard de vendas em tempo real',
  'Integração WhatsApp em cada veículo',
  'Gestão de vendedores e equipe',
  'Multi-loja com isolamento total',
  'Upload ilimitado de fotos',
  'Suporte premium via WhatsApp',
];

const SubscribePage = () => {
  const { logout, user, subscription, refreshSubscription, lojaSlug } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);

  // Após retorno do Stripe, fica fazendo polling até detectar active
  useEffect(() => {
    if (params.get('success') === 'true') {
      let tries = 0;
      const t = setInterval(async () => {
        tries++;
        await refreshSubscription();
        if (tries > 15) clearInterval(t);
      }, 2000);
      return () => clearInterval(t);
    }
  }, [params, refreshSubscription]);

  // Redireciona quando assinatura ficar ativa
  useEffect(() => {
    if (subscription?.status === 'active' && lojaSlug) {
      navigate(`/${lojaSlug}/dashboard`, { replace: true });
    }
  }, [subscription, lojaSlug, navigate]);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error || data?.error) throw new Error(error?.message || data?.error);
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: 'Erro ao iniciar pagamento', description: e.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const waUrl = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(
    `Olá! Tenho dúvidas sobre a assinatura JVS (${user?.email || ''}).`,
  )}`;

  const isProcessing = params.get('success') === 'true' && subscription?.status !== 'active';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-card rounded-3xl p-6 md:p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">Plano JVS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Ative sua assinatura
          </h1>
          <p className="text-muted-foreground">
            Tudo o que sua loja precisa para vender mais — por um único valor mensal.
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground">Plano único</p>
          <p className="text-5xl font-bold text-gradient my-2">R$ 99<span className="text-lg text-muted-foreground">/mês</span></p>
          <p className="text-xs text-muted-foreground">Cancele quando quiser</p>
        </div>

        <ul className="space-y-2.5 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {isProcessing && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4 text-center">
            <p className="text-sm text-cyan-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              Confirmando seu pagamento...
            </p>
          </div>
        )}

        {user?.email && (
          <div className="p-3 rounded-xl bg-muted/30 mb-4 text-sm text-center text-muted-foreground">
            Logado como <strong className="text-foreground">{user.email}</strong>
          </div>
        )}

        <div className="space-y-3">
          <Button variant="premium" size="lg" className="w-full" onClick={handleCheckout} disabled={loading || isProcessing}>
            <Rocket className="w-5 h-5" />
            {loading ? 'Abrindo checkout...' : 'Assinar agora — R$ 99/mês'}
          </Button>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="lg" className="w-full">
              <MessageCircle className="w-4 h-4" /> Tirar dúvidas no WhatsApp
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

export default SubscribePage;
