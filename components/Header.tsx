"use client";

import Link from "next/link";
import { supabase } from "../lib/supabaseClient";


export default function Header() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="w-full border-b border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl">
          Experio
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            Home
          </Link>

          <Link
            href="/new"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium text-white"
          >
            + New Post
          </Link>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition font-medium text-white"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
