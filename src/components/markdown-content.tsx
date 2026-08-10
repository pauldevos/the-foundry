import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// mdast node shape react-markdown passes through `node` — typed loosely since
// we only need to walk text content out of it.
type MdastNode = {
  type: string;
  value?: string;
  children?: MdastNode[];
};

function textOf(node: MdastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text" && node.value) return node.value;
  if (!node.children) return "";
  return node.children.map(textOf).join("");
}

/** Renders a GFM table two ways: a normal scrollable <table> on md+ screens,
 * and a stacked label/value card per row on small screens — so a wide table
 * (like the skills-map frequency table) never gets crushed into unreadable
 * columns on a phone. */
function ResponsiveTable({ node }: { node?: MdastNode }) {
  if (!node) return null;
  const [thead, tbody] = node.children ?? [];
  const headerRow = thead?.children?.[0];
  const headers = (headerRow?.children ?? []).map(textOf);
  const bodyRows = tbody?.children ?? [];

  return (
    <div className="my-4">
      {/* Desktop / tablet: real table, horizontally scrollable if still wide */}
      <div className="hidden overflow-x-auto rounded-lg border border-slate-700 md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold text-stone-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri} className="border-b border-stone-900 last:border-0">
                {(row.children ?? []).map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 align-top text-slate-300">
                    {textOf(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per row, label: value stacked */}
      <div className="grid gap-3 md:hidden">
        {bodyRows.map((row, ri) => (
          <div key={ri} className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            {(row.children ?? []).map((cell, ci) => (
              <div key={ci} className="mb-2 last:mb-0">
                <div className="text-xs font-medium uppercase tracking-wide text-amber-400">
                  {headers[ci]}
                </div>
                <div className="text-sm text-stone-200">{textOf(cell)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const components: Components = {
  table: ResponsiveTable as unknown as Components["table"],
  h1: (props) => <h1 className="mb-4 mt-8 font-serif text-3xl text-slate-200" {...props} />,
  h2: (props) => <h2 className="mb-3 mt-8 font-serif text-2xl text-slate-200" {...props} />,
  h3: (props) => <h3 className="mb-2 mt-6 font-serif text-xl text-slate-200" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed text-slate-300" {...props} />,
  ul: (props) => <ul className="mb-4 list-disc space-y-1.5 pl-6 text-slate-300" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-1.5 pl-6 text-slate-300" {...props} />,
  a: (props) => <a className="text-amber-400 underline underline-offset-2 hover:text-amber-400" {...props} />,
  code: (props) => (
    <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-300" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="my-4 border-l-2 border-amber-500 pl-4 italic text-slate-400" {...props} />
  ),
};

export default function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
