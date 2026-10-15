# Conteudo pendente

O site antigo (OpenCart) nao tinha produtos cadastrados nem texto institucional.
Tudo abaixo precisa vir da MAQCENTER. Cada arquivo JSON tambem lista as pendencias no campo `_todo`.

## Empresa (`company.json`)
- Razao social e CNPJ
- CEP
- Latitude e longitude (JSON-LD)
- Texto da pagina Sobre

## Servicos (`services.json`)
- Descricao de cada um dos 4 servicos
- Foto para locacao e para venda de maquinas

## Equipamentos (`equipment/*.json`)
- Descricao e especificacoes dos 6 equipamentos
- Fotos: cortadeira de piso, lavador de pressao e serra circular nao tem nenhuma
- Compactador, rompedor e vibrador usam recortes de 162px do banner antigo. Trocar por fotos reais e confirmar os modelos
- O banner antigo tambem mostrava furadeira de impacto, gerador e perfurador de solo para locacao. Confirmar se entram no catalogo

## Prova social (`testimonials.json`)
- Depoimentos reais de clientes (com autorizacao). A secao so aparece quando houver itens

## Legal (`legal/`)
- Politica de privacidade: rascunho factual, precisa de revisao juridica, CNPJ e prazo de retencao
- Termos e condicoes: sem texto

## Identidade
- Logo em SVG ou PNG em alta resolucao (o atual tem 441x83 px)
