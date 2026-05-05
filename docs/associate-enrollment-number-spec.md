# Especificação inicial da matrícula de associados e dependentes

Issue de origem: [#21 Matrícula](https://github.com/thalescampelodac/landing-page-aajf/issues/21)

## Objetivo

Definir como o sistema deve atribuir uma matrícula única para cada associado e
para cada dependente, de forma automática, consistente e sem depender de
preenchimento manual pela administração.

## Contexto atual

Hoje o sistema já possui:

- autenticação por conta
- concessão de vínculo de associado
- ficha cadastral persistida
- dependentes
- área do associado
- gestão administrativa de associados

Mas ainda não existe um identificador de matrícula próprio da associação para:

- associados
- dependentes

## Problema que a issue resolve

Sem matrícula:

- não existe um número único de referência do associado
- não existe um número único de referência do dependente
- a identificação visual da carteirinha fica incompleta
- consultas administrativas ficam mais frágeis
- futuras integrações financeiras, relatórios ou documentos ficam sem um
  identificador institucional estável

## Direção proposta

A matrícula deve ser:

- única por associado
- única por dependente
- gerada automaticamente pelo sistema
- imutável depois de criada
- nunca reutilizada
- independente do email da conta
- preservada mesmo se o associado ficar `inactive` ou `suspended`

## Formato da matrícula

### Proposta principal

Usar duas sequências independentes:

- associados: `000001`
- dependentes: `D000001`

### Motivo

Esse formato:

- diferencia claramente associado de dependente
- evita colisão visual entre cadastros de naturezas diferentes
- continua simples para operação humana
- mantém os dependentes identificáveis sem ambiguidade

### Exemplos

- associado: `000154`
- dependente: `D000031`

## Escopo da matrícula

### Associado principal

Cada associado principal recebe sua própria matrícula institucional.

### Dependente

Cada dependente também recebe sua própria matrícula institucional, separada da
do associado principal.

O dependente continua vinculado ao associado, mas não reaproveita nem compartilha
o número do titular.

## Momento da atribuição

A matrícula deve ser atribuída automaticamente:

- para o associado, na primeira criação do vínculo real do associado no sistema
- para o dependente, na primeira criação do dependente dentro da ficha do associado

Na prática:

1. a administração concede o vínculo do associado
2. se aquele associado ainda não tiver matrícula, o sistema gera a próxima
   matrícula disponível
3. essa matrícula passa a ficar gravada no cadastro do associado
4. se o mesmo associado for editado, suspenso ou reativado depois, a matrícula
   permanece a mesma
5. quando um dependente novo é criado, o sistema gera a próxima matrícula de
   dependente disponível
6. se o dependente for editado depois, a matrícula permanece a mesma

## Regra de unicidade

- cada associado deve ter no máximo uma matrícula
- cada dependente deve ter no máximo uma matrícula
- uma matrícula de associado nunca pode pertencer a dois associados
- uma matrícula de dependente nunca pode pertencer a dois dependentes
- uma matrícula já usada nunca deve voltar para a fila

## Onde armazenar

### Proposta

Adicionar os campos na estrutura própria do cadastro institucional, e não na
conta de auth.

Campos sugeridos:

- `aajf.associate_profiles.membership_number`
- `aajf.associate_dependents.membership_number`

### Motivo

A matrícula pertence ao cadastro institucional, não ao mecanismo de login.

## Regra de geração

### Algoritmo sugerido

#### Associados

1. buscar a maior matrícula de associado já registrada
2. incrementar em `+1`
3. preencher com zero à esquerda até 6 dígitos
4. salvar no mesmo fluxo da criação inicial do vínculo

#### Dependentes

1. buscar a maior matrícula de dependente já registrada
2. incrementar em `+1`
3. aplicar prefixo `D`
4. preencher a parte numérica com zero à esquerda até 6 dígitos
5. salvar no mesmo fluxo da criação do dependente

Exemplos:

- maior matrícula de associado atual: `000154`
- próxima matrícula de associado: `000155`
- maior matrícula de dependente atual: `D000031`
- próxima matrícula de dependente: `D000032`

## Tratamento de concorrência

Como a matrícula é sequencial, a geração precisa ser protegida contra colisão,
tanto para associados quanto para dependentes.

### Recomendação técnica

Fazer a atribuição no banco, e não no cliente.

O ideal é usar:

- função SQL dedicada
- ou sequence no Postgres
- com constraint `unique`

## Associados já existentes

Como já existem associados no sistema antes da matrícula, a issue precisa
prever backfill.

### Regra sugerida

Ao aplicar a feature:

1. todos os associados já existentes recebem matrícula
2. todos os dependentes já existentes recebem matrícula
3. a ordem de atribuição do associado deve seguir o vínculo mais antigo disponível
4. a ordem de atribuição do dependente deve seguir `created_at` ou ordem estável
   por `id`
5. se não houver data confiável suficiente, usar ordem estável por `created_at`
   ou `id`

## Exibição no produto

### Administração

A matrícula deve aparecer:

- na listagem administrativa de associados
- na modal de dados completos do associado
- na visualização textual dos dependentes

### Área do associado

A matrícula deve aparecer:

- na área do associado
- na carteirinha digital
- na listagem de dependentes, quando houver

## Regras de negócio

- matrícula não pode ser editada manualmente na interface
- matrícula não muda em reativação
- matrícula continua associada ao cadastro mesmo com troca de email
- matrícula deve existir para todo associado com vínculo válido no sistema
- matrícula deve existir para todo dependente persistido no sistema
- matrícula é obrigatória para exibição da carteirinha final

## Escopo sugerido da implementação

### Etapa 1

- adicionar campos no banco
- criar geração automática
- criar constraints de unicidade
- criar backfill dos associados e dependentes já existentes

### Etapa 2

- exibir matrícula no admin
- exibir matrícula na área do associado
- incluir matrícula na carteirinha
- exibir matrícula de dependentes na visualização textual do admin

### Etapa 3

- preparar uso futuro em exportações, PDF e relatórios

## Perguntas em aberto

1. O prefixo `D` para dependentes está ok ou a associação prefere outro formato?
2. A associação quer reservar alguma faixa para migração manual futura?
3. A matrícula deve aparecer também em filtros e busca do admin?

## Recomendação final

Minha recomendação para esta issue é:

- associado: `000001`
- dependente: `D000001`
- geração: automática no backend
- persistência:
  - `aajf.associate_profiles.membership_number`
  - `aajf.associate_dependents.membership_number`
- regra: única, imutável e não reutilizável
- backfill: obrigatório para associados e dependentes já existentes

## Critérios de aceite

- todo novo associado recebe matrícula automaticamente
- todo novo dependente recebe matrícula automaticamente
- associados já existentes recebem matrícula por backfill
- dependentes já existentes recebem matrícula por backfill
- não existe colisão de matrícula
- matrícula não é editável manualmente na interface
- matrícula aparece no admin
- matrícula aparece na área do associado
- matrícula aparece na carteirinha digital
- matrícula de dependente aparece na visualização administrativa dos dependentes
