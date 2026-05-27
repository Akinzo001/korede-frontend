import { CheckCircle2, Shield, XCircle } from "lucide-react";

const brokenWay = [
  "Unverified cases often rely on fabricated stories and forged documents.",
  "Donations sent to personal bank accounts are easily diverted for non-medical use.",
  "No transparency on whether the patient actually receives life-saving care.",
];

const koredeWay = [
  "Institutional Vetting: Cases only go live after hospital board accreditation.",
  "Direct-to-Hospital Settlement: Funds are locked in smart contracts and released only to hospitals.",
  "Cryptographic Receipts: Every kobo is trackable via immutable blockchain explorer links.",
];

export function IntegritySection() {
  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            A New Standard of Integrity
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Traditional medical crowdfunding is plagued by fraud and
            inefficiency. Korede replaces hope with cryptographic certainty.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-16 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-300 bg-white p-6 sm:p-10">
            <h3 className="text-xl font-semibold text-slate-950 sm:text-2xl">
              The Broken Way
            </h3>
            <ul className="mt-8 space-y-7">
              {brokenWay.map((item) => (
                <li key={item} className="flex gap-4 text-sm leading-6 text-slate-600 sm:gap-5">
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-800" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-teal-900 bg-white p-6 shadow-xl shadow-slate-300/50 sm:p-10">
            <Shield className="absolute right-6 top-6 h-20 w-20 text-teal-900/10 sm:right-10 sm:top-8 sm:h-24 sm:w-24" />
            <h3 className="text-xl font-semibold text-teal-950 sm:text-2xl">
              The Korede Way
            </h3>
            <ul className="mt-8 space-y-7">
              {koredeWay.map((item) => (
                <li key={item} className="flex gap-4 text-sm leading-6 text-slate-700 sm:gap-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-teal-800" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
