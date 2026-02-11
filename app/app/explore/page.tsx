"use client";

import React, { useMemo, useState } from "react";

type Experience = {
  id: string;
  title: string;
  category: "Travel" | "Work" | "Health";
  summary: string;
  country: string;
  city: string;
  rating: number;
  readTime: string;
};

const MOCK_EXPERIENCES: Experience[] = [
  {
    id: "1",
    title: "Rome student life: what I wish I knew",
    category: "Travel",
    summary:
      "Housing, transport, documents, and how to avoid common mistakes in the first month.",
    country: "Italy",
    city: "Rome",
    rating: 4.8,
    readTime: "6 min",
  },
  {
    id: "2",
    title: "Remote work setup that actually increased focus",
    category: "Work",
    summary:
      "A practical system: schedule blocks, tools, and a simple KPI method for weekly progress.",
    country: "Spain",
    city: "Castellón",
    rating: 4.6,
    readTime: "5 min",
  },
  {
    id: "3",
    title: "Vitamin D deficiency: symptoms and what helped",
    category: "Health",
    summary:
      "My experience with tests, sunlight routine, supplements, and how long it took to feel better.",
    country: "Iraq",
    city: "Erbil",
    rating: 4.7,
    readTime: "4 min",
  },
  {
    id: "4",
    title: "Road trip planning: Iraq to Europe (real checklist)",
    category: "Travel",
    summary:
      "Borders, insurance, documents, and what to pack. A checklist that saved us time and money.",
    country: "Iraq",
    city: "Mosul",
    rating: 4.9,
    readTime: "7 min",
  },
];

const CATEGORIES = ["All", "Travel", "Work", "Health"] as const;

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #eaeaea",
        background: "#fff",
        fontSize: 12,
        color: "#111",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function Star({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span style={{ fontSize: 12, color: "#444", whiteSpace: "nowrap" }}>
      ★ {v.toFixed(1)}
    </span>
  );
}

function Card({ exp }: { exp: Experience }) {
  const [hover, setHover] = useState(false);

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: "1px solid #eaeaea",
        borderRadius: 18,
        padding: 16,
        background: "#fff",
        boxShadow: hover ? "0 10px 24px rgba(0,0,0,0.08)" : "0 4px 12px rgba(0,0,0,0.04)",
        transform: hover ? "translateY(-2px)" : "translateY(0px)",
        transition: "all 0.18s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: 190,
      }}
    >
      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <Badge text={exp.category} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Star value={exp.rating} />
          <span style={{ fontSize: 12, color: "#666" }}>• {exp.readTime}</span>
        </div>
      </div>

      {/* title */}
      <h3 style={{ margin: "12px 0 8px", fontSize: 18, lineHeight: 1.25, color: "#111" }}>
        {exp.title}
      </h3>

      {/* summary */}
      <p style={{ margin: 0, color: "#555", lineHeight: 1.6, fontSize: 14 }}>
        {exp.summary}
      </p>

      {/* footer */}
      <div style={{ display: "flex", gap: 10, marginTop: "auto", alignItems: "center", paddingTop: 14 }}>
        <span style={{ fontSize: 13, color: "#666" }}>📍 {exp.city}, {exp.country}</span>
        <span style={{ marginLeft: "auto", fontSize: 13, color: "#111" }}>
          Read →
        </span>
      </div>
    </article>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_EXPERIENCES.filter((x) => {
      const catOk = category === "All" ? true : x.category === category;
      const textOk =
        q.length === 0
          ? true
          : (x.title + " " + x.summary + " " + x.city + " " + x.country).toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [query, category]);

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#111",
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#111" }}>
          <span style={{ fontSize: 22 }}>🧷</span>
          <strong style={{ fontSize: 20, letterSpacing: 0.2 }}>Experio</strong>
        </a>

        <nav style={{ display: "flex", gap: 14, fontSize: 14 }}>
          <a href="/explore" style={{ color: "#111", textDecoration: "none" }}>Explore</a>
          <a href="/#categories" style={{ color: "#111", textDecoration: "none" }}>Categories</a>
          <a href="/#why" style={{ color: "#111", textDecoration: "none" }}>Why Experio</a>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 10px" }}>
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 18,
            padding: "18px 18px",
            background: "linear-gradient(135deg, #f5f7ff 0%, #f8fff7 100%)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15 }}>
            Discover Real Experiences
          </h1>

          <p style={{ margin: "8px 0 0", color: "#555", lineHeight: 1.7, fontSize: 14, maxWidth: 820 }}>
            Travel • Work • Health — learn from real people, real stories.
            <br />
            (Today we use sample data. Later we’ll connect Supabase for real posts.)
          </p>
        </div>
      </section>

      {/* Controls */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px 0" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences..."
            style={{
              flex: "1 1 420px",
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid #e6e6e6",
              fontSize: 14,
              background: "#fff",
              outline: "none",
            }}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            style={{
              padding: "12px 12px",
              borderRadius: 12,
              border: "1px solid #e6e6e6",
              background: "#fff",
              fontSize: 14,
              outline: "none",
              minWidth: 180,
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              // زر شكلي فقط (لأن الفلترة لحظية)
              // تقدر تخليه يجيب من Supabase لاحقاً
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "0",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14,
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </div>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px 40px" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              border: "1px solid #eaeaea",
              borderRadius: 18,
              padding: 18,
              color: "#555",
              background: "#fff",
            }}
          >
            No results. Try a different keyword or category.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((exp) => (
              <Card key={exp.id} exp={exp} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
