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

- nome completo
- email
- telefone
- documento principal
- data de nascimento
- endereço

Observação:

Esta lista ainda precisa ser fechada com a definição da ficha cadastral real.

### 2. Situação do vínculo

Este bloco deve exibir informações do relacionamento do usuário com a associação.

Sugestão inicial:

- status do associado
- data de concessão
- observações institucionais, se houver

Objetivo:

- deixar claro se o vínculo está ativo, inativo ou suspenso
- evitar que o usuário dependa de atendimento para entender sua situação

### 3. Segurança da conta

Este bloco deve concentrar ações ligadas ao acesso.

Escopo inicial:

- alteração de senha
- informação sobre método de acesso atual

Exemplos:

- conta com login Google
- conta com email e senha
- conta com ambos os meios habilitados

### 4. Informações complementares

Este bloco pode ser usado depois para exibir:

- observações da associação
- dados adicionais do cadastro
- conteúdos exclusivos do associado

Por enquanto, ele pode nascer vazio ou como espaço reservado.

## Edição de dados

Precisamos separar claramente o que o associado poderá editar e o que será apenas leitura.

### Campos potencialmente editáveis pelo associado

Sugestão inicial:

- telefone
- endereço
- alguns dados complementares de contato

### Campos que tendem a ser apenas leitura

Sugestão inicial:

- status do vínculo
- papel/perfil institucional
- data de concessão
- informações sensíveis definidas pela administração

## Alteração de senha

Já foi decidido que a área do associado deve conter um espaço para alteração de senha.

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

## Dependências para implementação

Antes da implementação completa da `#7`, ainda precisamos fechar:

- quais campos compõem a ficha cadastral do associado
- quais campos o associado pode editar
- quais campos são apenas leitura
- como o status será apresentado visualmente

## Perguntas em aberto

1. Quais campos exatos da ficha cadastral entram na área do associado?
2. Quais desses campos o associado pode editar sozinho?
3. A alteração de senha será feita inline na mesma página ou em bloco separado com ação dedicada?
4. Devemos mostrar histórico ou apenas estado atual do vínculo?
5. Haverá conteúdos exclusivos do associado além do cadastro?

## Critérios de aceite propostos

- o associado autenticado e ativo consegue acessar sua área
- a área exibe seus dados principais
- a área mostra o status do vínculo
- a área oferece alteração de senha
- a interface separa claramente leitura e edição
- o fluxo funciona bem em desktop e mobile

## Fora de escopo por enquanto

Este documento ainda não fecha:

- a ficha cadastral final completa
- integrações com pagamentos, mensalidades ou eventos
- histórico detalhado do vínculo
- conteúdos editoriais exclusivos para associados

## Próximo passo sugerido

Antes da implementação visual completa, vale fazer um refinamento curto deste documento para fechar:

- lista final dos campos
- campos editáveis
- blocos definitivos da página
