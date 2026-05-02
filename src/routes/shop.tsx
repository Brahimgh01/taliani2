import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { ProductCard } from "@/components/ProductCard";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Taliani" },
      { name: "description", content: "Discover the Taliani collection. Premium garments, editorial pieces." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { t } = useI18n();
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase.from("products").select("*").eq("visible", true).order("sort_order").then(({ data }) => setProducts(data || []));
  }, []);

  const filtered = useMemo(() => filter === "all" ? products : products.filter(p => p.category === filter), [products, filter]);
  const filters = [
    { v: "all", l: t("shop.filter.all") },
    { v: "tops", l: t("shop.filter.tops") },
    { v: "outerwear", l: t("shop.filter.outerwear") },
    { v: "bottoms", l: t("shop.filter.bottoms") },
  ];

  return (
    <SiteShell>
      <section className="px-6 md:px-10 pt-32 md:pt-40 pb-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
          <div className="text-eyebrow opacity-60 mb-6">— SS / MMXXVI</div>
          <h1 className="text-display text-6xl md:text-9xl">{t("shop.title")}</h1>
        </motion.div>

        <div className="mt-12 md:mt-16 flex flex-wrap gap-x-8 gap-y-3 border-b border-border pb-6">
          {filters.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`text-eyebrow transition-opacity ${filter === f.v ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
            >
              {f.l} {filter === f.v && <span className="ml-2 opacity-60">{filtered.length}</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 pb-24">
        {filtered.length === 0 ? (
          <p className="opacity-60 py-24 text-center">{t("shop.empty")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
