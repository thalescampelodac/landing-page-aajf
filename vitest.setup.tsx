import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      src: string;
      alt: string;
      fill?: boolean;
      priority?: boolean;
    },
  ) => {
    const { alt, src, fill, priority, ...imgProps } = props;

    void fill;
    void priority;

    // Keep the mock tiny: tests only need accessible rendering, not image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} {...imgProps} />;
  },
}));
