import { fireEvent, render, screen } from "@testing-library/react";
import { ContactForm } from "@/components/contact-form";

describe("ContactForm", () => {
  it("redireciona para o mailto ao enviar o formulario", () => {
    const originalAssign = window.location.assign;
    const assignMock = vi.fn();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        assign: assignMock,
      },
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Assunto"), {
      target: { value: "Visita cultural" },
    });
    fireEvent.change(screen.getByLabelText("Mensagem"), {
      target: { value: "Gostaria de saber sobre os encontros." },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Enviar para o email oficial" }),
    );

    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock.mock.calls[0][0]).toContain("Visita+cultural");
    expect(assignMock.mock.calls[0][0]).toContain("Ana");

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        assign: originalAssign,
      },
    });
  });
});
