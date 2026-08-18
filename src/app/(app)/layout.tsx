import Link from "next/link";
import NavTopicsDropdown from "@/components/nav-topics-dropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-sm">
          <Link href="/" className="whitespace-nowrap font-serif text-base text-slate-200">
            Foundry
          </Link>
          <Link href="/materials" className="whitespace-nowrap text-slate-400 hover:text-amber-400">
            Materials
          </Link>
          <a href="/databricks-study.html" className="whitespace-nowrap text-amber-400 hover:text-amber-300">
            Databricks 5-dims
          </a>
          <NavTopicsDropdown />
          <Link href="/study-cards" className="whitespace-nowrap text-slate-400 hover:text-amber-400">
            Review
          </Link>
          <form action="/api/logout" method="post" className="ml-auto">
            <button type="submit" className="whitespace-nowrap text-slate-500 hover:text-slate-300">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
