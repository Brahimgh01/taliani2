import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { useCart, formatTND } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { t } = useI18n();
  const { items, remove, setQty, subtotal, clear } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [whatsapp, setWhatsapp] = useState<string>("");

  useEffect(() => {
    supabase.from("site_settings").select("whatsapp_number").eq("id", 1).single().then(({ data }) => setWhatsapp(data?.whatsapp_number || ""));
  }, []);

  const applyCode = async () => {
    if (!code) return;
    const c = code.toUpperCase().trim();
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("code", c)
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    if (error) return alert(error.message);
    if (!data) return alert("Promo not found or inactive");
    // check date range
    const now = new Date();
    if (data.starts_at && new Date(data.starts_at) > now) return alert("Promo not started yet");
    if (data.ends_at && new Date(data.ends_at) <= now) return alert("Promo expired");
    // check usage limit if present
    if (data.usage_limit && data.usage_count >= data.usage_limit) return alert("Promo usage limit reached");
    setApplied(data);
    const amt = Math.round((subtotal * (data.percent_off / 100)) * 100) / 100;
    setDiscountAmount(amt);
    alert(`Applied ${data.code} — ${data.percent_off}% off`);
  };

  const clearCode = () => { setApplied(null); setCode(""); setDiscountAmount(0); };

  const handleCheckout = async () => {
    // attempt to increment usage_count for applied promo (may fail due to RLS)
    if (applied) {
      try {
        await supabase.from("promotions").update({ usage_count: (applied.usage_count || 0) + 1 }).eq("id", applied.id);
      } catch (e) {
        // ignore — likely prevented by RLS; it's informational only
      }
    }

    const lines = items.map(i => `• ${i.name} — ${i.size} × ${i.qty} (${formatTND(i.price * i.qty)})`).join("\n");
    const total = subtotal - discountAmount;
    const promoLine = applied ? `\nPromo: ${applied.code} — -${formatTND(discountAmount)}\n` : "";
    const msg = `Bonjour Taliani,\n\nJe souhaite commander :\n\n${lines}\n\nTotal : ${formatTND(subtotal)}${promoLine}À payer : ${formatTND(total)}\n\nMerci.`;
    const url = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <SiteShell>
      <section className="px-6 md:px-10 pt-32 md:pt-40 pb-24 min-h-screen">
        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-display text-6xl md:text-8xl mb-12">
          {t("cart.title")}
        </motion.h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="opacity-60 mb-8">{t("cart.empty")}</p>
            <Link to="/shop" className="text-eyebrow border-b border-foreground pb-1">{t("cart.continue")} →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            <div className="border-t border-border">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[100px_1fr_auto] gap-6 py-6 border-b border-border items-center">
                  <img src={item.image} alt={item.name} className="w-full aspect-[4/5] object-cover bg-muted" />
                  <div>
                    <div className="text-lg">{item.name}</div>
                    <div className="text-eyebrow opacity-60 mt-1">{t("product.size")}: {item.size}</div>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => setQty(item.id, item.qty - 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm tabular-nums w-6 text-center">{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} className="w-7 h-7 border border-border flex items-center justify-center hover:bg-muted"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums">{formatTND(item.price * item.qty)}</div>
                    <button onClick={() => remove(item.id)} className="text-eyebrow opacity-50 hover:opacity-100 mt-3 inline-flex items-center gap-1"><X className="w-3 h-3" /> {t("cart.remove")}</button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start bg-paper p-8 border border-border">
              <div className="text-eyebrow opacity-60 mb-4">Récapitulatif</div>
              <div className="flex justify-between text-2xl mb-4">
                <span>{t("cart.subtotal")}</span>
                <span className="tabular-nums">{formatTND(subtotal)}</span>
              </div>

              <div className="mb-4">
                <label className="text-eyebrow opacity-60 block mb-2">Promo code</label>
                {!applied ? (
                  <div className="flex gap-2">
                    <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-border px-3 py-2 bg-transparent" />
                    <button onClick={applyCode} className="px-4 py-2 border border-border">Apply</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono">{applied.code}</div>
                      <div className="text-sm opacity-70">{applied.percent_off}% off</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={clearCode} className="text-eyebrow border border-border px-3 py-1">Remove</button>
                    </div>
                  </div>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-lg mb-6">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatTND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl mb-8">
                <span>Total</span>
                <span className="tabular-nums">{formatTND(Math.max(0, subtotal - discountAmount))}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-ink text-paper py-5 text-eyebrow hover:opacity-80 transition-opacity">
                {t("cart.checkout")} →
              </button>
              <button onClick={clear} className="mt-4 w-full text-eyebrow opacity-50 hover:opacity-100">Clear bag</button>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
