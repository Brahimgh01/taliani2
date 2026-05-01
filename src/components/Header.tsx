import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const langs: Lang[] = ["en", "fr", "ar"];

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"}`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 h-16 md:h-20">
          <button onClick={() => setOpen(true)} className="text-eyebrow flex items-center gap-2 hover:opacity-60 transition-opacity">
            <Menu className="w-4 h-4" /> Menu
          </button>

          <Link to="/" className="text-display text-2xl md:text-3xl tracking-tight">TALIANI</Link>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 text-eyebrow">
              {langs.map((l, i) => (
                <span key={l} className="flex items-center gap-2">
                  <button
                    onClick={() => setLang(l)}
                    className={`uppercase transition-opacity ${lang === l ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
                  >
                    {l === "ar" ? "TN" : l}
                  </button>
                  {i < langs.length - 1 && <span className="opacity-30">/</span>}
                </span>
              ))}
            </div>
            <Link to="/cart" className="text-eyebrow hover:opacity-60 transition-opacity">
              {t("nav.cart")} ({String(count).padStart(2, "0")})
            </Link>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[60] bg-ink text-paper"
          >
            <div className="flex items-center justify-between px-6 md:px-10 h-16 md:h-20">
              <span className="text-eyebrow opacity-60">Menu</span>
              <button onClick={() => setOpen(false)} className="text-eyebrow flex items-center gap-2">
                <X className="w-4 h-4" /> Close
              </button>
            </div>
            <nav className="px-6 md:px-10 mt-16 md:mt-24 flex flex-col gap-4 md:gap-6">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: t("nav.shop") },
                { to: "/about", label: t("nav.about") },
                { to: "/contact", label: t("nav.contact") },
                { to: "/cart", label: t("nav.cart") },
              ].map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="text-display text-6xl md:text-8xl block hover:opacity-50 transition-opacity"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="absolute bottom-8 left-6 right-6 md:left-10 md:right-10 flex items-center justify-between text-eyebrow opacity-60">
              <span>© Taliani MMXXVI</span>
              <div className="flex gap-3">
                {langs.map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={lang === l ? "opacity-100" : "opacity-40"}>
                    {l === "ar" ? "TN" : l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
