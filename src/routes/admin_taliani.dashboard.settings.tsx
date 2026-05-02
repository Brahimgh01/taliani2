import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin_taliani/dashboard/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const [s, setS] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).single().then(({ data }) => setS(data));
  }, []);

  const save = async () => {
    setSaving(true);
    const { id, updated_at, ...payload } = s;
    const { error } = await supabase.from("site_settings").update(payload).eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Saved");
  };

  if (!s) return <div className="opacity-60">Loading…</div>;

  const fields: [string, string][] = [
    ["brand_name", "Brand name"],
    ["tagline_en", "Tagline (EN)"],
    ["tagline_fr", "Tagline (FR)"],
    ["tagline_ar", "Tagline (AR)"],
    ["footer_en", "Footer line (EN)"],
    ["footer_fr", "Footer line (FR)"],
    ["footer_ar", "Footer line (AR)"],
    ["contact_email", "Contact email"],
    ["contact_phone", "Contact phone"],
    ["whatsapp_number", "WhatsApp number (digits, e.g. 21670000000)"],
  ];

  return (
    <div>
      <h1 className="text-display text-4xl mb-8">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {fields.map(([k, l]) => (
          <div key={k}>
            <label className="text-eyebrow opacity-60 block mb-1">{l}</label>
            <input value={s[k] || ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} className="w-full border border-border px-3 py-2 bg-transparent" />
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving} className="mt-8 bg-ink text-paper px-8 py-4 text-eyebrow disabled:opacity-50">{saving ? "Saving…" : "Save settings"}</button>
    </div>
  );
}
