import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { useI18n, localizedField } from "@/lib/i18n";
import { useCart, formatTND } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const { add } = useCart();
  const nav = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [size, setSize] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").eq("slug", slug).eq("visible", true).maybeSingle().then(({ data }) => {
      setProduct(data);
      setSize(data?.sizes?.[0] || "");
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <SiteShell><div className="min-h-screen" /></SiteShell>;
  if (!product) return <SiteShell><div className="px-6 pt-40 min-h-screen"><h1 className="text-display text-5xl">Not found</h1><Link to="/shop" className="text-eyebrow underline mt-4 inline-block">Back to shop</Link></div></SiteShell>;

  const name = localizedField(product, "name", lang);
  const desc = localizedField(product, "description", lang);

  const handleAdd = () => {
    if (!size) return;
    add({
      productId: product.id,
      name,
      price: Number(product.price),
      size,
      image: product.images?.[0] || "",
    });
    toast.success(t("product.added"));
  };

  return (
    <SiteShell>
      <section className="pt-24 md:pt-28 grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="bg-muted">
          {(product.images || []).map((img: string, i: number) => (
            <motion.img
              key={i}
              src={img}
              alt={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="w-full aspect-[4/5] object-cover"
            />
          ))}
        </div>

        <div className="md:sticky md:top-24 md:self-start px-6 md:px-12 py-12 md:py-16">
          <Link to="/shop" className="text-eyebrow opacity-60 hover:opacity-100">← {t("nav.shop")}</Link>
          <h1 className="text-display text-5xl md:text-6xl mt-6">{name}</h1>
          <div className="mt-3 text-eyebrow opacity-60">{product.category}</div>
          <div className="text-2xl mt-6 tabular-nums">{formatTND(Number(product.price))}</div>

          {desc && (
            <p className="mt-8 opacity-80 leading-relaxed max-w-md">{desc}</p>
          )}

          <div className="mt-10">
            <div className="text-eyebrow opacity-60 mb-3">{t("product.size")}</div>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || []).map((s: string) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-5 py-3 border text-sm transition-colors ${size === s ? "bg-ink text-paper border-ink" : "border-border hover:border-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!size}
            className="mt-10 w-full bg-ink text-paper py-5 text-eyebrow hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {t("product.add")}
          </button>

          <button
            onClick={() => { handleAdd(); setTimeout(() => nav({ to: "/cart" }), 300); }}
            disabled={!size}
            className="mt-3 w-full border border-foreground py-5 text-eyebrow hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
          >
            {t("cart.checkout")} →
          </button>
        </div>
      </section>
    </SiteShell>
  );
}
