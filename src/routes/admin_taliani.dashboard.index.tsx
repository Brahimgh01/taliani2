import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_taliani/dashboard/")({
  component: Overview,
});

function Overview() {
  const [stats, setStats] = useState({ products: 0, promos: 0, requests: 0, newRequests: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("promotions").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("contact_requests").select("id", { count: "exact", head: true }),
      supabase.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]).then(([p, pr, r, nr]) => {
      setStats({ products: p.count || 0, promos: pr.count || 0, requests: r.count || 0, newRequests: nr.count || 0 });
    });
  }, []);

  const cards = [
    { l: "Products", v: stats.products },
    { l: "Active promos", v: stats.promos },
    { l: "Total requests", v: stats.requests },
    { l: "New requests", v: stats.newRequests },
  ];

  return (
    <div>
      <h1 className="text-display text-5xl mb-10">Welcome back.</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.l} className="border border-border p-8">
            <div className="text-eyebrow opacity-60">{c.l}</div>
            <div className="text-display text-6xl mt-3 tabular-nums">{String(c.v).padStart(2, "0")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
