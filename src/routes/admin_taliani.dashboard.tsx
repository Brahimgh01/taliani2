import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_taliani/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Taliani Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { nav({ to: "/admin_taliani" }); return; }

      // Use the security definer RPC instead of querying user_roles directly
      const { data: role } = await supabase.rpc("get_my_role");
      const admin = role === "admin";

      if (!mounted) return;
      setIsAdmin(admin);
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) nav({ to: "/admin_taliani" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [nav]);

  const logout = async () => {
    await supabase.auth.signOut();
    nav({ to: "/admin_taliani" });
  };

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-eyebrow opacity-60">Loading…</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-display text-5xl mb-4">Forbidden</h1>
      <p className="opacity-70 mb-6">Your account is signed in but does not have admin privileges.</p>
      <button onClick={logout} className="text-eyebrow border-b border-foreground pb-1">Sign out</button>
    </div>
  );

  const tabs = [
    { to: "/admin_taliani/dashboard", l: "Overview", exact: true },
    { to: "/admin_taliani/dashboard/products", l: "Products" },
    { to: "/admin_taliani/dashboard/promotions", l: "Promotions" },
    { to: "/admin_taliani/dashboard/socials", l: "Socials" },
    { to: "/admin_taliani/dashboard/requests", l: "Requests" },
    { to: "/admin_taliani/dashboard/settings", l: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-display text-xl">TALIANI</Link>
          <span className="text-eyebrow opacity-50">Admin</span>
        </div>
        <button onClick={logout} className="text-eyebrow opacity-60 hover:opacity-100">Sign out</button>
      </header>
      <div className="border-b border-border px-6 md:px-10 flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.exact ? loc.pathname === tab.to : loc.pathname.startsWith(tab.to);
          return (
            <Link key={tab.to} to={tab.to} className={`text-eyebrow py-4 border-b-2 transition-colors whitespace-nowrap ${active ? "border-foreground opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}>
              {tab.l}
            </Link>
          );
        })}
      </div>
      <main className="px-6 md:px-10 py-10">
        <Outlet />
      </main>
    </div>
  );
}