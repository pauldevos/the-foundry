import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-stone-800 bg-stone-950/95 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center gap-5 overflow-x-auto px-4 py-3 text-sm">
          <Link href="/" className="whitespace-nowrap font-serif text-base text-stone-100">
            Foundry Study
          </Link>
          <Link href="/" className="whitespace-nowrap text-stone-400 hover:text-amber-500">
            Review
          </Link>
          <Link href="/notes" className="whitespace-nowrap text-stone-400 hover:text-amber-500">
            Notes
          </Link>
          <Link href="/talk-tracks" className="whitespace-nowrap text-stone-400 hover:text-amber-500">
            Talk Tracks
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
