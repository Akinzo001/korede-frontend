import { Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";

export function LoginPage() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (!password) {
      toast.error("Password is required.");
      return;
    }

    toast.info("Login endpoint is not connected yet.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <section className="w-full max-w-xl">
          <div className="text-center">
            <Link to="/" className="inline-flex justify-center text-5xl sm:text-6xl">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-6 text-xl text-slate-800 sm:text-2xl">
              Welcome back to Korede.
            </p>
          </div>

          <form
            className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
            onSubmit={handleLogin}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-base font-medium text-slate-950"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="mt-2 h-14 w-full rounded-lg border border-slate-300 bg-slate-50 px-5 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:text-lg"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="password"
                className="block text-base font-medium text-slate-950"
              >
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-14 w-full rounded-lg border border-slate-300 bg-slate-50 px-5 pr-12 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10 sm:text-lg"
                />
                <button
                  type="button"
                  aria-label="Show password"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-teal-800"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 text-base sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-slate-800">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-teal-800 focus:ring-teal-800"
                />
                Remember me
              </label>
              <a
                href="#"
                className="font-medium text-teal-800 transition hover:text-teal-950"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="mt-9 h-14 w-full rounded-lg bg-teal-800 text-base font-bold text-white transition hover:bg-teal-900"
            >
              Login
            </button>
          </form>

          <div className="mt-10 space-y-5 text-center text-lg text-slate-800 sm:text-xl">
            <p>
              Need a verification check?{" "}
              <Link to="/hospital/register" className="font-medium text-teal-800">
                Hospital Partner Signup.
              </Link>
            </p>
            <p>
              Need to raise funds?{" "}
              <a href="#" className="font-medium text-amber-700">
                Start a Patient Case.
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-4 py-8 text-sm text-slate-600 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Korede Medical Funding. Secure Blockchain Verified.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Security Protocol"].map(
              (item) => (
                <a key={item} href="#" className="transition hover:text-teal-800">
                  {item}
                </a>
              ),
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
