import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin_taliani/")({
  head: () => ({ meta: [{ title: "Admin — Taliani" }, { name: "robots", content: "noindex" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin_taliani/dashboard" });
    });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    nav({ to: "/admin_taliani/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="text-display text-3xl text-center mb-2">TALIANI</div>
        <div className="text-eyebrow opacity-60 text-center mb-12">— Admin</div>
        <div className="space-y-6">
          <div>
            <label className="text-eyebrow opacity-60 block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none py-3" />
          </div>
          <div>
            <label className="text-eyebrow opacity-60 block mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent border-b border-foreground/30 focus:border-foreground outline-none py-3" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-ink text-paper py-4 text-eyebrow hover:opacity-80 disabled:opacity-50">
            {loading ? "..." : "Sign in →"}
          </button>
        </div>
      </form>
    </div>
  );
}
