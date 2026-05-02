import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Upload, X } from "lucide-react";

export const Route = createFileRoute("/admin_taliani/dashboard/products")({
  component: ProductsAdmin,
});

const empty = {
  slug: "", name_en: "", name_fr: "", name_ar: "",
  description_en: "", description_fr: "", description_ar: "",
  price: 0, compare_at_price: null as number | null, category: "tops",
  sizes: ["S", "M", "L", "XL"] as string[], images: [] as string[],
  stock: 10, visible: true, featured: false, sort_order: 0,
};

function ProductsAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    setList(data || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display text-4xl">Products</h1>
        <button onClick={() => setEditing({ ...empty })} className="bg-ink text-paper px-5 py-3 text-eyebrow flex items-center gap-2"><Plus className="w-4 h-4" /> New</button>
      </div>

      <div className="border border-border">
        {list.map((p) => (
          <div key={p.id} className="grid grid-cols-[80px_1fr_auto_auto_auto] gap-4 p-4 border-b border-border items-center last:border-b-0">
            <img src={p.images?.[0]} alt="" className="w-20 h-20 object-cover bg-muted" />
            <div>
              <div className="font-medium">{p.name_en}</div>
              <div className="text-eyebrow opacity-60">{p.slug} · {p.category}</div>
            </div>
            <div className="text-sm tabular-nums">{Number(p.price).toFixed(0)} TND</div>
            <div className="flex gap-2">
              {p.visible ? <span className="text-eyebrow opacity-60">Visible</span> : <span className="text-eyebrow opacity-30">Hidden</span>}
              {p.featured && <span className="text-eyebrow">★</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="text-eyebrow border border-border px-3 py-2 hover:bg-foreground hover:text-background">Edit</button>
              <button onClick={() => remove(p.id)} className="text-eyebrow border border-border px-3 py-2 hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="p-12 text-center opacity-60">No products yet.</div>}
      </div>

      {editing && <ProductEditor initial={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function ProductEditor({ initial, onClose }: { initial: any; onClose: () => void }) {
  const [form, setForm] = useState<any>({ ...initial, sizes: initial.sizes || ["S","M","L","XL"], images: initial.images || [] });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setSaving(true);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock), sort_order: Number(form.sort_order), compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null };
    const { id, ...data } = payload;
    const res = id
      ? await supabase.from("products").update(data).eq("id", id)
      : await supabase.from("products").insert(data);
    setSaving(false);
    if (res.error) toast.error(res.error.message); else { toast.success("Saved"); onClose(); }
  };

  const upload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${file.name}`;
      const { error } = await supabase.storage.from("taliani").upload(path, file, { upsert: false });
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("taliani").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setForm((f: any) => ({ ...f, images: [...(f.images || []), ...urls] }));
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background/95 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-display text-3xl">{form.id ? "Edit product" : "New product"}</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug *" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Field label="Name (EN) *" value={form.name_en} onChange={(v) => setForm({ ...form, name_en: v })} />
          <Field label="Name (FR)" value={form.name_fr || ""} onChange={(v) => setForm({ ...form, name_fr: v })} />
          <Field label="Name (AR)" value={form.name_ar || ""} onChange={(v) => setForm({ ...form, name_ar: v })} />
          <Field label="Price (TND)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          <Field label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          <Field label="Sort order" type="number" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} />
          <Field label="Sizes (comma sep)" value={(form.sizes || []).join(",")} onChange={(v) => setForm({ ...form, sizes: v.split(",").map((s: string) => s.trim()).filter(Boolean) })} />
        </div>

        <div className="mt-4">
          <Area label="Description (EN)" value={form.description_en || ""} onChange={(v) => setForm({ ...form, description_en: v })} />
          <Area label="Description (FR)" value={form.description_fr || ""} onChange={(v) => setForm({ ...form, description_fr: v })} />
          <Area label="Description (AR)" value={form.description_ar || ""} onChange={(v) => setForm({ ...form, description_ar: v })} />
        </div>

        <div className="mt-6">
          <div className="text-eyebrow opacity-60 mb-3">Images</div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
            {(form.images || []).map((url: string, i: number) => (
              <div key={i} className="relative group">
                <img src={url} className="w-full aspect-square object-cover bg-muted" />
                <button onClick={() => setForm({ ...form, images: form.images.filter((_: any, j: number) => j !== i) })} className="absolute top-1 right-1 bg-ink text-paper p-1 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="border border-border px-4 py-3 text-eyebrow flex items-center gap-2 hover:bg-foreground hover:text-background"><Upload className="w-3 h-3" /> {uploading ? "Uploading…" : "Upload images"}</button>
        </div>

        <div className="mt-6 flex gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} /> Visible</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        </div>

        <div className="mt-10 flex gap-3">
          <button onClick={save} disabled={saving} className="bg-ink text-paper px-8 py-4 text-eyebrow disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
          <button onClick={onClose} className="border border-border px-8 py-4 text-eyebrow">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-eyebrow opacity-60 block mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent border border-border px-3 py-2 outline-none focus:border-foreground" />
    </div>
  );
}
function Area({ label, value, onChange }: any) {
  return (
    <div className="mb-4">
      <label className="text-eyebrow opacity-60 block mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-transparent border border-border px-3 py-2 outline-none focus:border-foreground resize-none" />
    </div>
  );
}
