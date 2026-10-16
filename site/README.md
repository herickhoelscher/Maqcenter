# Site MAQCENTER

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma 7 (SQLite/Turso).
Site institucional, catálogo de locação, loja com pagamento pelo Mercado Pago e painel administrativo.

## Rodar no computador

```bash
npm install                 # também gera o Prisma Client
cp .env.example .env        # preencha SESSION_SECRET e ADMIN_*
npx prisma migrate dev      # cria o banco local (prisma/dev.db)
npm run db:seed             # importa o conteúdo de content/*.json e cria o primeiro admin
npm run dev                 # http://localhost:3000
```

## Painel administrativo

Endereço: `/admin`. O primeiro usuário vem de `ADMIN_EMAIL` e `ADMIN_PASSWORD` no seed. Os demais são criados em **Usuários**.

| Seção | O que faz |
|---|---|
| Pedidos | Compras do site. Marcar como entregue, marcar como pago (recebido fora do site) ou cancelar. Cancelar um pedido pago devolve o estoque |
| Produtos à venda | Com preço e estoque o produto é vendido online. Sem preço aparece "sob consulta" com orçamento |
| Equipamentos | Catálogo de locação (orçamento). Renomear o endereço mantém o antigo redirecionando |
| Serviços | Textos e foto das 4 páginas de serviço |
| Dados da empresa | Telefones, e-mails, endereço, horário, redes sociais e texto "Sobre" |
| Marcas, Depoimentos | Logos e depoimentos (só aparecem quando houver algum publicado) |
| Mensagens | Formulário de contato e lista de orçamento. Ficam salvas mesmo sem e-mail configurado |
| Clientes | Contas criadas na loja |

Toda alteração aparece no site na hora (cache por tag `content`).

## Loja e Mercado Pago

1. Crie a aplicação em https://www.mercadopago.com.br/developers/panel (produto **Checkout Pro**).
2. Coloque o **Access Token** em `MERCADOPAGO_ACCESS_TOKEN`. Para testar sem cobrar, use o token de teste (`TEST-...`) e os cartões de teste do Mercado Pago.
3. Em **Webhooks**, cadastre `https://<dominio>/api/mercadopago/webhook` com o evento **Pagamentos** e copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`.

Fluxo: carrinho → login/cadastro do cliente → checkout (retirada na loja ou entrega a combinar) → página do Mercado Pago (PIX, cartão, boleto) → volta para `/conta/pedidos/<id>`. O pedido é confirmado pelo webhook e também ao voltar do pagamento; o valor é sempre conferido na API do Mercado Pago. O estoque é baixado uma única vez, quando o pagamento é aprovado.

Sem `MERCADOPAGO_ACCESS_TOKEN` a loja mostra os produtos mas avisa que o pagamento online não está ativo.

## Conteúdo

O conteúdo vive no banco e é editado no painel. Os arquivos de `content/` são a carga inicial (seed) e a documentação de origem:

- `SOURCES.md`: de onde veio cada informação (site antigo, Instagram) e a validação
- `TODO.md`: o que ainda falta a empresa enviar
- `legal/*.json`: textos legais (editados no código)
- `redirects.csv`: 301 das URLs do site antigo (`next.config.ts`)

## Imagens

- Enviadas pelo painel: convertidas para WebP. Em produção vão para o **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`); no computador ficam em `uploads/` (servidas por `/api/media`).
- Do site antigo e do Instagram: `npm run images` recorta e converte para `public/images/`.

## Formulário de contato (Resend)

`RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (remetente com domínio verificado) e opcionalmente `CONTACT_TO_EMAIL`. Sem eles a mensagem fica só no painel.

## Publicar (Vercel + Turso)

1. Em https://vercel.com, entre com o GitHub e importe o repositório `Maqcenter`. **Root Directory: `site`**.
2. No projeto, aba **Storage**: crie um banco **Turso** e um **Blob** e conecte ao projeto. Isso cria `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` e `BLOB_READ_WRITE_TOKEN` (o código aceita esses nomes).
3. Em **Settings > Environment Variables**, adicione `SESSION_SECRET` (32+ caracteres aleatórios), `NEXT_PUBLIC_SITE_URL` (o endereço do site) e o primeiro login do painel: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Mercado Pago e Resend quando tiver.
4. Faça **Redeploy**. O build (`npm run build`) prepara o banco sozinho: aplica as migrações que faltam, carrega o conteúdo inicial se o banco estiver vazio (nunca sobrescreve o que foi editado no painel) e cria o admin de `ADMIN_EMAIL` se ele ainda não existir.

Logins da equipe: pelo painel (**Usuários**) ou pelo terminal:
```bash
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run user:create -- "Nome" email@exemplo.com
```
Sem senha no comando, uma senha inicial forte é gerada e mostrada uma vez.
