import Link from "next/link";
import NavTopicsDropdown from "@/components/nav-topics-dropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center gap-5 px-4 py-3 text-sm">
          <Link href="/" className="whitespace-nowrap font-serif text-base text-slate-200">
            Foundry Study
          </Link>
          <NavTopicsDropdown />
          <Link href="/study-cards" className="whitespace-nowrap text-slate-400 hover:text-amber-400">
            Study Cards
          </Link>
          <Link href="/interviews" className="whitespace-nowrap text-slate-400 hover:text-amber-400">
            Interviews
          </Link>
          <Link href="/search" className="whitespace-nowrap text-slate-400 hover:text-amber-400">
            Search
          </Link>
          <form action="/api/logout" method="post" className="ml-auto">
            <button type="submit" className="whitespace-nowrap text-slate-500 hover:text-slate-300">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
