import { CATEGORICAL_PALETTE_DARK, type TaxonomyMatrixData } from "@/lib/content";

// Axis color: identity accent only (borders, dots, small pill backgrounds) -
// prose stays in text tokens (stone-300/stone-400), never colored itself.
// See CATEGORICAL_PALETTE_DARK for the validated ordering - never reorder.
function axisColor(colorSlot: number): string {
  return CATEGORICAL_PALETTE_DARK[colorSlot - 1] ?? "#78716c"; // stone-500 fallback
}

function AxisPill({ number, name, color }: { number: number; name: string; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      <span className="font-mono text-[10px] font-bold opacity-90">{number}</span>
      {name}
    </span>
  );
}

/** Number lives INSIDE the dot in both the header and the body cells - so no
 * cell ever relies on color alone to say which axis it is (a legend far above
 * a long table is a lookup tax; this makes every cell self-describing). */
function AxisDot({
  number,
  filled,
  color,
  title,
}: {
  number: number;
  filled: boolean;
  color: string;
  title: string;
}) {
  return (
    <span
      title={title}
      aria-label={title}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] font-bold"
      style={
        filled
          ? { backgroundColor: color, borderColor: color, color: "#fff" }
          : {
              backgroundColor: "transparent",
              borderColor: "#57534e" /* stone-600 */,
              color: "#78716c" /* stone-500 */,
            }
      }
    >
      {number}
    </span>
  );
}

