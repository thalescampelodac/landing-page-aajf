# Especificação inicial da concessão de acesso e ficha do associado

Issue de origem: [#8 Modelar ficha cadastral do associado](https://github.com/thalescampelodac/landing-page-aajf/issues/8)

## Objetivo

Definir como um novo associado nasce no sistema, quais dados compõem sua ficha
cadastral e como esse acesso será concedido para permitir testes reais da área
do associado.

Esta issue deve servir de ponte entre:

- a gestão administrativa de associados
- a área do associado
- a modelagem persistente da ficha cadastral

## Problema que a issue resolve

Hoje a área do associado já tem direção visual, mas ainda depende de dados reais
para validação ponta a ponta.

Sem a `#8`, continuamos com:

- dados apenas de exemplo
- ausência de concessão operacional de novos associados
- dificuldade para testar login e experiência real do associado

## Resultado esperado

Ao final desta issue, a administração deve conseguir:

1. conceder acesso a um novo associado;
2. preencher ou iniciar a ficha cadastral desse associado;
3. permitir que o associado entre e visualize sua área com dados reais.

## Direção funcional

### 1. Concessão de acesso

O acesso do associado deve nascer por ação administrativa.

Fluxo esperado:

1. a administração localiza ou cria a pessoa no sistema;
2. a administração concede o vínculo de associado;
3. o status inicial fica ativo;
4. a ficha cadastral passa a existir para aquele perfil;
5. o associado consegue entrar e acessar a área do associado.

### 2. Ficha cadastral

A ficha do associado deve conter, no mínimo:

- foto
- nome completo
- email
- categoria
- CPF
- RG
- telefone com DDD
- data de nascimento
- naturalidade
- endereço com CEP
- observação
- lista de dependentes

Cada dependente deve conter:

- nome completo
- categoria
- CPF
- RG
- data de nascimento
- naturalidade

### 3. Termo de responsabilidade

O associado deve ter acesso ao texto do termo na própria área.

Também deve existir campo que registre o aceite do termo.

Ponto a definir na implementação:

- o aceite será apenas visual e editável pelo próprio associado?
- ou ficará persistido com data/hora no banco?

Minha recomendação:

- persistir boolean + timestamp de aceite

## Regras de negócio herdadas da #7

Estas regras já devem ser respeitadas na modelagem:

- um administrador pode e deve ser um associado
- um associado pode ou não ser um administrador
- os controles de associado e administrador devem ser mantidos separados
- o mesmo email pode ter vínculo de associado e papel administrativo sem misturar as permissões

## Estrutura de dados sugerida

Além de `aajf.associate_memberships`, esta issue provavelmente exigirá uma
tabela dedicada para os dados cadastrais do associado.

### Sugestão de tabela principal

`aajf.associate_profiles`

Campos sugeridos:

- `id`
- `profile_id`
- `photo_url`
- `full_name`
- `category`
- `cpf`
- `rg`
- `phone`
- `birth_date`
- `nationality`
- `cep`
- `street`
- `number`
- `complement`
- `neighborhood`
- `city`
- `state`
- `observation`
- `term_accepted`
- `term_accepted_at`
- `created_at`
- `updated_at`

### Sugestão de tabela de dependentes

`aajf.associate_dependents`

Campos sugeridos:

- `id`
- `associate_profile_id`
- `full_name`
- `category`
- `cpf`
- `rg`
- `birth_date`
- `nationality`
- `created_at`
- `updated_at`

## Separação entre quem edita o quê

### Administração

Deve poder:

- conceder o vínculo de associado
- ativar, inativar ou suspender
- consultar a ficha
- completar ou revisar dados quando necessário

### Associado

Deve poder editar:

- foto
- nome completo
- categoria
- CPF
- RG
- telefone
- data de nascimento
- naturalidade
- endereço
- dependentes
- observação

## Estados importantes

### Estado 1: perfil autenticado sem vínculo de associado

Não entra na área do associado.

### Estado 2: perfil autenticado com vínculo inativo ou suspenso

Recebe bloqueio amigável.

### Estado 3: perfil autenticado com vínculo ativo

Entra na área do associado e vê a ficha.

## Testes que esta issue deve destravar

Ao final da implementação, precisamos conseguir testar:

- concessão de um novo associado pela administração
- primeiro acesso do associado
- visualização da ficha na área do associado
- edição de dados permitidos
- presença de dependentes
- carteira visual refletindo os dados persistidos

## Perguntas em aberto

1. A criação do perfil de associado será separada da concessão do membership ou tudo no mesmo fluxo?
2. A administração vai cadastrar primeiro e o associado depois só complementa?
3. O campo `email` da ficha será sempre derivado de `profiles.email`?
4. Como o upload da foto será persistido?
5. O termo precisa de trilha de auditoria além do aceite simples?

## Critérios de aceite propostos

- a administração consegue conceder acesso a um novo associado
- a ficha cadastral básica do associado existe em banco
- dependentes podem ser persistidos
- o associado ativo consegue acessar sua área com dados reais
- a área do associado reflete a ficha persistida
- as regras de separação entre acesso administrativo e acesso de associado são preservadas
