"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Travel");

  async function submit(e: any) {
    e.preventDefault();

    await supabase.from("posts").insert([
      {
        title: title,
        description: description,
        category: category,
      },
    ]);

    router.push("/");
  }

  return (
    <main style={{ padding: "40px", maxWidth: "600px", margin: "auto" }}>
      <h1>New Post</h1>

      <form onSubmit={submit}>
        <p>Title</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%" }}
        />

        <p>Category</p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%" }}
        >
          <option>Travel</option>
          <option>Work</option>
          <option>Health</option>
        </select>

        <p>Description</p>
        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%" }}
        />

        <br />
        <br />

        <button type="submit">Publish</button>
      </form>
    </main>
  );
}
