"use client";

import { FormEvent, useState } from "react";
import { buildContactMailto } from "@/lib/contact-form";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    window.location.assign(
      buildContactMailto({ name, email, subject, message }),
    );
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span>Nome</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
          />
        </label>

        <label className="form-field">
          <span>Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@email.com"
          />
        </label>
      </div>

      <label className="form-field">
        <span>Assunto</span>
        <input
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Como podemos ajudar?"
        />
      </label>

      <label className="form-field">
        <span>Mensagem</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Escreva sua mensagem"
        />
      </label>

      <button className="primary-button w-full sm:w-fit" type="submit">
        Enviar para o email oficial
      </button>
    </form>
  );
}
