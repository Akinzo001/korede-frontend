import { Building2, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="bg-slate-50 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] [background-size:24px_24px]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:min-h-[520px] lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-7 flex max-w-full items-center gap-2 rounded-lg bg-teal-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-950 sm:mb-9 sm:max-w-xl sm:rounded-full sm:px-4 sm:py-1 sm:text-xs sm:tracking-[0.18em]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="min-w-0">Institutional verification guaranteed</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Crowdfunding You Can{" "}
            <span className="text-teal-800">Finally Trust.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-slate-700 md:text-lg">
            Every medical case on Korede is verified by accredited hospitals,
            settled directly to healthcare providers, and recorded immutably on
            the Sui blockchain.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button className="w-full rounded-md bg-teal-800 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-900 sm:w-auto">
              Explore Active Cases
            </button>
            <button className="w-full rounded-md border border-teal-950 px-7 py-4 text-sm font-bold text-teal-950 transition hover:bg-white sm:w-auto">
              For Hospitals: Partner With Us
            </button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-3 ml-auto flex w-fit items-center gap-2 rounded-md border border-amber-700 bg-amber-400 px-4 py-2 text-xs font-semibold text-amber-950 shadow-md sm:absolute sm:-right-4 sm:-top-5 sm:z-10 sm:mb-0 sm:px-5 sm:py-3 sm:text-sm">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Hospital Verified
          </div>

          <div className="rounded-lg border-t-4 border-teal-900 bg-white p-5 shadow-xl shadow-slate-300/60 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <img
                src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=160&q=80"
                alt="Verified patient case"
                className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
              />
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
                  Case #4029
                </h2>
                <p className="text-sm text-slate-600">
                  St. Nicholas Hospital, Lagos
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Raised
                </p>
                <p className="text-xl font-bold text-teal-950 sm:text-2xl">
                  N1,200,000
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Target
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  N3,000,000
                </p>
              </div>
            </div>

            <div className="mt-5 h-3 rounded-full bg-teal-100">
              <div className="h-3 w-2/5 rounded-full bg-teal-800" />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
              <Building2 className="h-5 w-5 shrink-0 text-teal-900" />
              Escrow held on Sui Network
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
