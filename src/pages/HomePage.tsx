import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, Zap, Users, BarChart3, Package, Shield,
  MessageCircle, ChevronDown, Instagram, Car, Clock, Star,
  TrendingUp, Smartphone, Globe, CreditCard, Rocket,
  Sparkles, Layers, ShieldCheck, Timer, X, PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import zailonHeroCar from '@/assets/zailon-hero-car.jpg';
import zailonLogo from '@/assets/zailon-logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Stat = ({ value, label, sub }: { value: string; label: string; sub?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', bounce: 0.35, duration: 0.8 }}
      className="text-center"
    >
      <p className="text-3xl md:text-5xl font-bold text-gradient leading-none">{value}</p>
      <p className="text-sm font-medium text-foreground mt-2">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
};

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const painPoints = [
    'Fotos perdidas em conversas do WhatsApp',
    'Leads esquecidos por falta de follow-up',
    'Planilhas confusas e sem controle real',
    'Sem ideia de qual veículo gera mais interesse',
    'Atendimento manual repetitivo e demorado',
    'Aparência amadora afastando clientes premium',
  ];

  const gains = [
    'Catálogo online profissional com link único',
    'CRM Kanban: cada lead na palma da mão',
    'Dashboard com vendas, conversão e origem',
    'Veículos com fotos HD em segundos',
    'Pré-atendimento automático qualifica o lead',
    'Imagem premium que vende sozinha',
  ];

  const features = [
    { icon: Package, title: 'Catálogo Premium', desc: 'Feed visual estilo Instagram com fotos HD, filtros e link exclusivo da sua loja.' },
    { icon: Users, title: 'CRM Kanban', desc: 'Acompanhe cada lead do primeiro toque até a venda. Nunca mais perca um cliente.' },
    { icon: BarChart3, title: 'Dashboard 360°', desc: 'KPIs em tempo real: funil, conversão, origem dos leads e ticket médio.' },
    { icon: Zap, title: 'WhatsApp 1‑clique', desc: 'Botão direto em cada veículo, com mensagem pronta. Atendimento sem atrito.' },
    { icon: Shield, title: 'Isolamento por Loja', desc: 'Multi‑tenancy seguro. Seus dados são só seus, protegidos por RLS.' },
    { icon: Smartphone, title: 'Mobile‑First', desc: 'Operação completa pelo celular. Cadastre, atenda e venda em campo.' },
  ];

  const steps = [
    { step: '01', title: 'Crie sua conta', desc: 'Cadastro em menos de 2 minutos. Ative seu plano e comece.', icon: CreditCard },
    { step: '02', title: 'Personalize a loja', desc: 'Logo, contato, redes sociais. Tudo com a sua cara.', icon: Layers },
    { step: '03', title: 'Suba os veículos', desc: 'Fotos HD, dados e preço. Publicação instantânea.', icon: Car },
    { step: '04', title: 'Venda mais', desc: 'Compartilhe seu link. Receba leads qualificados no WhatsApp.', icon: Rocket },
  ];

  const planFeatures = [
    'Catálogo online profissional com link exclusivo',
    'CRM Kanban completo com histórico de atendimento',
    'Dashboard com métricas e KPIs em tempo real',
    'Pré‑atendimento automático que qualifica leads',
    'Upload ilimitado de fotos HD por veículo',
    'Multi‑tenancy seguro com isolamento por loja',
    'Suporte premium via WhatsApp',
    'Interface 100% responsiva (mobile, tablet, desktop)',
    'Sem limite de veículos ou leads cadastrados',
    'Atualizações e novas funcionalidades grátis',
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Background particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-500/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src={zailonLogo} alt="Zailon" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 object-contain" />
              <span className="text-base sm:text-lg font-bold text-gradient truncate">Zailon</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#beneficios" className="hover:text-cyan-400 transition-colors">Benefícios</a>
              <a href="#recursos" className="hover:text-cyan-400 transition-colors">Recursos</a>
              <a href="#como-funciona" className="hover:text-cyan-400 transition-colors">Como funciona</a>
              <a href="#plano" className="hover:text-cyan-400 transition-colors">Plano</a>
            </nav>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <ThemeToggle />
              <Link to="/login" className="hidden sm:block">
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
              <Link to="/login">
                <Button variant="default" size="sm" className="btn-primary-glow">
                  <Rocket className="w-4 h-4" />
                  <span className="hidden sm:inline">Começar agora</span>
                  <span className="sm:hidden">Começar</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center pt-24 sm:pt-28 pb-16 overflow-hidden">
        <motion.div style={{ y: heroImageY, scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <img src={zailonHeroCar} alt="Loja de veículos premium" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/75 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        </motion.div>

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[90vw] md:w-[900px] h-[300px] md:h-[500px] bg-cyan-500/10 rounded-full blur-[100px] md:blur-[150px] z-0" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-5 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs sm:text-sm font-semibold text-cyan-300">Plataforma #1 para lojas de veículos</span>
            </motion.div>

            <h1 className="text-[2.25rem] sm:text-5xl md:text-7xl font-bold text-white mb-5 leading-[1.05] tracking-tight" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.6)' }}>
              Sua loja vende sozinha
              <span className="text-gradient block mt-2">enquanto você dorme</span>
            </h1>

            <p className="text-base sm:text-lg md:text-2xl text-white/85 max-w-3xl mx-auto mb-8 px-2 leading-relaxed" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}>
              Catálogo profissional, CRM e dashboard num só sistema.
              <strong className="text-white"> Mais leads, menos esforço, vendas no automático.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2 mb-5">
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="animate-glow-pulse w-full sm:w-auto text-base">
                  <Rocket className="w-5 h-5" />
                  Quero vender mais agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] sm:text-xs text-white/70">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Sem fidelidade</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Setup em minutos</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Suporte humano</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Cancele quando quiser</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-12 sm:mt-16">
            <a href="#beneficios" className="inline-flex flex-col items-center text-white/50 hover:text-cyan-400 transition-colors">
              <span className="text-xs sm:text-sm mb-2">Descubra como</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* STATS / SOCIAL PROOF */}
      <section className="py-12 relative border-y border-white/5 bg-background-elevated/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="+3x" label="Mais leads" sub="vs WhatsApp avulso" />
            <Stat value="2 min" label="Para começar" sub="Setup express" />
            <Stat value="24/7" label="Catálogo no ar" sub="Vendendo por você" />
            <Stat value="100%" label="No celular" sub="Opera de qualquer lugar" />
          </div>
        </div>
      </section>

      {/* ANTES vs DEPOIS — neuromarketing loss aversion */}
      <section id="beneficios" className="py-20 relative">
  <div className="container mx-auto px-4">
    <AnimatedSection className="text-center mb-14 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
        <Timer className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-semibold text-red-300">
          Cada dia sem o Zailon é dinheiro perdido
        </span>
      </div>

      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
        A diferença entre{" "}
        <span className="text-red-400">perder</span> e{" "}
        <span className="text-gradient">vender</span>
      </h2>

      <p className="text-muted-foreground">
        Quem opera sem sistema, perde. Quem usa o Zailon, escala.
      </p>
    </AnimatedSection>

    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* SEM Zailon */}
      <AnimatedSection>
        <div className="glass-card overflow-visible rounded-3xl p-6 sm:p-8 border-red-500/20 relative">
          <div className="absolute left-6 top-0 -translate-y-1/2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-300 uppercase tracking-wide">
            Sem Zailon
          </div>

          <h3 className="text-xl font-bold text-foreground mt-2 mb-5">
            O caos de hoje
          </h3>

          <ul className="space-y-3">
            {painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-400" />
                </div>

                <span className="text-muted-foreground line-through decoration-red-500/40">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* COM Zailon */}
      <AnimatedSection delay={0.15}>
        <div className="glass-card overflow-visible rounded-3xl p-6 sm:p-8 border-cyan-500/30 relative shadow-[0_0_60px_-15px_rgba(7,171,216,0.4)]">
          <div className="absolute left-6 top-0 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-bold text-white uppercase tracking-wide">
            Com Zailon
          </div>

          <h3 className="text-xl font-bold text-foreground mt-2 mb-5">
            A máquina de vendas
          </h3>

          <ul className="space-y-3">
            {gains.map((g, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>

                <span className="text-foreground font-medium">
                  {g}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>
    </div>
  </div>
</section>

      {/* FEATURES */}
      <section id="recursos" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-300">Tudo em um só lugar</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              A plataforma <span className="text-gradient">completa</span> para sua loja
            </h2>
            <p className="text-muted-foreground">
              Recursos profissionais que transformam visitantes em compradores.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.06}>
                <div className="glass-card p-6 rounded-2xl group hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Comece em <span className="text-gradient">4 passos</span>
            </h2>
            <p className="text-muted-foreground">Do cadastro à primeira venda — mais rápido do que servir um café.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {steps.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <div className="relative text-center">
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-8 h-8 text-cyan-400" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 -right-3 z-0">
                      <ArrowRight className="w-5 h-5 text-cyan-500/30" />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PLANO */}
      <section id="plano" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">Sem fidelidade · Cancele quando quiser</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Um plano, <span className="text-gradient">tudo incluso</span>
            </h2>
            <p className="text-muted-foreground">
              Sem upsells, sem letras miúdas. Tudo o que sua loja precisa, por um único valor.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="max-w-2xl mx-auto glass-card p-8 sm:p-10 rounded-3xl text-center relative overflow-hidden border-cyan-500/30 shadow-[0_20px_80px_-20px_rgba(7,171,216,0.35)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 mb-4">
                <Star className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide">Plano Zailon Pro</span>
              </div>

              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-2xl text-muted-foreground">R$</span>
                <span className="text-6xl md:text-7xl font-bold text-gradient leading-none">99</span>
                <span className="text-lg text-muted-foreground">/mês</span>
              </div>
              <p className="text-xs text-muted-foreground mb-8">Menos que um tanque de gasolina. Mais retorno que um vendedor extra.</p>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-left mb-8">
                {planFeatures.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/login" className="block">
                <Button variant="premium" size="lg" className="w-full animate-glow-pulse text-base mb-3">
                  <Rocket className="w-5 h-5" />
                  Começar agora — R$ 99/mês
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Pagamento seguro · Suporte premium incluso
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Perguntas frequentes</h2>
            <p className="text-muted-foreground">Tudo o que você precisa saber antes de começar.</p>
          </AnimatedSection>

          {[
            { q: 'Preciso instalar algo?', a: 'Não. O Zailon é 100% online. Acesse pelo navegador do celular ou computador, em qualquer lugar.' },
            { q: 'Posso cancelar quando quiser?', a: 'Sim, sem multas ou contratos. Cancele a qualquer momento pelo painel.' },
            { q: 'Quantos veículos posso cadastrar?', a: 'Ilimitado. Cadastre quantos veículos precisar, sem custo adicional.' },
            { q: 'Como meus clientes acessam o catálogo?', a: 'Você recebe um link exclusivo (ex: zailon.com.br/loja/sua-loja) para compartilhar por WhatsApp, Instagram ou onde quiser.' },
            { q: 'Os dados são seguros?', a: 'Sim. Cada loja tem isolamento total, criptografia e políticas avançadas. Ninguém acessa os dados de outra loja.' },
            { q: 'Funciona para loja pequena?', a: 'Especialmente. O Zailon foi desenhado para que uma pessoa só consiga operar uma loja inteira sem perder vendas.' },
          ].map((faq, i) => (
            <AnimatedSection key={i} delay={i * 0.06}>
              <details className="glass-card rounded-xl mb-3 group">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-foreground font-medium hover:text-cyan-400 transition-colors list-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="glass-card p-8 md:p-14 rounded-3xl text-center relative overflow-hidden border-cyan-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-emerald-500/10" />
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
                  <Clock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span className="text-xs font-semibold text-red-300">Cada dia parado = leads perdidos</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  Sua próxima venda <span className="text-gradient">começa hoje</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Em poucos minutos sua loja está no ar, profissional, vendendo e organizada. Sem desculpas.
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="premium" size="lg" className="animate-glow-pulse w-full sm:w-auto text-base">
                      <Rocket className="w-5 h-5" />
                      Criar minha conta agora
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5" />
                      Falar com especialista
                    </Button>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Sem fidelidade · Cancele quando quiser · Suporte humano
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={zailonLogo} alt="Zailon" className="w-9 h-9 rounded-lg object-contain" />
              <div>
                <p className="text-sm font-semibold text-foreground">Zailon © {new Date().getFullYear()}</p>
                <p className="text-[11px] text-muted-foreground">Desenvolvido por JVS Soluções</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/demo" className="hover:text-cyan-400 transition-colors">Demo</Link>
              <Link to="/login" className="hover:text-cyan-400 transition-colors">Entrar</Link>
              <a href="https://instagram.com/_jvs_solucoes_" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
