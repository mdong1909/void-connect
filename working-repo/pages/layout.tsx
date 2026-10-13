import type { ReactNode } from "react";
import "../styles/app.css";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Live Q&A Queue</title>
      </head>
      <body>{children}</body>
    </html>
  );
}

