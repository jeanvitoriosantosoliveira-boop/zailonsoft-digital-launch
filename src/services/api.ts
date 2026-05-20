import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// ======================= TIPOS =======================

export interface Car {
  id: string;
  nome: string;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  preco: number | string;
  descricao: string;
  imagens: string[];
  loja_id: string;
  status: string;
  estoque: number;
  quilometragem: number;
  combustivel: string | null;
  cambio: string | null;
  cor: string | null;
  created_at: string;
}

export interface LojaDetails {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  telefone_principal: string | null;
  email: string | null;
  site: string | null;
  whatsapp: string | null;
  horario_funcionamento: any;
  localizacao: any;
  redes_sociais: any;
  logo_url: string | null;
  proprietario: string | null;
  user_id: string | null;
}

export interface Client {
  id: string;
  chat_id: string;
  name: string;
  phone: string;
  cpf: string;
  job: string;
  state: string;
  documents: string[];
  report: string;
  payment_method: string;
  rg_number: string;
  incomeProof: string;
  rg_photo: string;
  visit_details: any;
  bot_data: any;
  deal_type: string;
  financing_details: string;
  interested_vehicles: string;
  trade_in_car: string;
  loja_id: string | null;
  created_at: string;
  updated_at: string;
  owner: string | null;
  priority: string;
  next_action_at: string | null;
  last_contact_at: string | null;
  appointment_at: string | null;
  tags: string[];
  notes: string | null;
  follow_up_count: number;
  outcome: string | null;
  channel: string | null;
}

export interface ClientPayload {
  name: string;
  phone: string;
  cpf: string;
  job: string;
  state: string;
  interested_vehicles: string;
  trade_in_car?: string;
  financing_details?: string;
  visit_details?: { day: string; time: string };
  deal_type: string;
  payment_method?: string;
  bot_data: any;
}

export interface Files {
  documents: File[];
  trade_in_photos: File[];
}

export interface SubmitLeadInput {
  loja_slug?: string;
  loja_id?: string;
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  age?: string | number;
  vehicle?: { id?: string; name?: string; price?: number };
  deal_type: string;
  cash_details?: { offered_value?: number; payment_window?: string };
  financing_details?: { down_payment?: number; installments?: number; monthly_income?: number };
  trade_in?: {
    brand?: string;
    model?: string;
    year?: string;
    estimated_value?: number;
    difference_payment?: 'cash' | 'financing' | null;
    photos?: string[];
  };
  visit_details?: { day?: string; time?: string };
  consortium_details?: { letter_value?: number; term_months?: number };
  cnh_url?: string;
  source?: string;
  notes?: string;
  lgpd_consent?: boolean;
}

