"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type Post = {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at?: string;
};

export default function PostPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) setErr(error.message);
    else setPost(data as Post);

    setLoading(false);
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Experio
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white">
              Home
            </Link>
            <Link
              href="/new"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 font-medium"
            >
              + New Post
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/" className="text-white/70 hover:text-white">
          ← Back
        </Link>

        <div className="mt-6 mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
          {loading ? (
            <div className="text-white/60">Loading...</div>
          ) : err ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
              {err}
            </div>
          ) : !post ? (
            <div className="text-white/60">Not found.</div>
          ) : (
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold">{post.title}</h1>
                <p className="mt-2 text-white/40 text-sm">
                  {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
                </p>
                <p className="mt-8 text-white/80 text-lg leading-relaxed">
                  {post.description}
                </p>
              </div>
              <span className="h-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                {post.category}
              </span>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-6 flex justify-between text-white/50 text-sm">
          <span>© {new Date().getFullYear()} Experio</span>
          <span>Built for real experiences.</span>
        </div>
      </footer>
    </main>
  );
}
