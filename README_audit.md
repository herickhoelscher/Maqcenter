# audit_maqcenter.py

Script de auditoria e extracao de conteudo. Varre um site inteiro a partir da home e das URLs do `sitemap.xml`/`robots.txt`, coleta estrutura, SEO, assets e formularios, e extrai o conteudo de cada pagina para a migracao.

Alvo original: https://www.maqcentercascavel.com.br (OpenCart).

## Requisitos

- Python 3.9+
- `requests`
- `beautifulsoup4`

```bash
pip install requests beautifulsoup4
```

Nenhuma credencial, chave de API ou navegador headless. So HTTP GET publico.

## Uso

```bash
python audit_maqcenter.py
python audit_maqcenter.py --url https://outro-site.com.br --max-pages 500 --delay 0.2
python audit_maqcenter.py --probe-ids   # tambem acha categorias, paginas e produtos sem link
```

| Flag | Padrao | O que faz |
|---|---|---|
| `--url` | maqcentercascavel.com.br | Site a auditar |
| `--max-pages` | 300 | Limite de paginas HTML rastreadas |
| `--delay` | 0.4 | Pausa em segundos entre requisicoes |
| `--out` | `.` | Pasta de saida |
| `--skip-images` | desligado | Nao baixa as imagens |
| `--probe-ids` | desligado | Percorre os ids do OpenCart (categorias 1-200, paginas de informacao 1-50, produtos 1-`--probe-max`, fabricantes 1-50) para achar conteudo sem link. 4 requisicoes em paralelo |
| `--probe-max` | 400 | Maior id de produto testado |

## Saidas

- `audit_report.md` relatorio legivel: resumo, tecnologias, mapa de paginas, problemas de SEO, formularios, assets, dominios externos, erros
- `audit_data.json` dados brutos de tudo que foi coletado, pra cruzar com planilha ou script de migracao
- `content/<slug>.json` conteudo principal de cada pagina: titulo, meta description, canonical, breadcrumb, headings, texto limpo, imagens (URL e alt), slug novo. Paginas de produto, categoria, home e contato tem blocos extras (`product`, `category`, `home`, `contact`)
- `assets/` imagens de `/image/catalog/` e `/image/cache/catalog/`, preservando o caminho e o nome. Para cada imagem de cache tambem tenta baixar o original. Pula arquivo ja existente e conteudo duplicado (sha1)
- `redirects.csv` `url_antiga,slug_novo` para cada URL vista (paginas, aliases, canonicals e sitemap), base dos 301
- `inventory.md` categorias, subcategorias, equipamentos, marcas, banners e dados de contato encontrados

## Como funciona

Crawler BFS de um unico dominio.

1. Comeca pela URL inicial e soma a fila as URLs do `sitemap.xml` (seguindo sitemap index) e os caminhos/sitemaps do `robots.txt`.
2. Para cada URL: faz GET, ignora resposta nao HTML e status >= 400 (registra em `broken`).
3. Parseia com BeautifulSoup e extrai:
   - title, meta description, canonical
   - todos os H1 e os 10 primeiros H2
   - contagem de palavras do texto visivel
   - imagens sem atributo `alt`
   - formularios: action, method e nomes dos campos
   - tempo de resposta e peso do HTML
4. Casa o HTML cru contra `TECH_SIGNATURES` (regex) pra detectar plataforma e bibliotecas.
5. Coleta assets em conjuntos globais: `<link rel=stylesheet>`, `<script src>`, `<img src|data-src>`.
6. Extrai os `<a href>`: links internos entram na fila, externos viram contagem por dominio.
7. Extrai o conteudo principal (remove header, footer, menu, breadcrumb, coluna lateral e cookies) e grava em `content/`.
8. Para quando a fila esvazia ou atinge `--max-pages`. Depois deduplica paginas com mesmo conteudo (OpenCart serve a mesma categoria em varias URLs), gera `redirects.csv`, `inventory.md` e baixa as imagens.

### Conteudo escondido (`--probe-ids`)

O OpenCart responde por id mesmo quando a categoria, pagina ou produto foi tirado do menu. Cada id que devolve uma pagina valida (title sem "nao encontrado") entra na fila pela URL canonica e aparece em `inventory.md` como "Categorias fora do menu" e no `redirects.csv`. No site da Maqcenter isso revelou 12 categorias de venda (furadeiras, brocas, discos etc.) que nao tinham link.

### Mapeamento de URLs

`SLUG_MAP` define para onde cada URL antiga aponta no site novo. `SLUG_FIXES` limpa slugs herdados (ex. `serra-circular1` -> `serra-circular`). Subcategorias de locacao vao para `/locacoes/<slug>`. Edite esses dicts se a estrutura do site novo mudar.

### Filtros

- `SKIP_EXT` descarta links para binarios (jpg, pdf, zip, mp4 etc.)
- `NOISE_PATTERNS` descarta rotas transacionais do OpenCart (`route=account/`, `route=checkout/`, carrinho, wishlist, logout). Sem isso o crawler se perde em milhares de URLs sem conteudo.
- `norm()` remove fragmento (`#`) e barra final pra nao duplicar a mesma pagina
- Links relativos sao resolvidos contra o `<base href>` da pagina, quando existe
- `same_host()` ignora o prefixo `www.` ao comparar dominio

### Estruturas principais

```python
pages    # lista de dicts, um por pagina HTML
assets   # {"css": set, "js": set, "img": set}
external # Counter de dominio -> numero de links
broken   # lista de {"url", "erro"}
tech     # {nome_tecnologia: numero_de_paginas}
contents # lista de dicts de conteudo, um por pagina
orphans  # URLs do sitemap/robots sem link interno
```

`crawl()` devolve esse dict, `report()` transforma em markdown, `main()` grava os arquivos de auditoria e de migracao.

## Limitacoes conhecidas

- Nao executa JavaScript. Conteudo renderizado no cliente nao aparece.
- So valida (baixando) as imagens de catalogo. CSS e JS sao apenas listados.
- Nao mede Core Web Vitals. `tempo_s` e so o tempo da requisicao HTML.
- Sequencial, sem paralelismo. Site grande demora.
- Paginas orfas so sao encontradas se estiverem no `sitemap.xml`, no `robots.txt` ou forem achadas por `--probe-ids`.
- Widgets carregados por JavaScript (ex. Elfsight) nao sao lidos. O do site antigo apontava para um Instagram que nao existe mais.
- Seletores de extracao sao do tema OpenCart padrao (`#content`, `#product-product`, `#tab-description` etc.). Outro tema pode exigir ajuste.
