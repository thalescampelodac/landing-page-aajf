# Bootstrap de administradores

Issue de origem: [#4 Implementar bootstrap de administradores](https://github.com/thalescampelodac/landing-page-aajf/issues/4)

## Objetivo

Conceder o primeiro acesso administrativo sem cadastro livre de administradores e sem arquivo manual no backend.

O login continua sendo feito pelo Supabase Auth. A permissão administrativa nasce apenas quando existe uma autorização explícita no banco.

## Fluxo recomendado

1. Inserir o email do primeiro administrador em `aajf.admin_bootstrap_grants`.
2. O administrador acessa o app com Google ou email e senha usando o mesmo email.
3. O trigger em `auth.users` sincroniza `aajf.profiles`.
4. Se existir grant pendente para o email autenticado, o banco cria `aajf.admin_memberships`.
5. O grant muda de `pending` para `claimed`.

## Autorizar o primeiro administrador

No Supabase SQL Editor, execute:

```sql
insert into aajf.admin_bootstrap_grants (email, role, notes)
values (
  'admin@example.com',
  'super_admin',
  'Primeiro administrador do sistema'
);
```

Troque `admin@example.com` pelo email real da pessoa autorizada.

## Conferir se o acesso foi concedido

Depois que a pessoa fizer login no app, execute:

```sql
select
  profiles.email,
  admin_memberships.role,
  admin_memberships.status,
  admin_memberships.granted_at
from aajf.admin_memberships
join aajf.profiles
  on profiles.id = admin_memberships.profile_id
where lower(profiles.email) = lower('admin@example.com');
```

O resultado esperado é uma linha com `role = 'super_admin'` e `status = 'active'`.

## Se o usuário já tinha feito login antes

Se a conta já existir em `auth.users` antes do grant ser criado e o grant continuar `pending`, execute:

```sql
select app_private.apply_admin_bootstrap_to_user(users.id)
from auth.users
where lower(users.email) = lower('admin@example.com');
```

Depois rode a consulta de conferência novamente.

A migration também possui um trigger em `aajf.admin_bootstrap_grants` para processar automaticamente novos grants quando o usuário já existe.

## Revogar um grant ainda não usado

Se o email foi autorizado por engano e ainda está `pending`:

```sql
update aajf.admin_bootstrap_grants
set status = 'revoked'
where lower(email) = lower('admin@example.com')
  and status = 'pending';
```

## Observações de segurança

- A autorização administrativa não usa `user_metadata`.
- A função de bootstrap fica no schema `app_private`.
- A tabela `admin_bootstrap_grants` tem RLS habilitado.
- Usuários autenticados não recebem permissão direta para executar a função de bootstrap.
- Depois do primeiro administrador, novos acessos administrativos devem ser geridos pela área administrativa.
