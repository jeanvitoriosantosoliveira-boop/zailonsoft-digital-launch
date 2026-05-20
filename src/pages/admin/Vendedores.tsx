import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Edit, Trash2, X, Save, Trophy, Phone, Mail, MessageCircle,
  Target, DollarSign, Camera, Search, TrendingUp, Award, Calendar, CheckCircle2, XCircle, Plus
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Seller, Sale } from '@/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/formatters';

const emptySeller: Omit<Seller, 'id' | 'salesCount'> = {
  name: '', email: '', phone: '', whatsapp: '',
  role: 'Consultor de Vendas', birthDate: '', hireDate: '',
  commissionPercent: 3, monthlyGoal: 0, active: true,
  notes: '', workingHours: '',
};

const Vendedores = () => {
  const { sellers, sales, vehicles, leads, addSeller, updateSeller, deleteSeller, addSale, deleteSale } = useData();
  const [search, setSearch] = useState('');
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState<Seller | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Seller | null>(null);
  const [form, setForm] = useState<Omit<Seller, 'id' | 'salesCount'>>(emptySeller);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  // New sale form
  const [saleVehicle, setSaleVehicle] = useState('');
  const [saleClient, setSaleClient] = useState('');
  const [saleValue, setSaleValue] = useState('');
  const [saleCommission, setSaleCommission] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleNotes, setSaleNotes] = useState('');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const sellerStats = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number; commission: number; thisMonth: number; thisMonthRevenue: number; lastMonth: number; lastMonthRevenue: number }>();
    sellers.forEach(s => map.set(s.id, { count: 0, revenue: 0, commission: 0, thisMonth: 0, thisMonthRevenue: 0, lastMonth: 0, lastMonthRevenue: 0 }));
    sales.forEach(sale => {
      if (!sale.vendedorId) return;
      const stat = map.get(sale.vendedorId);
      if (!stat) return;
      stat.count += 1;
      stat.revenue += sale.valor || 0;
      stat.commission += sale.comissao || 0;
      const d = new Date(sale.dataVenda);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        stat.thisMonth += 1;
        stat.thisMonthRevenue += sale.valor || 0;
      }
      const lastMonth = (currentMonth - 1 + 12) % 12;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      if (d.getFullYear() === lastYear && d.getMonth() === lastMonth) {
        stat.lastMonth += 1;
        stat.lastMonthRevenue += sale.valor || 0;
      }
    });
    return map;
  }, [sales, sellers, currentMonth, currentYear]);

  const leadsBySeller = useMemo(() => {
    const map = new Map<string, number>();
    leads.forEach(l => {
      if (l.vendedorId) map.set(l.vendedorId, (map.get(l.vendedorId) || 0) + 1);
    });
    return map;
  }, [leads]);

  const ranking = useMemo(() => {
    return [...sellers]
      .map(s => ({ seller: s, stats: sellerStats.get(s.id) || { count: 0, revenue: 0, commission: 0, thisMonth: 0, thisMonthRevenue: 0, lastMonth: 0, lastMonthRevenue: 0 } }))
      .sort((a, b) => b.stats.thisMonthRevenue - a.stats.thisMonthRevenue);
  }, [sellers, sellerStats]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ranking;
    return ranking.filter(({ seller }) =>
      seller.name.toLowerCase().includes(q) ||
      (seller.email || '').toLowerCase().includes(q) ||
      (seller.phone || '').toLowerCase().includes(q)
    );
  }, [ranking, search]);

  const openCreate = () => {
    setForm(emptySeller);
    setFotoFile(null);
    setFotoPreview('');
    setEditingSeller(null);
    setShowCreate(true);
  };

  const openEdit = (s: Seller) => {
    setForm({
      name: s.name, email: s.email, phone: s.phone, whatsapp: s.whatsapp || '',
      role: s.role || 'Consultor de Vendas', birthDate: s.birthDate || '', hireDate: s.hireDate || '',
      commissionPercent: s.commissionPercent ?? 3, monthlyGoal: s.monthlyGoal ?? 0,
      active: s.active !== false, notes: s.notes || '', workingHours: s.workingHours || '',
    });
    setFotoFile(null);
    setFotoPreview(s.avatar || '');
    setEditingSeller(s);
    setShowCreate(true);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }
    try {
      if (editingSeller) {
        await updateSeller(editingSeller.id, form, fotoFile);
        toast({ title: 'Vendedor atualizado!' });
      } else {
        await addSeller(form, fotoFile);
        toast({ title: 'Vendedor adicionado!' });
      }
      setShowCreate(false);
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message || 'Falha ao salvar', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteSeller(confirmDelete.id);
      toast({ title: 'Vendedor removido' });
      setConfirmDelete(null);
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const openSale = (s: Seller) => {
    setShowSaleModal(s);
    setSaleVehicle('');
    setSaleClient('');
    setSaleValue('');
    setSaleCommission('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setSaleNotes('');
  };

  const handleAddSale = async () => {
    if (!showSaleModal) return;
    const val = Number(saleValue);
    if (!val || val <= 0) {
      toast({ title: 'Informe um valor válido', variant: 'destructive' });
      return;
    }
    const vehicle = vehicles.find(v => v.id === saleVehicle);
    const client = leads.find(l => l.id === saleClient);
    try {
      await addSale({
        lojaId: '', // overridden in context
        vendedorId: showSaleModal.id,
        carId: vehicle?.id,
        vehicleName: vehicle?.name || '',
        clientId: client?.id,
        clientName: client?.name || '',
        valor: val,
        comissao: Number(saleCommission) || (val * (showSaleModal.commissionPercent || 0)) / 100,
        dataVenda: new Date(saleDate).toISOString(),
        observacoes: saleNotes,
      });
      toast({ title: 'Venda registrada!' });
      setShowSaleModal(null);
    } catch (err: any) {
      toast({ title: 'Erro', description: err?.message, variant: 'destructive' });
    }
  };

  const totalThisMonth = ranking.reduce((acc, r) => acc + r.stats.thisMonthRevenue, 0);
  const totalSalesThisMonth = ranking.reduce((acc, r) => acc + r.stats.thisMonth, 0);

  const rankColors = ['from-yellow-400 to-amber-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-700'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold text-white mb-2">
            Vendedores
          </motion.h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {sellers.length} vendedores • {totalSalesThisMonth} vendas este mês • {formatPrice(totalThisMonth)} em receita
          </p>
        </div>
        <Button onClick={openCreate}>
          <UserPlus className="w-4 h-4" /> Novo Vendedor
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="w-3.5 h-3.5" /> Vendas no mês</div>
          <p className="text-2xl font-bold text-white mt-1">{totalSalesThisMonth}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><DollarSign className="w-3.5 h-3.5" /> Receita no mês</div>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{formatPrice(totalThisMonth)}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Award className="w-3.5 h-3.5" /> Top vendedor</div>
          <p className="text-sm font-semibold text-white mt-1 truncate">{ranking[0]?.seller.name || '—'}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><Target className="w-3.5 h-3.5" /> Vendedores ativos</div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{sellers.filter(s => s.active !== false).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar vendedor..." className="pl-11 h-11" />
      </div>

      {/* Sellers Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Nenhum vendedor cadastrado</p>
          <p className="text-sm text-muted-foreground mb-4">Comece adicionando sua equipe de vendas para ranquear performance.</p>
          <Button onClick={openCreate}><UserPlus className="w-4 h-4" /> Adicionar vendedor</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ seller, stats }, idx) => {
            const goalReached = (seller.monthlyGoal || 0) > 0 ? (stats.thisMonthRevenue / (seller.monthlyGoal || 1)) * 100 : 0;
            const trend = stats.lastMonthRevenue > 0 ? ((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100 : null;
            const myLeads = leadsBySeller.get(seller.id) || 0;
            return (
              <motion.div key={seller.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                {/* Rank Badge */}
                {idx < 3 && (
                  <div className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-gradient-to-br ${rankColors[idx]} flex items-center justify-center shadow-lg`}>
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center border-2 border-white/10">
                        <span className="text-cyan-400 text-2xl font-bold">{seller.name.charAt(0)}</span>
                      </div>
                    )}
                    {seller.active === false && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-500/90 text-white text-[9px] font-medium">Inativo</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{seller.name}</h3>
                    <p className="text-xs text-cyan-400 font-medium">{seller.role}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {seller.phone && (
                        <a href={`tel:${seller.phone}`} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"><Phone className="w-3 h-3" />{seller.phone}</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] text-center">
                    <p className="text-[10px] text-muted-foreground">Vendas mês</p>
                    <p className="text-lg font-bold text-white">{stats.thisMonth}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] text-center">
                    <p className="text-[10px] text-muted-foreground">Total vendas</p>
                    <p className="text-lg font-bold text-cyan-400">{stats.count}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] text-center">
                    <p className="text-[10px] text-muted-foreground">Leads</p>
                    <p className="text-lg font-bold text-blue-400">{myLeads}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Receita mês</span>
                    <span className="font-semibold text-emerald-400">{formatPrice(stats.thisMonthRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Comissão mês</span>
                    <span className="font-semibold text-amber-400">{formatPrice(stats.commission)}</span>
                  </div>
                  {trend !== null && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">vs mês anterior</span>
                      <span className={`font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {(seller.monthlyGoal || 0) > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Meta</span>
                        <span className="text-white">{Math.min(100, goalReached).toFixed(0)}% • {formatPrice(seller.monthlyGoal || 0)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full ${goalReached >= 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(100, goalReached)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/5">
                  {seller.whatsapp && (
                    <a href={`https://wa.me/55${seller.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full"><MessageCircle className="w-3.5 h-3.5" /></Button>
                    </a>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openSale(seller)} className="flex-1">
                    <Plus className="w-3.5 h-3.5" /> Venda
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(seller)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDelete(seller)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent sales table */}
      {sales.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">Histórico de Vendas</h3>
            <p className="text-xs text-muted-foreground">{sales.length} venda{sales.length !== 1 ? 's' : ''} registrada{sales.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-white/5">
                  <th className="p-3">Data</th>
                  <th className="p-3">Vendedor</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Veículo</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 text-right">Comissão</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 20).map(s => {
                  const seller = sellers.find(v => v.id === s.vendedorId);
                  return (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-3 text-muted-foreground">{new Date(s.dataVenda).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 text-white">{seller?.name || '—'}</td>
                      <td className="p-3 text-muted-foreground">{s.clientName || '—'}</td>
                      <td className="p-3 text-muted-foreground">{s.vehicleName || '—'}</td>
                      <td className="p-3 text-right font-semibold text-emerald-400">{formatPrice(s.valor)}</td>
                      <td className="p-3 text-right text-amber-400">{formatPrice(s.comissao || 0)}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteSale(s.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl glass-card rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">{editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}</h3>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                    <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      <Camera className="w-3.5 h-3.5" /> {fotoPreview ? 'Trocar foto' : 'Adicionar foto'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG ou PNG, recomendado 400x400</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Nome *</label>
                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="João Silva" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Cargo</label>
                    <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Consultor de Vendas" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Telefone</label>
                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">WhatsApp</label>
                    <Input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Email</label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="vendedor@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Data de nascimento</label>
                    <Input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Data de admissão</label>
                    <Input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Comissão (%)</label>
                    <Input type="number" min={0} max={100} step={0.1} value={form.commissionPercent ?? ''} onChange={e => setForm({ ...form, commissionPercent: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Meta mensal (R$)</label>
                    <Input type="number" min={0} value={form.monthlyGoal ?? ''} onChange={e => setForm({ ...form, monthlyGoal: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Horário disponível</label>
                    <Input value={form.workingHours} onChange={e => setForm({ ...form, workingHours: e.target.value })} placeholder="Seg-Sex 9h-18h" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Observações</label>
                    <Textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Especialidades, idiomas, notas internas..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.active !== false} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded" />
                      <span className="text-sm text-white">Vendedor ativo</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-white/5">
                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleSave} className="flex-1"><Save className="w-4 h-4" /> {editingSeller ? 'Salvar' : 'Adicionar'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sale Modal */}
      <AnimatePresence>
        {showSaleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaleModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Registrar Venda • {showSaleModal.name}</h3>
                <button onClick={() => setShowSaleModal(null)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Veículo</label>
                  <select value={saleVehicle} onChange={e => {
                    setSaleVehicle(e.target.value);
                    const v = vehicles.find(x => x.id === e.target.value);
                    if (v && !saleValue) setSaleValue(String(v.price));
                  }} className="w-full h-11 px-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm" style={{ colorScheme: 'dark' }}>
                    <option value="">— Selecionar —</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} • {formatPrice(v.price)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Cliente (lead)</label>
                  <select value={saleClient} onChange={e => setSaleClient(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm" style={{ colorScheme: 'dark' }}>
                    <option value="">— Sem lead associado —</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Valor *</label>
                    <Input type="number" value={saleValue} onChange={e => setSaleValue(e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Comissão</label>
                    <Input type="number" value={saleCommission} onChange={e => setSaleCommission(e.target.value)} placeholder={`${showSaleModal.commissionPercent || 0}%`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data</label>
                  <Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Observações</label>
                  <Textarea rows={2} value={saleNotes} onChange={e => setSaleNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-white/5">
                <Button variant="outline" onClick={() => setShowSaleModal(null)} className="flex-1">Cancelar</Button>
                <Button onClick={handleAddSale} className="flex-1"><CheckCircle2 className="w-4 h-4" /> Registrar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-sm glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-2">Remover {confirmDelete.name}?</h3>
              <p className="text-sm text-muted-foreground mb-4">Esta ação não pode ser desfeita. As vendas associadas serão preservadas mas ficarão sem vendedor.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete} className="flex-1"><Trash2 className="w-4 h-4" /> Remover</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendedores;
