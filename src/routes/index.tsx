import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/hero-main.jpg";
import storyImg from "@/assets/brand-story.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taliani — Carry the elegance." },
      { name: "description", content: "Premium clothing house from Tunis. Editorial garments designed with restraint." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  const [featured, setFeatured] = useState<any[]>([]);
  const [promo, setPromo] = useState<any>(null);

  useEffect(() => {
    supabase.from("products").select("*").eq("visible", true).eq("featured", true).order("sort_order").then(({ data }) => setFeatured(data || []));
    supabase.from("promotions").select("*").eq("active", true).limit(1).maybeSingle().then(({ data }) => setPromo(data));
  }, []);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <motion.img
          src={heroImg}
          alt="Taliani editorial"
          className="absolute inset-0 w-full h-full object-cover grayscale"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 pb-16 md:pb-24 text-paper">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-eyebrow opacity-80 mb-6"
          >
            {t("hero.eyebrow")}
          </motion.div>

          <h1 className="text-display text-[16vw] md:text-[10vw] leading-[0.88]">
            <span className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 1.5, duration: 1.0, ease: [0.76, 0, 0.24, 1] }}>
                {t("hero.title.1")}
              </motion.span>
            </span>
            <span className="block overflow-hidden italic">
              <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 1.7, duration: 1.0, ease: [0.76, 0, 0.24, 1] }}>
                {t("hero.title.2")}
              </motion.span>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <p className="max-w-md text-sm md:text-base opacity-85">{t("hero.subtitle")}</p>
            <Link to="/shop" className="text-eyebrow border-b border-paper pb-1 hover:opacity-70 transition-opacity self-start">
              {t("hero.cta")} →
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-6 right-6 text-eyebrow opacity-60 text-paper hidden md:block">
          Scroll ↓
        </div>
      </section>

      {/* FEATURED */}
      <section className="px-6 md:px-10 py-24 md:py-36">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <div className="text-eyebrow opacity-60 mb-4">{t("featured.eyebrow")} — 04</div>
            <h2 className="text-display text-5xl md:text-7xl">{t("featured.title")}</h2>
          </div>
          <Link to="/shop" className="text-eyebrow hidden md:inline-block border-b border-foreground pb-1 hover:opacity-60">
            {t("nav.shop")} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* STORY split */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        <div className="relative aspect-[4/5] md:aspect-auto overflow-hidden">
          <motion.img
            src={storyImg}
            alt="Atelier"
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="flex flex-col justify-center px-6 md:px-16 py-16">
          <div className="text-eyebrow opacity-60 mb-6">{t("story.eyebrow")}</div>
          <h2 className="text-display text-5xl md:text-7xl mb-8">{t("story.title")}</h2>
          <p className="max-w-md opacity-80 leading-relaxed">{t("story.body")}</p>
          <Link to="/about" className="text-eyebrow border-b border-foreground pb-1 mt-10 self-start hover:opacity-60">
            {t("story.cta")} →
          </Link>
        </div>
      </section>

      {/* PROMO */}
      {promo && (
        <section className="bg-ink text-paper px-6 md:px-10 py-24 md:py-32 text-center">
          <div className="text-eyebrow opacity-60 mb-6">Promotion</div>
          <h3 className="text-display text-5xl md:text-8xl">
            {promo.percent_off}% {t("promo.title").replace(/^\d+%\s*/, "")}
          </h3>
          <div className="text-eyebrow opacity-70 mt-8">
            Code <span className="opacity-100 border-b border-paper pb-1">{promo.code}</span>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
