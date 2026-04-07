import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Associacao Alema de Juiz de Fora",
  description:
    "Nova landing page institucional da Associacao Cultural e Recreativa Brasil-Alemanha, em Juiz de Fora/MG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
