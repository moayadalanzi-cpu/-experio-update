"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewPostPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Travel");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setSession(data.session);
      setReady(true);
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");

    if (!session) return;

    if (!title.trim() || !description.trim()) {
      setMsg("Please fill in all fields.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("posts").insert([
      {
        title: title.trim(),
        description: description.trim(),
        category,
        user_id: session.user.id,
      },
    ]);

    setSaving(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    router.push("/");
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h1 className="text-3xl font-semibold mb-8">New Post</h1>

        {msg && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-red-300">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-white/80">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            >
              <option value="Travel">Travel</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Description</label>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your experience"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-white text-slate-950 px-5 py-3 font-medium disabled:opacity-60"
          >
            {saving ? "Publishing..." : "Publish Post"}
          </button>
        </form>
      </div>
    </main>
  );
}
