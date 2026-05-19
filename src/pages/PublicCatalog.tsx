import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, SlidersHorizontal, X, Instagram, MessageCircle, MapPin, Clock, Phone, Mail, Globe, Facebook } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { VehiclePostCard } from '@/components/ui/VehiclePostCard';
import { Vehicle } from '@/data/vehicles';
import { fetchCarsByLojaSlug } from '@/services/api';
import type { LojaDetails } from '@/services/api';

const PublicCatalog = () => {
  const { lojaSlug } = useParams<{ lojaSlug: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loja, setLoja] = useState<LojaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!lojaSlug) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const { cars, loja } = await fetchCarsByLojaSlug(lojaSlug);
        setLoja(loja);
        setVehicles(cars.map(car => ({
          id: car.id,
          name: car.nome || '',
          brand: car.marca || '',
          model: car.modelo || '',
          year: car.ano || new Date().getFullYear(),
          price: Number(car.preco) || 0,
          mileage: car.quilometragem || 0,
          fuel: car.combustivel || '',
          transmission: car.cambio || '',
          color: car.cor || '',
          description: car.descricao || '',
          features: [],
          images: car.imagens || [],
          stock: car.estoque || 1,
          status: (car.status as 'available' | 'reserved' | 'sold') || 'available',
          createdAt: car.created_at || new Date().toISOString(),
          views: 0,
          likes: 0,
        })));
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [lojaSlug]);

  const brands = useMemo(() => [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort(), [vehicles]);
  const years = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!vehicle.name.toLowerCase().includes(q) && !vehicle.brand.toLowerCase().includes(q) && !vehicle.model.toLowerCase().includes(q)) return false;
      }
      if (selectedBrand && vehicle.brand !== selectedBrand) return false;
      if (selectedYear && vehicle.year.toString() !== selectedYear) return false;
      if (minPrice && vehicle.price < minPrice) return false;
      if (maxPrice && vehicle.price > maxPrice) return false;
      return true;
    });
  }, [vehicles, searchQuery, selectedBrand, selectedYear, minPrice, maxPrice]);

  const hasActiveFilters = selectedBrand || selectedYear || minPrice > 0 || maxPrice > 0;
  const handleResetFilters = () => { setSelectedBrand(''); setSelectedYear(''); setMinPrice(0); setMaxPrice(0); setSearchQuery(''); };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <img src="/favicon.ico" alt="" className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground mb-6">Verifique o link e tente novamente.</p>
          <Link to="/"><Button>Página inicial</Button></Link>
        </div>
      </div>
    );
  }

  const storeName = loja?.nome || 'Catálogo';
  const storeLogo = loja?.logo_url || '';
  const storeWhatsapp = loja?.whatsapp || '';
  const storeDescription = loja?.descricao || '';
  const loc = (loja?.localizacao || {}) as { endereco?: string; cidade?: string; estado?: string; cep?: string };
  const cityLine = [loc.cidade, loc.estado].filter(Boolean).join(' / ');
  const fullAddress = [loc.endereco, cityLine].filter(Boolean).join(' • ');
  const horario = loja?.horario_funcionamento as any;
  const horarioText = typeof horario === 'string' ? horario : horario?.descricao || horario?.texto || '';
  const redes = (loja?.redes_sociais || {}) as { instagram?: string; facebook?: string };
  const instagramHandle = redes.instagram?.replace('@', '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
  const facebookUrl = redes.facebook?.startsWith('http') ? redes.facebook : redes.facebook ? `https://facebook.com/${redes.facebook}` : '';
  const mapsUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : '';

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-cyan-500/10 rounded-full blur-[120px] opacity-50" />

        <div className="relative container mx-auto px-4 py-6 md:py-10">
          {/* Store identity */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6 md:mb-8">
            <img src={storeLogo || '/favicon.ico'} alt={storeName} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl shadow-glow-md object-cover border border-white/10" />
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-white truncate">{storeName}</h1>
              {cityLine && (
                <p className="text-[11px] md:text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {cityLine}
                </p>
              )}
            </div>
          </motion.div>

          {/* Hero Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
              <span className="text-xs md:text-sm font-medium text-cyan-400">Veículos Exclusivos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Encontre seu próximo
              <span className="text-gradient block mt-1">veículo dos sonhos</span>
            </h2>
            {storeDescription ? (
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">{storeDescription}</p>
            ) : (
              <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto px-4">
                Navegue pelo nosso catálogo premium de veículos selecionados
              </p>
            )}
          </motion.div>

          {/* Store info bar */}
          {(fullAddress || horarioText || loja?.telefone_principal || loja?.email || loja?.site || instagramHandle || facebookUrl) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="max-w-3xl mx-auto glass-card rounded-2xl p-4 md:p-5 mb-5 md:mb-6">
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                {fullAddress && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-white/85 hover:text-cyan-400 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Endereço</p>
                      <p className="text-sm leading-tight">{fullAddress}</p>
                    </div>
                  </a>
                )}
                {horarioText && (
                  <div className="flex items-start gap-3 text-white/85">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Horário</p>
                      <p className="text-sm leading-tight whitespace-pre-line">{horarioText}</p>
                    </div>
                  </div>
                )}
                {loja?.telefone_principal && (
                  <a href={`tel:${loja.telefone_principal}`} className="flex items-start gap-3 text-white/85 hover:text-cyan-400 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Telefone</p>
                      <p className="text-sm">{loja.telefone_principal}</p>
                    </div>
                  </a>
                )}
                {loja?.email && (
                  <a href={`mailto:${loja.email}`} className="flex items-start gap-3 text-white/85 hover:text-cyan-400 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">E-mail</p>
                      <p className="text-sm truncate">{loja.email}</p>
                    </div>
                  </a>
                )}
              </div>
              {(instagramHandle || facebookUrl || loja?.site) && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <span className="text-[11px] text-muted-foreground mr-1">Siga:</span>
                  {instagramHandle && (
                    <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-xs text-white/85 transition-all">
                      <Instagram className="w-3.5 h-3.5" /> @{instagramHandle}
                    </a>
                  )}
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-xs text-white/85 transition-all">
                      <Facebook className="w-3.5 h-3.5" /> Facebook
                    </a>
                  )}
                  {loja?.site && (
                    <a href={loja.site.startsWith('http') ? loja.site : `https://${loja.site}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-xs text-white/85 transition-all">
                      <Globe className="w-3.5 h-3.5" /> Site
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Search & Filter Bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto">
            <div className="relative flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nome, marca ou modelo..."
                  className="input-premium w-full h-12 md:h-14 pl-12 pr-10 text-sm md:text-base rounded-xl" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`h-12 md:h-14 px-4 md:px-5 rounded-xl flex items-center gap-2 font-semibold transition-all flex-shrink-0 ${
                  showFilters || hasActiveFilters
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)]'
                    : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-500/60'
                }`}>
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm">Filtros</span>
                {hasActiveFilters && !showFilters && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-cyan-400 text-[10px] font-bold">
                    {(selectedBrand ? 1 : 0) + (selectedYear ? 1 : 0) + (minPrice > 0 || maxPrice > 0 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Filters */}
            <motion.div initial={false} animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="glass-card rounded-2xl p-4 md:p-5 space-y-4">
                {brands.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Marca</label>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedBrand('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedBrand ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                        Todas
                      </button>
                      {brands.map(b => (
                        <button key={b} onClick={() => setSelectedBrand(b)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBrand === b ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {years.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Ano</label>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedYear('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedYear ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                        Todos
                      </button>
                      {years.map(y => (
                        <button key={y} onClick={() => setSelectedYear(y.toString())}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedYear === y.toString() ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Faixa de Preço</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Mínimo</span>
                      <input type="number" value={minPrice || ''} onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)} placeholder="R$ 0" className="input-premium w-full h-10 text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Máximo</span>
                      <input type="number" value={maxPrice || ''} onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)} placeholder="Sem limite" className="input-premium w-full h-10 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button onClick={handleResetFilters} className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors">Limpar filtros</button>
                  <button onClick={() => setShowFilters(false)} className="text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-colors">Aplicar</button>
                </div>
              </div>
            </motion.div>

            {/* Active filter chips */}
            {hasActiveFilters && !showFilters && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Filtros:</span>
                {selectedBrand && <button onClick={() => setSelectedBrand('')} className="badge-premium flex items-center gap-1">{selectedBrand} <X className="w-3 h-3" /></button>}
                {selectedYear && <button onClick={() => setSelectedYear('')} className="badge-premium flex items-center gap-1">{selectedYear} <X className="w-3 h-3" /></button>}
                {(minPrice > 0 || maxPrice > 0) && <button onClick={() => { setMinPrice(0); setMaxPrice(0); }} className="badge-premium flex items-center gap-1">{minPrice > 0 ? formatPrice(minPrice) : 'R$ 0'} - {maxPrice > 0 ? formatPrice(maxPrice) : '∞'} <X className="w-3 h-3" /></button>}
                <button onClick={handleResetFilters} className="text-xs text-cyan-400 hover:text-cyan-300 underline">Limpar</button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </header>


      {/* Feed */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {isLoading ? (
          <div className="feed-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <p className="text-xs md:text-sm text-muted-foreground">
                {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="feed-grid">
              {filteredVehicles.map((vehicle, index) => (
                <VehiclePostCard key={vehicle.id} vehicle={vehicle} index={index} linkPrefix={`/loja/${lojaSlug}`} />
              ))}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <img src="/favicon.ico" alt="" className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Nenhum veículo encontrado</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md px-4">
              {hasActiveFilters ? 'Tente ajustar seus filtros' : 'Nenhum veículo disponível no momento'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={handleResetFilters}>Limpar filtros</Button>}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={storeLogo || '/favicon.ico'} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover" />
              <span className="text-xs md:text-sm text-muted-foreground">{storeName} © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <a href={`https://wa.me/${storeWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-cyan-400 transition-colors">WhatsApp</a>
              <span className="text-xs text-muted-foreground/50">Powered by ZAILON</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicCatalog;
