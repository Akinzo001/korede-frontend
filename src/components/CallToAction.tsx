import { Link } from "react-router-dom";

export function CallToAction() {
  return (
    <section className="bg-teal-900 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] px-4 py-16 text-white [background-size:24px_24px] sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to restore faith in medical giving?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-teal-50">
          Whether you are a hospital seeking a reliable funding channel or a
          donor looking for radical transparency, Korede is built for you.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/patient/register"
            className="inline-flex w-full items-center justify-center rounded-md bg-amber-400 px-7 py-4 text-sm font-semibold text-teal-950 transition hover:bg-amber-300 sm:w-auto"
          >
            Create Your First Case
          </Link>
          <button className="w-full rounded-md border border-white px-7 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-teal-950 sm:w-auto">
            Learn About On-Chain Settlements
          </button>
        </div>
      </div>
    </section>
  );
}
