import { render, screen } from "@testing-library/react";
import EntrarPage from "@/app/entrar/page";

vi.mock("@/lib/supabase/server", () => ({
  getCurrentUser: vi.fn(async () => null),
}));

vi.mock("@/lib/supabase/config", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/supabase/config")>();

  return {
    ...actual,
    isSupabaseConfigured: vi.fn(() => false),
  };
});

describe("Entrar page", () => {
  it("renderiza login e aviso quando Supabase nao esta configurado", async () => {
    render(await EntrarPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("heading", {
        name: /Entre com Google ou email e senha\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Supabase ainda não está configurado/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Entrar com Google/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Entrar com email e senha/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("link", { name: /Esqueci minha senha/i }),
    ).toHaveAttribute("href", "/recuperar-senha");
  });
});
