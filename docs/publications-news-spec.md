# Especificação inicial da área de publicações e notícias

Issue de origem: [#24 Estruturar área de publicações e notícias](https://github.com/thalescampelodac/landing-page-aajf/issues/24)

## Objetivo

Definir como a área de publicações deve evoluir de uma lista estática para um
módulo editorial real da landing page, com foco em notícias, destaques e
conteúdo institucional.

Esta issue deve organizar:

- a experiência pública da página `/publicacoes`
- a estrutura dos cards e da listagem na home
- a modelagem futura dos dados editoriais
- a base para gestão administrativa de notícias depois
- o painel administrativo de criação, edição e publicação
- o upload de imagem de capa

## Situação atual

Hoje o projeto já possui:

- bloco de `Publicações` na home
- página pública `/publicacoes`
- cards visuais de publicação
- conteúdo fixo vindo de `src/lib/site-content.ts`

Isso atende bem como placeholder editorial, mas ainda não resolve:

- criação de novas notícias pelo painel
- edição e remoção de publicações
- separação entre rascunho e publicado
- organização por destaque, categoria ou data
- leitura individual de notícia

## Problema que a issue resolve

Sem a `#14`, a área de publicações continua:

- dependente de dados hardcoded
- sem fluxo operacional para novas notícias
- sem estrutura para crescimento de acervo
- sem ponte com administração/editorial

## Resultado esperado

Ao final desta issue, a solução deve deixar claro:

1. como uma notícia nasce no sistema;
2. como ela aparece na home;
3. como ela aparece na página `/publicacoes`;
4. quais campos compõem uma publicação;
5. como a administração vai publicar esse conteúdo futuramente.

## Decomposição recomendada

### 1. Modelagem e dados

- criar tabela principal de publicações
- definir campos editoriais
- definir status editoriais
- definir campo de destaque
- preparar storage e imagem de capa

### 2. Home conectada ao acervo real

- substituir conteúdo hardcoded do bloco de publicações
- renderizar destaque principal da home a partir do acervo publicado
- renderizar publicações secundárias a partir do acervo publicado

### 3. Página pública `/publicacoes`

- listar publicações publicadas
- manter hierarquia editorial e visual institucional
- preparar espaço para paginação futura

### 4. Página individual por slug

- criar rota `/publicacoes/[slug]`
- renderizar corpo completo da notícia
- suportar compartilhamento e leitura longa

### 5. Painel administrativo de publicações

- criar área admin para listar publicações
- criar fluxo de criação
- criar fluxo de edição
- permitir alternância entre `draft`, `published` e `archived`
- permitir definir destaque

### 6. Upload de imagem

- permitir upload de capa da notícia
- persistir imagem em storage
- refletir imagem na home, na listagem e na página individual

#### Regras da imagem de capa

- formatos aceitos: `JPG`, `PNG`, `WEBP`
- tamanho máximo: `5 MB`
- orientação esperada: horizontal
- proporção recomendada: `16:10`
- resolução mínima recomendada: `1600x1000`
- a imagem pode ficar ausente em `draft`
- a imagem é obrigatória para `published`
- o texto alternativo da imagem é obrigatório para `published`
- o painel deve mostrar prévia antes do salvamento

## Escopo funcional recomendado

### 1. Home da landing

O bloco de publicações da home deve continuar existindo como vitrine editorial.

Função esperada:

- destacar a publicação principal
- listar outras publicações recentes
- levar para `/publicacoes`

Regra sugerida:

- a home não deve mostrar tudo
- ela deve mostrar apenas recorte editorial
- algo como:
  - 1 destaque principal
  - 2 ou 3 publicações secundárias

### 2. Página `/publicacoes`

Esta página deve funcionar como listagem pública de notícias.

Função esperada:

- mostrar as publicações em ordem editorial
- permitir leitura agradável do conjunto
- servir como acervo inicial da associação

Decisão recomendada:

- manter uma listagem em cards ou blocos grandes
- deixar espaço para futura paginação
- não transformar a página em mural administrativo

### 3. Página individual da notícia

É recomendável que a notícia tenha URL própria.

Exemplo:

- `/publicacoes/[slug]`

Vantagens:

- leitura limpa
- compartilhamento por link direto
- base melhor para SEO
- espaço para texto longo, galeria e anexos

Minha recomendação:

- esta issue já deve prever isso na estrutura
- mesmo que a primeira entrega ainda comece pela listagem

## Modelo editorial sugerido

Cada publicação deve ter, no mínimo:

- `id`
- `slug`
- `title`
- `excerpt`
- `body`
- `cover_image_url`
- `cover_image_alt`
- `published_at`
- `featured`
- `status`
- `author_name`
- `created_at`
- `updated_at`

### Campos opcionais recomendados

- `category`
- `seo_title`
- `seo_description`
- `gallery`
- `external_link`

## Status editoriais sugeridos

Sugestão inicial:

- `draft`
- `published`
- `archived`

Objetivo:

- permitir criação sem publicação imediata
- evitar que tudo entre no ar automaticamente
- dar margem para revisão editorial

## Destaque editorial

É importante existir uma noção de destaque.

Sugestão:

- apenas uma notícia pode ser o `featured` principal da home
- na listagem de `/publicacoes`, ela também pode aparecer primeiro

Pergunta em aberto:

- o destaque será manual?
- ou sempre a publicação mais recente publicada?

Minha recomendação:

- destaque manual

## Estrutura de dados sugerida

### Tabela principal

`aajf.publications`

Campos sugeridos:

- `id`
- `slug`
- `title`
- `excerpt`
- `body`
- `cover_image_url`
- `status`
- `featured`
- `category`
- `published_at`
- `author_name`
- `seo_title`
- `seo_description`
- `created_at`
- `updated_at`

### Possível tabela de mídia futura

Se a associação quiser múltiplas imagens por notícia depois:

`aajf.publication_assets`

Campos sugeridos:

- `id`
- `publication_id`
- `asset_url`
- `asset_type`
- `caption`
- `sort_order`
- `created_at`

## Relação com a área administrativa

Esta issue não precisa fechar toda a UX de administração agora, mas precisa
deixar a direção pronta.

Futuro esperado:

- painel administrativo cria publicação
- painel salva rascunho
- painel publica
- painel edita ou arquiva

Então a modelagem desta issue deve nascer compatível com isso.

## Regras de negócio sugeridas

- publicações públicas não dependem de login
- apenas administração autorizada pode criar/editar/publicar
- notícia arquivada não aparece na home
- notícia `draft` não aparece publicamente
- a home mostra só recorte do acervo
- `/publicacoes` mostra o acervo publicado
- imagem de capa e texto alternativo são obrigatórios para `published`

## Direção visual

A área de publicações deve continuar institucional e editorial, não parecer
blog genérico ou painel de sistema.

Direção recomendada:

- cards amplos
- boa hierarquia entre imagem, título e data
- destaque claro para notícia principal
- leitura confortável para texto longo

## Perguntas em aberto

1. A primeira entrega já terá página individual por `slug`?
2. A administração de notícias entra nesta mesma issue ou em issue separada?
3. Vamos ter categorias editoriais ou só notícias em lista simples?
4. As publicações poderão ter mais de uma imagem?
5. O corpo será texto simples, markdown, rich text ou blocos?

## Critérios de aceite propostos

- a estrutura da área de publicações deixa de depender de conteúdo hardcoded como solução final
- a modelagem de notícia fica definida
- a página `/publicacoes` fica preparada para crescer como acervo
- existe direção clara para destaque editorial na home
- existe página individual por `slug`
- existe base administrativa para criar, editar e publicar
- a solução fica compatível com futura gestão administrativa de notícias

## Fora de escopo por enquanto

Este documento ainda não fecha:

- tradução multilíngue das notícias
- SEO completo por idioma
- comentários
- compartilhamento social avançado
- analytics editorial
- workflow de aprovação com múltiplos revisores
