import { Building2, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="bg-slate-50 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] [background-size:24px_24px]">
      <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-9 flex max-w-xl items-center gap-2 rounded-full bg-teal-200 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-950">
            <ShieldCheck className="h-4 w-4" />
            Institutional verification guaranteed
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
            Crowdfunding You Can{" "}
            <span className="text-teal-800">Finally Trust.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-700 md:text-lg">
            Every medical case on Korede is verified by accredited hospitals,
            settled directly to healthcare providers, and recorded immutably on
            the Solana blockchain.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-md bg-teal-800 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900">
              Explore Active Cases
            </button>
            <button className="rounded-md border border-teal-950 px-7 py-4 text-sm font-bold text-teal-950 transition hover:bg-white">
              For Hospitals: Partner With Us
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -right-4 -top-5 z-10 flex items-center gap-2 rounded-md border border-amber-700 bg-amber-400 px-5 py-3 text-sm font-semibold text-amber-950 shadow-md">
            <ShieldCheck className="h-4 w-4" />
            Hospital Verified
          </div>

          <div className="rounded-lg border-t-4 border-teal-900 bg-white p-8 shadow-xl shadow-slate-300/60">
            <div className="flex items-center gap-5">
              <img
                src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=160&q=80"
                alt="Verified patient case"
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Case #4029</h2>
                <p className="text-sm text-slate-600">
                  St. Nicholas Hospital, Lagos
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Raised
                </p>
                <p className="text-2xl font-bold text-teal-950">N1,200,000</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Target
                </p>
                <p className="text-sm font-semibold text-slate-900">N3,000,000</p>
              </div>
            </div>

            <div className="mt-5 h-3 rounded-full bg-teal-100">
              <div className="h-3 w-2/5 rounded-full bg-teal-800" />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
              <Building2 className="h-5 w-5 text-teal-900" />
              Escrow held on Solana Network
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
