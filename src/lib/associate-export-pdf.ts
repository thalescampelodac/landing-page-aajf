import type { AdminAssociateExportRow } from "@/lib/supabase/admin-associates";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 40;
const FIRST_PAGE_CONTENT_TOP = 594;
const OTHER_PAGE_CONTENT_TOP = 708;
const FOOTER_TOP = 44;
const BOTTOM_LIMIT = 76;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CARD_GAP = 18;
const CARD_INNER_PADDING = 18;
const TABLE_HEADER_HEIGHT = 20;
const TABLE_ROW_HEIGHT = 20;
const SUMMARY_TOP = 646;

const COLORS = {
  border: [0.84, 0.83, 0.79] as const,
  cardBg: [1, 0.985, 0.955] as const,
  dangerBadge: [0.96, 0.89, 0.9] as const,
  dangerText: [0.45, 0.09, 0.13] as const,
  gold: [0.85, 0.69, 0.38] as const,
  greenBadge: [0.89, 0.95, 0.92] as const,
  greenText: [0.09, 0.21, 0.18] as const,
  ink: [0.09, 0.18, 0.14] as const,
  muted: [0.29, 0.36, 0.34] as const,
  paper: [1, 0.97, 0.93] as const,
  tableHeader: [0.97, 0.94, 0.89] as const,
  warning: [0.58, 0.12, 0.17] as const,
};

type AssociateGroup = {
  associate: AdminAssociateExportRow;
  dependents: AdminAssociateExportRow[];
};

type AssociateCardChunk = {
  associate: AdminAssociateExportRow;
  dependents: AdminAssociateExportRow[];
  endDependentIndexExclusive: number;
  hasMoreDependents: boolean;
  isContinuation: boolean;
  startDependentIndex: number;
};

type PageModel = {
  cards: AssociateCardChunk[];
  isFirstPage: boolean;
};

type PdfOp = string;
type FontKey = "normal" | "bold";

