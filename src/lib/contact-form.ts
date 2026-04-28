import { siteConfig } from "@/lib/site-content";

type ContactMailtoArgs = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function buildContactMailto({
  name,
  email,
  subject,
  message,
}: ContactMailtoArgs) {
  const mailto = new URL(`mailto:${siteConfig.email}`);

  mailto.searchParams.set(
    "subject",
    subject || `Contato pelo site - ${siteConfig.name}`,
  );
  mailto.searchParams.set(
    "body",
    [`Nome: ${name}`, `Email: ${email}`, "", "Mensagem:", message].join("\n"),
  );

  return mailto.toString();
}
