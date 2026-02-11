"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  className?: string;
};

export default function AuthButton({ className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setAuthed(!!data.session);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return authed ? (
    <button
      onClick={signOut}
      disabled={loading}
      className={`px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 ${className}`}
    >
      {loading ? "Signing out..." : "Logout"}
    </button>
  ) : (
    <button
      onClick={signInWithGoogle}
      disabled={loading}
      className={`w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium ${className}`}
    >
      {loading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