export const submitLead = async (payload: SubmitLeadInput) => {
  try {
    let lojaId = payload.loja_id;
    if (!lojaId && payload.loja_slug) {
      const { data: loja, error: lojaError } = await supabase
        .from('lojas')
        .select('id')
        .eq('slug', payload.loja_slug)
        .maybeSingle();
      if (lojaError || !loja) {
        throw new Error('Loja não encontrada.');
      }
      lojaId = loja.id;
    }

    if (!lojaId) {
      throw new Error('É necessário informar loja_slug ou loja_id.');
    }

    const chat_id = `web_${uuidv4()}`;
    const interestedVehicles = payload.vehicle
      ? JSON.stringify([
          {
            id: payload.vehicle.id ?? '',
            nome: payload.vehicle.name ?? '',
            preco: payload.vehicle.price ?? 0,
          },
        ])
      : '';

    const tradeInCar = payload.trade_in
      ? JSON.stringify({
          brand: payload.trade_in.brand ?? '',
          model: payload.trade_in.model ?? '',
          year: payload.trade_in.year ?? '',
          estimated_value: payload.trade_in.estimated_value ?? 0,
          difference_payment: payload.trade_in.difference_payment ?? null,
          photos: payload.trade_in.photos ?? [],
        })
      : '';

    const financingDetails = payload.financing_details
      ? JSON.stringify(payload.financing_details)
      : '';

    const bot_data = {
      cash_details: payload.cash_details ?? null,
      consortium_details: payload.consortium_details ?? null,
      cnh_url: payload.cnh_url ?? null,
      lgpd_consent: !!payload.lgpd_consent,
      age: payload.age ?? null,
      submitted_at: new Date().toISOString(),
      source: payload.source ?? 'catalog',
      history: [
        {
          timestamp: new Date().toLocaleString('pt-BR'),
          updated_data: { state: 'Lead criado via formulário' },
        },
      ],
    };

    const insertPayload: Record<string, any> = {
      id: uuidv4(),
      chat_id,
      loja_id: lojaId,
      name: payload.name,
      phone: payload.phone,
      cpf: payload.cpf ?? '',
      job: '',
      state: 'novo',
      deal_type: payload.deal_type,
      payment_method: payload.cash_details ? 'a_vista' : '',
      interested_vehicles: interestedVehicles,
      trade_in_car: tradeInCar,
      financing_details: financingDetails,
      visit_details: payload.visit_details ?? null,
      bot_data,
      channel: payload.source ?? 'catalog',
      notes: payload.notes ?? '',
      priority: 'normal',
      documents: [],
      tags: [],
      follow_up_count: 0,
      unread_messages: 0,
    };

    const { data, error } = await supabase
      .from('clients')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao enviar lead diretamente:', error);
      throw new Error(error.message || 'Falha ao enviar lead.');
    }

    return data;
  } catch (err: any) {
    console.error('Erro ao enviar lead diretamente:', err);
    throw new Error(err?.message || 'Falha ao enviar lead.');
  }
};

