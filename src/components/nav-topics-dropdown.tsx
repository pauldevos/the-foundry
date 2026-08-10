"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const TOPICS = [
  { slug: "rag", label: "RAG" },
  { slug: "evals", label: "Evals" },
  { slug: "agentic-ai", label: "Agentic AI" },
  { slug: "llm-core", label: "LLM Core" },
  { slug: "production", label: "Production" },
  { slug: "governance", label: "Governance" },
  { slug: "strategy", label: "Strategy" },
  { slug: "platforms", label: "Platforms" },
];

export default function NavTopicsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 whitespace-nowrap text-slate-400 hover:text-amber-400"
      >
        Topics
        <span className="text-[10px] leading-none">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[11rem] rounded-lg border border-slate-700 bg-[#0B0F14] py-1 shadow-xl">
          {TOPICS.map((t) => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-amber-400"
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
