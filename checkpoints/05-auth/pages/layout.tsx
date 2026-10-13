import type { ReactNode } from "react";
import "../styles/app.css";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}

