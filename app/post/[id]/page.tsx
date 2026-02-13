"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Comment, Post } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PostDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  const [likeBusy, setLikeBusy] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  // edit mode
  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("Travel");
  const [editBusy, setEditBusy] = useState(false);

  const loadAll = async () => {
    setLoading(true);

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setAuthed(!!sess.session);
    setUserId(uid);

    // 1) post
    const { data: p, error: pErr } = await supabase
      .from("posts")
      .select("id,user_id,title,description,category,created_at")
      .eq("id", params.id)
      .single();

    if (pErr || !p) {
      setPost(null);
      setComments([]);
      setLoading(false);
      return;
    }

    const owner = !!uid && p.user_id === uid;
    setIsOwner(owner);

    setEditTitle(p.title);
    setEditDesc(p.description);
    setEditCat(p.category);

    // 2) likes count
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", params.id);

    // 3) liked by me
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

    // 4) comments
    const { data: c } = await supabase
      .from("post_comments")
      .select("id,post_id,user_id,content,created_at")
      .eq("post_id", params.id)
      .order("created_at", { ascending: false });

    setComments((c ?? []) as Comment[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadAll());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const toggleLike = async () => {
    if (!post) return;
    if (!userId) return (window.location.href = "/login");
    if (likeBusy) return;

    setLikeBusy(true);

    const wasLiked = !!post.liked_by_me;

    // optimistic
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

  const addComment = async () => {
    if (!userId) return (window.location.href = "/login");
    if (!post) return;
    const content = commentText.trim();
    if (!content) return;
    if (commentBusy) return;

    setCommentBusy(true);

    const { error } = await supabase.from("post_comments").insert({
      post_id: post.id,
      user_id: userId,
      content,
    });

    if (!error) {
      setCommentText("");
      await loadAll();
    }

    setCommentBusy(false);
  };

  const deleteComment = async (c: Comment) => {
    if (!userId) return;
    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", c.id)
      .eq("user_id", userId);

    if (!error) setComments((prev) => prev.filter((x) => x.id !== c.id));
  };

  const saveEdit = async () => {
    if (!post || !isOwner) return;
    if (editBusy) return;

    const title = editTitle.trim();
    const description = editDesc.trim();
    if (!title || !description) return;

    setEditBusy(true);

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        description,
        category: editCat,
      })
      .eq("id", post.id);

    if (!error) {
      setEditMode(false);
      await loadAll();
    }

    setEditBusy(false);
  };

  const deletePost = async () => {
    if (!post || !isOwner) return;
    const ok = confirm("Delete this post permanently?");
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) router.push("/");
  };

  const canDeleteComment = useMemo(
    () => (c: Comment) => userId && c.user_id === userId,
    [userId]
  );

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
        <>
          <article className="mt-6 p-5 rounded-3xl border border-white/10 bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {editMode ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
                      placeholder="Title"
                    />
                    <select
                      value={editCat}
                      onChange={(e) => setEditCat(e.target.value)}
                      className="mt-3 w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
                    >
                      <option>Travel</option>
                      <option>Work</option>
                      <option>Health</option>
                    </select>
                  </>
                ) : (
                  <h1 className="text-2xl font-extrabold leading-snug break-words">
                    {post.title}
                  </h1>
                )}
              </div>

              <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-white/10">
                {post.category}
              </span>
            </div>

            {editMode ? (
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={6}
                className="mt-4 w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none"
                placeholder="Description"
              />
            ) : (
              <p className="mt-4 leading-7 opacity-90 whitespace-pre-wrap">
                {post.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
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

              {isOwner && (
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={editBusy}
                        className="px-4 py-2 rounded-2xl bg-white text-slate-900 font-semibold disabled:opacity-50"
                      >
                        {editBusy ? "Saving..." : "Save"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={deletePost}
                        className="px-4 py-2 rounded-2xl border border-red-500/30 bg-red-500/15 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <p className="mt-6 text-xs opacity-60">
              {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
            </p>
          </article>

          {/* COMMENTS */}
          <section className="mt-6 p-5 rounded-3xl border border-white/10 bg-white/5">
            <div className="font-bold text-lg">Comments</div>

            <div className="mt-3 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={authed ? "Write a comment..." : "Login to comment"}
                disabled={!authed}
                className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none disabled:opacity-50"
              />
              <button
                onClick={addComment}
                disabled={!authed || commentBusy || !commentText.trim()}
                className="px-4 py-3 rounded-2xl bg-white text-slate-900 font-semibold disabled:opacity-50"
              >
                {commentBusy ? "..." : "Send"}
              </button>
            </div>

            {comments.length === 0 ? (
              <div className="mt-4 opacity-75">No comments yet.</div>
            ) : (
              <div className="mt-4 grid gap-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs opacity-60">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                      </div>

                      {canDeleteComment(c) && (
                        <button
                          onClick={() => deleteComment(c)}
                          className="text-xs px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    <div className="mt-2 whitespace-pre-wrap leading-7 opacity-90">
                      {c.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
