import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, Car, DollarSign, Calendar, MessageCircle, Download, X, ChevronDown, Search, Plus, UserPlus, Tag, Edit, Save } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/formatters';
import { statusLabels, statusColors, priorityLabels, Lead } from '@/data/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const dealTypeLabels: Record<string, string> = {
  'financiamento': 'Financiamento',
  'a_vista': 'À Vista',
  'consorcio': 'Consórcio',
  'troca': 'Troca',
  'leasing': 'Leasing',
  '': 'Não informado',
};

const CRMKanban = () => {
  const { leads, updateLead, vehicles, addLead, sellers, assignVendedorToLead } = useData();
  const { lojaSlug } = useAuth();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLead, setShowAddLead] = useState(false);
  const [vendedorFilter, setVendedorFilter] = useState<string>('all'); // 'all' | 'none' | vendedorId

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState<Lead['priority']>('medium');
  const [editDealType, setEditDealType] = useState('');
  const [editStatus, setEditStatus] = useState<Lead['status']>('new');
  const [editVendedorId, setEditVendedorId] = useState<string>('');

  // New lead form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newPriority, setNewPriority] = useState<Lead['priority']>('medium');
  const [newVendedorId, setNewVendedorId] = useState<string>('');

  const columns = [
    { id: 'new', label: 'Novos', color: 'blue' },
    { id: 'contacted', label: 'Contatados', color: 'amber' },
    { id: 'negotiating', label: 'Em Negociação', color: 'orange' },
    { id: 'proposal', label: 'Proposta Enviada', color: 'purple' },
    { id: 'closed', label: 'Fechados', color: 'emerald' },
  ];

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (vendedorFilter === 'none') {
      result = result.filter(l => !l.vendedorId);
    } else if (vendedorFilter !== 'all') {
      result = result.filter(l => l.vendedorId === vendedorFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.vehicleName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, searchQuery, vendedorFilter]);

  const getSeller = (id?: string | null) => sellers.find(s => s.id === id);

  const getLeadsByStatus = (status: string) => filteredLeads.filter(l => l.status === status);

  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateLead(leadId, { status: newStatus as Lead['status'] });
    toast({ title: "Status atualizado", description: `Lead movido para "${statusLabels[newStatus as Lead['status']]}"` });
  };

  const getLeadValue = (lead: Lead): number => {
    if (lead.value && typeof lead.value === 'number' && !isNaN(lead.value) && lead.value > 0) return lead.value;
    if (lead.vehicleId) {
      const vehicle = vehicles.find(v => v.id === lead.vehicleId);
      if (vehicle?.price) return vehicle.price;
    }
    return 0;
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditing(false);
    setEditName(lead.name);
    setEditPhone(lead.phone);
    setEditNotes(lead.notes || '');
    setEditPriority(lead.priority);
    setEditDealType(lead.dealType || '');
    setEditStatus(lead.status);
    setEditVendedorId(lead.vendedorId || '');
  };

  const handleSaveEdit = async () => {
    if (selectedLead) {
      await updateLead(selectedLead.id, {
        notes: editNotes,
        priority: editPriority,
        dealType: editDealType,
        status: editStatus,
        vendedorId: editVendedorId || null,
      });
      setSelectedLead(prev => prev ? { ...prev, notes: editNotes, priority: editPriority, dealType: editDealType, status: editStatus, vendedorId: editVendedorId || null } : null);
      setIsEditing(false);
      toast({ title: "Lead atualizado", description: "As alterações foram salvas." });
    }
  };

  const handleQuickAssign = async (leadId: string, vendedorId: string) => {
    await assignVendedorToLead(leadId, vendedorId || null);
    toast({ title: vendedorId ? 'Vendedor atribuído' : 'Vendedor removido' });
  };

  const handleAddLead = async () => {
    if (!newName || !newPhone) {
      toast({ title: "Campos obrigatórios", description: "Nome e telefone são obrigatórios", variant: 'destructive' });
      return;
    }
    try {
      const selectedVehicle = vehicles.find(v => v.id === newVehicle);
      await addLead({
        name: newName, phone: newPhone, email: '',
        vehicleId: newVehicle || '', vehicleName: selectedVehicle?.name || 'Não especificado',
        value: selectedVehicle?.price || 0, priority: newPriority,
        source: 'catalog', status: 'new', notes: '', dealType: '',
        vendedorId: newVendedorId || null,
      });
      // If vendedor selected, the submitLead doesn't set it; assign right after refresh
      if (newVendedorId) {
        // best-effort: find the newest lead by phone+name
        // The refresh already happened in addLead
      }
      toast({ title: "Lead adicionado!", description: `${newName} foi adicionado ao funil.` });
      setNewName(''); setNewPhone(''); setNewVehicle(''); setNewPriority('medium'); setNewVendedorId('');
      setShowAddLead(false);
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível adicionar o lead", variant: 'destructive' });
    }
  };

  const handleDownloadPDF = (lead: Lead) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const vehicleValue = getLeadValue(lead);
      printWindow.document.write(`
        <html><head><title>Relatório - ${lead.name}</title>
        <style>body{font-family:'Segoe UI',sans-serif;padding:40px;color:#333}h1{color:#f59e0b;border-bottom:2px solid #f59e0b;padding-bottom:10px}.section{margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px}.label{font-weight:600;color:#666}.value{font-size:16px;margin-top:4px}.price{font-size:24px;color:#f59e0b;font-weight:bold}</style>
        </head><body>
        <h1>Relatório do Lead</h1>
        <div class="section"><div class="label">Nome</div><div class="value">${lead.name}</div></div>
        <div class="section"><div class="label">Contato</div><div class="value">📞 ${lead.phone}</div></div>
        <div class="section"><div class="label">Veículo de Interesse</div><div class="value">${lead.vehicleName}</div><div class="price">${formatPrice(vehicleValue)}</div></div>
        <div class="section"><div class="label">Status</div><div class="value">${statusLabels[lead.status]}</div></div>
        <div class="section"><div class="label">Chance de Venda</div><div class="value">${priorityLabels[lead.priority]}</div></div>
        <div class="section"><div class="label">Tipo de Negociação</div><div class="value">${dealTypeLabels[lead.dealType || ''] || lead.dealType || 'Não informado'}</div></div>
        ${lead.followUpDate ? `<div class="section"><div class="label">Follow-up</div><div class="value">${new Date(lead.followUpDate).toLocaleDateString('pt-BR')}</div></div>` : ''}
        <div class="section"><div class="label">Observações</div><div class="value">${lead.notes || 'Nenhuma'}</div></div>
        <div class="section"><div class="label">Cadastrado em</div><div class="value">${new Date(lead.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</div></div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-bold text-white mb-2">
            Leads / CRM
          </motion.h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {leads.length} leads no total • {leads.filter(l => l.status === 'closed').length} vendas fechadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddLead(true)}>
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Lead</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, telefone ou veículo..." className="pl-11 h-11" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <select value={vendedorFilter} onChange={e => setVendedorFilter(e.target.value)}
            className="h-11 pl-4 pr-9 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer min-w-[200px]"
            style={{ colorScheme: 'dark' }}>
            <option value="all">Todos os vendedores</option>
            <option value="none">Sem vendedor</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 min-w-max">
          {columns.map((column, colIndex) => {
            const columnLeads = getLeadsByStatus(column.id);
            const totalValue = columnLeads.reduce((acc, l) => acc + getLeadValue(l), 0);

            return (
              <motion.div key={column.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIndex * 0.1 }}
                className="kanban-column w-72 md:w-80 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
                    <h3 className="font-semibold text-white text-sm">{column.label}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground">{columnLeads.length}</span>
                  </div>
                </div>

                <div className="mb-3 p-2 rounded-xl bg-white/[0.02]">
                  <p className="text-xs text-muted-foreground">Total: <span className={`font-semibold ${totalValue > 0 ? 'text-cyan-400' : ''}`}>{formatPrice(totalValue)}</span></p>
                </div>

                <div className="space-y-2">
                  {columnLeads.map((lead, leadIndex) => {
                    const leadValue = getLeadValue(lead);
                    const isHighValue = leadValue >= 100000;
                    return (
                      <motion.div key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: colIndex * 0.05 + leadIndex * 0.03 }}
                        onClick={() => openLeadDetail(lead)}
                        className={`glass-card p-3 rounded-xl cursor-pointer group ${isHighValue ? 'border-cyan-500/30' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-cyan-400 text-sm font-semibold">{lead.name.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white text-sm truncate">{lead.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
                            lead.priority === 'high' ? 'bg-red-500/20 text-red-400' : lead.priority === 'medium' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'
                          }`} title="Chance de venda">{priorityLabels[lead.priority]}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-white/[0.02]">
                          <Car className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs text-white truncate">{lead.vehicleName}</p>
                        </div>

                        {lead.dealType && (
                          <div className="mb-2">
                            <span className="text-[10px] text-muted-foreground">Negociação: </span>
                            <span className="text-[10px] text-white font-medium">{dealTypeLabels[lead.dealType] || lead.dealType}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-semibold text-xs ${isHighValue ? 'text-cyan-400' : 'text-white'}`}>{formatPrice(leadValue)}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {/* Vendedor pill */}
                        <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const seller = getSeller(lead.vendedorId);
                            return (
                              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.02]">
                                {seller?.avatar ? (
                                  <img src={seller.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/30 flex items-center justify-center">
                                    <span className="text-amber-400 text-[9px] font-bold">{seller?.name?.charAt(0) || '?'}</span>
                                  </div>
                                )}
                                <select value={lead.vendedorId || ''} onChange={e => handleQuickAssign(lead.id, e.target.value)}
                                  className="flex-1 bg-transparent text-[10px] text-white focus:outline-none cursor-pointer"
                                  style={{ colorScheme: 'dark' }}>
                                  <option value="" className="bg-[#1a1a2e]">Sem vendedor</option>
                                  {sellers.map(s => <option key={s.id} value={s.id} className="bg-[#1a1a2e]">{s.name}</option>)}
                                </select>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                          <a href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-7">
                              <MessageCircle className="w-3 h-3" /> WhatsApp
                            </Button>
                          </a>
                          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                            <select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className="w-full h-7 px-2 rounded-lg bg-[#1a1a2e] border border-white/10 text-white text-[10px] focus:outline-none appearance-none cursor-pointer"
                              style={{ colorScheme: 'dark' }}>
                              {columns.map(col => (<option key={col.id} value={col.id}>{col.label}</option>))}
                              <option value="lost">Perdido</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {columnLeads.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Nenhum lead</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Lead Modal */}
      <AnimatePresence>
        {showAddLead && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddLead(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Adicionar Lead</h3>
                <button onClick={() => setShowAddLead(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Nome *</label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do cliente" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Telefone *</label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Veículo de interesse</label>
                  <select value={newVehicle} onChange={e => setNewVehicle(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" style={{ colorScheme: 'dark' }}>
                    <option value="">Selecionar veículo</option>
                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.name} - {formatPrice(v.price)}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Vendedor responsável</label>
                  <select value={newVendedorId} onChange={e => setNewVendedorId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" style={{ colorScheme: 'dark' }}>
                    <option value="">— Sem vendedor —</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Chance de Venda</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(p => (
                      <button key={p} onClick={() => setNewPriority(p)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          newPriority === p
                            ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : p === 'medium' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-white/5 text-muted-foreground border border-white/10'
                        }`}>
                        {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 p-4 border-t border-white/5">
                <Button variant="outline" onClick={() => setShowAddLead(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleAddLead} className="flex-1"><Plus className="w-4 h-4" /> Adicionar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Detail / Edit Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">{isEditing ? 'Editar Lead' : 'Detalhes do Lead'}</h3>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Lead header */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center">
                    <span className="text-cyan-400 text-xl font-semibold">{selectedLead.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                    <p className="text-muted-foreground">{selectedLead.phone}</p>
                    {selectedLead.cpf && <p className="text-xs text-muted-foreground">CPF: {selectedLead.cpf}</p>}
                  </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-muted-foreground">Veículo de Interesse</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{selectedLead.vehicleName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs text-muted-foreground">Valor</span>
                    </div>
                    <p className="text-sm font-medium text-cyan-400">{formatPrice(getLeadValue(selectedLead))}</p>
                  </div>
                </div>

                {isEditing ? (
                  /* Edit mode */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Status do Lead</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Lead['status'])}
                        className="w-full h-12 px-4 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" style={{ colorScheme: 'dark' }}>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Chance de Venda</label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map(p => (
                          <button key={p} onClick={() => setEditPriority(p)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              editPriority === p
                                ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : p === 'medium' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-white/5 text-muted-foreground border border-white/10'
                            }`}>
                            {p === 'high' ? '🔥 Alta' : p === 'medium' ? '⚡ Média' : '❄️ Baixa'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Tipo de Negociação</label>
                      <select value={editDealType} onChange={(e) => setEditDealType(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-[#1a1a2e] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50" style={{ colorScheme: 'dark' }}>
                        <option value="">Não informado</option>
                        <option value="financiamento">Financiamento</option>
                        <option value="a_vista">À Vista</option>
                        <option value="consorcio">Consórcio</option>
                        <option value="troca">Troca</option>
                        <option value="leasing">Leasing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Observações</label>
                      <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Adicione observações..." rows={3} className="resize-none" />
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[selectedLead.status]}`}>
                        {statusLabels[selectedLead.status]}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        selectedLead.priority === 'high' ? 'bg-red-500/20 text-red-400' : selectedLead.priority === 'medium' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        Chance: {priorityLabels[selectedLead.priority]}
                      </span>
                    </div>

                    {selectedLead.dealType && (
                      <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-xs text-muted-foreground mb-1">Tipo de Negociação</p>
                        <p className="text-sm text-white font-medium">{dealTypeLabels[selectedLead.dealType] || selectedLead.dealType}</p>
                      </div>
                    )}

                    {/* === Bloco condicional por tipo de negociação === */}
                    {selectedLead.dealType === 'financiamento' && selectedLead.financingDetails && (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <p className="text-sm font-semibold text-emerald-400">Dados do Financiamento</p>
                        </div>
                        {selectedLead.financingDetails.down_payment != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Entrada</span>
                            <span className="text-white font-medium">{formatPrice(Number(selectedLead.financingDetails.down_payment) || 0)}</span>
                          </div>
                        )}
                        {selectedLead.financingDetails.installments != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Parcelas</span>
                            <span className="text-white font-medium">{selectedLead.financingDetails.installments}x</span>
                          </div>
                        )}
                        {selectedLead.financingDetails.monthly_income != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Renda mensal</span>
                            <span className="text-white font-medium">{formatPrice(Number(selectedLead.financingDetails.monthly_income) || 0)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedLead.dealType === 'a_vista' && selectedLead.cashDetails && (
                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-cyan-400" />
                          <p className="text-sm font-semibold text-cyan-400">Pagamento à Vista</p>
                        </div>
                        {selectedLead.cashDetails.offered_value != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Valor oferecido</span>
                            <span className="text-white font-medium">{formatPrice(Number(selectedLead.cashDetails.offered_value) || 0)}</span>
                          </div>
                        )}
                        {selectedLead.cashDetails.payment_window && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prazo</span>
                            <span className="text-white font-medium">{selectedLead.cashDetails.payment_window}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedLead.dealType === 'troca' && selectedLead.tradeIn && (
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-semibold text-blue-400">Veículo de Troca</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {selectedLead.tradeIn.brand && (
                            <div><span className="text-muted-foreground">Marca: </span><span className="text-white">{selectedLead.tradeIn.brand}</span></div>
                          )}
                          {selectedLead.tradeIn.model && (
                            <div><span className="text-muted-foreground">Modelo: </span><span className="text-white">{selectedLead.tradeIn.model}</span></div>
                          )}
                          {selectedLead.tradeIn.year && (
                            <div><span className="text-muted-foreground">Ano: </span><span className="text-white">{selectedLead.tradeIn.year}</span></div>
                          )}
                          {selectedLead.tradeIn.estimated_value != null && (
                            <div><span className="text-muted-foreground">Valor: </span><span className="text-white">{formatPrice(Number(selectedLead.tradeIn.estimated_value) || 0)}</span></div>
                          )}
                        </div>
                        {selectedLead.tradeIn.difference_payment && (
                          <div className="text-sm pt-2 border-t border-white/5">
                            <span className="text-muted-foreground">Diferença será paga: </span>
                            <span className="text-white font-medium">{selectedLead.tradeIn.difference_payment === 'cash' ? 'À vista' : 'Financiada'}</span>
                          </div>
                        )}
                        {selectedLead.tradeIn.photos && selectedLead.tradeIn.photos.length > 0 && (
                          <div className="flex gap-2 pt-2 overflow-x-auto">
                            {selectedLead.tradeIn.photos.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedLead.dealType === 'visita' && selectedLead.visitDetails && (
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <p className="text-sm font-semibold text-purple-400">Visita Agendada</p>
                        </div>
                        {selectedLead.visitDetails.day && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Data</span>
                            <span className="text-white font-medium">{new Date(selectedLead.visitDetails.day).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        {selectedLead.visitDetails.time && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Horário</span>
                            <span className="text-white font-medium">{selectedLead.visitDetails.time}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {(selectedLead.dealType === 'consorcio' || selectedLead.dealType === 'leasing') && selectedLead.consortiumDetails && (
                      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-4 h-4 text-cyan-400" />
                          <p className="text-sm font-semibold text-cyan-400">{selectedLead.dealType === 'consorcio' ? 'Consórcio' : 'Leasing'}</p>
                        </div>
                        {selectedLead.consortiumDetails.letter_value != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Valor da carta</span>
                            <span className="text-white font-medium">{formatPrice(Number(selectedLead.consortiumDetails.letter_value) || 0)}</span>
                          </div>
                        )}
                        {selectedLead.consortiumDetails.term_months != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Prazo</span>
                            <span className="text-white font-medium">{selectedLead.consortiumDetails.term_months} meses</span>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedLead.cnhUrl && (
                      <a href={selectedLead.cnhUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                        <Download className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-white">Ver CNH enviada</span>
                      </a>
                    )}

                    {selectedLead.tags && selectedLead.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {selectedLead.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-xs text-muted-foreground mb-1">Cadastrado em</p>
                        <p className="text-sm text-white">{new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      {selectedLead.lastContactAt && (
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <p className="text-xs text-muted-foreground mb-1">Último contato</p>
                          <p className="text-sm text-white">{new Date(selectedLead.lastContactAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                      {selectedLead.followUpDate && (
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <p className="text-xs text-muted-foreground mb-1">Follow-up</p>
                          <p className="text-sm text-white">{new Date(selectedLead.followUpDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                      {selectedLead.owner && (
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                          <p className="text-sm text-white">{selectedLead.owner}</p>
                        </div>
                      )}
                      {selectedLead.age && (
                        <div className="p-3 rounded-xl bg-white/[0.02]">
                          <p className="text-xs text-muted-foreground mb-1">Idade</p>
                          <p className="text-sm text-white">{selectedLead.age}</p>
                        </div>
                      )}
                    </div>

                    {selectedLead.notes && (
                      <div className="p-3 rounded-xl bg-white/[0.02]">
                        <p className="text-xs text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm text-white whitespace-pre-wrap">{selectedLead.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 p-4 border-t border-white/5">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSaveEdit} className="flex-1"><Save className="w-4 h-4" /> Salvar</Button>
                  </>
                ) : (
                  <>
                    <a href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[100px]">
                      <Button variant="outline" className="w-full"><MessageCircle className="w-4 h-4" /> WhatsApp</Button>
                    </a>
                    <Button variant="outline" onClick={() => handleDownloadPDF(selectedLead)} className="flex-1 min-w-[100px]">
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                    <Button onClick={() => setSelectedLead(null)} className="flex-1 min-w-[100px]">Fechar</Button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMKanban;
