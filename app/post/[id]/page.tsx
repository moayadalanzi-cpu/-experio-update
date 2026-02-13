"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Post } from "@/lib/types";
import Link from "next/link";

export default function PostDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const load = async () => {
    setLoading(true);

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setAuthed(!!sess.session);
    setUserId(uid);

    // 1) get post
    const { data: p, error: pErr } = await supabase
      .from("posts")
      .select("id,title,description,category,created_at")
      .eq("id", params.id)
      .single();

    if (pErr || !p) {
      setPost(null);
      setLoading(false);
      return;
    }

    // 2) count likes
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id);

    // 3) liked by me?
    let likedByMe = false;
    if (uid) {
      const { data: my } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", params.id)
        .eq("user_id", uid)
        .maybeSingle();

      likedByMe = !!my;
    }

    setPost({
      ...(p as Post),
      likes_count: count ?? 0,
      liked_by_me: likedByMe,
    });

    setLoading(false);
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const toggleLike = async () => {
    if (!post) return;

    if (!userId) {
      window.location.href = "/login";
      return;
    }

    if (likeBusy) return;
    setLikeBusy(true);

    // optimistic update
    const wasLiked = !!post.liked_by_me;
    setPost({
      ...post,
      liked_by_me: !wasLiked,
      likes_count: (post.likes_count ?? 0) + (wasLiked ? -1 : 1),
    });

    if (wasLiked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);

      if (error) {
        // rollback
        setPost((prev) =>
          prev
            ? {
                ...prev,
                liked_by_me: true,
                likes_count: (prev.likes_count ?? 0) + 1,
              }
            : prev
        );
      }
    } else {
      const { error } = await supabase.from("post_likes").insert({
        post_id: post.id,
        user_id: userId,
      });

      if (error) {
        // rollback
        setPost((prev) =>
          prev
            ? {
                ...prev,
                liked_by_me: false,
                likes_count: Math.max((prev.likes_count ?? 0) - 1, 0),
              }
            : prev
        );
      }
    }

    setLikeBusy(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/" className="opacity-80 hover:opacity-100">
        ← Back
      </Link>

      {loading ? (
        <div className="mt-6 opacity-80">Loading...</div>
      ) : !post ? (
        <div className="mt-6 opacity-80">Post not found.</div>
      ) : (
        <article className="mt-6 p-5 rounded-3xl border border-white/10 bg-white/5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-extrabold leading-snug">
              {post.title}
            </h1>
            <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white/10">
              {post.category}
            </span>
          </div>

          <p className="mt-4 leading-7 opacity-90 whitespace-pre-wrap">
            {post.description}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={toggleLike}
              disabled={!authed || likeBusy}
              className={`px-4 py-2 rounded-2xl border border-white/10 disabled:opacity-50 ${
                post.liked_by_me
                  ? "bg-white text-slate-900 font-semibold"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              {post.liked_by_me ? "Liked" : "Like"}
            </button>

            <div className="text-sm opacity-80">👍 {post.likes_count ?? 0}</div>
          </div>

          <p className="mt-6 text-xs opacity-60">
            {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
          </p>
        </article>
      )}
    </main>
  );
}
