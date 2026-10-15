# Prompt para o Claude Code — reconstrucao do site

Cole o bloco abaixo no Claude Code, com `audit_maqcenter.py` e `README_audit.md` na pasta do projeto.

---

Vou reconstruir do zero o site https://www.maqcentercascavel.com.br. Hoje e um OpenCart. A MAQCENTER e uma empresa de Cascavel, PR, que faz locacao de equipamentos, assistencia tecnica, venda de maquinas e acessorios, e perfuracao em concreto.

Na pasta tem `audit_maqcenter.py` (crawler de auditoria) e `README_audit.md` (documentacao dele). Leia os dois antes de comecar.

## Fase 1 — extrair o conteudo do site antigo

O script hoje so audita. Preciso que ele tambem extraia o conteudo para migracao. Edite o arquivo existente, mantendo o estilo (stdlib + requests + bs4, sem dependencia nova sem me perguntar antes):

- Ler `sitemap.xml` e `robots.txt` e somar as URLs encontradas a fila, pra pegar pagina orfa.
- Para cada pagina, salvar o conteudo principal (titulo, descricao, texto limpo, lista de imagens com URL e alt) em `content/<slug>.json`.
- Baixar todas as imagens de `/image/catalog/` e `/image/cache/catalog/` para `assets/`, preservando o nome. Pular duplicadas.
- Gerar `redirects.csv` com `url_antiga,slug_novo` para cada pagina, pra eu montar os 301 depois e nao perder o SEO.
- Gerar `inventory.md` listando categorias, subcategorias e equipamentos encontrados.

Rode e me mostre o resultado antes de passar para a fase 2.

## Fase 2 — construir o site novo

Stack: Next.js (App Router) + TypeScript + Tailwind CSS. Conteudo em arquivos locais (MDX ou JSON), sem CMS e sem banco de dados nesta primeira versao.

Sem carrinho, sem checkout, sem login. O OpenCart tinha isso mas nao e o negocio real da empresa: o fluxo e o cliente pedir orcamento. Todo CTA de produto ou equipamento vai para WhatsApp com mensagem pre-preenchida, ou para um formulario de contato.

Estrutura de paginas:

- `/` home: hero, os 4 servicos, equipamentos em destaque, marcas, prova social, contato
- `/locacoes` listagem dos equipamentos para locacao
- `/locacoes/[slug]` pagina de cada equipamento: fotos, descricao, especificacoes, CTA de orcamento
- `/assistencia-tecnica`
- `/venda-de-maquinas`
- `/perfuracao-em-concreto`
- `/sobre`
- `/contato` formulario + mapa + endereco
- paginas legais: politica de privacidade, termos

Dados fixos da empresa:

- Telefone e WhatsApp: (45) 99805-2928
- E-mail: pedidos@maqcenter.com.br
- Endereco: Rua Erechim 745, Centro, Cascavel, PR
- Instagram: @maqcentercascavel
- Facebook: Maqcenter Ferramentas Eletricas

Requisitos tecnicos:

- Mobile first. O publico e construcao civil, chega pelo celular.
- Imagens via `next/image`, convertidas para WebP, com `alt` preenchido em todas.
- SEO: metadata unica por pagina, Open Graph, `sitemap.xml` e `robots.txt` gerados, JSON-LD de `LocalBusiness` na home e de `Product` nas paginas de equipamento.
- Acessibilidade: contraste AA, navegacao por teclado, labels nos campos do formulario.
- Lighthouse acima de 90 em performance e SEO.
- Botao flutuante de WhatsApp.
- Formulario de contato funcionando via API route, com honeypot anti spam. Me pergunte qual servico de envio usar antes de implementar.

## Regras

- Me mostre a estrutura de pastas e o plano antes de escrever codigo.
- Commits pequenos e descritivos conforme avanca.
- Portugues no conteudo e nos textos de interface. Codigo, variaveis e comentarios em ingles.
- Sem emoji, sem texto decorativo.
- Se faltar informacao ou se algo que pedi conflitar entre si, me pergunte em vez de inventar. Nao invente texto institucional, preco, prazo ou depoimento de cliente: use o que foi extraido na fase 1 e marque o que faltar como TODO.
