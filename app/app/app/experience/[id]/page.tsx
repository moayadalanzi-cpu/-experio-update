"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Experience = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  description?: string | null;
};

export default function ExperiencePage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", params.id)
        .single();

      setItem(data);
      setLoading(false);
    };

    load();
  }, [params.id]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!item) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <p>Not found</p>
        <Link className="text-cyan-300 underline" href="/">Go back</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/" className="text-cyan-300 hover:underline">
          ← Back
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-xs rounded-full bg-cyan-500/15 text-cyan-300 px-3 py-1">
              {item.category || "General"}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(item.created_at).toLocaleString()}
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight">{item.title}</h1>

          <div className="mt-4 text-slate-300 leading-relaxed whitespace-pre-wrap">
            {item.description || "No description yet."}
          </div>
        </div>
      </div>
    </main>
  );
}
