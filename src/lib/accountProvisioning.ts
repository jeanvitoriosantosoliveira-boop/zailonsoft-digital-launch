import { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';

type ProvisionInput = {
  user: User;
  storeName?: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  businessEmail?: string;
  descricao?: string;
  site?: string;
  cidade?: string;
  estado?: string;
  instagram?: string;
  updateExistingStore?: boolean;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 52);

const activeLikeStatuses = new Set(['active', 'trialing', 'past_due', 'unpaid', 'incomplete']);

export const createAccountSlug = (name: string, userId: string) => {
  const base = slugify(name) || 'loja';
  return `${base}-${userId.slice(0, 8)}`;
};

export async function provisionUserAccount({
  user,
  storeName,
  ownerName,
  phone,
  whatsapp,
  businessEmail,
  descricao,
  site,
  cidade,
  estado,
  instagram,
  updateExistingStore = false,
}: ProvisionInput) {
  const metadata = user.user_metadata || {};
  const emailName = user.email?.split('@')[0] || 'usuario';
  const resolvedOwnerName = ownerName || metadata.owner_name || metadata.full_name || emailName;
  const resolvedStoreName = storeName || metadata.store_name || `Loja ${resolvedOwnerName}`;
  const resolvedPhone = phone || metadata.phone || null;
  const resolvedWhatsapp = whatsapp || resolvedPhone;
  const resolvedBusinessEmail = businessEmail || user.email || null;
  const profileUsername = `${slugify(resolvedOwnerName || resolvedStoreName || emailName) || 'user'}-${user.id.slice(0, 8)}`;

  const { data: profile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (profileLookupError) throw profileLookupError;

  if (profile) {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profileUsername,
        phone_number: resolvedPhone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) throw error;
  } else {
    try {
      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        username: profileUsername,
        phone_number: resolvedPhone,
        updated_at: new Date().toISOString(),
      });
      // Se houver conflito de chave única (inserção concorrente), ignoramos
      if (error && (error.code !== '23505' && !/duplicate key value/i.test(error.message || ''))) {
        throw error;
      }
    } catch (err: unknown) {
      // Alguns adaptadores podem lançar; aceitamos conflitos de chave única
      const okToIgnore = (err && typeof err === 'object' && ('code' in err) && (err as any).code === '23505') ||
        (err instanceof Error && /duplicate key value/i.test(err.message));
      if (!okToIgnore) throw err;
    }
  }

  const { data: subscriptions, error: subscriptionLookupError } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id);
  if (subscriptionLookupError) throw subscriptionLookupError;

  const existingSubscription = subscriptions?.[0];
  if (!existingSubscription) {
    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      status: 'pending_payment',
    });
    if (error) throw error;
  } else if (!activeLikeStatuses.has(existingSubscription.status || '')) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: existingSubscription.status || 'pending_payment' })
      .eq('id', existingSubscription.id);
    if (error) throw error;
  }

  const { data: stores, error: storeLookupError } = await supabase
    .from('lojas')
    .select('id, slug')
    .eq('user_id', user.id)
    .limit(1);
  if (storeLookupError) throw storeLookupError;

  const location = cidade || estado ? { cidade: cidade || null, estado: estado || null } : null;
  const social = instagram ? { instagram } : null;
  const storePayload = {
    nome: resolvedStoreName,
    proprietario: resolvedOwnerName,
    telefone_principal: resolvedPhone,
    whatsapp: resolvedWhatsapp,
    email: resolvedBusinessEmail,
    descricao: descricao || null,
    site: site || null,
    localizacao: location,
    redes_sociais: social,
    user_id: user.id,
  };

  if (stores?.[0]) {
    if (updateExistingStore) {
      const { error } = await supabase.from('lojas').update(storePayload).eq('id', stores[0].id);
      if (error) throw error;
    }
    return { lojaSlug: stores[0].slug };
  }

  const slug = createAccountSlug(resolvedStoreName, user.id);
  const { data: createdStore, error: storeInsertError } = await supabase
    .from('lojas')
    .insert({ ...storePayload, slug })
    .select('id, slug')
    .single();
  if (storeInsertError) throw storeInsertError;

  // ✅ Criar estágios de Kanban padrão para a nova loja
  const kanbanStages = [
    { stage_id: 'novo', name: 'Novo Lead', stage_order: 1, is_default: true },
    { stage_id: 'contato', name: 'Em Contato', stage_order: 2, is_default: false },
    { stage_id: 'visita', name: 'Visita Agendada', stage_order: 3, is_default: false },
    { stage_id: 'proposta', name: 'Proposta Enviada', stage_order: 4, is_default: false },
    { stage_id: 'negociacao', name: 'Em Negociação', stage_order: 5, is_default: false },
    { stage_id: 'fechado', name: 'Fechado / Vendido', stage_order: 6, is_default: false },
    { stage_id: 'perdido', name: 'Perdido', stage_order: 7, is_default: false },
  ];

  const stagesPayload = kanbanStages.map(stage => ({
    ...stage,
    loja_id: createdStore.id,
  }));

  const { error: stagesError } = await supabase.from('kanban_stages').insert(stagesPayload);
  if (stagesError && !(stagesError.code === '23505' || /duplicate key value/i.test(stagesError.message || ''))) {
    console.warn('⚠️ Aviso ao criar kanban_stages:', stagesError);
  }

  // ✅ Criar vendedor padrão para a nova loja
  const { error: vendedorError } = await supabase.from('vendedores').insert({
    loja_id: createdStore.id,
    nome: resolvedOwnerName || resolvedStoreName,
    telefone: resolvedPhone,
    whatsapp: resolvedWhatsapp,
    email: resolvedBusinessEmail,
  });
  if (vendedorError && !(vendedorError.code === '23505' || /duplicate key value/i.test(vendedorError.message || ''))) {
    console.warn('⚠️ Aviso ao criar vendedor:', vendedorError);
  }

  return { lojaSlug: createdStore.slug };
}