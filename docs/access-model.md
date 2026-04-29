# Modelo de acesso e perfis

Issue de origem: [#2 Definir modelo de acesso e perfis do sistema](https://github.com/thalescampelodac/landing-page-aajf/issues/2)

## Objetivo

Definir como o sistema diferencia apoiadores, associados e administradores usando Supabase Auth para autenticação e tabelas do banco para autorização.

## Decisão

O acesso ao sistema poderá ser feito por Google ou por email e senha usando Supabase Auth. Esse login prova a identidade do usuário, mas não concede permissão por si só.

Perfis, permissões e status serão definidos em tabelas próprias do banco. Assim, uma pessoa autenticada só acessa áreas internas se existir um vínculo autorizado e ativo para o perfil correspondente.

## Perfis

| Perfil | Entrada no sistema | Regra principal |
| --- | --- | --- |
| Apoiador | Cadastro livre | Pode criar acesso por Google ou email e senha. |
| Associado | Acesso concedido | Não se cadastra livremente. A administração concede o vínculo. |
| Administrador | Acesso concedido | Não se cadastra livremente. O acesso administrativo é concedido. |

## Status

Associados devem ter status operacional independente da autenticação:

| Status | Significado |
| --- | --- |
| `active` | Associado com acesso válido. |
| `inactive` | Associado sem acesso ativo no momento. |
| `suspended` | Associado temporariamente bloqueado por decisão administrativa. |

Administradores também devem ter status:

| Status | Significado |
| --- | --- |
| `active` | Pode acessar a administração. |
| `inactive` | Não pode acessar a administração. |
| `suspended` | Bloqueio administrativo explícito. |

## Modelo de dados inicial

Este desenho é a base para as próximas issues. Os nomes podem ser ajustados durante a implementação, mas a separação entre autenticação e autorização deve ser preservada.

### `profiles`

Representa a pessoa autenticada no app.

Campos sugeridos:

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `uuid` | Mesmo id de `auth.users.id`. |
| `email` | `text` | Email principal do usuário autenticado. |
| `full_name` | `text` | Nome exibido no app. |
| `created_at` | `timestamptz` | Criação do perfil. |
| `updated_at` | `timestamptz` | Última alteração. |

### `admin_memberships`

Controla quem pode acessar a administração.

Campos sugeridos:

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `uuid` | Chave primária. |
| `profile_id` | `uuid` | Referência para `profiles.id`. |
| `role` | `text` | `super_admin` ou `admin`. |
| `status` | `text` | `active`, `inactive` ou `suspended`. |
| `granted_by` | `uuid` | Perfil que concedeu acesso, quando aplicável. |
| `granted_at` | `timestamptz` | Data de concessão. |

### `associate_memberships`

Controla quem é associado e seu estado.

Campos sugeridos:

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `uuid` | Chave primária. |
| `profile_id` | `uuid` | Referência para `profiles.id`. |
| `status` | `text` | `active`, `inactive` ou `suspended`. |
| `granted_by` | `uuid` | Administrador que concedeu acesso. |
| `granted_at` | `timestamptz` | Data de concessão. |
| `notes` | `text` | Observações internas. |

### `supporter_profiles`

Controla o cadastro livre de apoiadores.

Campos sugeridos:

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | `uuid` | Chave primária. |
| `profile_id` | `uuid` | Referência para `profiles.id`. |
| `status` | `text` | `active`, `inactive` ou `suspended`. |
| `created_at` | `timestamptz` | Criação do cadastro. |

## Regras de autorização

1. Usuário autenticado sem vínculo em `admin_memberships`, `associate_memberships` ou `supporter_profiles` não deve acessar áreas internas.
2. A área administrativa exige `admin_memberships.status = active`.
3. A área do associado exige `associate_memberships.status = active`.
4. A área do apoiador exige cadastro em `supporter_profiles` com status válido.
5. Administradores podem conceder ou alterar acesso de associados.
6. Administradores podem conceder acesso administrativo conforme regra definida no bootstrap.
7. Status `inactive` e `suspended` bloqueiam acesso à área correspondente.

## Bootstrap de administradores

O primeiro administrador precisa ser criado de forma controlada, pois ainda não existe painel administrativo operacional.

Estratégia recomendada:

1. Configurar uma lista inicial de emails autorizados em variável de ambiente, por exemplo `ADMIN_BOOTSTRAP_EMAILS`.
2. Quando um usuário autenticado com email presente nessa lista acessar a área administrativa pela primeira vez, o sistema cria ou ativa seu registro em `admin_memberships` como `super_admin`.
3. Após a área administrativa estar funcional, novos administradores devem ser concedidos pelo painel, não por alteração manual de arquivo.

Essa estratégia usa variável de ambiente apenas para o primeiro acesso controlado. A fonte de verdade permanente continua sendo o banco.

## Segurança e RLS

As tabelas expostas pelo Supabase devem usar Row Level Security.

Diretrizes:

1. Habilitar RLS nas tabelas em schema exposto.
2. Usar `auth.uid()` para vincular o usuário autenticado ao próprio perfil.
3. Não usar `user_metadata` como fonte de autorização, porque metadados de usuário podem ser alterados pelo próprio usuário.
4. Guardar autorização em tabelas próprias ou, se necessário no futuro, em `app_metadata`.
5. Índices devem existir em campos usados por políticas, como `profile_id` e `status`.

Referências:

- Supabase Auth: https://supabase.com/docs/guides/auth
- Login com Google: https://supabase.com/docs/guides/auth/social-login/auth-google
- Email e senha: https://supabase.com/docs/guides/auth/passwords
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security

## Fora de escopo desta decisão

Esta issue não implementa autenticação, migrations, telas, policies ou cadastro real. Ela apenas define a regra que as próximas issues devem seguir.

## Próximas issues dependentes

1. [#3 Preparar autenticacao com Supabase](https://github.com/thalescampelodac/landing-page-aajf/issues/3)
2. [#4 Implementar bootstrap de administradores](https://github.com/thalescampelodac/landing-page-aajf/issues/4)
3. [#5 Criar area de administracao](https://github.com/thalescampelodac/landing-page-aajf/issues/5)
4. [#6 Criar gestao de associados e status](https://github.com/thalescampelodac/landing-page-aajf/issues/6)

## Critérios de aceite atendidos

- Perfis do sistema definidos.
- Regras de acesso claras.
- Autenticação e autorização separadas.
- Base inicial para modelagem das tabelas de permissões.
