import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, ArrowRight, Zap, Users, BarChart3, Package, Headphones, Shield, 
  MessageCircle, ChevronDown, Instagram, Car, Gauge, Clock, Star, 
  TrendingUp, Lock, Eye, Smartphone, Globe, CreditCard, Rocket,
  Award, Target, Layers, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroCarImage from '@/assets/hero-car.jpg';
import { ThemeToggle } from '@/components/ThemeToggle';
// Animated section wrapper
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

// Speedometer-style counter
const SpeedCounter = ({ value, label }: { value: string; label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
        className="text-3xl md:text-5xl font-bold text-gradient mb-2"
      >
        {value}
      </motion.p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
};

const HomePage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const features = [
    { icon: Package, title: 'Catálogo Premium', description: 'Feed visual estilo Instagram com fotos HD, filtros e compartilhamento direto' },
    { icon: Users, title: 'CRM Inteligente', description: 'Kanban visual para acompanhar cada lead do primeiro contato até a venda' },
    { icon: BarChart3, title: 'Dashboard Completo', description: 'KPIs em tempo real: conversão, funil de vendas, origens e ticket médio' },
    { icon: Zap, title: 'WhatsApp Integrado', description: 'Botão direto de contato em cada veículo, com mensagem pré-configurada' },
    { icon: Shield, title: 'Multi-tenancy Seguro', description: 'Isolamento total por loja. Cada cliente vê apenas seus dados, garantido por RLS' },
    { icon: Headphones, title: 'Suporte Premium', description: 'Atendimento dedicado via WhatsApp com resposta em até 2 horas' },
    { icon: Globe, title: 'Link Exclusivo', description: 'Cada loja recebe uma URL única para compartilhar o catálogo online com clientes' },
    { icon: Smartphone, title: '100% Responsivo', description: 'Interface adaptada para celular, tablet e desktop. Perfeito para uso em campo' },
    { icon: Lock, title: 'Acesso Protegido', description: 'Sistema de login seguro com controle de assinatura e proteção de dados' },
  ];

  const problems = [
    { problem: 'Fotos espalhadas no WhatsApp', solution: 'Catálogo profissional organizado com link exclusivo' },
    { problem: 'Perder leads por falta de controle', solution: 'CRM Kanban com histórico completo de cada cliente' },
    { problem: 'Não saber de onde vêm as vendas', solution: 'Dashboard com métricas de origem e conversão' },
    { problem: 'Gastar horas com planilhas', solution: 'Sistema pronto que faz tudo automaticamente' },
  ];

  const testimonials = [
    // { name: 'Roberto S.', role: 'Auto King Veículos', text: 'Triplicamos nossos leads em 2 meses. O catálogo online é um diferencial enorme.' },
    // { name: 'Marcela P.', role: 'MP Motors', text: 'Nunca mais perdi um cliente por falta de follow-up. O CRM é sensacional.' },
    // { name: 'Carlos D.', role: 'CD Premium Cars', text: 'Investimento que se paga no primeiro mês. Simples, bonito e funcional.' },
  ];

  const steps = [
    { step: '01', title: 'Assine o plano', description: 'Crie sua conta e ative sua assinatura em menos de 2 minutos', icon: CreditCard },
    { step: '02', title: 'Configure sua loja', description: 'Adicione logo, dados de contato e personalize seu catálogo', icon: Layers },
    { step: '03', title: 'Cadastre veículos', description: 'Suba fotos, preencha os dados e publique instantaneamente', icon: Car },
    { step: '04', title: 'Comece a vender', description: 'Compartilhe o link do catálogo e receba leads pelo WhatsApp', icon: Rocket },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-500/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
        {/* Road lines animation */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-32 bg-gradient-to-t from-cyan-500/20 to-transparent"
          animate={{ y: [-200, 800] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 left-[30%] w-[2px] h-20 bg-gradient-to-t from-cyan-500/10 to-transparent"
          animate={{ y: [-100, 800] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 left-[70%] w-[2px] h-20 bg-gradient-to-t from-cyan-500/10 to-transparent"
          animate={{ y: [-100, 800] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 2 }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src="/favicon-zailon.ico" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0" />
              <span className="text-base sm:text-lg font-bold text-foreground truncate">JVS Soluções</span>
            </Link>
            <div className="flex items-center gap-1.5 sm:gap-3">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
              <Link to="/login">
                <Button variant="default" size="sm" className="btn-primary-glow">
                  <Rocket className="w-4 h-4" />
                  <span className="hidden sm:inline">Criar minha conta</span>
                  <span className="sm:hidden">Contato</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center justify-center pt-24 sm:pt-28 pb-16 overflow-hidden">
        <motion.div style={{ y: heroImageY, scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <img src={heroCarImage} alt="Luxury car" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
        </motion.div>

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[90vw] md:w-[900px] h-[300px] md:h-[500px] bg-cyan-500/8 rounded-full blur-[100px] md:blur-[150px] z-0" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-3 sm:mb-4 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 sm:mb-6 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="text-[11px] sm:text-sm font-medium text-cyan-400">Plataforma SaaS para Lojas de Veículos</span>
            </div>

            <h1 className="text-[2rem] sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-[1.1]" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              Sua loja de veículos
              <span className="text-gradient block">no próximo nível</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-6 sm:mb-8 px-2" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
              Catálogo profissional, CRM completo e dashboard de vendas.
              <strong className="text-white"> Tudo pronto para usar em minutos.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2">
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="animate-glow-pulse w-full sm:w-auto">
                  <MessageCircle className="w-5 h-5" />
                  Criar minha conta
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>

            <p className="text-[11px] sm:text-xs text-muted-foreground mt-4">✓ Atendimento humano · ✓ Suporte premium · ✓ Setup rápido</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-10 sm:mt-16">
            <a href="#features" className="inline-flex flex-col items-center text-white/50 hover:text-cyan-400 transition-colors">
              <span className="text-xs sm:text-sm mb-2">Saiba mais</span>
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Social proof stats */}
      {/* Problems we solve */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Chega de perder vendas
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Problemas que toda loja de veículos enfrenta — e como resolvemos cada um
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="glass-card p-6 rounded-2xl flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="text-red-400 text-lg">✗</span>
                    </div>
                    <div className="w-0.5 h-6 bg-gradient-to-b from-red-500/30 to-emerald-500/30" />
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-red-400 text-sm font-medium mb-1 line-through">{item.problem}</p>
                    <p className="text-white font-medium">{item.solution}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Tudo que você precisa</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Uma plataforma completa
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ferramentas profissionais que transformam sua loja em uma máquina de vendas
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.06}>
                <div className="glass-card p-6 rounded-2xl group hover:border-cyan-500/30 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comece em <span className="text-gradient">4 passos simples</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 0.15}>
                <div className="relative text-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">{step.step}</span>
                  <h3 className="text-lg font-semibold text-white mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-8">
                      <ArrowRight className="w-5 h-5 text-cyan-500/30" />
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          {/* <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quem usa, <span className="text-gradient">recomenda</span>
            </h2>
          </AnimatedSection> */}

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-cyan-400 fill-cyan-400" />)}
                  </div>
                  <p className="text-white/80 text-sm mb-4 flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center">
                      <span className="text-cyan-400 font-semibold">{t.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Plano - sem preço, contato direto */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-xl mx-auto glass-card p-6 sm:p-8 md:p-10 rounded-3xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400" />
              <p className="text-muted-foreground mb-2">Plano completo profissional</p>
              <h3 className="text-3xl md:text-4xl font-bold text-gradient mb-4">Tudo incluso</h3>
              <p className="text-sm text-muted-foreground mb-6">Sistema completo para transformar sua loja de veículos em uma máquina de vendas automatizada. Do primeiro contato até a venda fechada, tudo integrado e funcionando 24/7.</p>

              <div className="space-y-3 text-left mb-8">
                {[
                  'Catálogo online profissional com link',
                  'CRM Kanban completo para controle de atendimento',
                  'Formulário instantâneo de pré-atendimento automático',
                  'Dashboard com métricas avançadas e KPIs em tempo real',
                  'Upload ilimitado de fotos HD para cada veículo',
                  'Multi-tenancy seguro com isolamento total para sua loja',
                  'Suporte premium via WhatsApp com resposta rápida',
                  'Interface 100% responsiva (celular, tablet, desktop)',
                  'Sistema de login seguro e controle de acesso',
                  'Atualizações gratuitas e suporte técnico contínuo',
                  'Sem limite de veículos ou leads cadastrados',
                  'Análise de origens de leads e funil de vendas',
                  'Relatórios de conversão e ticket médio automático',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-cyan-500/5 rounded-xl p-4 mb-6 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Pré-atendimento inteligente</h4>
                    <p className="text-sm text-muted-foreground">Formulários automáticos capturam dados completos do cliente (financiamento, troca, visita) antes mesmo do primeiro contato humano, qualificando leads automaticamente.</p>
                  </div>
                </div>
              </div>

              <Link to="/login" className="block">
                <Button variant="premium" size="lg" className="w-full animate-glow-pulse mb-3">
                  <MessageCircle className="w-5 h-5" />
                  Criar minha conta
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">Atendimento humano · resposta rápida via WhatsApp</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Perguntas frequentes</h2>
          </AnimatedSection>

          {[
            { q: 'Preciso instalar algo?', a: 'Não! O JVS Soluções é 100% online. Basta acessar pelo navegador do celular ou computador.' },
            { q: 'Posso cancelar quando quiser?', a: 'Sim, sem multas nem contratos. Cancele a qualquer momento pelo painel.' },
            { q: 'Quantos veículos posso cadastrar?', a: 'Ilimitado! Cadastre quantos veículos precisar sem custo adicional.' },
            { q: 'Como meus clientes acessam o catálogo?', a: 'Você recebe um link exclusivo (ex: JVS Soluções.com/loja/sua-loja) para compartilhar por WhatsApp, Instagram ou onde quiser.' },
            { q: 'Os dados são seguros?', a: 'Sim! Cada loja tem isolamento total. Ninguém acessa os dados de outra loja. Usamos criptografia e políticas de segurança avançadas.' },
          ].map((faq, index) => (
            <AnimatedSection key={index} delay={index * 0.08}>
              <details className="glass-card rounded-xl mb-3 group">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-cyan-400 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="glass-card p-8 md:p-12 rounded-3xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10" />
              {/* Animated speed lines */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Pronto para acelerar suas vendas?
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                  Junte-se a dezenas de lojas que já estão vendendo mais com JVS Soluções
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="premium" size="lg" className="animate-glow-pulse w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5" />
                      Criar minha conta
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </a>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="glass" size="lg" className="w-full sm:w-auto">
                      Loguin
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-sm text-muted-foreground">JVS Soluções © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/demo" className="hover:text-cyan-400 transition-colors">Demo</Link>
              <Link to="/login" className="hover:text-cyan-400 transition-colors">Entrar</Link>
              <a href="https://instagram.com/_jvs_solucoes_" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Instagram className="w-4 h-4" />@_jvs_solucoes_
              </a>
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