export function buildAssociatePdfDocument(rows: AdminAssociateExportRow[]) {
  const groups = groupRows(rows);
  const pages = paginateGroups(groups);
  const totalAssociates = groups.length;
  const totalDependents = groups.reduce(
    (sum, group) => sum + group.dependents.length,
    0,
  );
  const exportedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const pageEntries: Array<{ contentObjectId: number; pageObjectId: number }> = [];
  const objects: Array<{ id: number; body: string }> = [];
  let nextObjectId = 3;

  for (const [pageIndex, page] of pages.entries()) {
    const pageObjectId = nextObjectId++;
    const contentObjectId = nextObjectId++;
    pageEntries.push({ contentObjectId, pageObjectId });

    const contentStream = buildPageContentStream({
      exportedAt,
      page,
      pageIndex: pageIndex + 1,
      totalAssociates,
      totalDependents,
      totalPages: pages.length,
    });

    objects.push({
      body: `<< /Length ${latin1ByteLength(contentStream)} >>\nstream\n${contentStream}\nendstream`,
      id: contentObjectId,
    });
    objects.push({
      body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${nextObjectId} 0 R /F2 ${nextObjectId + 1} 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      id: pageObjectId,
    });
  }

  const normalFontId = nextObjectId++;
  const boldFontId = nextObjectId++;
  objects.push({
    body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    id: normalFontId,
  });
  objects.push({
    body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    id: boldFontId,
  });

  const pagesKids = pageEntries.map((entry) => `${entry.pageObjectId} 0 R`).join(" ");
  objects.unshift(
    {
      body: `<< /Type /Pages /Kids [${pagesKids}] /Count ${pageEntries.length} >>`,
      id: 2,
    },
    { body: "<< /Type /Catalog /Pages 2 0 R >>", id: 1 },
  );

  const orderedObjects = objects.sort((a, b) => a.id - b.id);
  const header = "%PDF-1.4\n%âãÏÓ\n";
  const parts: string[] = [header];
  const offsets: number[] = [0];
  let currentOffset = latin1ByteLength(header);

  for (const object of orderedObjects) {
    offsets[object.id] = currentOffset;
    const objectString = `${object.id} 0 obj\n${object.body}\nendobj\n`;
    parts.push(objectString);
    currentOffset += latin1ByteLength(objectString);
  }

  const xrefOffset = currentOffset;
  const totalObjects = orderedObjects.length + 1;
  let xref = `xref\n0 ${totalObjects}\n0000000000 65535 f \n`;

  for (let index = 1; index < totalObjects; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  parts.push(xref, trailer);

  return encodeLatin1(parts.join(""));
}

function buildPageContentStream({
  exportedAt,
  page,
  pageIndex,
  totalAssociates,
  totalDependents,
  totalPages,
}: {
  exportedAt: string;
  page: PageModel;
  pageIndex: number;
  totalAssociates: number;
  totalDependents: number;
  totalPages: number;
}) {
  const ops: PdfOp[] = [];
  drawPageHeader(ops, exportedAt);
  drawPageFooter(ops, exportedAt, pageIndex, totalPages);

  if (page.isFirstPage) {
    drawSummaryCards(ops, exportedAt, totalAssociates, totalDependents);
  }

  let currentTop = page.isFirstPage ? FIRST_PAGE_CONTENT_TOP : OTHER_PAGE_CONTENT_TOP;

  for (const card of page.cards) {
    const cardHeight = measureCardHeight(card);
    drawAssociateCard(ops, card, currentTop, cardHeight);
    currentTop -= cardHeight + CARD_GAP;
  }

  return ops.join("\n");
}

function drawPageHeader(ops: PdfOp[], exportedAt: string) {
  drawCircle(ops, 64, 760, 20, {
    fill: COLORS.greenText,
  });
  drawText(ops, "AAJF", 47, 755, {
    color: COLORS.paper,
    font: "bold",
    size: 13.5,
  });

  drawText(ops, "Associação Alemã de Juiz de Fora", 102, 776, {
    color: COLORS.ink,
    font: "bold",
    size: 16.5,
  });
  drawText(ops, "Relatório de Associados e Dependentes", 102, 753, {
    color: COLORS.gold,
    font: "bold",
    size: 11.5,
  });
  drawTextRight(ops, `Exportado em ${exportedAt}`, PAGE_WIDTH - MARGIN_X, 776, {
    color: COLORS.muted,
    size: 9.5,
  });
  drawTextRight(ops, "Documento interno - contém dados pessoais.", PAGE_WIDTH - MARGIN_X, 756, {
    color: COLORS.warning,
    font: "bold",
    size: 8.5,
  });

  drawLine(ops, MARGIN_X, 736, PAGE_WIDTH - MARGIN_X, 736, {
    color: COLORS.border,
    width: 1,
  });
}

function drawSummaryCards(
  ops: PdfOp[],
  exportedAt: string,
  totalAssociates: number,
  totalDependents: number,
) {
  const totalPeople = totalAssociates + totalDependents;
  const gap = 12;
  const cardWidth = (CONTENT_WIDTH - gap * 3) / 4;
  const y = SUMMARY_TOP;
  const cards = [
    { label: "Total de associados", value: String(totalAssociates) },
    { label: "Total de dependentes", value: String(totalDependents) },
    { label: "Total geral", value: String(totalPeople) },
    { label: "Data da emissão", value: exportedAt.split(",")[0] ?? exportedAt },
  ];

  cards.forEach((card, index) => {
    const x = MARGIN_X + index * (cardWidth + gap);
    drawRoundedRect(ops, x, y, cardWidth, 56, 12, {
      fill: COLORS.cardBg,
      stroke: COLORS.border,
      strokeWidth: 1,
    });
    drawText(ops, card.label, x + 14, y + 38, {
      color: COLORS.muted,
      font: "bold",
      size: 8.5,
    });
    drawText(ops, card.value, x + 14, y + 18, {
      color: COLORS.ink,
      font: "bold",
      size: 17,
    });
  });
}

function drawPageFooter(
  ops: PdfOp[],
  exportedAt: string,
  pageNumber: number,
  totalPages: number,
) {
  drawLine(ops, MARGIN_X, FOOTER_TOP + 20, PAGE_WIDTH - MARGIN_X, FOOTER_TOP + 20, {
    color: COLORS.border,
    width: 1,
  });
  drawText(ops, "Associação Alemã de Juiz de Fora", MARGIN_X, FOOTER_TOP, {
    color: COLORS.muted,
    font: "bold",
    size: 8.5,
  });
  drawText(ops, "Documento interno - contém dados pessoais.", 210, FOOTER_TOP, {
    color: COLORS.warning,
    size: 8.5,
  });
  drawText(
    ops,
    `Página ${pageNumber} de ${totalPages} · ${exportedAt}`,
    PAGE_WIDTH - 180,
    FOOTER_TOP,
    {
      color: COLORS.muted,
      size: 8.5,
    },
  );
}

function drawAssociateCard(
  ops: PdfOp[],
  card: AssociateCardChunk,
  top: number,
  height: number,
) {
  const left = MARGIN_X;
  const width = CONTENT_WIDTH;
  const bottom = top - height;
  const innerLeft = left + CARD_INNER_PADDING;
  const innerRight = left + width - CARD_INNER_PADDING;
  let currentY = top - CARD_INNER_PADDING;

  drawRoundedRect(ops, left, bottom, width, height, 14, {
    fill: COLORS.cardBg,
    stroke: COLORS.border,
    strokeWidth: 1,
  });

  if (card.isContinuation) {
    drawText(
      ops,
      `Dependentes de ${card.associate.name} (continuação)`,
      innerLeft,
      currentY,
      {
        color: COLORS.ink,
        font: "bold",
        size: 13,
      },
    );
    currentY -= 26;
  } else {
    drawText(ops, card.associate.name, innerLeft, currentY, {
      color: COLORS.ink,
      font: "bold",
      size: 16,
    });
    drawBadge(
      ops,
      innerRight - 150,
      currentY - 12,
      70,
      20,
      humanizeStatus(card.associate.status),
      getStatusBadge(card.associate.status),
    );
    drawBadge(
      ops,
      innerRight - 72,
      currentY - 12,
      72,
      20,
      card.associate.category || "Sem categoria",
      {
        fill: COLORS.tableHeader,
        text: COLORS.ink,
      },
    );

    currentY -= 22;
    drawText(
      ops,
      `Matrícula ${card.associate.membershipNumber}`,
      innerLeft,
      currentY,
      {
        color: COLORS.muted,
        font: "bold",
        size: 10,
      },
    );
    currentY -= 18;

    const columnGap = 24;
    const columnWidth = (width - CARD_INNER_PADDING * 2 - columnGap) / 2;

    const leftColumn = [
      ["Email", card.associate.email || "Não informado"],
      ["CPF", card.associate.cpf || "Não informado"],
      ["Nascimento", formatDate(card.associate.birthDate)],
    ] as const;
    const rightColumn = [
      ["Telefone", card.associate.phone || "Não informado"],
      ["RG", card.associate.rg || "Não informado"],
      ["Nacionalidade", card.associate.nationality || "Não informada"],
    ] as const;

    let leftY = currentY;
    let rightY = currentY;

    for (const [label, value] of leftColumn) {
      leftY = drawInfoBlock(ops, innerLeft, leftY, columnWidth, label, value);
    }

    for (const [label, value] of rightColumn) {
      rightY = drawInfoBlock(
        ops,
        innerLeft + columnWidth + columnGap,
        rightY,
        columnWidth,
        label,
        value,
      );
    }

    currentY = Math.min(leftY, rightY) - 8;
    currentY = drawInfoBlock(
      ops,
      innerLeft,
      currentY,
      width - CARD_INNER_PADDING * 2,
      "Endereço",
      joinAddress(card.associate),
    );

    if (card.associate.observation) {
      currentY = drawInfoBlock(
        ops,
        innerLeft,
        currentY - 6,
        width - CARD_INNER_PADDING * 2,
        "Observação",
        card.associate.observation,
      );
    }

    currentY -= 2;
  }

  drawText(ops, "Dependentes", innerLeft, currentY, {
    color: COLORS.ink,
    font: "bold",
    size: 11.5,
  });
  currentY -= 18;

  if (!card.dependents.length && !card.hasMoreDependents) {
    drawText(ops, "Nenhum dependente cadastrado.", innerLeft, currentY, {
      color: COLORS.muted,
      size: 10,
    });
    return;
  }

  const tableX = innerLeft;
  const tableWidth = width - CARD_INNER_PADDING * 2;
  const columns = [
    { key: "membership", label: "Matrícula", width: 52 },
    { key: "name", label: "Nome", width: 112 },
    { key: "category", label: "Categoria", width: 60 },
    { key: "cpf", label: "CPF", width: 68 },
    { key: "rg", label: "RG", width: 48 },
    { key: "birth", label: "Nascimento", width: 60 },
    { key: "nationality", label: "Nacionalidade", width: tableWidth - 400 },
  ] as const;

  drawRoundedRect(ops, tableX, currentY - TABLE_HEADER_HEIGHT, tableWidth, TABLE_HEADER_HEIGHT, 8, {
    fill: COLORS.tableHeader,
    stroke: COLORS.border,
    strokeWidth: 1,
  });

  let cursorX = tableX + 8;
  for (const column of columns) {
    drawText(ops, column.label, cursorX, currentY - 13, {
      color: COLORS.muted,
      font: "bold",
      size: 8.5,
    });
    cursorX += column.width;
  }

  let rowTop = currentY - TABLE_HEADER_HEIGHT;
  for (const dependent of card.dependents) {
    drawLine(ops, tableX, rowTop - TABLE_ROW_HEIGHT, tableX + tableWidth, rowTop - TABLE_ROW_HEIGHT, {
      color: COLORS.border,
      width: 1,
    });

    const cells = [
      dependent.membershipNumber || "Pendente",
      truncateText(dependent.name, 26),
      truncateText(dependent.category || "Não definida", 14),
      dependent.cpf || "Não informado",
      dependent.rg || "Não informado",
      formatDate(dependent.birthDate),
      truncateText(dependent.nationality || "Não informada", 14),
    ];

    let cellX = tableX + 8;
    for (const [index, value] of cells.entries()) {
      drawText(ops, value, cellX, rowTop - 14, {
        color: COLORS.ink,
        size: 8.7,
      });
      cellX += columns[index]?.width ?? 0;
    }

    rowTop -= TABLE_ROW_HEIGHT;
  }

  if (card.hasMoreDependents) {
    drawText(
      ops,
      `Continua na próxima página (${card.endDependentIndexExclusive + 1}+).`,
      innerRight - 170,
      rowTop - 16,
      {
        color: COLORS.muted,
        size: 8.5,
      },
    );
  }
}

function paginateGroups(groups: AssociateGroup[]) {
  const pages: PageModel[] = [{ cards: [], isFirstPage: true }];
  let currentPage = pages[0];
  let remainingHeight = currentPage.isFirstPage
    ? FIRST_PAGE_CONTENT_TOP - BOTTOM_LIMIT
    : OTHER_PAGE_CONTENT_TOP - BOTTOM_LIMIT;

  for (const group of groups) {
    let dependentIndex = 0;
    let isContinuation = false;

    while (true) {
      const chunk = fitChunk(group, dependentIndex, isContinuation, remainingHeight);

      if (!chunk) {
        currentPage = { cards: [], isFirstPage: false };
        pages.push(currentPage);
        remainingHeight = OTHER_PAGE_CONTENT_TOP - BOTTOM_LIMIT;
        continue;
      }

      currentPage.cards.push(chunk);
      remainingHeight -= measureCardHeight(chunk) + CARD_GAP;

      if (chunk.endDependentIndexExclusive >= group.dependents.length) {
        break;
      }

      dependentIndex = chunk.endDependentIndexExclusive;
      isContinuation = true;
    }
  }

  return pages;
}

function fitChunk(
  group: AssociateGroup,
  dependentIndex: number,
  isContinuation: boolean,
  remainingHeight: number,
): AssociateCardChunk | null {
  const dependents = group.dependents;

  if (!dependents.length) {
    const candidate: AssociateCardChunk = {
      associate: group.associate,
      dependents: [],
      endDependentIndexExclusive: 0,
      hasMoreDependents: false,
      isContinuation,
      startDependentIndex: 0,
    };

    return measureCardHeight(candidate) <= remainingHeight ? candidate : null;
  }

  let endIndex = dependents.length;

  while (endIndex > dependentIndex) {
    const candidate: AssociateCardChunk = {
      associate: group.associate,
      dependents: dependents.slice(dependentIndex, endIndex),
      endDependentIndexExclusive: endIndex,
      hasMoreDependents: endIndex < dependents.length,
      isContinuation,
      startDependentIndex: dependentIndex,
    };

    if (measureCardHeight(candidate) <= remainingHeight) {
      return candidate;
    }

    endIndex -= 1;
  }

  return null;
}

function measureCardHeight(card: AssociateCardChunk) {
  let height = CARD_INNER_PADDING * 2;

  if (card.isContinuation) {
    height += 32;
  } else {
    height += 24; // nome
    height += 18; // matrícula
    height += 12; // espaço
    height += measureInfoBlockHeight("Email", card.associate.email || "Não informado", 214);
    height += 8;
    height += measureInfoBlockHeight("Telefone", card.associate.phone || "Não informado", 214);
    height += 8;
    height += measureInfoBlockHeight("CPF", card.associate.cpf || "Não informado", 214);
    height += 8;
    height += measureInfoBlockHeight("RG", card.associate.rg || "Não informado", 214);
    height += 8;
    height += measureInfoBlockHeight(
      "Nascimento",
      formatDate(card.associate.birthDate),
      214,
    );
    height += 8;
    height += measureInfoBlockHeight(
      "Nacionalidade",
      card.associate.nationality || "Não informada",
      214,
    );
    height += 10;
    height += measureInfoBlockHeight("Endereço", joinAddress(card.associate), 460);
    if (card.associate.observation) {
      height += 8;
      height += measureInfoBlockHeight("Observação", card.associate.observation, 460);
    }
    height += 8;
  }

  height += 18; // título dependentes
  if (!card.dependents.length && !card.hasMoreDependents) {
    height += 20;
    return height;
  }

  height += TABLE_HEADER_HEIGHT;
  height += card.dependents.length * TABLE_ROW_HEIGHT;
  if (card.hasMoreDependents) {
    height += 18;
  }

  return height;
}

function drawInfoBlock(
  ops: PdfOp[],
  x: number,
  top: number,
  width: number,
  label: string,
  value: string,
) {
  drawText(ops, label, x, top, {
    color: COLORS.muted,
    font: "bold",
    size: 8.3,
  });

  const lines = wrapText(value, width, 10.4);
  let currentY = top - 14;

  for (const line of lines) {
    drawText(ops, line, x, currentY, {
      color: COLORS.ink,
      size: 10.4,
    });
    currentY -= 13;
  }

  return currentY;
}

function measureInfoBlockHeight(label: string, value: string, width: number) {
  const labelHeight = 12;
  const lines = wrapText(value, width, 10.4);
  return labelHeight + lines.length * 13;
}

function drawBadge(
  ops: PdfOp[],
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  colors: { fill: readonly [number, number, number]; text: readonly [number, number, number] },
) {
  drawRoundedRect(ops, x, y, width, height, 10, {
    fill: colors.fill,
    stroke: colors.fill,
    strokeWidth: 1,
  });
  drawText(ops, truncateText(text, 18), x + 10, y + 6.5, {
    color: colors.text,
    font: "bold",
    size: 8.4,
  });
}

function drawRoundedRect(
  ops: PdfOp[],
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  options: {
    fill?: readonly [number, number, number];
    stroke?: readonly [number, number, number];
    strokeWidth?: number;
  },
) {
  const k = 0.5522847498;
  const right = x + width;
  const top = y + height;
  const c = radius * k;

  if (options.fill) {
    ops.push(`${options.fill[0]} ${options.fill[1]} ${options.fill[2]} rg`);
  }
  if (options.stroke) {
    ops.push(`${options.stroke[0]} ${options.stroke[1]} ${options.stroke[2]} RG`);
  }
  if (options.strokeWidth) {
    ops.push(`${options.strokeWidth} w`);
  }

  ops.push(
    `${x + radius} ${y} m`,
    `${right - radius} ${y} l`,
    `${right - radius + c} ${y} ${right} ${y + radius - c} ${right} ${y + radius} c`,
    `${right} ${top - radius} l`,
    `${right} ${top - radius + c} ${right - radius + c} ${top} ${right - radius} ${top} c`,
    `${x + radius} ${top} l`,
    `${x + radius - c} ${top} ${x} ${top - radius + c} ${x} ${top - radius} c`,
    `${x} ${y + radius} l`,
    `${x} ${y + radius - c} ${x + radius - c} ${y} ${x + radius} ${y} c`,
    options.fill && options.stroke ? "B" : options.fill ? "f" : "S",
  );
}

function drawCircle(
  ops: PdfOp[],
  centerX: number,
  centerY: number,
  radius: number,
  options: {
    fill?: readonly [number, number, number];
    stroke?: readonly [number, number, number];
  },
) {
  drawRoundedRect(ops, centerX - radius, centerY - radius, radius * 2, radius * 2, radius, {
    fill: options.fill,
    stroke: options.stroke,
    strokeWidth: 1,
  });
}

function drawLine(
  ops: PdfOp[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: { color: readonly [number, number, number]; width: number },
) {
  ops.push(
    `${options.color[0]} ${options.color[1]} ${options.color[2]} RG`,
    `${options.width} w`,
    `${x1} ${y1} m`,
    `${x2} ${y2} l`,
    "S",
  );
}

function drawText(
  ops: PdfOp[],
  text: string,
  x: number,
  y: number,
  options: {
    color: readonly [number, number, number];
    font?: FontKey;
    size: number;
  },
) {
  const fontName = options.font === "bold" ? "F2" : "F1";
  ops.push(
    "BT",
    `${options.color[0]} ${options.color[1]} ${options.color[2]} rg`,
    `/${fontName} ${options.size} Tf`,
    `${x} ${y} Td`,
    `(${escapePdfText(text)}) Tj`,
    "ET",
  );
}

function drawTextRight(
  ops: PdfOp[],
  text: string,
  rightX: number,
  y: number,
  options: {
    color: readonly [number, number, number];
    font?: FontKey;
    size: number;
  },
) {
  const width = estimateTextWidth(text, options.size, options.font === "bold");
  drawText(ops, text, rightX - width, y, options);
}

function groupRows(rows: AdminAssociateExportRow[]) {
  const groups: AssociateGroup[] = [];
  let currentGroup: AssociateGroup | null = null;

  for (const row of rows) {
    if (row.type === "associado") {
      currentGroup = { associate: row, dependents: [] };
      groups.push(currentGroup);
      continue;
    }

    if (currentGroup) {
      currentGroup.dependents.push(row);
    }
  }

  return groups;
}

function joinAddress(row: AdminAssociateExportRow) {
  const parts = [
    row.addressStreet,
    row.addressNumber,
    row.addressComplement,
    row.addressNeighborhood,
    row.addressCity,
    row.addressState,
    row.zipCode,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "Não informado";
}

function humanizeStatus(status: AdminAssociateExportRow["status"]) {
  if (status === "active") return "Ativo";
  if (status === "inactive") return "Inativo";
  return "Suspenso";
}

function getStatusBadge(status: AdminAssociateExportRow["status"]) {
  if (status === "active") {
    return {
      fill: COLORS.greenBadge,
      text: COLORS.greenText,
    };
  }

  return {
    fill: COLORS.dangerBadge,
    text: COLORS.dangerText,
  };
}

function wrapText(text: string, width: number, fontSize: number) {
  const maxChars = Math.max(18, Math.floor(width / (fontSize * 0.53)));

  if (!text.trim() || text.length <= maxChars) {
    return [text];
  }

  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function estimateTextWidth(text: string, fontSize: number, bold = false) {
  const factor = bold ? 0.57 : 0.52;
  return text.length * fontSize * factor;
}

function formatDate(value: string) {
  if (!value) {
    return "Não informada";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function encodeLatin1(value: string) {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }

  return bytes;
}

function latin1ByteLength(value: string) {
  return encodeLatin1(value).length;
}
