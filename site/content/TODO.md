# Conteudo pendente

Veja `SOURCES.md` para a origem de tudo que ja esta no site.

O site antigo (OpenCart) nao tinha produtos cadastrados nem texto institucional.
Tudo abaixo precisa vir da MAQCENTER. Cada arquivo JSON tambem lista as pendencias no campo `_todo`.

## Empresa (`company.json`)
- Razao social e CNPJ
- CEP
- Latitude e longitude (JSON-LD)

## Servicos (`services.json`)
- Locacao: como funciona (periodo minimo, retirada/entrega, caucao)
- Assistencia: garantia, prazo medio, se e autorizada de alguma marca
- Perfuracao: diametros, profundidades e area de atendimento
- Foto para venda de maquinas

## Equipamentos (`equipment/*.json`)
- Descricao de compactador, cortadeira, lavador, rompedor e serra circular (betoneira e vibrador ja tem, vindas do Instagram)
- Especificacoes de todos os equipamentos
- Fotos: cortadeira de piso, lavador de pressao e serra circular nao tem nenhuma
- Compactador, rompedor e vibrador usam recortes de 152px do banner antigo. Trocar por fotos reais e confirmar os modelos
- O banner antigo tambem mostrava furadeira de impacto, gerador e perfurador de solo para locacao. Confirmar se entram no catalogo

## Prova social (`testimonials.json`)
- Depoimentos reais de clientes (com autorizacao). A secao so aparece quando houver itens
- Os reels de feedback de clientes no Instagram sao em audio; transcrever com autorizacao

## Legal (`legal/`)
- Politica de privacidade: rascunho factual, precisa de revisao juridica, CNPJ e prazo de retencao
- Termos e condicoes: sem texto

## Identidade
- Logo em SVG. O logo horizontal do header foi remontado a partir do logo quadrado (avatar.jpg), porque o PNG horizontal antigo tem so 303x39 px de arte
