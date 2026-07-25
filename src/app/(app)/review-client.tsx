"use client";

import { useState } from "react";

type Card = {
  id: string;
  deckTopic: string | null;
  type: string;
  front: string;
  back: string;
  starred: boolean;
  clipVideoId: string | null;
  clipSeconds: number | null;
};

export default function ReviewClient({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState(initialCards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  const card = cards[i];

  async function advance() {
    setFlipped(false);
    setEditing(false);
    if (i < cards.length - 1) setI(i + 1);
    else setI(cards.length); // past the end -> "done" state
  }

  async function grade(grade: "recalled" | "missed") {
    await fetch(`/api/cards/${card.id}/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade }),
    });
    if (grade === "recalled") setPassCount((n) => n + 1);
    else setFailCount((n) => n + 1);
    advance();
  }

  async function notUseful() {
    await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    setCards((cs) => cs.filter((c) => c.id !== card.id));
    // don't advance index — the array shrank under us, current index now points
    // at what was the next card already
    setFlipped(false);
    setEditing(false);
  }

  function startEdit() {
    setEditFront(card.front);
    setEditBack(card.back);
    setEditing(true);
  }

  async function saveEdit() {
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ front: editFront, back: editBack }),
    });
    setCards((cs) =>
      cs.map((c) => (c.id === card.id ? { ...c, front: editFront, back: editBack } : c))
    );
    setEditing(false);
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900 p-8 text-center">
        <p className="font-serif text-xl text-stone-100">Nothing due right now.</p>
        <p className="mt-2 text-sm text-stone-400">Come back later, or browse Notes / Talk Tracks.</p>
      </div>
    );
  }

  if (i >= cards.length) {
    return (
      <div className="rounded-xl border border-stone-800 bg-stone-900 p-8 text-center">
        <p className="font-serif text-xl text-stone-100">Session complete.</p>
        <p className="mt-2 text-sm text-stone-400">
          {passCount} recalled / {failCount} missed
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-stone-500">
        <span>
          {passCount} recalled / {failCount} missed
        </span>
        <span>
          {i + 1} / {cards.length}
        </span>
      </div>

      <div
        onClick={() => !editing && setFlipped((f) => !f)}
        className="min-h-[220px] cursor-pointer rounded-xl border border-stone-800 bg-stone-900 p-6 shadow-lg"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-amber-500">
            {card.starred ? "⭐ " : ""}
            {card.type}
          </span>
          {card.deckTopic && (
            <span className="text-xs text-stone-500">{card.deckTopic}</span>
          )}
        </div>

        {!editing ? (
          <>
            <p className="font-serif text-lg leading-snug text-stone-100">{card.front}</p>
            {flipped && (
              <div className="mt-4 border-t border-stone-800 pt-4">
                <p className="text-sm leading-relaxed text-stone-300">{card.back}</p>
                {card.clipVideoId && card.clipSeconds != null && (
                  <a
                    href={`https://www.youtube.com/watch?v=${card.clipVideoId}&t=${card.clipSeconds}s`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 inline-block text-xs text-amber-500 hover:underline"
                  >
                    ▶ watch this moment
                  </a>
                )}
              </div>
            )}
            {!flipped && <p className="mt-4 text-xs text-stone-600">tap to reveal</p>}
          </>
        ) : (
          <div onClick={(e) => e.stopPropagation()} className="space-y-3">
            <textarea
              value={editFront}
              onChange={(e) => setEditFront(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 p-2 text-sm text-stone-100"
              rows={2}
            />
            <textarea
              value={editBack}
              onChange={(e) => setEditBack(e.target.value)}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 p-2 text-sm text-stone-100"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm text-stone-950"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-stone-700 px-3 py-1.5 text-sm text-stone-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <>
          {flipped && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => grade("missed")}
                className="rounded-lg border border-red-900 py-2.5 text-sm font-medium text-red-400 hover:bg-red-950"
              >
                Missed it
              </button>
              <button
                onClick={notUseful}
                className="rounded-lg border border-stone-700 py-2.5 text-sm font-medium text-stone-400 hover:bg-stone-800"
              >
                Not useful
              </button>
              <button
                onClick={() => grade("recalled")}
                className="rounded-lg border border-emerald-900 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-950"
              >
                Recalled
              </button>
            </div>
          )}
          <div className="mt-3 flex justify-between text-xs">
            <button onClick={startEdit} className="text-stone-500 hover:text-stone-300">
              Edit
            </button>
            <button onClick={advance} className="text-stone-500 hover:text-stone-300">
              skip →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
