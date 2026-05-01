import { useState, type ReactNode } from "react";
import { Preloader } from "./Preloader";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteShell({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Preloader onDone={() => setLoaded(true)} />
      <Header />
      <main className={loaded ? "" : "opacity-0"}>{children}</main>
      <Footer />
    </>
  );
}
