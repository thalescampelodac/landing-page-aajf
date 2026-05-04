# Especificação inicial da área do associado

Issue de origem: [#7 Criar área do associado](https://github.com/thalescampelodac/landing-page-aajf/issues/7)

## Objetivo

Definir a estrutura funcional da área do associado antes da implementação completa da tela e da ficha cadastral.

Esta área deve servir como ponto de acesso do associado autenticado para:

- consultar seus dados
- acompanhar seu status de vínculo
- atualizar informações permitidas
- gerenciar sua senha

## Papel da área do associado

A área do associado não deve funcionar como painel administrativo.

Ela deve ser uma área pessoal, centrada no próprio usuário, com foco em:

- consulta do cadastro
- atualização de dados permitidos
- visibilidade sobre o vínculo com a associação
- autonomia básica de conta

## Estrutura recomendada da tela

### Bloco de boas-vindas

O topo da área deve mostrar:

- saudação principal
- nome do associado
- email conectado
- status atual do vínculo

Objetivo:

- confirmar que a pessoa entrou na conta correta
- dar contexto imediato sobre o estado do acesso

## Blocos principais sugeridos

### 1. Dados do associado

Este bloco deve reunir as informações principais da ficha cadastral.

Sugestão inicial de campos:

- foto (upload de imagem. aplicar todas as regras para que uma foto posso ser usada)
- nome completo
- email
- categoria: 
    - Kleine Kinder
    - Gosse Kinder
    - Heimweh
- CPF
- RG
- telefone (com DDD)
- data de nascimento
- naturalidade (lista de seleção para naturalidades. exemplo: brasileira, alemã, portuguesa, e assim por diante)
- endereço (usar consulta por CEP para preenchimento automatico dos campos - CEP tbm é uma inforção que será guardada no banco de dados)
- dependente (aqui será uma listagem de dependentes. deve sr um espação para incluir o primeiro dependente e adivionar tantos outros quanto necessario, entao tem que deixar aquela div com "+", sabe qual é?)
    - nome completo
    - categoria
    - CPF
    - RG
    - data de nascimento
    - naturalidade
- observação


### 2. Situação do vínculo

Este bloco deve exibir informações do relacionamento do usuário com a associação.

Deixar em algum lugar esse texto para ser lido:

"Por meio deste instrumento, declaro me responsabilizar pela guarda e conservação do TRAJE FOLCLÓRICO do GRUPO DE DANÇAS FOLCLÓRICAS GERMÂNICAS SCHMETTERLING de propriedade da ASSOCIAÇÃO ALEMÃ DE JUIZ DE FORA/MG, inscrita no CNPJ 73.627.960/0001-50 pelo tempo que estiver associado a entidade e integrar o referido grupo. 

Me comprometo a devolver o mencionado bem em perfeito estado de conservação, como atualmente se encontra.

Em caso de extravio ou danos que provoquem a perda total ou parcial do bem, fico obrigado a ressarcir a Associação Alemã de Juiz de Fora/MG dos prejuízos ocasionados."

E um check para ser marcado com o texto "Declaro ter lido e estar de pleno acordo com o termo acima descrito."

eu não acredito que seja necessario exibir situação, uma vez que a unica situação atual possivel para que um associado veja ao entrar seja o de ativo. pela logica, se ele entrou entao ele é ativo.

### 3. Segurança da conta

Este bloco deve concentrar ações ligadas ao acesso.

Escopo inicial:

- alteração de senha
- informação sobre método de acesso atual
    - conta com login Google
    - conta com email e senha
    - conta com ambos os meios habilitados

### 4. Informações complementares

Este bloco pode ser usado depois para exibir:

- observações da associação
- dados adicionais do cadastro
- conteúdos exclusivos do associado

Por enquanto, nascercomo espaço reservado.

## Edição de dados

somente os seguintes dados poderão ser editados pelo usuario:

- foto
- nome completo
- categoria: 
    - Kleine Kinder
    - Gosse Kinder
    - Heimweh
- CPF
- RG
- telefone (com DDD)
- data de nascimento
- naturalidade (lista de seleção para naturalidades. exemplo: brasileira, alemã, portuguesa, e assim por diante)
- endereço (usar consulta por CEP para preenchimento automatico dos campos - CEP tbm é uma inforção que será guardada no banco de dados)
- dependente (aqui será uma listagem de dependentes. deve sr um espação para incluir o primeiro dependente e adivionar tantos outros quanto necessario, entao tem que deixar aquela div com "+", e tambem disponibilizar uma forma de remover o dependente)
    - nome completo
    - categoria
    - CPF
    - RG
    - data de nascimento
    - naturalidade
- observação

## Alteração de senha

Já foi decidido que a área do associado deve conter um espaço para alteração de senha em bloco separado com ação dedicada.

Este bloco deve:

- permitir definir nova senha
- confirmar a senha
- mostrar feedback claro de sucesso ou erro

Se a conta tiver sido criada inicialmente por Google, a interface deve explicar que a senha local pode ser criada ali para habilitar acesso por email e senha.

## Estados de acesso

A área do associado precisa tratar cenários de acesso de forma clara.

### Estado 1: usuário sem sessão

Comportamento esperado:

- redirecionar para login

### Estado 2: usuário autenticado sem vínculo de associado ativo

Comportamento esperado:

- mostrar bloqueio amigável
- explicar que a conta existe, mas o vínculo não está ativo

### Estado 3: associado ativo

Comportamento esperado:

- liberar acesso completo à área

## Relação com a issue #6

Esta issue depende parcialmente da gestão administrativa dos associados.

Separação recomendada:

- `#6`: administração consulta e gerencia associados
- `#7`: o próprio associado consulta e mantém sua área pessoal

Isso significa que a modelagem dos dados deve ser compatível entre os dois módulos.

## Critérios de aceite propostos

- o associado autenticado e ativo consegue acessar sua área
- a área exibe seus dados principais
- a área oferece alteração de senha
- a interface separa claramente leitura e edição
- o fluxo funciona bem em desktop e mobile

## Fora de escopo por enquanto

Este documento ainda não fecha:

- a ficha cadastral final completa
- integrações com pagamentos, mensalidades ou eventos
- histórico detalhado do vínculo
- conteúdos editoriais exclusivos para associados

## Carteira visual na tela

- aparece dentro da área do associado
- incluir os seguintes dados:
    - foto se tiver
    - nome completo
    - categoria: 
    - CPF
    - data de nascimento
    - naturalidade (lista de seleção para naturalidades. exemplo: brasileira, alemã, portuguesa, e assim por diante)

## Regras de negocio

- um administrador pode e deve ser um associado
- um associado pode ou nao ser um administrador
- os acessos e controles de administrador e de um associado devem ser mantidos separadamente. um mesmo email deve ter seus acessos de associado e administrador separados.
