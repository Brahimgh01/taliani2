import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Lang, localizedField } from "@/lib/i18n";
import { Instagram, Music2, Facebook, Youtube, Twitter } from "lucide-react";

const ICONS: Record<string, any> = {
  instagram: Instagram,
  tiktok: Music2,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
};

export function Footer() {
  const { t, lang, setLang } = useI18n();
  const [socials, setSocials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase.from("social_links").select("*").eq("visible", true).order("sort_order").then(({ data }) => setSocials(data || []));
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => setSettings(data));
  }, []);

  const langs: Lang[] = ["en", "fr", "ar"];
  const tagline = settings ? localizedField(settings, "tagline", lang) : t("footer.tagline");
  const footerLine = settings ? localizedField(settings, "footer", lang) : `© Taliani. ${t("footer.rights")}`;

  return (
    <footer className="bg-ink text-paper mt-24">
      {/* marquee */}
      <div className="overflow-hidden border-b border-paper/15 py-6">
        <div className="flex gap-12 animate-marquee whitespace-nowrap text-display text-5xl md:text-7xl">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              {tagline} <span className="opacity-30">●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <div className="text-display text-3xl">TALIANI</div>
          <p className="text-sm mt-3 opacity-70 max-w-xs">{tagline}</p>
        </div>

        <div>
          <div className="text-eyebrow opacity-50 mb-4">{t("footer.menu")}</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:opacity-60">{t("nav.shop")}</Link></li>
            <li><Link to="/about" className="hover:opacity-60">{t("nav.about")}</Link></li>
            <li><Link to="/contact" className="hover:opacity-60">{t("nav.contact")}</Link></li>
            <li><Link to="/cart" className="hover:opacity-60">{t("nav.cart")}</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-eyebrow opacity-50 mb-4">Social</div>
          <ul className="space-y-2 text-sm">
            {socials.map((s) => {
              const Icon = ICONS[s.platform.toLowerCase()] || Instagram;
              return (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60">
                    <Icon className="w-4 h-4" /> <span className="capitalize">{s.platform}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="text-eyebrow opacity-50 mb-4">{t("footer.lang")}</div>
          <div className="flex gap-3 text-sm">
            {langs.map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`uppercase ${lang === l ? "opacity-100" : "opacity-40 hover:opacity-80"}`}>
                {l === "ar" ? "TN" : l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-paper/15 px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between text-eyebrow opacity-60 gap-2">
        <span>{footerLine}</span>
        <span>MMXXVI — Tunis</span>
      </div>
    </footer>
  );
}
