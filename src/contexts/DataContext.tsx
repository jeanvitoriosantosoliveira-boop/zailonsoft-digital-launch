import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Vehicle } from '@/data/vehicles';
import { Lead } from '@/data/leads';
import { Store, Seller, Sale } from '@/data/store';
import { useAuth } from '@/contexts/AuthContext';
import * as apiService from '@/services/api';

interface DataContextType {
  vehicles: Vehicle[];
  leads: Lead[];
  store: Store;
  sellers: Seller[];
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'views' | 'likes'>, images?: File[]) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  assignVendedorToLead: (leadId: string, vendedorId: string | null) => Promise<void>;
  updateStore: (updates: Partial<Store>) => Promise<void>;
  addSeller: (seller: Omit<Seller, 'id' | 'salesCount'>, fotoFile?: File | null) => Promise<void>;
  updateSeller: (id: string, updates: Partial<Seller>, fotoFile?: File | null) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

const parsePriceString = (value: any) => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  let s = String(value || '');
  s = s.replace(/[^0-9.,-]/g, '');
  if (!s) return 0;
  if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const normalizeStateToStatus = (raw: any): Lead['status'] => {
  const s = String(raw || '').toLowerCase();
  if (!s) return 'new';
  if (s.includes('vend') || s.includes('sold') || s.includes('fechad') || s.includes('closed')) return 'closed';
  if (s.includes('perd') || s.includes('lost')) return 'lost';
  if (s.includes('proposta') || s.includes('proposal')) return 'proposal';
  if (s.includes('negoc') || s.includes('negoti')) return 'negotiating';
  if (s.includes('contat') || s.includes('contact') || s.includes('tentativa')) return 'contacted';
  if (s.includes('visita') || s.includes('visit')) return 'contacted';
  if (s.includes('novo') || s.includes('new') || s.includes('inicial')) return 'new';
  return 'new';
};

const mapCarToVehicle = (car: apiService.Car): Vehicle => ({
  id: car.id,
  name: car.nome || '',
  brand: car.marca || '',
  model: car.modelo || '',
  year: car.ano || new Date().getFullYear(),
  price: parsePriceString(car.preco),
  mileage: car.quilometragem || 0,
  fuel: car.combustivel || '',
  transmission: car.cambio || '',
  color: car.cor || '',
  description: car.descricao || '',
  features: [],
  images: car.imagens || [],
  videoUrl: undefined,
  stock: car.estoque || 1,
  status: (car.status as 'available' | 'reserved' | 'sold') || 'available',
  createdAt: car.created_at || new Date().toISOString(),
  views: 0,
  likes: 0
});

const safeParse = (val: any): any => {
  if (val == null) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string' && val.trim()) {
    try { return JSON.parse(val); } catch { return null; }
  }
  return null;
};

const mapClientToLead = (client: apiService.Client): Lead => {
  const bot = client.bot_data || {};

  let vehicleName = 'Veículo';
  let vehicleId = '';
  let vehiclePrice = 0;
  const interestedParsed = safeParse(client.interested_vehicles);
  try {
    if (Array.isArray(interestedParsed) && interestedParsed.length > 0) {
      const first = typeof interestedParsed[0] === 'string'
        ? safeParse(interestedParsed[0])
        : interestedParsed[0];
      vehicleName = first?.nome || first?.name || 'Veículo';
      vehicleId = first?.id || '';
      vehiclePrice = parsePriceString(first?.preco || first?.price || 0);
    } else {
      const fromBot = bot.interested_vehicles?.[0] || bot.interested_vehicle;
      if (fromBot) {
        vehicleName = fromBot?.nome || fromBot?.name || 'Veículo';
        vehicleId = fromBot?.id || '';
        vehiclePrice = parsePriceString(fromBot?.preco || fromBot?.price || 0);
      }
    }
  } catch {}

  // Parsed condicional blocks
  const financing = safeParse(client.financing_details) || bot?.financing_details || null;
  const tradeIn = safeParse(client.trade_in_car) || bot?.trade_in || null;
  const visit = client.visit_details || bot?.visit_details || null;
  const cashDetails = bot?.cash_details || null;
  const consortiumDetails = bot?.consortium_details || null;

  let value = vehiclePrice;
  if (financing?.down_payment) {
    value = parsePriceString(financing.down_payment) || vehiclePrice;
  }

  let followUpDate: string | undefined;
  if (visit?.day) followUpDate = visit.day;

  const priorityMap: Record<string, Lead['priority']> = {
    alta: 'high', high: 'high',
    media: 'medium', medium: 'medium', normal: 'medium',
    baixa: 'low', low: 'low',
  };

  return {
    id: client.id,
    chatId: client.chat_id,
    name: client.name || 'Sem nome',
    email: '',
    phone: client.phone || '',
    cpf: client.cpf || '',
    vehicleId,
    vehicleName,
    value,
    priority: priorityMap[(client.priority || 'normal').toLowerCase()] || 'medium',
    source: (client.channel as Lead['source']) || 'catalog',
    status: normalizeStateToStatus(client.state || bot.state),
    notes: client.notes || '',
    createdAt: client.created_at || new Date().toISOString(),
    updatedAt: client.updated_at || new Date().toISOString(),
    followUpDate,
    dealType: client.deal_type || '',
    appointmentAt: client.appointment_at || undefined,
    owner: client.owner || '',
    tags: client.tags || [],
    outcome: client.outcome || '',
    lastContactAt: client.last_contact_at || undefined,
    followUpCount: client.follow_up_count || 0,
    // Blocos condicionais
    financingDetails: financing,
    tradeIn: tradeIn,
    visitDetails: visit,
    cashDetails,
    consortiumDetails,
    cnhUrl: bot?.cnh_url || null,
    age: bot?.age || null,
  } as Lead;
};

