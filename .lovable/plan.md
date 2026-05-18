
# Plano de Implementação — JVS Soluções (Plataforma SaaS)

## Visão geral
Transformar o projeto atual numa plataforma SaaS pronta para vender: usuário cria conta + loja na própria tela de login, paga mensalidade de R$ 99 via Stripe (price `price_1Srdi4Rbk31AIXyOR3IBtz0X`) e só então libera o acesso à ferramenta. Inadimplência bloqueia uso com tela dedicada. Home pública reformulada para conversão.

---

## 1. Preparação do repositório

1. Fazer `pull` da branch `main` para garantir base atualizada.
2. Verificar `package.json` (Stripe, Supabase já instalados via `@supabase/supabase-js`).
3. Confirmar variáveis `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` no `.env.local` (já existem, apontando para o projeto ZailonSoft).

## 2. Conexão ao banco Supabase do ZailonSoft

O projeto **já está conectado** ao Supabase do ZailonSoft (ver `SUPABASE_INTEGRATION.md` e `src/services/supabaseClient.ts`). Vou:

- Reaproveitar `supabase` client existente.
- Mapear o schema enviado (`lojas`, `profiles`, `subscriptions`, `cars`, `clients`, `vendedores`, `kanban_stages`).
- A tabela `subscriptions` já tem `stripe_customer_id` e `stripe_subscription_id` — perfeito para integração Stripe.

## 3. Cadastro completo de Usuário + Loja

Reformular `LoginPage.tsx` com 2 abas: **Entrar** e **Criar conta + loja**.

Campos do signup (mapeados ao schema real):

**Usuário / auth:**
- email, senha, confirmar senha
- nome do proprietário (`lojas.proprietario` + `profiles.username`)
- telefone pessoal (`profiles.phone_number`)

**Loja (`lojas`):**
- nome da loja *(obrigatório)*
- slug (gerado automático a partir do nome, editável)
- descrição curta
- email comercial
- telefone principal
- whatsapp
- site (opcional)
- endereço/localização (cidade, estado, CEP — salvo em `localizacao` jsonb)
- horário de funcionamento (jsonb simples seg-sab)
- redes sociais (instagram, facebook — jsonb)
- upload de logo (opcional, Supabase Storage)

Fluxo:
1. Edge Function `signup-store` (já existe!) — vou estendê-la para receber todos os novos campos e gravar `profiles` + `lojas` + `subscriptions(status='pending_payment')`.
2. Após signup, redireciona para `/assinar` (já existe) que agora mostra botão **"Pagar R$ 99/mês com Stripe"**.

## 4. Integração Stripe (R$ 99/mês)

**Pré-requisito**: o usuário precisa adicionar o secret `STRIPE_SECRET_KEY` (vou pedir via tool de secrets na hora certa).

Edge Functions novas em `supabase/functions/`:

- `create-checkout/index.ts` — cria Checkout Session em modo `subscription` com `price_1Srdi4Rbk31AIXyOR3IBtz0X`, retorna URL. Usa `stripe_customer_id` salvo em `subscriptions` (cria se não existir).
- `stripe-webhook/index.ts` — escuta `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Atualiza `subscriptions.status` para `active` / `past_due` / `canceled` e grava `next_billing_date`, `stripe_subscription_id`.
- `customer-portal/index.ts` — gera link do Stripe Billing Portal para o usuário gerenciar/cancelar.

Config `supabase/config.toml`: declarar `stripe-webhook` com `verify_jwt = false`.

Secrets necessários: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

## 5. Gate de acesso por mensalidade

O `AuthContext` já carrega `subscription.status`. Vou:

- Tratar status `active` → libera tudo.
- `pending_payment` / `incomplete` → manda para `/assinar` com botão de pagamento.
- `past_due` / `unpaid` → **nova tela `/inadimplente`** com mensagem clara ("Mensalidade em atraso — regularize para voltar a usar") + botão Stripe portal + WhatsApp suporte.
- `canceled` → tela de reativação.

Guard em `App.tsx` (`SistemaRedirect` + rotas `/:lojaSlug/*`): se logado e não-ativo, redireciona para a tela apropriada.

## 6. Página `/assinar` atualizada

Mostrar:
- Resumo do plano (recursos)
- Preço R$ 99/mês destacado
- Botão **"Assinar agora"** → chama `create-checkout`, redireciona para Stripe Checkout
- Após retorno (`?success=true`), faz `refreshSubscription()` em loop curto até detectar `active`.

## 7. Home pública (HomePage) bonita

Refazer `HomePage.tsx` no padrão premium dark + laranja (já estabelecido na landing JVS) mas focado em vender a **ferramenta JVS para lojas de veículos**:

Seções:
1. **Hero** — "A plataforma que vende carros por você" + CTA "Começar agora" → `/login?signup=1`
2. **Demo** — mockup do dashboard/CRM/catálogo
3. **Features** — CRM Kanban, catálogo público, bot de WhatsApp, gestão de leads, vendedores, multi-loja
4. **Plano único R$ 99/mês** — card com tudo incluso
5. **Prova social** — depoimentos / números
6. **FAQ**
7. **CTA final** + WhatsApp float

## 8. Tela de "Inadimplente"

Nova rota `/inadimplente`:
- Ícone alerta vermelho
- "Sua mensalidade está em atraso"
- Mostra valor (R$ 99) e data do último pagamento
- Botão "Regularizar pagamento" → Stripe Customer Portal
- Botão WhatsApp suporte (46) 99116-3405

## 9. Validação

- `tsc --noEmit` (automático)
- Testar fluxo: criar conta → ver `/assinar` → simular webhook (Stripe CLI ou inserir manualmente status `active` no DB) → acessar `/{lojaSlug}/dashboard`.
- Testar inadimplência: alterar status para `past_due` no DB → confirmar redirect.

---

## Detalhes técnicos

**Arquivos novos:**
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/customer-portal/index.ts`
- `src/pages/PastDuePage.tsx`
- `src/components/SignupStoreForm.tsx` (form completo dentro do LoginPage)

**Arquivos editados:**
- `supabase/functions/signup-store/index.ts` — aceitar todos os campos de loja/profile
- `src/pages/LoginPage.tsx` — abas login/signup com form completo
- `src/pages/SubscribePage.tsx` — substituir botão "Falar com equipe" por **checkout Stripe**
- `src/pages/HomePage.tsx` — redesign completo focado em conversão SaaS
- `src/contexts/AuthContext.tsx` — adicionar lógica `past_due` → redirect `/inadimplente`
- `src/App.tsx` — nova rota `/inadimplente`
- `supabase/config.toml` — declarar nova função webhook com `verify_jwt=false`

**Secrets a solicitar:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (após criar webhook no Stripe Dashboard apontando para a URL da edge function)

**Após implementar**, instruo você a:
1. Criar o webhook no Stripe Dashboard com URL `https://<project>.supabase.co/functions/v1/stripe-webhook` selecionando os eventos listados.
2. Colar o signing secret no `STRIPE_WEBHOOK_SECRET`.

---

Posso seguir e implementar tudo isso?
