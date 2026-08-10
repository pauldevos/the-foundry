"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TalkTrackActions({
  id,
  director,
  staff,
  unified,
}: {
  id: string;
  director: string | null;
  staff: string | null;
  unified: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState(director ?? "");
  const [s, setS] = useState(staff ?? unified ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/talk-tracks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ director_framing: d, staff_framing: s }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function del() {
    if (!confirm("Delete this talk track entry? It stays in the-foundry repo, just hidden here.")) return;
    await fetch(`/api/talk-tracks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-3 space-y-2">
        <label className="block text-xs text-amber-400">Director framing</label>
        <textarea
          value={d}
          onChange={(e) => setD(e.target.value)}
          rows={3}
          className="w-full rounded border border-stone-700 bg-[#0B0F14] p-2 text-sm text-stone-200"
        />
        <label className="block text-xs text-amber-400">Principal/Staff framing</label>
        <textarea
          value={s}
          onChange={(e) => setS(e.target.value)}
          rows={4}
          className="w-full rounded border border-stone-700 bg-[#0B0F14] p-2 text-sm text-stone-200"
        />
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-amber-500 px-3 py-1 text-xs text-stone-950 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-stone-700 px-3 py-1 text-xs text-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-3 text-xs text-slate-400">
      <button onClick={() => setEditing(true)} className="hover:text-slate-300">
        Edit
      </button>
      <button onClick={del} className="hover:text-red-400">
        Delete
      </button>
    </div>
  );
}
