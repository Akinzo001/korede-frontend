import { Link } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";

const navItems = ["Explore Cases", "How it Works", "For Hospitals"];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-6 lg:gap-10">
          <Link to="/" className="shrink-0 text-lg sm:text-xl">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-slate-700 lg:flex">
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

        <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
          <Link
            to="/login"
            className="text-xs font-medium text-slate-800 transition hover:text-teal-800 sm:text-sm"
          >
            Log In
          </Link>
          <button className="rounded-md bg-teal-800 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 sm:px-5 sm:text-sm">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
