# Site MAQCENTER

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Conteudo em arquivos JSON, sem banco e sem CMS.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Conteudo

Tudo que aparece no site vem de `content/`:

| Arquivo | O que e |
|---|---|
| `company.json` | Nome, telefone, WhatsApp, e-mail, endereco, horario, redes sociais |
| `services.json` | Os 4 servicos (texto curto, foto, mensagem pre-preenchida do WhatsApp) |
| `equipment/*.json` | Um arquivo por equipamento de locacao: fotos, descricao, especificacoes |
| `brands.json` | Logos das marcas |
| `testimonials.json` | Depoimentos. A secao so aparece quando a lista tem itens |
| `legal/*.json` | Politica de privacidade e termos |
| `redirects.csv` | 301 das URLs do site antigo, gerado por `../audit_maqcenter.py` |
| `TODO.md` | O que falta a empresa enviar |

Campos `null` nao sao exibidos. O campo `_todo` de cada arquivo lista o que falta e nao e usado pelo site.

Novo equipamento: crie `content/equipment/<slug>.json` copiando um existente e registre o import em `src/lib/content.ts`.

## Imagens

`npm run images` recorta e converte para WebP as imagens extraidas do site antigo (`../assets`) e gera logo, favicon e imagem Open Graph. Fotos novas podem ir direto em `public/images/` (de preferencia WebP) e ser referenciadas no JSON com `src`, `alt`, `width` e `height`.

## Formulario de contato

`POST /api/contact` valida os campos, descarta envios com o honeypot preenchido e envia o e-mail pelo [Resend](https://resend.com). Copie `.env.example` para `.env.local` e preencha:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` remetente com dominio verificado no Resend, ex. `Site MAQCENTER <site@maqcentercascavel.com.br>`
- `CONTACT_TO_EMAIL` opcional, padrao e o e-mail de `company.json`

Sem essas variaveis o formulario responde com erro e orienta o cliente a usar o WhatsApp.

## Deploy

Na Vercel, aponte o Root Directory para `site/` e cadastre as variaveis acima.
