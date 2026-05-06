# Especificação inicial de exportação de associados

Issue de origem: [#29 Exportar em PDF e EXCEL](https://github.com/thalescampelodac/landing-page-aajf/issues/29)

## Objetivo

Definir como a administração poderá exportar os dados dos associados em:

- `Excel`
- `PDF`

O foco desta issue é transformar a listagem administrativa de associados em uma
saída utilizável fora do sistema, tanto para operação interna quanto para
compartilhamento institucional.

## Contexto atual

Hoje o módulo `/admin/associados` já possui:

- listagem administrativa dos associados
- filtros por busca, status e categoria
- paginação
- modal de leitura com os dados completos do associado

Ainda falta transformar esses dados em arquivos exportáveis para uso
administrativo real.

## Resultado esperado

Ao final da issue, a administração deve conseguir:

1. exportar a listagem de associados para `Excel`
2. exportar a listagem de associados para `PDF`
3. usar os filtros ativos como base da exportação
4. levar no arquivo os principais dados do associado
5. gerar uma saída legível também para dependentes

## Direção de produto

A exportação deve seguir dois objetivos diferentes:

### Excel

Usado para:

- conferência administrativa
- organização interna
- manipulação posterior dos dados
- importação em rotinas paralelas

### PDF

Usado para:

- compartilhamento institucional
- impressão
- relatório visual consolidado

## Regra principal de escopo

As exportações são funcionalidades próprias do módulo administrativo.

Isso significa que:

- não dependem do grid atual
- não dependem da paginação
- não são “exportação da tabela da tela”
- partem diretamente dos dados persistidos no banco

A tela administrativa pode futuramente oferecer parâmetros para exportação, mas
o arquivo gerado deve ser tratado como uma representação estruturada do domínio
de associados, e não como um espelho visual da listagem.

## Exportação em Excel

### Objetivo

Gerar uma planilha operacional, limpa e manipulável.

### Formato sugerido

- arquivo `.xlsx`
- uma única aba
- cada linha representa um registro exportado
- a hierarquia entre associado e dependentes deve aparecer na própria planilha

### Colunas mínimas recomendadas

- tipo de registro
- matrícula do associado
- matrícula do associado responsável
- matrícula do próprio registro
- nome completo
- email
- categoria
- status
- telefone
- CPF
- RG
- data de nascimento
- naturalidade
- CEP
- rua
- número
- complemento
- bairro
- cidade
- UF
- observação
- data de concessão do vínculo

### Estrutura hierárquica no Excel

O Excel deve usar uma única aba com hierarquia explícita:

- primeiro vem a linha do associado
- logo abaixo vêm as linhas de seus dependentes

Para deixar isso claro, a planilha deve ter pelo menos:

- coluna `tipo_registro`
  - `associado`
  - `dependente`
- coluna `matricula_associado_responsavel`
- coluna `matricula_registro`

Regra sugerida:

- quando a linha for do associado, `matricula_registro` e
  `matricula_associado_responsavel` podem coincidir
- quando a linha for de dependente, `matricula_registro` é a matrícula do
  dependente e `matricula_associado_responsavel` aponta para o associado

### Dependentes no Excel

Os dependentes não devem ir para aba separada.

Eles aparecem:

- na mesma aba
- em linhas próprias
- logo abaixo do associado responsável

Minha recomendação é que a exportação use também diferenciação visual:

- associado com linha principal
- dependente com estilo secundário ou recuo visual

Assim a planilha continua legível para operação humana sem perder a relação
entre os registros.

## Exportação em PDF

### Objetivo

Gerar um relatório visual e compartilhável da listagem atual.

### Formato sugerido

- arquivo `.pdf`
- cabeçalho institucional da associação
- título do relatório
- data e hora da exportação
- resumo dos filtros aplicados

### Conteúdo sugerido

O PDF deve seguir a mesma fonte de verdade do banco e a mesma lógica de
hierarquia do domínio.

Ele não precisa imitar o grid nem a planilha, mas deve refletir:

- associado como registro principal
- dependentes abaixo do associado responsável

Sugestão de saída resumida por associado:

- matrícula
- nome
- email
- categoria
- status
- telefone
- dependentes vinculados

### Dependentes no PDF

Os dependentes devem aparecer vinculados ao associado responsável.

Minha recomendação:

- em vez de exibir só a contagem, listar os dependentes abaixo do associado
- manter a apresentação mais compacta do que no Excel

Assim o PDF continua institucional, mas preserva a relação entre os registros.

## Nome dos arquivos

Sugestão:

### Excel

- `associados-YYYY-MM-DD.xlsx`

### PDF

- `associados-YYYY-MM-DD.pdf`

## Regras de negócio

- apenas usuários administrativos autorizados podem exportar
- a exportação usa somente os dados já autorizados para a administração
- a matrícula deve aparecer na exportação
- dependentes também devem levar matrícula própria
- a exportação não deve alterar dados do banco
- a exportação deve refletir o estado atual dos dados persistidos
- a exportação deve partir dos registros persistidos, não da renderização da
  tela

## Regras de UX

- os botões de exportação devem ficar no topo da área de listagem
- os rótulos devem ser simples:
  - `Exportar Excel`
  - `Exportar PDF`
- se a exportação futuramente permitir recorte por parâmetro, o estado vazio
  deve ser tratado com mensagem amigável

## Regras técnicas sugeridas

### Excel

- geração no servidor
- retorno como download direto
- arquivo montado a partir dos dados persistidos do banco
- hierarquia de associado e dependentes construída durante a exportação

### PDF

- geração no servidor
- layout simples e institucional
- evitar depender de impressão de HTML bruto
- composição baseada nos dados persistidos do banco

## Perguntas já respondidas nesta especificação

1. A exportação deve respeitar filtros ativos da tela?

Não como regra principal.

Ela é uma funcionalidade própria e desacoplada do grid.

2. O Excel deve conter todos os dados?

Sim, em uma única aba com hierarquia explícita entre associado e dependentes.

3. O PDF deve ser completo ou resumido?

Resumido.

4. Dependentes entram na exportação?

Sim, preservando o vínculo com o associado responsável.

## Critérios de aceite propostos

- a tela `/admin/associados` oferece botão de exportar `Excel`
- a tela `/admin/associados` oferece botão de exportar `PDF`
- o Excel exporta associados e dependentes em uma única aba
- o PDF exporta associados e dependentes em formato legível e institucional
- as matrículas aparecem na exportação
- a exportação não exige navegação extra fora do módulo

## Fora de escopo por enquanto

Esta issue ainda não precisa incluir:

- envio automático por email
- templates múltiplos de PDF
- personalização de colunas pelo usuário
- exportação de carteirinhas
- assinatura digital de relatório

## Próximo passo sugerido

Depois de alinhar esta especificação na issue, a implementação pode ser dividida
em duas etapas:

1. exportação `Excel`
2. exportação `PDF`

Assim a gente fecha primeiro a saída operacional mais útil e depois entra na
camada de apresentação institucional.
