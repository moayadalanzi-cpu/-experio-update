"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Experience = {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
};

const CATEGORIES = ["All", "Travel", "Work", "Health"] as const;

export default function Home() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("experiences")
        .select("id, title, category, created_at")
        .order("created_at", { ascending: false });

      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((x) => {
      const okCat = cat === "All" ? true : (x.category || "").toLowerCase() === cat.toLowerCase();
      const okSearch = !s ? true : (x.title || "").toLowerCase().includes(s);
      return okCat && okSearch;
    })