// Upload de CNH para storage público (bucket cnh-uploads)
export const uploadCnhPublic = async (file: File, lojaSlug: string): Promise<string> => {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const path = `${lojaSlug}/${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from('cnh-uploads').upload(path, file, { upsert: false });
  if (error) {
    console.warn('Falha ao subir CNH (continua sem):', error.message);
    return '';
  }
  const { data } = supabase.storage.from('cnh-uploads').getPublicUrl(path);
  return data.publicUrl;
};


// ======================= CARROS =======================

export const fetchAvailableCars = async (lojaId: string): Promise<Car[]> => {
  if (!lojaId) {
    console.error('fetchAvailableCars: lojaId ausente');
    return [];
  }

  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('loja_id', lojaId);

  if (error) {
    console.error('Erro ao buscar veículos:', error);
    throw new Error('Falha ao buscar veículos disponíveis.');
  }
  return (data || []) as Car[];
};

export const fetchCarDetails = async (carId: string): Promise<Car> => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single();
  if (error) {
    console.error(`Erro ao buscar veículo ${carId}:`, error);
    throw new Error('Veículo não encontrado.');
  }
  return data as Car;
};

export const fetchCarsByLojaId = async (lojaId: string): Promise<Car[]> => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('loja_id', lojaId);
  if (error) {
    console.error(`Erro ao buscar veículos da loja ${lojaId}:`, error);
    throw new Error('Falha ao buscar catálogo da loja.');
  }
  return (data || []) as Car[];
};

export const fetchCarsByLojaSlug = async (slug: string): Promise<{ cars: Car[]; loja: LojaDetails }> => {
  const { data: loja, error: lojaError } = await supabase
    .from('lojas')
    .select('*')
    .eq('slug', slug)
    .single();

  if (lojaError || !loja) {
    throw new Error('Loja não encontrada.');
  }

  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('*')
    .eq('loja_id', loja.id);

  if (carsError) {
    throw new Error('Falha ao buscar veículos da loja.');
  }

  return { cars: (cars || []) as Car[], loja: loja as LojaDetails };
};

export const fetchAllCars = async (): Promise<Car[]> => {
  const { data, error } = await supabase.from('cars').select('*');
  if (error) {
    console.error('Erro ao buscar todos os veículos:', error);
    throw new Error('Falha ao buscar veículos.');
  }
  return (data || []) as Car[];
};

export const fetchLojaDetails = async (lojaId: string): Promise<LojaDetails> => {
  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .eq('id', lojaId)
    .single();

  if (error) {
    console.error('Erro ao buscar detalhes da loja:', error);
    throw new Error('Não foi possível carregar os dados da loja.');
  }
  if (!data) throw new Error('Loja não encontrada.');
  return data as LojaDetails;
};

export const fetchLojaBySlug = async (slug: string): Promise<LojaDetails> => {
  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    throw new Error('Loja não encontrada.');
  }
  return data as LojaDetails;
};

export const addVehicle = async (
  vehicleData: {
    name: string;
    brand: string;
    model: string;
    year: string;
    price: string;
    description: string;
    mileage?: number;
    fuel?: string;
    transmission?: string;
    color?: string;
    stock?: number;
    status?: string;
  },
  images: File[],
  lojaId: string
) => {
  try {
    if (!lojaId) throw new Error('Loja não identificada.');

    const carId = uuidv4();
    const imageUrls: string[] = [];

    for (const file of images) {
      const originalName = file.name || 'image.jpg';
      const ext = originalName.includes('.')
        ? originalName.split('.').pop()
        : 'jpg';

      const safeFileName = `${uuidv4()}.${ext}`;
      const filePath = `${lojaId}/${carId}/${safeFileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('car-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Falha no upload da imagem:', uploadError);
        throw new Error(`Falha no upload da imagem: ${uploadError.message}`);
      }

      const { data: publicURLData } = supabase
        .storage
        .from('car-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicURLData.publicUrl);
    }

    const insertPayload = {
      id: carId,
      loja_id: lojaId,
      nome: (vehicleData.name ?? '').trim(),
      marca: (vehicleData.brand ?? '').trim() || null,
      modelo: (vehicleData.model ?? '').trim() || null,
      descricao: (vehicleData.description ?? '').trim(),
      preco: Number(vehicleData.price) || 0,
      ano: vehicleData.year ? Number(vehicleData.year) : null,
      quilometragem: vehicleData.mileage || 0,
      combustivel: vehicleData.fuel || null,
      cambio: vehicleData.transmission || null,
      cor: vehicleData.color || null,
      estoque: vehicleData.stock || 1,
      status: vehicleData.status || 'available',
      imagens: imageUrls,
    };

    const { data, error: dbError } = await supabase
      .from('cars')
      .insert(insertPayload)
      .select()
      .single();

    if (dbError) throw new Error(`Falha ao cadastrar o veículo: ${dbError.message}`);
    return data;
  } catch (e: any) {
    console.error('Erro no fluxo de adição do veículo:', e);
    throw e;
  }
};

export const updateVehicle = async ({
  carId,
  updatedData,
  newImages = [],
}: {
  carId: string;
  updatedData: { [key: string]: any };
  newImages?: File[];
}) => {
  try {
    const imageUrls: string[] = [];

    if (newImages && newImages.length > 0) {
      for (const file of newImages) {
        const originalName = file.name || 'image.jpg';
        const ext = originalName.includes('.')
          ? originalName.split('.').pop()
          : 'jpg';

        const safeFileName = `${uuidv4()}.${ext}`;
        const filePath = `${carId}/${safeFileName}`;

        const { error: uploadError } = await supabase
          .storage
          .from('car-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Erro de upload no Supabase Storage:', uploadError);
          throw new Error('Falha ao fazer upload da nova imagem.');
        }

        const { data: publicURLData } = supabase
          .storage
          .from('car-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicURLData.publicUrl);
      }
    }

    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('imagens')
      .eq('id', carId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar imagens atuais do carro:', fetchError);
      throw new Error('Falha ao buscar imagens atuais.');
    }

    const finalImages = [...(currentCar?.imagens || []), ...imageUrls];
    const dataToUpdate = { ...updatedData, imagens: finalImages };

    const { data, error: dbError } = await supabase
      .from('cars')
      .update(dataToUpdate)
      .eq('id', carId)
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao atualizar carro no banco:', dbError);
      throw new Error(`Falha ao atualizar o veículo: ${dbError.message}`);
    }

    return data;
  } catch (e: any) {
    console.error('Erro no fluxo de atualização do veículo:', e);
    throw e;
  }
};

