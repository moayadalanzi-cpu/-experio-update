"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finish = async () => {
      // غالباً الجلسة تتسجل تلقائياً بعد الرجوع من Google
      await supabase.auth.getSession();
      router.replace("/");
    };
    finish();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-white">
      Finishing login...
    </main>
  );
}
