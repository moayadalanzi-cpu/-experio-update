"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Post } from "@/lib/types";

const CATS = ["All", "Travel", "Work", "Health"] as const;
const PAGE_SIZE = 12;

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const enrichLikes = async (rows: Post[], uid: string | null) => {
    // count likes via embedded count
    // PostgREST returns: post_likes: [{ count: <number> }]
    const ids = rows.map((r) => r.id);
    let likedSet = new Set<string>();

    if (uid && ids.length) {
      const { data: myLikes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", uid)
        .in("post_id", ids);

      (myLikes ?? []).forEach((x: any) => likedSet.add(x.post_id));
    }

    return rows.map((r: any) => ({
      ...r,
      likes_count: Array.isArray(r.post_likes) ? (r.post_likes[0]?.count ?? 0) : 0,
      liked_by_me: uid ? likedSet.has(r.id) : false,
    })) as Post[];
  };

  const fetchPage = async (pageIndex: number, append: boolean) => {
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setAuthed(!!sess.session);
    setUserId(uid);

    const { data, error } = await supabase
      .from("posts")
      .select("id,title,description,category,created_at, post_likes(count)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return { ok: false, rows: [] as Post[] };

    const baseRows = (data ?? []) as any[];
    setHasMore(baseRows.length === PAGE_SIZE);

    const rows = await enrichLikes(baseRows as any, uid);

    if (append) setPosts((prev) => [...prev, ...rows]);
    else setPosts(rows);

    return { ok: true, rows };
  };

  const loadFirst = async () => {
    setLoading(true);
    setPage(0);
    await fetchPage(0, false);
    setLoading(false);
  };

  useEffect(() => {
    loadFirst();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadFirst());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = async () => {
    if (moreLoading || !hasMore) return;
    setMoreLoading(true);
    const next = page + 1;
    const res = await fetchPage(next, true);
    if (res.ok) setPage(next);
    setMoreLoading(false);
  };

  const toggleLike = async (post: Post) => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    // optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== post.id) return p;
        const liked = !!p.liked_by_me;
        return {
          ...p,
          liked_by_me: !liked,
          likes_count: (p.likes_count ?? 0) + (liked ? -1 : 1),
        };
      })
    );

    if (post.liked_by_me) {
      // unlike
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      if (error) {
        // rollback
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, liked_by_me: true, likes_count: (p.likes_count ?? 0) + 1 }
              : p
          )
        );
      }
    } else {
      // like
      const { error } = await supabase.from("post_likes").insert({
        post_id: post.id,
        user_id: userId,
      });

      if (error) {
        // rollback
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, liked_by_me: false, likes_count: Math.max((p.likes_count ?? 0) - 1, 0) }
              : p
          )
        );
      }
    }
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      const catOk = cat === "All" ? true : p.category === cat;
      const qOk =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [posts, q, cat]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Experio Feed</h1>
          <p className="opacity-70 mt-1">Share real experiences in Travel, Work, and Health.</p>
        </div>

        <div className="flex gap-3">
          {authed ? (
            <Link
              href="/new"
              className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-semibold"
            >
              + New Post
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <div className="md:col-span-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-white/20"
          />
        </div>

        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as any)}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-white/20"
        >
          {CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="opacity-80">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <div className="font-semibold">No posts found</div>
          <div className="opacity-75 mt-1">Try another keyword or category.</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <Link href={`/post/${p.id}`} className="group block">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold leading-snug group-hover:underline">
                      {p.title}
                    </h2>
                    <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white/10">
                      {p.category}
                    </span>
                  </div>

                  <p className="mt-3 opacity-85 line-clamp-3 leading-7">
                    {p.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs opacity-60">
                    <span>{p.created_at ? new Date(p.created_at).toLocaleString() : ""}</span>
                    <span className="opacity-70 group-hover:opacity-100">Open →</span>
                  </div>
                </Link>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => toggleLike(p)}
                    className={`px-3 py-2 rounded-2xl border border-white/10 ${
                      p.liked_by_me ? "bg-white text-slate-900 font-semibold" : "bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    {p.liked_by_me ? "Liked" : "Like"}
                  </button>

                  <div className="text-sm opacity-80">
                    👍 {p.likes_count ?? 0}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={moreLoading || !hasMore}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50"
            >
              {moreLoading ? "Loading..." : hasMore ? "Load more" : "No more"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
