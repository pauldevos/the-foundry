import Link from "next/link";
import NavTopicsDropdown from "@/components/nav-topics-dropdown";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-stone-800 bg-stone-950/95 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center gap-5 px-4 py-3 text-sm">
          <Link href="/" className="whitespace-nowrap font-serif text-base text-stone-100">
            Foundry Study
          </Link>
          <NavTopicsDropdown />
          <Link href="/study-cards" className="whitespace-nowrap text-stone-400 hover:text-amber-500">
            Study Cards
          </Link>
          <Link href="/interviews" className="whitespace-nowrap text-stone-400 hover:text-amber-500">
            Interviews
          </Link>
          <Link href="/search" className="whitespace-nowrap text-stone-400 hover:text-amber-500">
            Search
          </Link>
          <form action="/api/logout" method="post" className="ml-auto">
            <button type="submit" className="whitespace-nowrap text-stone-500 hover:text-stone-300">
              Log out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
