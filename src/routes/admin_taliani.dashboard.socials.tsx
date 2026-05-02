import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin_taliani/dashboard/socials")({
  component: SocialsAdmin,
});

function SocialsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ platform: "instagram", url: "", sort_order: 0 });

  const load = async () => {
    const { data } = await supabase.from("social_links").select("*").order("sort_order");
    setList(data || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.url) { toast.error("URL required"); return; }
    const { error } = await supabase.from("social_links").insert({ ...form, visible: true, sort_order: Number(form.sort_order) });
    if (error) toast.error(error.message); else { toast.success("Added"); setForm({ platform: "instagram", url: "", sort_order: 0 }); load(); }
  };
  const toggle = async (id: string, v: boolean) => { await supabase.from("social_links").update({ visible: !v }).eq("id", id); load(); };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("social_links").delete().eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-display text-4xl mb-8">Social links</h1>

      <div className="border border-border p-6 mb-10 grid grid-cols-1 md:grid-cols-[200px_1fr_120px_auto] gap-3 items-end">
        <div>
          <label className="text-eyebrow opacity-60 block mb-1">Platform</label>
          <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full border border-border px-3 py-2 bg-transparent">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>
        <div><label className="text-eyebrow opacity-60 block mb-1">URL</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border border-border px-3 py-2 bg-transparent" placeholder="https://..." /></div>
        <div><label className="text-eyebrow opacity-60 block mb-1">Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full border border-border px-3 py-2 bg-transparent" /></div>
        <button onClick={create} className="bg-ink text-paper px-5 py-2.5 text-eyebrow flex items-center gap-2"><Plus className="w-3 h-3" /> Add</button>
      </div>

      <div className="border border-border">
        {list.map((s) => (
          <div key={s.id} className="grid grid-cols-[150px_1fr_auto_auto] gap-4 p-4 border-b border-border last:border-b-0 items-center">
            <div className="capitalize">{s.platform}</div>
            <a href={s.url} target="_blank" rel="noreferrer" className="text-sm opacity-70 truncate hover:opacity-100">{s.url}</a>
            <button onClick={() => toggle(s.id, s.visible)} className={`text-eyebrow border px-3 py-1 ${s.visible ? "border-foreground" : "border-border opacity-50"}`}>{s.visible ? "Visible" : "Hidden"}</button>
            <button onClick={() => remove(s.id)} className="text-eyebrow border border-border px-3 py-2 hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
