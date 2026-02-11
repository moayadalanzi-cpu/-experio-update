"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type Post = {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
};

const tabs = ["All", "Travel", "Work", "Health"] as const;
type Tab = (typeof tabs)[number];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("All");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setPosts(data as Post[]);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const okTab = tab === "All" ? true : p.category === tab;
      const q = query.trim().toLowerCase();
      const okQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return okTab && okQuery;
    });
  }, [posts, query, tab]);

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Share experiences.
        </h1>
        <p className="text-white/70 mt-3">
          Real stories in Travel, Work, and Health — calm, clean, and fast.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-5 py-4 outline-none focus:border-white/20"
          />

          <div className="flex flex-wrap gap-3 justify-start md:justify-end">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "px-6 py-4 rounded-2xl border transition " +
                  (tab === t
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/10 hover:border-white/20")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        {filtered.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <article className="rounded-3xl border border-white/10 bg-white/5 p-8 hover:border-white/20 transition">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold">{post.title}</h2>
                  <p className="text-white/70 mt-2">{post.description}</p>
                  <p className="text-white/40 text-sm mt-4">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>

                <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm">
                  {post.category}
                </span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
