import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin_taliani/dashboard/promotions")({
  component: PromosAdmin,
});

function PromosAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", percent_off: 10, description: "", active: true });

  const load = async () => {
    const { data } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
    setList(data || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code) { toast.error("Code required"); return; }
    const { error } = await supabase.from("promotions").insert({ ...form, percent_off: Number(form.percent_off) });
    if (error) toast.error(error.message); else { toast.success("Created"); setForm({ code: "", percent_off: 10, description: "", active: true }); load(); }
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("promotions").update({ active: !active }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("promotions").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="text-display text-4xl mb-8">Promotions</h1>

      <div className="border border-border p-6 mb-10 grid grid-cols-1 md:grid-cols-[1fr_120px_2fr_auto] gap-3 items-end">
        <div><label className="text-eyebrow opacity-60 block mb-1">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border border-border px-3 py-2 bg-transparent" /></div>
        <div><label className="text-eyebrow opacity-60 block mb-1">% off</label><input type="number" value={form.percent_off} onChange={(e) => setForm({ ...form, percent_off: Number(e.target.value) })} className="w-full border border-border px-3 py-2 bg-transparent" /></div>
        <div><label className="text-eyebrow opacity-60 block mb-1">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border px-3 py-2 bg-transparent" /></div>
        <button onClick={create} className="bg-ink text-paper px-5 py-2.5 text-eyebrow flex items-center gap-2"><Plus className="w-3 h-3" /> Add</button>
      </div>

      <div className="border border-border">
        {list.map((p) => (
          <div key={p.id} className="grid grid-cols-[1fr_80px_1fr_auto_auto] gap-4 p-4 border-b border-border last:border-b-0 items-center">
            <div className="font-mono">{p.code}</div>
            <div className="tabular-nums">{p.percent_off}%</div>
            <div className="text-sm opacity-70">{p.description}</div>
            <button onClick={() => toggle(p.id, p.active)} className={`text-eyebrow border px-3 py-1 ${p.active ? "border-foreground" : "border-border opacity-50"}`}>{p.active ? "Active" : "Inactive"}</button>
            <button onClick={() => remove(p.id)} className="text-eyebrow border border-border px-3 py-2 hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
        {list.length === 0 && <div className="p-12 text-center opacity-60">No promotions.</div>}
      </div>
    </div>
  );
}