export const deleteVehicle = async (vehicleId: string): Promise<string> => {
  try {
    const { data: vehicle, error: fetchError } = await supabase
      .from('cars')
      .select('imagens')
      .eq('id', vehicleId)
      .single();
    if (fetchError) console.warn('Veículo não encontrado para listar imagens (continua exclusão).');

    const filePaths = (vehicle?.imagens || [])
      .map((url: string) => url.split('/car-images/')[1])
      .filter(Boolean);

    if (filePaths.length > 0) {
      await supabase.storage.from('car-images').remove(filePaths);
    }

    const { error: dbError } = await supabase.from('cars').delete().eq('id', vehicleId);
    if (dbError) throw new Error('Falha ao deletar o veículo do banco.');

    return vehicleId;
  } catch (e: any) {
    console.error('Erro no fluxo de exclusão do veículo:', e);
    throw e;
  }
};

export const deleteVehicleImage = async ({
  carId,
  imageUrl,
}: {
  carId: string;
  imageUrl: string;
}) => {
  try {
    const filePath = imageUrl.split('/car-images/')[1];
    if (filePath) await supabase.storage.from('car-images').remove([filePath]);

    const { data: currentCar, error: fetchError } = await supabase
      .from('cars')
      .select('imagens')
      .eq('id', carId)
      .single();
    if (fetchError) throw new Error('Falha ao buscar imagens atuais.');

    const updatedImages = (currentCar?.imagens || []).filter((u: string) => u !== imageUrl);
    const { error: dbError } = await supabase
      .from('cars')
      .update({ imagens: updatedImages })
      .eq('id', carId);

    if (dbError) throw new Error('Falha ao atualizar imagens no banco.');

    return updatedImages;
  } catch (e: any) {
    console.error('Erro ao deletar imagem do veículo:', e);
    throw e;
  }
};

// ======================= CLIENTES =======================

export const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) {
    console.error('Erro ao buscar clientes:', error);
    throw new Error('Falha ao buscar clientes.');
  }
  return (data || []) as Client[];
};

export const createClient = async ({
  clientPayload,
  files,
  lojaId,
}: {
  clientPayload: ClientPayload;
  files: Files;
  lojaId: string;
}) => {
  try {
    const chat_id = `web_${uuidv4()}`;
    const documentUrls: string[] = [];
    const tradeInUrls: string[] = [];

    if (files.documents?.length) {
      for (const file of files.documents) {
        const filePath = `${lojaId}/${chat_id}/documents/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('client-documents')
          .upload(filePath, file);
        if (uploadError) {
          throw new Error(`Falha no upload de documento: ${uploadError.message}`);
        }
        const { data: publicURLData } = supabase
          .storage
          .from('client-documents')
          .getPublicUrl(filePath);
        documentUrls.push(publicURLData.publicUrl);
      }
    }

    if (files.trade_in_photos?.length) {
      for (const file of files.trade_in_photos) {
        const filePath = `${lojaId}/${chat_id}/trade-in/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('trade-in-cars')
          .upload(filePath, file);
        if (uploadError) {
          throw new Error(`Falha no upload da foto da troca: ${uploadError.message}`);
        }
        const { data: publicURLData } = supabase
          .storage
          .from('trade-in-cars')
          .getPublicUrl(filePath);
        tradeInUrls.push(publicURLData.publicUrl);
      }
    }

    const finalClientPayload = {
      ...clientPayload,
      chat_id,
      loja_id: lojaId,
      documents: documentUrls,
      bot_data: {
        ...clientPayload.bot_data,
        trade_in_photos: tradeInUrls,
      },
    };

    const { data, error: dbError } = await supabase
      .from('clients')
      .insert(finalClientPayload)
      .select()
      .single();

    if (dbError) throw new Error(`Falha ao cadastrar cliente: ${dbError.message}`);
    return data;
  } catch (e: any) {
    console.error('Erro no fluxo de criação do cliente:', e);
    throw e;
  }
};