const mapLojaToStore = (loja: apiService.LojaDetails): Store => {
  const loc = loja.localizacao || {};
  const social = loja.redes_sociais || {};
  const hours = loja.horario_funcionamento;

  return {
    id: loja.id,
    name: loja.nome || '',
    logo: loja.logo_url || '',
    description: loja.descricao || '',
    email: loja.email || '',
    phone: loja.telefone_principal || '',
    whatsapp: loja.whatsapp || '',
    address: loc.endereco || loc.address || '',
    city: loc.cidade || loc.city || '',
    state: loc.estado || loc.state || '',
    website: loja.site || '',
    workingHours: hours || '',
    socialMedia: {
      instagram: social.instagram || '',
      facebook: social.facebook || '',
    }
  };
};

const emptyStore: Store = {
  id: '', name: '', description: '', email: '', phone: '', whatsapp: '',
  address: '', city: '', state: '', website: '', workingHours: '',
  socialMedia: { instagram: '', facebook: '' }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { lojaId, user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [store, setStore] = useState<Store>(emptyStore);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (user && lojaId) {
        // Fetch cars for this store only
        const carsData = await apiService.fetchAvailableCars(lojaId);
        setVehicles(carsData.map(mapCarToVehicle));

        // Fetch clients
        try {
          const clientsData = await apiService.fetchClients();
          setLeads(clientsData.map(mapClientToLead));
        } catch (err) {
          console.warn('Não foi possível carregar clientes:', err);
          setLeads([]);
        }

        // Fetch store details
        try {
          const storeData = await apiService.fetchLojaDetails(lojaId);
          if (storeData) {
            setStore(mapLojaToStore(storeData));
            try {
              const vendedoresData = await apiService.fetchVendedores(storeData.id);
              setSellers((vendedoresData || []).map((v: any) => ({
                id: v.id,
                name: v.nome || '',
                email: v.email || '',
                phone: v.telefone || v.whatsapp || '',
                role: 'Consultor de Vendas',
                salesCount: 0,
              })));
            } catch {
              setSellers([]);
            }
          }
        } catch (err) {
          console.warn('Não foi possível carregar loja:', err);
        }
      } else if (!user) {
        // Public: no data loaded by default, pages fetch their own
        setVehicles([]);
        setLeads([]);
        setStore(emptyStore);
        setSellers([]);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err?.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user, lojaId]);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'views' | 'likes'>, images: File[] = []) => {
    try {
      if (!lojaId) throw new Error('Loja não identificada.');

      const result = await apiService.addVehicle({
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        year: String(vehicle.year),
        price: String(vehicle.price),
        description: vehicle.description,
        mileage: vehicle.mileage,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        color: vehicle.color,
        stock: vehicle.stock,
        status: vehicle.status,
      }, images, lojaId);

      const newVehicle = mapCarToVehicle(result);
      setVehicles(prev => [newVehicle, ...prev]);
    } catch (err) {
      console.error('Erro ao adicionar veículo:', err);
      throw err;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const dataToSupabase: Record<string, any> = {};
      if (updates.name !== undefined) dataToSupabase.nome = updates.name;
      if (updates.brand !== undefined) dataToSupabase.marca = updates.brand;
      if (updates.model !== undefined) dataToSupabase.modelo = updates.model;
      if (updates.price !== undefined) dataToSupabase.preco = Number(updates.price);
      if (updates.year !== undefined) dataToSupabase.ano = Number(updates.year);
      if (updates.description !== undefined) dataToSupabase.descricao = updates.description;
      if (updates.mileage !== undefined) dataToSupabase.quilometragem = updates.mileage;
      if (updates.fuel !== undefined) dataToSupabase.combustivel = updates.fuel;
      if (updates.transmission !== undefined) dataToSupabase.cambio = updates.transmission;
      if (updates.color !== undefined) dataToSupabase.cor = updates.color;
      if (updates.stock !== undefined) dataToSupabase.estoque = updates.stock;
      if (updates.status !== undefined) dataToSupabase.status = updates.status;

      await apiService.updateVehicle({ carId: id, updatedData: dataToSupabase });
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    } catch (err) {
      console.error('Erro ao atualizar veículo:', err);
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await apiService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Erro ao deletar veículo:', err);
      throw err;
    }
  };

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!lojaId) throw new Error('Loja não identificada.');
      await apiService.submitLead({
        loja_id: lojaId,
        name: lead.name,
        phone: lead.phone,
        cpf: lead.cpf || '',
        vehicle: lead.vehicleId
          ? { id: lead.vehicleId, name: lead.vehicleName, price: lead.value }
          : undefined,
        deal_type: lead.dealType || 'a_vista',
        source: 'admin',
        notes: lead.notes || '',
      });
      // Recarrega lista para refletir
      await refreshData();
    } catch (err) {
      console.error('Erro ao criar lead:', err);
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const lead = leads.find(l => l.id === id);
      const chatId = lead?.chatId || id;
      
      if (updates.status) {
        await apiService.updateClientStatus({ chatId, newState: updates.status });
      }

      // Build a single update payload for all other fields
      const detailUpdates: Record<string, any> = {};
      if (updates.notes !== undefined) detailUpdates.notes = updates.notes;
      if (updates.priority !== undefined) detailUpdates.priority = updates.priority;
      if (updates.dealType !== undefined) detailUpdates.deal_type = updates.dealType;
      if (updates.owner !== undefined) detailUpdates.owner = updates.owner;

      if (Object.keys(detailUpdates).length > 0) {
        await apiService.updateClientDetails({ chatId, updatedData: detailUpdates });
      }

      setLeads(prev => prev.map(l =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ));
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const lead = leads.find(l => l.id === id);
      await apiService.deleteClient(lead?.chatId || id);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
    }
  };

  const updateStore = async (updates: Partial<Store>) => {
    try {
      if (!store.id) return;
      const supabaseUpdates: Record<string, any> = {};
      if (updates.name !== undefined) supabaseUpdates.nome = updates.name;
      if (updates.phone !== undefined) supabaseUpdates.telefone_principal = updates.phone;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.whatsapp !== undefined) supabaseUpdates.whatsapp = updates.whatsapp;
      if (updates.description !== undefined) supabaseUpdates.descricao = updates.description;
      if (updates.website !== undefined) supabaseUpdates.site = updates.website;
      if (updates.address !== undefined || updates.city !== undefined || updates.state !== undefined) {
        supabaseUpdates.localizacao = {
          endereco: updates.address ?? store.address,
          cidade: updates.city ?? store.city,
          estado: updates.state ?? store.state,
        };
      }
      if (updates.socialMedia !== undefined) {
        supabaseUpdates.redes_sociais = updates.socialMedia;
      }
      if (updates.workingHours !== undefined) {
        supabaseUpdates.horario_funcionamento = updates.workingHours;
      }

      await apiService.updateStoreDetails({ lojaId: store.id, updates: supabaseUpdates });
      setStore(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Erro ao atualizar loja:', err);
    }
  };

  const addSeller = async (seller: Omit<Seller, 'id' | 'salesCount'>) => {
    try {
      if (!lojaId) throw new Error('Loja não identificada.');
      const result = await apiService.createVendedor({
        nome: seller.name,
        telefone: seller.phone,
        email: seller.email,
        whatsapp: seller.phone,
        loja_id: lojaId
      });
      setSellers(prev => [...prev, { ...seller, id: result.id, salesCount: 0 }]);
    } catch (err) {
      console.error('Erro ao adicionar vendedor:', err);
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      await apiService.deleteVendedor(id);
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar vendedor:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      vehicles, leads, store, sellers, isLoading, error,
      refreshData, addVehicle, updateVehicle, deleteVehicle,
      addLead, updateLead, deleteLead, updateStore, addSeller, deleteSeller
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
