# Especificação inicial da gestão de associados

Issue de origem: [#6 Criar gestão de associados e status](https://github.com/thalescampelodac/landing-page-aajf/issues/6)

## Objetivo

Definir o comportamento esperado do módulo administrativo de gestão de associados, incluindo:

- consulta dos dados cadastrais do associado
- visualização rápida em lista administrativa
- alteração de status
- ações operacionais por registro
- exportação dos dados para Excel e PDF

Este documento serve como base de alinhamento antes da implementação completa do módulo.

## Direção de produto

A gestão de associados deve priorizar operação rápida pela administração.

Por isso, a interface principal deve usar:

- uma listagem em formato de grid/tabela
- uma coluna final de ações
- um modal para consulta detalhada do associado

O modal entra como apoio para leitura e inspeção, não como navegação principal do módulo.

## Estrutura recomendada da tela

### Bloco superior

O topo do módulo deve conter:

- título e descrição curta do módulo
- contador de associados, quando fizer sentido
- filtros principais
- botão de exportar Excel
- botão de exportar PDF

### Área principal

A área principal deve exibir uma tabela/grid com uma linha por associado.

Sugestão de colunas iniciais:

- nome completo
- email
- status
- tipo de vínculo
- data relevante
- ações

Observação:

`data relevante` ainda precisa ser definida com mais precisão. Pode ser:

- data de concessão do vínculo
- data de atualização
- data de ingresso

## Ações por associado

Cada linha deve ter um botão ou menu de ações ao final.

Escopo inicial desejado:

- ver detalhes
- alterar status
- editar dados do associado

Dependendo do andamento da implementação, podemos começar com:

- ver detalhes
- alterar status

e deixar edição mais completa para a etapa seguinte.

## Modal de detalhes

O modal deve ser usado para consultar rapidamente os dados do associado sem sair da listagem.

Conteúdo esperado:

- identificação principal
- informações de contato
- status atual
- dados cadastrais relevantes
- observações, se existirem

O modal pode evoluir depois para suportar edição, mas a primeira função esperada é consulta.

## Exportação

O módulo deve oferecer duas opções de exportação:

- exportar para Excel
- exportar para PDF

### Exportar Excel

Objetivo:

- permitir manipulação posterior dos dados
- facilitar conferência administrativa
- apoiar rotinas de secretaria e organização interna

Pontos a definir:

- quais colunas entram na exportação
- se a exportação respeita filtros ativos
- nome do arquivo

### Exportar PDF

Objetivo:

- gerar um relatório compartilhável
- facilitar impressão ou envio institucional

Pontos a definir:

- layout do PDF
- cabeçalho institucional
- se o PDF será resumido ou completo
- se a exportação respeita filtros ativos

## Filtros esperados

A listagem deve prever filtros administrativos.

Sugestão inicial:

- busca por nome
- busca por email
- filtro por status
- filtro por tipo de vínculo

Podemos expandir depois conforme a modelagem dos dados evoluir.

## Status

O módulo deve operar com os status já definidos para associados:

- `active`
- `inactive`
- `suspended`

As ações da administração devem refletir essas regras com clareza visual.

## Dependências de modelagem

Antes de finalizar a implementação da interface, ainda precisamos consolidar:

- quais dados compõem a ficha do associado
- quais campos ficam visíveis na tabela
- quais campos ficam apenas no modal
- quais campos podem ser editados pela administração

Isso conecta diretamente esta issue com a evolução da ficha cadastral.

## Perguntas em aberto

As perguntas abaixo ainda precisam de resposta antes do fechamento completo da issue:

1. Quais campos exatos da ficha do associado entram na tabela principal?
2. Quais campos exatos entram no modal?
3. Qual coluna será usada como `data relevante`?
4. A exportação deve respeitar os filtros ativos da tela?
5. O PDF será detalhado por associado ou um relatório resumido da listagem?
6. O botão de ações será uma lista suspensa ou botões visíveis na linha?

## Critérios de aceite propostos

- a administração consegue visualizar associados em uma listagem estruturada
- a administração consegue consultar os dados principais de um associado sem sair da tela
- a administração consegue alterar o status do associado
- a administração encontra ações operacionais no fim da linha
- a tela oferece exportação para Excel
- a tela oferece exportação para PDF
- o módulo permanece usável tanto em desktop quanto em telas menores

## Fora de escopo por enquanto

Este documento ainda não define:

- o layout final do PDF
- a biblioteca de exportação a ser usada
- a lista final e fechada dos campos cadastrais
- regras de exclusão de associado
- automações externas de envio ou assinatura

## Próximo passo sugerido

Antes da implementação completa da `#6`, vale fechar um pequeno refinamento deste documento respondendo as perguntas em aberto, principalmente:

- colunas da tabela
- conteúdo do modal
- comportamento exato das exportações