export default function TaxonomyMatrix({ data }: { data: TaxonomyMatrixData }) {
  const axisById = Object.fromEntries(data.axes.map((a) => [a.id, a]));

  return (
    <div className="max-w-none">
      <h1 className="mb-4 mt-2 font-serif text-3xl text-stone-100">{data.title}</h1>
      <p className="mb-8 leading-relaxed text-stone-300">{data.intro}</p>

      {/* Section 1: the 8 core axes as a card grid */}
      <h2 className="mb-3 mt-8 font-serif text-2xl text-stone-100">
        The core taxonomy — 8 named problem classes
      </h2>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.axes.map((axis) => {
          const color = axisColor(axis.colorSlot);
          return (
            <div
              key={axis.id}
              className="rounded-lg border border-stone-800 bg-stone-900 p-4"
              style={{ borderLeftWidth: 4, borderLeftColor: color }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-xs text-stone-500">{axis.number}</span>
                <h3 className="text-sm font-semibold text-stone-100">{axis.name}</h3>
              </div>
              <p className="text-sm leading-relaxed text-stone-400">{axis.definition}</p>
            </div>
          );
        })}
      </div>

      <p className="mb-2 text-xs uppercase tracking-wide text-stone-500">
        Also worth having — less universal, decisive in specific domains
      </p>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.extendedAxes.map((axis) => (
          <div
            key={axis.id}
            className="rounded-lg border border-dashed border-stone-700 bg-stone-900/50 p-3"
          >
            <h3 className="mb-1 text-sm font-semibold text-stone-300">{axis.name}</h3>
            <p className="text-sm leading-relaxed text-stone-500">{axis.definition}</p>
          </div>
        ))}
      </div>

      {/* Cross-cutting lens: not a member of the 8-color set on purpose - this
          is the tuning question that sits ON TOP of all 8, not another one of
          them, so it gets a distinct (amber-accented, uncolored) treatment
          rather than a 9th categorical hue. */}
      {data.crossCuttingLens && (
        <>
          <h2 className="mb-3 mt-8 font-serif text-2xl text-stone-100">
            {data.crossCuttingLens.title}
          </h2>
          <p className="mb-4 leading-relaxed text-stone-300">{data.crossCuttingLens.intro}</p>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-amber-800/50 bg-stone-900 p-4">
              <h3 className="mb-1 text-sm font-semibold text-amber-500">
                {data.crossCuttingLens.precision.label}
              </h3>
              <p className="text-sm leading-relaxed text-stone-400">
                {data.crossCuttingLens.precision.definition}
              </p>
            </div>
            <div className="rounded-lg border border-amber-800/50 bg-stone-900 p-4">
              <h3 className="mb-1 text-sm font-semibold text-amber-500">
                {data.crossCuttingLens.recall.label}
              </h3>
              <p className="text-sm leading-relaxed text-stone-400">
                {data.crossCuttingLens.recall.definition}
              </p>
            </div>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-stone-400">
            {data.crossCuttingLens.whyItMatters}
          </p>
          <div className="mb-8 rounded-lg border border-stone-800 bg-stone-900 p-4">
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-500">
              {data.crossCuttingLens.onEvalsOwnership.heading}
            </h3>
            <p className="text-sm leading-relaxed text-stone-300">
              {data.crossCuttingLens.onEvalsOwnership.text}
            </p>
          </div>
        </>
      )}

      {/* Section 2: which axes dominate where */}
      <h2 className="mb-3 mt-8 font-serif text-2xl text-stone-100">
        Applying it — which axes dominate where
      </h2>

      {/* Legend - always present for >=2 series. Same numbering as the card
          grid above and every dot below - one consistent numeric anchor. */}
      <div className="mb-4 flex flex-wrap gap-2">
        {data.axes.map((axis) => (
          <AxisPill
            key={axis.id}
            number={axis.number}
            name={axis.name}
            color={axisColor(axis.colorSlot)}
          />
        ))}
      </div>

      {/* Desktop: dot matrix, domain rows x axis columns. Header dots and body
          dots both carry their number - never relies on color-position lookup. */}
      <div className="mb-4 hidden overflow-x-auto rounded-lg border border-stone-800 md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-800 bg-stone-900">
              <th className="px-4 py-2.5 text-left font-semibold text-stone-200">Domain</th>
              {data.axes.map((axis) => (
                <th key={axis.id} className="px-2 py-2.5 text-center">
                  <AxisDot
                    number={axis.number}
                    filled
                    color={axisColor(axis.colorSlot)}
                    title={axis.name}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.domains.map((domain) => (
              <tr key={domain.id} className="border-b border-stone-900 last:border-0">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-stone-200">{domain.name}</div>
                  <div className="mt-0.5 text-xs text-stone-500">{domain.why}</div>
                </td>
                {data.axes.map((axis) => (
                  <td key={axis.id} className="px-2 py-3 text-center align-middle">
                    <AxisDot
                      number={axis.number}
                      filled={domain.dominantAxisIds.includes(axis.id)}
                      color={axisColor(axis.colorSlot)}
                      title={axis.name}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards, pills only for dominant axes */}
      <div className="mb-8 grid gap-3 md:hidden">
        {data.domains.map((domain) => (
          <div key={domain.id} className="rounded-lg border border-stone-800 bg-stone-900 p-4">
            <div className="mb-1 font-medium text-stone-200">{domain.name}</div>
            <div className="mb-2 text-xs text-stone-500">{domain.why}</div>
            <div className="flex flex-wrap gap-1.5">
              {domain.dominantAxisIds.map((axisId) => {
                const axis = axisById[axisId];
                if (!axis) return null;
                return (
                  <AxisPill
                    key={axisId}
                    number={axis.number}
                    name={axis.name}
                    color={axisColor(axis.colorSlot)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: per-domain worked examples */}
      <h2 className="mb-3 mt-8 font-serif text-2xl text-stone-100">Domain deep-dives</h2>
      <div className="space-y-6">
        {data.domains.map((domain) => (
          <div key={domain.id} className="rounded-lg border border-stone-800 bg-stone-900 p-5">
            <h3 className="mb-1 font-serif text-xl text-stone-100">{domain.name}</h3>
            <p className="mb-3 text-sm italic text-stone-500">{domain.why}</p>
            <ul className="mb-3 space-y-2.5">
              {domain.examples.map((ex, i) => {
                const axis = axisById[ex.axisId];
                return (
                  <li key={i} className="flex flex-wrap items-start gap-2">
                    {axis && (
                      <AxisPill
                        number={axis.number}
                        name={axis.name}
                        color={axisColor(axis.colorSlot)}
                      />
                    )}
                    <span className="flex-1 text-sm leading-relaxed text-stone-300">{ex.text}</span>
                  </li>
                );
              })}
            </ul>
            {domain.personal && (
              <blockquote className="border-l-2 border-amber-700 pl-4 text-sm italic text-stone-400">
                [Personal: {domain.personal}]
              </blockquote>
            )}
          </div>
        ))}
      </div>

      {/* Closing */}
      <div className="mt-8 rounded-lg border border-stone-800 bg-stone-900 p-4">
        <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-amber-500">
          Why this works rhetorically
        </h2>
        <p className="text-sm leading-relaxed text-stone-300">{data.closing}</p>
      </div>
    </div>
  );
}
