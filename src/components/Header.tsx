const navItems = ["Explore Cases", "How it Works", "For Hospitals"];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <a href="/" className="text-xl font-bold text-teal-950">
            Korede
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-700 md:flex">
            {navItems.map((item, index) => (
              <a
                key={item}
                href="#"
                className={
                  index === 0
                    ? "border-b-2 border-teal-800 pb-1 font-medium text-teal-950"
                    : "transition hover:text-teal-800"
                }
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button className="hidden text-slate-800 transition hover:text-teal-800 sm:block">
            Log In
          </button>
          <button className="rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
