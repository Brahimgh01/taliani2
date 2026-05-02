import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Check } from "lucide-react";

export const Route = createFileRoute("/admin_taliani/dashboard/requests")({
  component: RequestsAdmin,
});

function RequestsAdmin() {
  const [list, setList] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("contact_requests").select("*").order("created_at", { ascending: false });
    setList(data || []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("contact_requests").update({ status }).eq("id", id);
    load();
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("contact_requests").delete().eq("id", id); toast.success("Deleted"); load(); };

  return (
    <div>
      <h1 className="text-display text-4xl mb-8">Contact requests</h1>
      <div className="space-y-4">
        {list.map((r) => (
          <div key={r.id} className="border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-medium">{r.name}</div>
                  <span className={`text-eyebrow px-2 py-0.5 ${r.status === "new" ? "bg-ink text-paper" : "border border-border opacity-60"}`}>{r.status}</span>
                </div>
                <div className="text-sm opacity-70 mt-1">{r.email}{r.phone && ` · ${r.phone}`}</div>
                <div className="text-eyebrow opacity-50 mt-1">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                {r.status === "new" && <button onClick={() => setStatus(r.id, "handled")} className="text-eyebrow border border-border px-3 py-2 flex items-center gap-1"><Check className="w-3 h-3" /> Mark handled</button>}
                <button onClick={() => remove(r.id)} className="text-eyebrow border border-border px-3 py-2 hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm opacity-90">{r.message}</p>
          </div>
        ))}
        {list.length === 0 && <div className="p-12 text-center opacity-60 border border-border">No requests yet.</div>}
      </div>
    </div>
  );
}
