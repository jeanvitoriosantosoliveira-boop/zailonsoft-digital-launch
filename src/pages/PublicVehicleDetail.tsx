import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Calendar, Fuel, Gauge, Palette, Settings2, Play,
  MessageCircle, Send, MapPin, Clock, Phone, ChevronLeft, ChevronRight, Check,
} from 'lucide-react';
import { formatPrice, formatMileage } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/ui/LeadForm';
import { Vehicle } from '@/data/vehicles';
import { fetchCarDetails, fetchLojaBySlug, type LojaDetails } from '@/services/api';

const PublicVehicleDetail = () => {
  const { lojaSlug, id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loja, setLoja] = useState<LojaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [car, lojaData] = await Promise.all([
          fetchCarDetails(id!),
          lojaSlug ? fetchLojaBySlug(lojaSlug) : Promise.resolve(null),
        ]);
        setVehicle({
          id: car.id, name: car.nome || '', brand: car.marca || '', model: car.modelo || '',
          year: car.ano || new Date().getFullYear(), price: Number(car.preco) || 0,
          mileage: car.quilometragem || 0, fuel: car.combustivel || '', transmission: car.cambio || '',
          color: car.cor || '', description: car.descricao || '', features: [], images: car.imagens || [],
          stock: car.estoque || 1, status: (car.status as any) || 'available',
          createdAt: car.created_at, views: 0, likes: 0,
        });
        if (lojaData) setLoja(lojaData);
      } catch {
        setVehicle(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, lojaSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <Settings2 className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Veículo não encontrado</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">O veículo que você procura não está disponível</p>
          <Button onClick={() => navigate(-1)}>Voltar ao catálogo</Button>
        </motion.div>
      </div>
    );
  }

  const storeWhatsapp = loja?.whatsapp || '';
  const storeName = loja?.nome || '';
  const storeLogo = loja?.logo_url || '';
  const loc = (loja?.localizacao || {}) as { endereco?: string; cidade?: string; estado?: string };
  const cityLine = [loc.cidade, loc.estado].filter(Boolean).join(' / ');
  const fullAddress = [loc.endereco, cityLine].filter(Boolean).join(' • ');
  const mapsUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : '';
  const horario = loja?.horario_funcionamento as any;
  const horarioText = typeof horario === 'string' ? horario : horario?.descricao || horario?.texto || '';

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.name} (${vehicle.year}) - ${formatPrice(vehicle.price)}`);
  const whatsappUrl = storeWhatsapp ? `https://wa.me/${storeWhatsapp}?text=${whatsappMessage}` : '';

  const specs = [
    { icon: Calendar, label: 'Ano', value: vehicle.year },
    { icon: Gauge, label: 'KM', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Combustível', value: vehicle.fuel },
    { icon: Settings2, label: 'Câmbio', value: vehicle.transmission },
    { icon: Palette, label: 'Cor', value: vehicle.color },
  ];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: vehicle.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const prevImage = () => setActiveImage((i) => (i - 1 + vehicle.images.length) % vehicle.images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % vehicle.images.length);

  return (
    <div className="min-h-screen pb-28 md:pb-10 bg-[#050505]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Voltar</span>
            </button>
            {storeName && (
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
                {storeLogo && <img src={storeLogo} alt={storeName} className="w-7 h-7 rounded-lg object-cover border border-white/10" />}
                <span className="text-xs md:text-sm font-medium text-white/90 truncate">{storeName}</span>
              </div>
            )}
            <button onClick={handleShare}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 transition-all">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 md:gap-8">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 md:space-y-4">
            <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden glass-card group">
              {showVideo && vehicle.videoUrl ? (
                <video src={vehicle.videoUrl} autoPlay controls playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={vehicle.images[activeImage] || '/placeholder.svg'} alt={vehicle.name} className="w-full h-full object-cover" />
              )}

              {/* Nav arrows (desktop) */}
              {!showVideo && vehicle.images.length > 1 && (
                <>
                  <button onClick={prevImage}
                    className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md hover:bg-cyan-500 hover:text-slate-950 items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={nextImage}
                    className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md hover:bg-cyan-500 hover:text-slate-950 items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {vehicle.videoUrl && (
                <button onClick={() => setShowVideo(!showVideo)}
                  className={`absolute top-3 right-3 md:top-4 md:right-4 px-3 py-1.5 md:px-4 md:py-2 rounded-xl flex items-center gap-1.5 md:gap-2 transition-all ${showVideo ? 'bg-cyan-500 text-slate-950' : 'bg-black/55 backdrop-blur-md text-white hover:bg-cyan-500/30'}`}>
                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm font-medium">{showVideo ? 'Fotos' : 'Vídeo'}</span>
                </button>
              )}

              <span className={`absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md ${
                vehicle.status === 'available' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                : vehicle.status === 'reserved' ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                : 'bg-red-500/25 text-red-300 border border-red-400/40'
              }`}>
                {vehicle.status === 'available' ? 'Disponível' : vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
              </span>

              {/* Image counter */}
              {!showVideo && vehicle.images.length > 1 && (
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-[11px] text-white/90 font-medium">
                  {activeImage + 1} / {vehicle.images.length}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {vehicle.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                {vehicle.images.map((image, index) => (
                  <button key={index} onClick={() => { setActiveImage(index); setShowVideo(false); }}
                    className={`relative w-20 h-16 md:w-24 md:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                      activeImage === index && !showVideo ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-[#050505]' : 'opacity-50 hover:opacity-100'
                    }`}>
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5 md:space-y-6">
            <div>
              {vehicle.brand && (
                <p className="text-xs md:text-sm text-cyan-400 font-semibold mb-2 uppercase tracking-wider">{vehicle.brand}</p>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{vehicle.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">A partir de</span>
              </div>
              <div className="price-tag text-2xl md:text-3xl mt-1">{formatPrice(vehicle.price)}</div>
            </div>

            {/* Specs grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
              {specs.map((spec, index) => (
                <div key={index} className="glass-card p-3 md:p-4 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <spec.icon className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">{spec.label}</p>
                      <p className="text-xs md:text-sm font-semibold text-white truncate">{spec.value || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="glass-card p-4 md:p-6 rounded-2xl">
                <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Descrição</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{vehicle.description}</p>
              </div>
            )}

            {/* Desktop CTAs */}
            <div className="hidden md:flex flex-col gap-3 pt-2">
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="premium" size="lg" className="w-full text-base">
                    <MessageCircle className="w-5 h-5" /> Tenho interesse — WhatsApp
                  </Button>
                </a>
              )}
              <Button variant="outline" size="lg" className="w-full" onClick={() => setShowLeadForm(true)}>
                <Send className="w-4 h-4" /> Enviar proposta
              </Button>
            </div>

            {/* Store mini-card */}
            {(storeName || fullAddress || horarioText) && (
              <div className="glass-card rounded-2xl p-4 md:p-5 border-cyan-500/15">
                <div className="flex items-center gap-3 mb-3">
                  {storeLogo && <img src={storeLogo} alt={storeName} className="w-10 h-10 rounded-xl object-cover border border-white/10" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{storeName}</p>
                    <p className="text-[11px] text-muted-foreground">Loja oficial</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {fullAddress && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-white/80 hover:text-cyan-400 transition-colors">
                      <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[13px] leading-tight">{fullAddress}</span>
                    </a>
                  )}
                  {horarioText && (
                    <div className="flex items-start gap-2 text-white/80">
                      <Clock className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[13px] leading-tight whitespace-pre-line">{horarioText}</span>
                    </div>
                  )}
                  {loja?.telefone_principal && (
                    <a href={`tel:${loja.telefone_principal}`} className="flex items-start gap-2 text-white/80 hover:text-cyan-400 transition-colors">
                      <Phone className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[13px]">{loja.telefone_principal}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 z-30 md:hidden">
        <div className="flex gap-2 max-w-lg mx-auto">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="premium" className="w-full h-12">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
          )}
          <Button variant="outline" className="flex-1 h-12" onClick={() => setShowLeadForm(true)}>
            <Send className="w-4 h-4" /> Proposta
          </Button>
        </div>
      </div>

      <LeadForm isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} vehicle={vehicle} />
    </div>
  );
};

export default PublicVehicleDetail;
