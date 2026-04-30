# Landing Page AAJF

Landing page e áreas autenticadas iniciais da Associação Alemã de Juiz de Fora.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Crie `.env.local` a partir de `.env.example` e preencha as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Suba o servidor local:

```bash
npm run dev
```

## Validação

Antes de abrir ou atualizar um PR, rode localmente:

```bash
npm run lint
npm run test
npm run build
```

O repositório também possui:

- Git hook local `pre-push` recomendado para bloquear push com validação falhando.
- GitHub Actions em `.github/workflows/ci.yml`.
- Branch protection exigindo o check `CI / Lint, test and build` antes do merge em `main`.

## Ambientes

- Local: usa `.env.local`.
- Preview: usa variáveis configuradas na Vercel para PRs e branches.
- Production: será configurado com o ambiente definitivo da associação.

Guia de Preview: [docs/preview-environment.md](docs/preview-environment.md)

Setup do Supabase: [docs/supabase-setup.md](docs/supabase-setup.md)

Bootstrap de administradores: [docs/admin-bootstrap.md](docs/admin-bootstrap.md)
