import {
  getSiteUrl,
  getSupabaseConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

const originalEnv = process.env;

describe("supabase config", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("identifica quando Supabase nao esta configurado", () => {
    expect(getSupabaseConfig()).toBeNull();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("retorna configuracao quando URL e chave publica existem", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";

    expect(getSupabaseConfig()).toEqual({
      publishableKey: "publishable-key",
      url: "https://example.supabase.co",
    });
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("resolve URL publica do site com fallback local", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");

    process.env.VERCEL_URL = "example.vercel.app";
    expect(getSiteUrl()).toBe("https://example.vercel.app");

    process.env.NEXT_PUBLIC_SITE_URL = "https://associacao.example";
    expect(getSiteUrl()).toBe("https://associacao.example");
  });
});
