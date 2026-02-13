"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Category = "Travel" | "Work" | "Health";

export default function NewPostPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const [category, setCategory] = useState<Category>("Travel");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 🔐 حماية الصفحة (فقط للمسجلين)
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setReady(true);
    };

    checkAuth();
  }, [router]);

  const submit = async () => {
  setMsg(null);

  if (!title.trim() || !description.trim()) {
    setMsg("Title and description are required.");
    return;
  }

  setLoading(true);

  // ✅ جلب المستخدم الحالي (مهم حتى نرسل user_id)
  const { data: uData, error: uErr } = await supabase.auth.getUser();

  if (uErr || !uData.user) {
    setLoading(false);
    setMsg("Please login again.");
    router.replace("/login");
    return;
  }

  const user_id = uData.user.id;

  const { error } = await supabase.from("posts").insert({
    title: title.trim(),
    description: description.trim(),
    category,
    user_id, // ✅ هنا الإضافة
  });

  setLoading(false);

  if (error) {
    setMsg(error.message);
    return;
  }

  router.push("/");
};

    if (!title.trim() || !description.trim()) {
      setMsg("Title and description are required.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      description: description.trim(),
      category,
    });

    setLoading(false);

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
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold mb-8">New Post</h1>

        {msg && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            {msg}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm opacity-80 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 outline-none"
            >
              <option value="Travel">Travel</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
            </select>
          </div>

          <div>
            <label className="block text-sm opacity-80 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write a short title..."
              className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm opacity-80 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your experience..."
              rows={8}
              className="w-full rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-3 font-medium"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
