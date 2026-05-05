# Especificação inicial da matrícula de associados

Issue de origem: [#21 Matrícula](https://github.com/thalescampelodac/landing-page-aajf/issues/21)

## Objetivo

Definir como o sistema deve atribuir uma matrícula única para cada associado,
de forma automática, consistente e sem depender de preenchimento manual pela
administração.

## Contexto atual

Hoje o sistema já possui:

- autenticação por conta
- concessão de vínculo de associado
- ficha cadastral persistida
- dependentes
- área do associado
- gestão administrativa de associados

Mas ainda não existe um identificador de matrícula próprio da associação.

## Problema que a issue resolve

Sem matrícula:

- não existe um número único de referência do associado
- a identificação visual da carteirinha fica incompleta
- consultas administrativas ficam mais frágeis
- futuras integrações financeiras, relatórios ou documentos ficam sem um
  identificador institucional estável

## Direção proposta

A matrícula deve ser:

- única por associado
- gerada automaticamente pelo sistema
- imutável depois de criada
- nunca reutilizada
- independente do email da conta
- preservada mesmo se o associado ficar `inactive` ou `suspended`

## Formato da matrícula

### Proposta principal

Usar um número sequencial com zero à esquerda:

- `000001`
- `000002`
- `000003`

### Motivo

Esse formato:

- é simples para usuários leigos
- funciona bem em carteirinhas
- evita acoplar a matrícula ao ano, ao grupo ou ao tipo de associado
- permite crescer sem precisar mudar a regra cedo

## Momento da atribuição

A matrícula deve ser atribuída automaticamente na primeira criação do vínculo
real do associado no sistema.

Na prática:

1. a administração concede o vínculo do associado
2. se aquele associado ainda não tiver matrícula, o sistema gera a próxima
   matrícula disponível
3. essa matrícula passa a ficar gravada no cadastro do associado
4. se o mesmo associado for editado, suspenso ou reativado depois, a matrícula
   permanece a mesma

## Regra de unicidade

- cada associado deve ter no máximo uma matrícula
- uma matrícula nunca pode pertencer a dois associados
- uma matrícula já usada nunca deve voltar para a fila

## Onde armazenar

### Proposta

Adicionar o campo na estrutura principal do associado, e não na conta de auth.

Campo sugerido:

- `aajf.associate_profiles.membership_number`

### Motivo

A matrícula pertence ao cadastro institucional do associado, não ao mecanismo
de login.

## Regra de geração

### Algoritmo sugerido

1. buscar a maior matrícula numérica já registrada
2. incrementar em `+1`
3. preencher com zero à esquerda até 6 dígitos
4. salvar no mesmo fluxo da criação inicial do vínculo

Exemplo:

- maior matrícula atual: `000154`
- próxima matrícula gerada: `000155`

## Tratamento de concorrência

Como a matrícula é sequencial, a geração precisa ser protegida contra colisão.

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
2. a ordem de atribuição deve seguir o vínculo mais antigo disponível
3. se não houver data confiável suficiente, usar ordem estável por `created_at`
   ou `id`

## Exibição no produto

### Administração

A matrícula deve aparecer:

- na listagem administrativa de associados
- na modal de dados completos do associado

### Área do associado

A matrícula deve aparecer:

- na área do associado
- na carteirinha digital

## Regras de negócio

- matrícula não pode ser editada manualmente na interface
- matrícula não muda em reativação
- matrícula continua associada ao cadastro mesmo com troca de email
- matrícula deve existir para todo associado com vínculo válido no sistema
- matrícula é obrigatória para exibição da carteirinha final

## Escopo sugerido da implementação

### Etapa 1

- adicionar campo no banco
- criar geração automática
- criar constraint de unicidade
- criar backfill dos associados já existentes

### Etapa 2

- exibir matrícula no admin
- exibir matrícula na área do associado
- incluir matrícula na carteirinha

### Etapa 3

- preparar uso futuro em exportações, PDF e relatórios

## Perguntas em aberto

1. A matrícula deve ter só número ou prefixo institucional, como `AAJF-000001`?
2. A associação quer reservar alguma faixa para migração manual futura?
3. A matrícula deve aparecer também em filtros e busca do admin?

## Recomendação final

Minha recomendação para esta issue é:

- formato: `000001`
- geração: automática no backend
- persistência: `aajf.associate_profiles.membership_number`
- regra: única, imutável e não reutilizável
- backfill: obrigatório para os associados já existentes

## Critérios de aceite

- todo novo associado recebe matrícula automaticamente
- associados já existentes recebem matrícula por backfill
- não existe colisão de matrícula
- matrícula não é editável manualmente na interface
- matrícula aparece no admin
- matrícula aparece na área do associado
- matrícula aparece na carteirinha digital
