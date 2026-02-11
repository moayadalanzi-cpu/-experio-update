"use client";

import Link from "next/link";
import AuthButton from "../../components/AuthButton";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Login</h1>
          <Link href="/" className="text-white/70 hover:text-white">
            Home
          </Link>
        </div>

        <p className="text-white/70 mb-6">
          Sign in to create posts and manage your profile.
        </p>

        <AuthButton />

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
          <div className="text-white/70 mb-3">Or login with email</div>
          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/20"
            placeholder="you@example.com"
          />
          <button
            className="mt-3 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white/70 cursor-not-allowed"
            disabled
          >
            Send magic link (later)
          </button>
        </div>

        <div className="mt-6 text-xs text-white/50">
          By continuing you agree to Experio terms.
        </div>
      </div>
    </main>
  );
}