export const updateClientDetails = async ({
  chatId,
  updatedData,
}: {
  chatId: string;
  updatedData: any;
}) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updatedData)
    .eq('chat_id', chatId)
    .select()
    .single();
  if (error) throw new Error('Falha ao atualizar detalhes do cliente.');
  return data;
};

export const updateClientStatus = async ({
  chatId,
  newState,
}: {
  chatId: string;
  newState: string;
}) => {
  const { data: clientData, error: fetchError } = await supabase
    .from('clients')
    .select('bot_data')
    .eq('chat_id', chatId)
    .single();
  if (fetchError) throw new Error('Cliente não encontrado.');

  const newBotData = clientData?.bot_data || {};
  newBotData.state = newState;
  newBotData.history = [
    ...(newBotData.history || []),
    {
      timestamp: new Date().toLocaleString('pt-BR'),
      updated_data: { state: `Movido para ${newState} via CRM` },
    },
  ];

  const { data, error } = await supabase
    .from('clients')
    .update({ state: newState, bot_data: newBotData })
    .eq('chat_id', chatId)
    .select()
    .single();
  if (error) throw new Error('Falha ao atualizar status do cliente.');

  return data;
};

export const deleteClient = async (chatId: string) => {
  const { error: dbError } = await supabase
    .from('clients')
    .delete()
    .eq('chat_id', chatId);
  if (dbError) throw new Error('Falha ao deletar cliente do banco.');
  return chatId;
};

export const uploadClientFile = async ({
  chatId,
  file,
  bucketName,
  filePathPrefix,
}: {
  chatId: string;
  file: File;
  bucketName: string;
  filePathPrefix: string;
}) => {
  const filePath = `${chatId}/${filePathPrefix}/${uuidv4()}-${file.name}`;
  const { error: uploadError } = await supabase
    .storage
    .from(bucketName)
    .upload(filePath, file);
  if (uploadError) throw new Error(`Falha ao fazer upload para ${bucketName}.`);
  const { data: publicURLData } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);
  return publicURLData.publicUrl;
};

export const deleteClientFile = async ({
  fileUrl,
  bucketName,
}: {
  fileUrl: string;
  bucketName: string;
}) => {
  const filePath = fileUrl.split(`/${bucketName}/`)[1];
  if (!filePath) throw new Error('URL de arquivo inválida.');
  const { error: storageError } = await supabase
    .storage
    .from(bucketName)
    .remove([filePath]);
  if (storageError) throw new Error('Falha ao remover arquivo do Storage.');
  return fileUrl;
};

// ======================= LOJA =======================

export const fetchStoreDetails = async (): Promise<LojaDetails> => {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) throw new Error('Usuário não autenticado.');

  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    console.error('Supabase erro ao buscar loja:', error);
    throw new Error('Falha ao buscar dados da sua loja.');
  }
  return data as LojaDetails;
};

