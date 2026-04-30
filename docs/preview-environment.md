# Ambiente Preview

Issue de origem: [#13 Configurar e validar ambiente Preview com Supabase](https://github.com/thalescampelodac/landing-page-aajf/issues/13)

## Objetivo

Todo PR precisa ser validado em Preview antes do merge. O Preview deve provar que a configuração de Vercel, Supabase Auth, redirects e permissões funciona fora do ambiente local.

## Ambientes

| Ambiente | Uso | Onde configura |
| --- | --- | --- |
| Local | Desenvolvimento na máquina | `.env.local` |
| Preview | Deploy automático de branch/PR | Vercel Project Settings |
| Production | Ambiente final publicado | Vercel Project Settings e Supabase definitivo |

## Variáveis da Vercel para Preview

Em **Vercel > Project > Settings > Environment Variables**, configure para o ambiente **Preview**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_PUBLISHABLE_KEY
```

Não use `secret` nem `service_role` em variáveis `NEXT_PUBLIC_`.

### Sobre `NEXT_PUBLIC_SITE_URL`

Para Production, `NEXT_PUBLIC_SITE_URL` deve apontar para o domínio oficial.

Para Preview, prefira não fixar `NEXT_PUBLIC_SITE_URL` quando cada PR usa uma URL diferente. O app usa `VERCEL_URL` como fallback no servidor para montar o redirect correto do deploy atual.

Se a Vercel estiver usando um domínio de branch estável e você quiser fixar o Preview, defina:

```env
NEXT_PUBLIC_SITE_URL=https://URL_PREVIEW_ESTAVEL
```

## Supabase Auth

Em **Supabase > Authentication > URL Configuration**:

1. Configure **Site URL** com o domínio oficial quando ele existir.
2. Adicione em **Redirect URLs**:

```text
http://localhost:3000/**
https://*-thalescampelo-2658s-projects.vercel.app/**
```

Se o Preview estiver em outro time/slug da Vercel, troque `thalescampelo-2658s-projects` pelo slug correto. A regra acima segue o padrão recomendado pela Supabase para previews da Vercel.

## Supabase Data API

Em **Supabase > Project Settings > Data API**:

1. Confirme que o schema `aajf` está em **Exposed schemas**.
2. Confirme que as migrations aplicadas no banco usado pelo Preview são:
   - `20260429150747_initial_access_schema.sql`
   - `20260429160126_admin_bootstrap.sql`

## Checklist obrigatório por PR

Antes de fazer merge:

1. CI do GitHub passou.
2. Vercel Preview build passou.
3. URL do Preview abre a landing page.
4. `/admin` redireciona para `/entrar` quando não há sessão.
5. Login com Google funciona no Preview.
6. Login com email e senha funciona no Preview quando aplicável.
7. `/admin` libera acesso para conta `super_admin`.
8. `/admin` bloqueia conta autenticada sem `admin_memberships.active`.
9. Não há erro visível de redirect ou API key.
10. Resultado da validação foi registrado no PR.

## Checklist pós-merge

Depois do merge:

1. Confirmar que o deploy associado ao `main` foi concluído.
2. Confirmar que o Project/issue foi movido para `Done`.
3. Registrar qualquer ajuste manual feito em Vercel ou Supabase.

## Referências

- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Vercel Preview Deployments: https://vercel.com/docs/deployments
- Supabase Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
