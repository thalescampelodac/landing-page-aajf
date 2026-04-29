# Setup manual do Supabase

Issue de origem: [#11 Criar schema inicial de acesso no Supabase](https://github.com/thalescampelodac/landing-page-aajf/issues/11)

## Criar projeto

1. Criar um projeto no dashboard da Supabase.
2. Copiar a Project URL.
3. Copiar a Publishable key do projeto.
4. Criar `.env.local` a partir de `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Onde encontrar as variáveis

No dashboard do Supabase:

1. Abrir o projeto usado para o app.
2. Abrir o botão **Connect** e copiar **Project URL** para `NEXT_PUBLIC_SUPABASE_URL`.
3. Ir em **Project Settings**.
4. Abrir **API Keys**.
5. Copiar uma **Publishable key** para `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Não use `secret` nem `service_role` em variáveis `NEXT_PUBLIC_`, porque elas ficam disponíveis no navegador.

Para desenvolvimento local, mantenha:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Em Preview/Produção na Vercel, defina `NEXT_PUBLIC_SITE_URL` com a URL pública do ambiente quando ela estiver disponível.

## Aplicar migration

Arquivo:

```text
supabase/migrations/20260429150747_initial_access_schema.sql
supabase/migrations/20260429160126_admin_bootstrap.sql
```

Opção pelo dashboard:

1. Abrir Supabase SQL Editor.
2. Colar o conteúdo da migration.
3. Executar o SQL.
4. Conferir se as tabelas foram criadas no schema `aajf`.

Opção pela CLI, quando o projeto estiver linkado:

```bash
supabase db push
```

## Configurar Auth

Em Authentication:

1. Habilitar login por email e senha.
2. Habilitar Google provider quando as credenciais OAuth estiverem disponíveis.
3. Configurar redirect URL local:

```text
http://localhost:3000/auth/callback
```

4. Configurar redirect URL de produção quando o domínio estiver definido:

```text
https://SEU_DOMINIO/auth/callback
```

## Expor schema para o app

Para o app consultar permissões usando RLS:

1. Abrir **Project Settings**.
2. Abrir **Data API**.
3. Em **Exposed schemas**, adicionar `aajf`.
4. Salvar as alterações.

O schema continua protegido por RLS. A exposição apenas permite que o Supabase client consulte as tabelas autorizadas pelas policies.

## Observações

- A migration cria a estrutura de autorização, mas não cria o primeiro administrador.
- A migration usa o schema `aajf` para isolar este app dentro de um projeto Supabase existente.
- O primeiro administrador é tratado pelo fluxo em [Bootstrap de administradores](./admin-bootstrap.md).
- A criação manual do projeto Supabase continua fora do escopo desta issue.

## Remover schema temporário

Se este schema for usado em um projeto Supabase compartilhado apenas durante o desenvolvimento, ele pode ser removido depois com:

```sql
drop schema if exists aajf cascade;
drop schema if exists app_private cascade;
```

Use esse comando apenas no ambiente correto, porque `cascade` remove todos os objetos dentro dos schemas.
