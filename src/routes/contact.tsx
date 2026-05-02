import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { SiteShell } from "@/components/SiteShell";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Taliani" },
      { name: "description", content: "Get in touch with Taliani. Custom requests, collaborations, press." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().min(1).max(5000),
});

function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => setSettings(data));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_requests").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("contact.sent"));
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <SiteShell>
      <section className="px-6 md:px-10 pt-32 md:pt-44 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 min-h-[80vh]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="text-eyebrow opacity-60 mb-6">— Contact</div>
          <h1 className="text-display text-6xl md:text-8xl mb-8">{t("contact.title")}</h1>
          <p className="opacity-80 max-w-md mb-12">{t("contact.subtitle")}</p>

          {settings && (
            <div className="space-y-3 text-sm">
              {settings.contact_email && <div><span className="text-eyebrow opacity-60">Email — </span>{settings.contact_email}</div>}
              {settings.contact_phone && <div><span className="text-eyebrow opacity-60">Tél — </span>{settings.contact_phone}</div>}
              <div><span className="text-eyebrow opacity-60">Atelier — </span>Tunis, Tunisie</div>
            </div>
          )}
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          {[
            { k: "name", label: t("contact.name"), type: "text" },
            { k: "email", label: t("contact.email"), type: "email" },
            { k: "phone", label: t("contact.phone"), type: "tel" },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-eyebrow opacity-60 block mb-2">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.k]}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none py-3 text-base"
                required={f.k !== "phone"}
              />
            </div>
          ))}
          <div>
            <label className="text-eyebrow opacity-60 block mb-2">{t("contact.message")}</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none py-3 text-base resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="bg-ink text-paper py-5 text-eyebrow hover:opacity-80 transition-opacity disabled:opacity-50 self-start px-12"
          >
            {sending ? "..." : t("contact.send")} →
          </button>
        </motion.form>
      </section>
    </SiteShell>
  );
}