export const updateStoreDetails = async ({
  lojaId,
  updates,
  newLogoFile,
}: {
  lojaId: string;
  updates: any;
  newLogoFile?: File | null;
}) => {
  let finalUpdates = { ...updates };

  if (newLogoFile) {
    const { data: currentLoja, error: fetchError } = await supabase
      .from('lojas')
      .select('logo_url')
      .eq('id', lojaId)
      .single();
    if (fetchError) {
      throw new Error('Não foi possível encontrar a loja para atualizar a logo.');
    }

    if (currentLoja?.logo_url) {
      const oldFilePath = currentLoja.logo_url.split('/logo-loja/')[1];
      if (oldFilePath) {
        const { error: removeError } = await supabase
          .storage
          .from('logo-loja')
          .remove([oldFilePath]);
        if (removeError) {
          console.warn('Falha ao remover logo antiga (prossegue).', removeError);
        }
      }
    }

    const fileExt = newLogoFile.name.split('.').pop();
    const filePath = `${lojaId}/${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await supabase
      .storage
      .from('logo-loja')
      .upload(filePath, newLogoFile);
    if (uploadError) {
      throw new Error(`Falha ao fazer upload da nova logo: ${uploadError.message}`);
    }

    const { data: publicURLData } = supabase
      .storage
      .from('logo-loja')
      .getPublicUrl(filePath);
    finalUpdates.logo_url = publicURLData.publicUrl;
  }

  const { data, error } = await supabase
    .from('lojas')
    .update(finalUpdates)
    .eq('id', lojaId)
    .select()
    .single();
  if (error) {
    throw new Error(`Falha ao atualizar os dados da loja: ${error.message}`);
  }
  return data;
};

// ======================= VENDEDORES =======================

export const fetchVendedores = async (lojaId: string) => {
  if (!lojaId) return [];
  const { data, error } = await supabase
    .from('vendedores')
    .select('*')
    .eq('loja_id', lojaId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar vendedores:', error);
    throw new Error('Falha ao buscar vendedores.');
  }
  return data;
};

export const uploadVendedorFoto = async (file: File, lojaId: string, vendedorId: string): Promise<string> => {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const path = `${lojaId}/${vendedorId}-${uuidv4()}.${ext}`;
  const { error } = await supabase.storage.from('vendedor-fotos').upload(path, file, { upsert: true });
  if (error) {
    console.error('Falha ao subir foto do vendedor:', error);
    throw new Error('Falha ao subir foto do vendedor.');
  }
  const { data } = supabase.storage.from('vendedor-fotos').getPublicUrl(path);
  return data.publicUrl;
};

export const createVendedor = async (vendedorData: any, fotoFile?: File | null) => {
  const id = vendedorData.id || uuidv4();
  let foto_url: string | null = null;
  if (fotoFile && vendedorData.loja_id) {
    foto_url = await uploadVendedorFoto(fotoFile, vendedorData.loja_id, id);
  }
  const payload = { ...vendedorData, id, ...(foto_url ? { foto_url } : {}) };
  const { data, error } = await supabase
    .from('vendedores')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`Falha ao adicionar vendedor: ${error.message}`);
  return data;
};

export const updateVendedor = async (vendedorId: string, updates: any, fotoFile?: File | null, lojaId?: string) => {
  const final: any = { ...updates };
  if (fotoFile) {
    final.foto_url = await uploadVendedorFoto(fotoFile, lojaId || updates.loja_id, vendedorId);
  }
  const { data, error } = await supabase
    .from('vendedores')
    .update(final)
    .eq('id', vendedorId)
    .select()
    .single();
  if (error) throw new Error(`Falha ao atualizar vendedor: ${error.message}`);
  return data;
};

export const deleteVendedor = async (vendedorId: string) => {
  const { error } = await supabase
    .from('vendedores')
    .delete()
    .eq('id', vendedorId);
  if (error) throw new Error('Falha ao deletar vendedor.');
  return vendedorId;
};

export const assignVendedorToClient = async (clientId: string, vendedorId: string | null) => {
  const { data, error } = await supabase
    .from('clients')
    .update({ vendedor_id: vendedorId })
    .eq('id', clientId)
    .select()
    .single();
  if (error) throw new Error('Falha ao atribuir vendedor ao lead.');
  return data;
};

// ======================= VENDAS =======================

export const fetchVendas = async (lojaId: string) => {
  if (!lojaId) return [];
  const { data, error } = await supabase
    .from('vendas')
    .select('*')
    .eq('loja_id', lojaId)
    .order('data_venda', { ascending: false });
  if (error) {
    console.error('Erro ao buscar vendas:', error);
    throw new Error('Falha ao buscar vendas.');
  }
  return data;
};

export const createVenda = async (venda: {
  loja_id: string;
  vendedor_id?: string | null;
  client_id?: string | null;
  car_id?: string | null;
  vehicle_name?: string;
  client_name?: string;
  valor: number;
  comissao?: number;
  data_venda?: string;
  observacoes?: string;
}) => {
  const payload = {
    id: uuidv4(),
    ...venda,
    data_venda: venda.data_venda || new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('vendas')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`Falha ao registrar venda: ${error.message}`);
  return data;
};

export const deleteVenda = async (vendaId: string) => {
  const { error } = await supabase.from('vendas').delete().eq('id', vendaId);
  if (error) throw new Error('Falha ao deletar venda.');
  return vendaId;
};

