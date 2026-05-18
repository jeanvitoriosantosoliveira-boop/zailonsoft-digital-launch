import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle, Store, User, Phone, MapPin, Globe, Instagram, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/services/supabaseClient';
import { ThemeToggle } from '@/components/ThemeToggle';

type Mode = 'login' | 'signup';

const LoginPage = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [descricao, setDescricao] = useState('');
  const [site, setSite] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [instagram, setInstagram] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const { login, isLoggedIn, lojaSlug, loading: authLoading, subscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!authLoading && isLoggedIn) {
      if (subscription?.status === 'active' && lojaSlug) {
        navigate(`/${lojaSlug}/dashboard`, { replace: true });
      } else if (subscription?.status === 'past_due' || subscription?.status === 'unpaid') {
        navigate('/inadimplente', { replace: true });
      } else {
        navigate('/assinar', { replace: true });
      }
    }
  }, [authLoading, isLoggedIn, lojaSlug, subscription, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos obrigatórios', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const success = await login?.(email, password);
      if (success) {
        toast({ title: 'Bem-vindo!' });
        setRedirecting(true);
      } else {
        toast({ title: 'Credenciais inválidas', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !storeName) {
      toast({ title: 'Preencha email, senha e nome da loja', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'A senha deve ter no mínimo 6 caracteres', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('signup-store', {
        body: {
          email,
          password,
          store_name: storeName,
          owner_name: ownerName,
          phone,
          whatsapp: whatsapp || phone,
          business_email: businessEmail || email,
          descricao,
          site,
          localizacao: cidade || estado ? { cidade, estado } : null,
          redes_sociais: instagram ? { instagram } : null,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Conta criada!',
        description: 'Agora ative sua assinatura para liberar o acesso.',
      });
      const ok = await login?.(email, password);
      if (ok) {
        setRedirecting(true);
        // o useEffect redireciona para /assinar
      } else {
        setMode('login');
      }
    } catch (err: any) {
      toast({ title: 'Erro ao criar conta', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/favicon-zailon.ico" alt="Logo" className="w-10 h-10 rounded-2xl shadow-glow-md" />
              <span className="text-xl font-bold text-foreground">ZAILON</span>
            </Link>
            <ThemeToggle />
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Bem-vindo de volta</h1>
                <p className="text-muted-foreground text-sm mb-6">Acesse o painel da sua loja</p>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-12 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isLoading || redirecting}>
                  {isLoading || redirecting ? (
                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      Entrar <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Crie sua loja</h1>
                <p className="text-muted-foreground text-sm mb-4">
                  Preencha os dados para criar seu acesso. A liberação do sistema é feita pela nossa equipe após contato.
                </p>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Nome da loja *</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Auto Premium Veículos" className="pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Seu nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="João Silva" className="pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" className="pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" className="pl-12 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isLoading || redirecting}>
                  {isLoading || redirecting ? (
                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      Criar conta <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors">
              <MessageCircle className="w-4 h-4" /> Precisa de ajuda? Fale conosco
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl font-bold text-white mb-4">
              Gerencie sua loja com
              <span className="text-gradient block">excelência</span>
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              Plataforma completa para gestão de leads, catálogo de veículos e vendas
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
