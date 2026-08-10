"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Same non-destructive hide as note-actions.tsx's Delete button (sets is_deleted in
// Supabase, leaves the file in the repo untouched) — duplicated here as a standalone
// button so it can sit on the list page, not just the note detail page. Bulk-hiding a
// handful of notes one detail-page click at a time is exactly the friction this removes.
export default function HideNoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [hiding, setHiding] = useState(false);

  async function hide(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Hide this note? It stays in the-foundry repo, just hidden here.")) return;
    setHiding(true);
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={hide}
      disabled={hiding}
      title="Hide from this list (stays in the repo)"
      className="shrink-0 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-500 hover:border-red-800 hover:text-red-400 disabled:opacity-50"
    >
      {hiding ? "..." : "Hide"}
    </button>
  );
}
