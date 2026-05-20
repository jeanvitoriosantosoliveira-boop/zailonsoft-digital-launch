export interface Lead {
  id: string;
  chatId?: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  vehicleId: string;
  vehicleName: string;
  status: 'new' | 'contacted' | 'negotiating' | 'proposal' | 'closed' | 'lost';
  priority: 'low' | 'medium' | 'high';
  value: number;
  notes: string;
  source: 'catalog' | 'whatsapp' | 'instagram' | 'referral';
  createdAt: string;
  updatedAt: string;
  followUpDate?: string;
  dealType?: string;
  appointmentAt?: string;
  owner?: string;
  tags?: string[];
  outcome?: string;
  lastContactAt?: string;
  followUpCount?: number;
  vendedorId?: string | null;
  vendedorName?: string | null;
  vendedorAvatar?: string | null;
  // Blocos condicionais por tipo de negociação
  financingDetails?: {
    down_payment?: number;
    installments?: number;
    monthly_income?: number;
  } | null;
  tradeIn?: {
    brand?: string;
    model?: string;
    year?: string;
    estimated_value?: number;
    difference_payment?: 'cash' | 'financing' | null;
    photos?: string[];
  } | null;
  visitDetails?: { day?: string; time?: string } | null;
  cashDetails?: { offered_value?: number; payment_window?: string } | null;
  consortiumDetails?: { letter_value?: number; term_months?: number } | null;
  cnhUrl?: string | null;
  age?: string | number | null;
}

export const leads: Lead[] = [];

export const statusLabels: Record<Lead['status'], string> = {
  new: 'Novo',
  contacted: 'Contatado',
  negotiating: 'Em Negociação',
  proposal: 'Proposta Enviada',
  closed: 'Fechado',
  lost: 'Perdido'
};

export const statusColors: Record<Lead['status'], string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  negotiating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  proposal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  closed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const priorityLabels: Record<Lead['priority'], string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
};
