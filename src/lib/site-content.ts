import { publicationSeedPosts } from "@/lib/publications-content";

export const siteConfig = {
  name: "Associação Alemã de Juiz de Fora",
  legalName: "Associação Cultural e Recreativa Brasil-Alemanha",
  phone: "(32) 99904-0629",
  phoneHref: "https://wa.me/5532999040629",
  email: "contato@associacaoalemajfmg.com.br",
  address: "Rua Braz Xavier Bastos Júnior 23, Borboleta, Juiz de Fora/MG",
  facebook: "https://www.facebook.com/associacaoalemajfmg",
  instagram: "https://www.instagram.com/associacaoalemajfmg/",
};

export const navItems = [
  { href: "/#inicio", label: "Início" },
  { href: "/#quem-somos", label: "Quem Somos" },
  { href: "/#schmetterling", label: "Schmetterling" },
  { href: "/#publicacoes", label: "Publicações" },
  { href: "/#comunidade", label: "Comunidade" },
  { href: "/#contato", label: "Contato" },
];

export const heroHighlights = [
  "Cultura viva em Juiz de Fora",
  "Tradição compartilhada entre gerações",
  "Dança, encontros e memória coletiva",
];

export const essenceItems = [
  {
    title: "Cultura",
    description:
      "Valorizamos costumes, simbolos e historias que mantem a presenca germanica viva na cidade.",
  },
  {
    title: "Tradição",
    description:
      "Cada encontro reforça um legado construído com cuidado, respeito e continuidade ao longo do tempo.",
  },
  {
    title: "Dança",
    description:
      "O movimento do Grupo Schmetterling transforma memória em celebração, alegria e expressão coletiva.",
  },
  {
    title: "Convivência",
    description:
      "A associação aproxima famílias, descendentes, admiradores e novos participantes em um ambiente acolhedor.",
  },
  {
    title: "Memória",
    description:
      "Preservamos a herança cultural com atividades que conectam passado, presente e futuro de forma afetiva.",
  },
  {
    title: "Comunidade",
    description:
      "Mais do que eventos, cultivamos pertencimento, amizade e vontade de construir histórias em conjunto.",
  },
];

export const communityMetrics = [
  { value: "Juiz de Fora/MG", label: "Presença local" },
  { value: "Schmetterling", label: "Grupo em destaque" },
  { value: "Cultura e união", label: "Compromisso" },
];

export const aboutContent = {
  eyebrow: "Quem somos",
  title: "Uma associação para preservar a cultura alemã com proximidade e calor humano.",
  paragraphs: [
    "A Associação Alemã de Juiz de Fora/MG, oficialmente Associação Cultural e Recreativa Brasil-Alemanha, atua para preservar e difundir as tradições germânicas por meio da cultura, da dança e da confraternização.",
    "Nosso trabalho une descendentes, admiradores e apoiadores em torno de encontros, apresentações e atividades que fortalecem a memória cultural e a convivência entre gerações.",
  ],
  pillars: [
    "Preservação da cultura alemã em Juiz de Fora",
    "União entre descendentes, admiradores e apoiadores",
    "Eventos, encontros e atividades culturais ao longo do ano",
  ],
};

export const schmetterlingContent = {
  eyebrow: "Grupo Schmetterling",
  title: "Tradição em movimento, com figurinos, alegria e apresentações que encantam.",
  description:
    "O Grupo de Danças Folclóricas Schmetterling traduz a herança alemã em coreografias vibrantes, trajes típicos e presença cativante em festas, encontros e eventos culturais. É uma forma viva de celebrar as origens com energia, beleza e pertencimento.",
  points: [
    "Dança folclórica alemã apresentada com autenticidade",
    "Figurinos e repertórios que reforçam identidade cultural",
    "Apresentações que aproximam público, história e celebração",
  ],
};

export const accessAreas = [
  {
    title: "Área do Associado",
    description:
      "Acesse seus dados, acompanhe comunicados, atualize seu cadastro e participe da vida da associação.",
    href: "/associado",
  },
  {
    title: "Área Administrativa",
    description:
      "Espaço reservado para gestão interna, cadastros, publicações, comunicados e organização das atividades.",
    href: "/admin",
  },
  {
    title: "Área do Apoiador",
    description:
      "Para quem admira a cultura alemã, deseja apoiar eventos, acompanhar novidades e se aproximar da comunidade.",
    href: "/apoiador",
  },
];

export const posts = publicationSeedPosts;

export const testimonials = [
  {
    name: "Mariana Köhler",
    quote:
      "Participar da Associação Alemã de Juiz de Fora tem sido uma experiência incrível. O Grupo Schmetterling me conectou às minhas raízes e me trouxe novas amizades.",
  },
  {
    name: "Fernando Bauer",
    quote:
      "Desde que entrei para a associação, aprendi muito sobre as tradições alemãs. Os eventos são sempre bem organizados e repletos de cultura.",
  },
  {
    name: "Carla Stein",
    quote:
      "Sou descendente de alemães e encontrar a associação foi como voltar às minhas origens. Recomendo para todos que querem viver essa cultura de perto.",
  },
];

export const footerLinks = [
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/publicacoes", label: "Publicações" },
  { href: "/contato", label: "Contato" },
  { href: "/termos-de-uso", label: "Termos de Uso" },
  { href: "/politica-de-privacidade", label: "Política de Privacidade" },
];
