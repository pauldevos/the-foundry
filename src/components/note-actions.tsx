"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NoteActions({
  id,
  title,
  bodyMarkdown,
}: {
  id: string;
  title: string;
  bodyMarkdown: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(title);
  const [b, setB] = useState(bodyMarkdown);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, body_markdown: b }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this note? It stays in the-foundry repo, just hidden here.")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.push("/notes");
  }

  if (editing) {
    return (
      <div className="mb-6 space-y-3 rounded-lg border border-stone-300 bg-stone-100 p-4">
        <input
          value={t}
          onChange={(e) => setT(e.target.value)}
          className="w-full rounded border border-stone-700 bg-stone-50 px-3 py-2 font-serif text-lg text-stone-900"
        />
        <textarea
          value={b}
          onChange={(e) => setB(e.target.value)}
          rows={16}
          className="w-full rounded border border-stone-700 bg-stone-50 p-3 font-mono text-xs text-stone-200"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm text-stone-950 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-stone-700 px-4 py-1.5 text-sm text-stone-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex gap-4 text-xs text-stone-500">
      <button onClick={() => setEditing(true)} className="hover:text-stone-700">
        Edit
      </button>
      <button onClick={del} className="hover:text-red-400">
        Delete
      </button>
    </div>
  );
}
