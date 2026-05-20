export interface Store {
  id: string;
  name: string;
  logo?: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  website: string;
  workingHours: any;
  socialMedia: {
    instagram?: string;
    facebook?: string;
  };
}

export const defaultStore: Store = {
  id: "store-1",
  name: "ZAILON Demo",
  description: "Sua concessionária de veículos de luxo. Especialistas em supercarros e veículos exclusivos desde 2010.",
  email: "contato@zailon.com.br",
  phone: "(11) 3456-7890",
  whatsapp: "5546991163405",
  address: "Av. Europa, 1000 - Jardim Europa",
  city: "São Paulo",
  state: "SP",
  website: "",
  workingHours: "Seg-Sex: 9h-19h | Sáb: 9h-14h",
  socialMedia: {
    instagram: "@_jvs_solucoes_",
  }
};

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  avatar?: string;
  role: string;
  birthDate?: string;
  hireDate?: string;
  commissionPercent?: number;
  monthlyGoal?: number;
  active?: boolean;
  notes?: string;
  workingHours?: string;
  salesCount: number;
  salesThisMonth?: number;
  revenueThisMonth?: number;
  revenueTotal?: number;
}

export interface Sale {
  id: string;
  lojaId: string;
  vendedorId?: string;
  clientId?: string;
  carId?: string;
  vehicleName?: string;
  clientName?: string;
  valor: number;
  comissao?: number;
  dataVenda: string;
  observacoes?: string;
}

export const sellers: Seller[] = [];
