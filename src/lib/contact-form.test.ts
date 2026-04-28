import { buildContactMailto } from "@/lib/contact-form";
import { siteConfig } from "@/lib/site-content";

describe("buildContactMailto", () => {
  it("monta a URL mailto com assunto e corpo preenchidos", () => {
    const mailto = buildContactMailto({
      name: "Maria",
      email: "maria@example.com",
      subject: "Quero participar",
      message: "Tenho interesse nas atividades.",
    });

    const url = new URL(mailto);

    expect(mailto.startsWith(`mailto:${siteConfig.email}`)).toBe(true);
    expect(url.searchParams.get("subject")).toBe("Quero participar");
    expect(url.searchParams.get("body")).toContain("Nome: Maria");
    expect(url.searchParams.get("body")).toContain(
      "Email: maria@example.com",
    );
    expect(url.searchParams.get("body")).toContain("Mensagem:");
    expect(url.searchParams.get("body")).toContain(
      "Tenho interesse nas atividades.",
    );
  });

  it("usa o assunto padrao quando nenhum assunto e informado", () => {
    const mailto = buildContactMailto({
      name: "Joao",
      email: "joao@example.com",
      subject: "",
      message: "Ola",
    });

    const url = new URL(mailto);

    expect(url.searchParams.get("subject")).toBe(
      `Contato pelo site - ${siteConfig.name}`,
    );
  });
});
