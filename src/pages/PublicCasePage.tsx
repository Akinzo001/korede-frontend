import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  Copy,
  FileText,
  HeartHandshake,
  Landmark,
  LockKeyhole,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";
import { API_BASE_URL, PUBLIC_APP_BASE_URL } from "../config/api";
import { formatNairaFromKobo } from "../lib/auth";

type PublicCase = {
  admitted_at: string | null;
  active_pending_payment_count: number;
  amount_raised_kobo: number;
  available_amount_kobo: number;
  bill_amount_kobo: number;
  created_at: string;
  diagnosis_summary: string;
  donation_options: DonationOptions;
  donors: PublicDonor[];
  hospital_id: string;
  hospital_address: string;
  hospital_name: string;
  id: string;
  patient_declaration: string;
  patient_id: string;
  public_link: string;
  public_slug: string;
  pending_amount_kobo: number;
  remaining_amount_kobo: number;
  status: string;
  title: string;
  updated_at: string;
};

type DonationOptions = {
  checkout_enabled: boolean;
  donations_closed: boolean;
  dva_enabled: boolean;
};

type PublicDonor = {
  amount_kobo: number;
  display_name: string;
  id: string;
  method: string;
  paid_at: string;
  sui_transaction_url: string;
};

type PaymentMethod = "checkout" | "dva_transfer";

type CheckoutDetails = {
  access_code: string;
  amount_kobo: number;
  authorization_url: string;
  donation_id: string;
  donor_display_name: string;
  expires_in_seconds: number;
  paystack_reference: string;
  reservation_expires_at: string;
};

type DonationInitializeResponse = {
  checkout: CheckoutDetails | null;
  checkout_enabled: boolean;
  donations_closed: boolean;
  dva_enabled: boolean;
  dva_transfer: Record<string, unknown> | null;
  payment_method: string;
};

type PaymentVerificationResponse = {
  donation_id: string;
  message: string;
  payment_status: string;
  status: string;
};

const pendingPaystackReferenceKey = "korede_pending_paystack_reference";
const activePaystackVerifications = new Set<string>();

export function PublicCasePage() {
  const { publicSlug } = useParams();
  const [medicalCase, setMedicalCase] = useState<PublicCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!publicSlug) {
      return;
    }

    let isMounted = true;

    async function loadPublicCase() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const responseBody = await fetchPublicCase(publicSlug ?? "");

        if (isMounted) {
          setMedicalCase(parsePublicCase(responseBody));
        }
      } catch (error) {
        if (isMounted) {
          setMedicalCase(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "We could not reconnect to this campaign. Please refresh and try again.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPublicCase();

    return () => {
      isMounted = false;
    };
  }, [publicSlug]);

  useEffect(() => {
    const pendingReference = sessionStorage.getItem(
      pendingPaystackReferenceKey,
    );

    if (pendingReference) {
      void monitorPaystackPayment(pendingReference, null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Go to Korede home">
            <BrandLogo size="lg" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#story" className="hover:text-teal-800">
              Story
            </a>
            <a href="#transparency" className="hover:text-teal-800">
              Transparency
            </a>
            <a href="#security" className="hover:text-teal-800">
              Security
            </a>
          </nav>
          <a
            href="#donate"
            className="inline-flex items-center justify-center rounded-lg bg-teal-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-900"
          >
            Donate Now
          </a>
        </div>
      </header>

      {!publicSlug ? (
        <PublicCaseError message="Medical case was not found." />
      ) : isLoading ? (
        <PublicCaseSkeleton />
      ) : errorMessage || !medicalCase ? (
        <PublicCaseError message={errorMessage} />
      ) : (
        <PublicCaseContent medicalCase={medicalCase} />
      )}
    </div>
  );
}

function PublicCaseContent({ medicalCase }: { medicalCase: PublicCase }) {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("checkout");
  const [isInitializingDonation, setIsInitializingDonation] = useState(false);
  const [donationResponse, setDonationResponse] =
    useState<DonationInitializeResponse | null>(null);
  const raised = medicalCase.amount_raised_kobo;
  const target = medicalCase.bill_amount_kobo;
  const remaining = medicalCase.remaining_amount_kobo;
  const fundedPercentage =
    target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
  const publicUrl = toAbsolutePublicUrl(
    medicalCase.public_link || `/cases/${medicalCase.public_slug}`,
  );
  const patientName = getPatientNameFromSlug(medicalCase.public_slug);
  const billingItems = buildBillingItems(medicalCase);
  const donorCount = medicalCase.donors.length;
  const donationOptions = parseDonationOptions(medicalCase.donation_options);

  const copyPublicUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Campaign link copied.");
  };

  const initializeDonation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amountNumber = Number(amount);

    if (!donorName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!donorEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!amountNumber || amountNumber <= 0) {
      toast.error("Please enter a valid donation amount.");
      return;
    }

    const checkoutWindow =
      paymentMethod === "checkout" ? window.open("", "_blank") : null;

    setIsInitializingDonation(true);
    setDonationResponse(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/cases/${encodeURIComponent(
          medicalCase.public_slug,
        )}/donations/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amountNumber,
            donor_email: donorEmail.trim(),
            donor_name: donorName.trim(),
            payment_method: paymentMethod,
          }),
        },
      );
      const responseBody = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(getDonationErrorMessage(response.status, responseBody));
      }

      const initializedDonation = parseDonationInitializeResponse(responseBody);

      if (initializedDonation.payment_method === "checkout") {
        const checkoutUrl = initializedDonation.checkout?.authorization_url;

        if (!checkoutUrl) {
          checkoutWindow?.close();
          throw new Error(
            "Paystack did not return a checkout link. Please try again.",
          );
        }

        if (checkoutWindow) {
          sessionStorage.setItem(
            pendingPaystackReferenceKey,
            initializedDonation.checkout?.paystack_reference ?? "",
          );
          checkoutWindow.location.assign(checkoutUrl);
          void monitorPaystackPayment(
            initializedDonation.checkout?.paystack_reference ?? "",
            checkoutWindow,
          );
        } else {
          toast.error(
            "Your browser blocked the Paystack tab. Allow pop-ups and try again.",
          );
        }

        return;
      }

      setDonationResponse(initializedDonation);
      toast.success("Donation payment initialized.");
    } catch (error) {
      checkoutWindow?.close();
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to initialize donation.",
      );
    } finally {
      setIsInitializingDonation(false);
    }
  };

  return (
    <>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="min-w-0 space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Korede
          </Link>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
              <div className="p-5 sm:p-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Hospital verified case
                </span>
                <h1 className="mt-5 break-words text-3xl font-bold tracking-tight sm:text-5xl">
                  {patientName}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  {medicalCase.title}
                </p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Admitted: {formatCaseDate(medicalCase.admitted_at)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Case: {medicalCase.public_slug || medicalCase.id}
                  </span>
                </div>
              </div>

              <div className="relative min-h-72 bg-slate-100">
                <img
                  src="/patient-dashboard-care-bg.png"
                  alt=""
                  className="h-full min-h-72 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/45 to-transparent" />
              </div>
            </div>
          </section>

          <section
            id="story"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold">The Story</h2>
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Patient statement
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-800">
                {medicalCase.patient_declaration || "No patient statement available."}
              </p>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Medical summary
              </p>
              <p className="mt-3 whitespace-pre-wrap break-words text-base leading-8 text-slate-800">
                {medicalCase.diagnosis_summary || "No medical summary available."}
              </p>
            </div>
          </section>

          <section
            id="transparency"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <h2 className="text-2xl font-bold">Billing Breakdown</h2>
              </div>
              <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold">
                NGN (₦)
              </span>
            </div>
            <div className="divide-y divide-slate-200">
              {billingItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <p className="break-words font-semibold">{item.label}</p>
                  </div>
                  <p className="shrink-0 font-bold">
                    {formatNairaFromKobo(item.amount)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 bg-teal-50 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <p className="text-2xl font-bold">Total Required</p>
              <p className="text-3xl font-bold text-teal-800 sm:text-4xl">
                {formatNairaFromKobo(target)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-2xl font-bold">Transparency Ledger</h2>
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-300 bg-slate-100 text-slate-900">
              {[
                ["Case published", medicalCase.id, formatCaseDate(medicalCase.created_at)],
                ["Funds raised", "Verified donations", formatNairaFromKobo(raised)],
                ["Remaining", "Outstanding bill", formatNairaFromKobo(remaining)],
              ].map(([label, detail, value]) => (
                <div
                  key={label}
                  className="grid gap-2 border-b border-slate-300 px-4 py-4 text-sm last:border-b-0 sm:grid-cols-[160px_1fr_160px]"
                >
                  <span className="font-bold text-slate-800">{label}</span>
                  <span className="break-all text-slate-600">{detail}</span>
                  <span className="font-bold text-slate-950 sm:text-right">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section
            id="donate"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total raised
            </p>
            <div className="mt-2 flex items-end gap-2">
              <p className="break-words text-3xl font-bold text-slate-950">
                {formatNairaFromKobo(raised)}
              </p>
              <p className="pb-1 text-sm font-semibold text-slate-500">
                of {formatNairaFromKobo(target)}
              </p>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-700"
                style={{ width: `${fundedPercentage}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>{fundedPercentage}% funded</span>
              <Link
                to={`/cases/${encodeURIComponent(
                  medicalCase.public_slug,
                )}/donors`}
                className="font-bold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-teal-950"
              >
                View {donorCount} donor{donorCount === 1 ? "" : "s"}
              </Link>
            </div>

            <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm font-semibold text-teal-900">
              <ShieldCheck className="mb-2 h-5 w-5" />
              Secure published case verified by a hospital partner.
            </div>

            {donationOptions.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-sm font-bold">Donation options</p>
                {donationOptions.map((option) => (
                  <div
                    key={option}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={initializeDonation} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  Your name
                </span>
                <input
                  type="text"
                  value={donorName}
                  onChange={(event) => setDonorName(event.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  Email address
                </span>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(event) => setDonorEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  Amount (NGN)
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="5000"
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                />
              </label>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Payment method
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  {[
                    { label: "Checkout", value: "checkout" },
                    { label: "DVA transfer", value: "dva_transfer" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(method.value as PaymentMethod)
                      }
                      className={`rounded-lg px-3 py-3 text-sm font-bold transition ${
                        paymentMethod === method.value
                          ? "bg-white text-teal-800 shadow-sm"
                          : "text-slate-600 hover:text-teal-800"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  isInitializingDonation ||
                  medicalCase.donation_options.donations_closed
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <HeartHandshake className="h-5 w-5" />
                {medicalCase.donation_options.donations_closed
                  ? "Donations closed"
                  : isInitializingDonation
                    ? "Initializing..."
                    : "Donate to this bill"}
              </button>
            </form>

            {donationResponse && (
              <DonationPaymentResult donation={donationResponse} />
            )}

            <button
              type="button"
              onClick={copyPublicUrl}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
            >
              <Copy className="h-4 w-4" />
              Copy campaign link
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Building2 className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold">The Hospital</h2>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <div className="h-36 bg-[radial-gradient(circle_at_30%_30%,#14b8a6_0_3px,transparent_4px),linear-gradient(135deg,#e2e8f0,#f8fafc)]" />
              <div className="space-y-3 bg-white p-4">
                <p className="text-sm font-bold">
                  {medicalCase.hospital_name || "Verified hospital partner"}
                </p>
                {medicalCase.hospital_address && (
                  <p className="text-sm leading-6 text-slate-600">
                    {medicalCase.hospital_address}
                  </p>
                )}
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <MapPin className="h-4 w-4" />
                  Case origin verified
                </p>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <section
        id="security"
        className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl bg-teal-50 p-5 sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold">How your money moves</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Funds are tracked through a transparent medical funding workflow.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MoneyMoveStep
              icon={WalletCards}
              title="You donate"
              body="Select an amount and contribute securely toward this verified bill."
            />
            <MoneyMoveStep
              icon={LockKeyhole}
              title="Smart escrow"
              body="Funds are tracked against the public case and verified bill."
            />
            <MoneyMoveStep
              icon={Landmark}
              title="Direct hospital settlement"
              body="Payments are routed toward hospital care and settlement."
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <BrandLogo size="lg" />
          <p>Donors only. Terms of service. Security. Audit ledger.</p>
        </div>
      </footer>
    </>
  );
}

function MoneyMoveStep({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof WalletCards;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-xl bg-white p-5 text-center shadow-sm">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-800 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}

function DonationPaymentResult({
  donation,
}: {
  donation: DonationInitializeResponse;
}) {
  const transferDetails = donation.dva_transfer;

  return (
    <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50 p-4">
      <p className="text-sm font-bold text-teal-950">
        Transfer details
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">
        Use the bank details below to complete your donation.
      </p>

      {transferDetails && (
        <div className="mt-4 space-y-2 rounded-lg border border-teal-100 bg-white p-3">
          {Object.entries(transferDetails).map(([key, value]) => (
            <PaymentDetail
              key={key}
              label={formatPaymentLabel(key)}
              value={formatPaymentValue(key, value)}
            />
          ))}
        </div>
      )}

      {donation.donations_closed && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          Donations are currently closed for this case.
        </p>
      )}
    </div>
  );
}

function PaymentDetail({ label, value }: { label: string; value: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 sm:grid-cols-[120px_1fr]">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="break-all font-bold text-slate-800">{value}</span>
    </div>
  );
}

function PublicCaseSkeleton() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-6 h-12 w-3/4 rounded bg-slate-100" />
        <div className="mt-6 h-80 rounded-xl bg-slate-100" />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-10 w-48 rounded bg-slate-100" />
        <div className="mt-6 h-3 rounded bg-slate-100" />
      </section>
    </main>
  );
}

function PublicCaseError({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Case not available</h1>
      <p className="mt-3 text-slate-600">
        {message || "Medical case was not found."}
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-800 px-5 py-3 text-sm font-bold text-white"
      >
        Go to Korede
      </Link>
    </main>
  );
}

function buildBillingItems(medicalCase: PublicCase) {
  const target = medicalCase.bill_amount_kobo;
  const remaining = Math.max(medicalCase.remaining_amount_kobo, 0);
  const raised = Math.max(medicalCase.amount_raised_kobo, 0);

  return [
    {
      label: medicalCase.title || "Medical treatment",
      amount: target,
      icon: ReceiptText,
    },
    {
      label: "Already raised",
      amount: raised,
      icon: WalletCards,
    },
    {
      label: "Still needed",
      amount: remaining,
      icon: HeartHandshake,
    },
  ];
}

function parseDonationOptions(options: DonationOptions) {
  const enabledOptions: string[] = [];

  if (options.checkout_enabled) {
    enabledOptions.push("Secure online checkout");
  }

  if (options.dva_enabled) {
    enabledOptions.push("Bank transfer");
  }

  return enabledOptions;
}

function parseDonationOptionsResponse(value: unknown): DonationOptions {
  if (!value || typeof value !== "object") {
    return {
      checkout_enabled: false,
      donations_closed: false,
      dva_enabled: false,
    };
  }

  const options = value as Record<string, unknown>;

  return {
    checkout_enabled: getBoolean(options.checkout_enabled),
    donations_closed: getBoolean(options.donations_closed),
    dva_enabled: getBoolean(options.dva_enabled),
  };
}

function parsePublicDonors(value: unknown): PublicDonor[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (donor): donor is Record<string, unknown> =>
        Boolean(donor) && typeof donor === "object",
    )
    .map((donor) => ({
      amount_kobo: getNumber(donor.amount_kobo),
      display_name: getString(donor.display_name),
      id: getString(donor.id),
      method: getString(donor.method),
      paid_at: getString(donor.paid_at),
      sui_transaction_url: getString(donor.sui_transaction_url),
    }));
}

function getPatientNameFromSlug(slug: string) {
  const [first = "Patient", second = ""] = slug.split("-");
  const name = `${capitalize(first)} ${capitalize(second)}`.trim();

  return name || "Patient";
}

function capitalize(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "";
}

function formatCaseDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}

function toAbsolutePublicUrl(value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(
      value.startsWith("/") ? value : `/${value}`,
      PUBLIC_APP_BASE_URL,
    ).toString();
  }
}

function parsePublicCase(responseBody: unknown): PublicCase {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid public case response.");
  }

  const body = responseBody as Record<string, unknown>;

  return {
    admitted_at: getNullableString(body.admitted_at),
    active_pending_payment_count: getNumber(
      body.active_pending_payment_count,
    ),
    amount_raised_kobo: getNumber(body.amount_raised_kobo),
    available_amount_kobo: getNumber(body.available_amount_kobo),
    bill_amount_kobo: getNumber(body.bill_amount_kobo),
    created_at: getString(body.created_at),
    diagnosis_summary: getString(body.diagnosis_summary),
    donation_options: parseDonationOptionsResponse(body.donation_options),
    donors: parsePublicDonors(body.donors),
    hospital_id: getString(body.hospital_id),
    hospital_address: getString(body.hospital_address),
    hospital_name: getString(body.hospital_name),
    id: getString(body.id),
    patient_declaration: getPatientStatement(body),
    patient_id: getString(body.patient_id),
    public_link: getString(body.public_link),
    public_slug: getString(body.public_slug),
    pending_amount_kobo: getNumber(body.pending_amount_kobo),
    remaining_amount_kobo: getNumber(body.remaining_amount_kobo),
    status: getString(body.status),
    title: getString(body.title),
    updated_at: getString(body.updated_at),
  };
}

function parseDonationInitializeResponse(
  responseBody: unknown,
): DonationInitializeResponse {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid donation response.");
  }

  const body = responseBody as Record<string, unknown>;

  return {
    checkout: parseCheckoutDetails(body.checkout),
    checkout_enabled: getBoolean(body.checkout_enabled),
    donations_closed: getBoolean(body.donations_closed),
    dva_enabled: getBoolean(body.dva_enabled),
    dva_transfer: getObject(body.dva_transfer),
    payment_method: getString(body.payment_method),
  };
}

function parseCheckoutDetails(value: unknown): CheckoutDetails | null {
  const checkout = getObject(value);

  if (!checkout) {
    return null;
  }

  return {
    access_code: getString(checkout.access_code),
    amount_kobo: getNumber(checkout.amount_kobo),
    authorization_url: getString(checkout.authorization_url),
    donation_id: getString(checkout.donation_id),
    donor_display_name: getString(checkout.donor_display_name),
    expires_in_seconds: getNumber(checkout.expires_in_seconds),
    paystack_reference: getString(checkout.paystack_reference),
    reservation_expires_at: getString(checkout.reservation_expires_at),
  };
}

function parsePaymentVerificationResponse(
  responseBody: unknown,
): PaymentVerificationResponse {
  const body = getObject(responseBody);

  if (!body) {
    throw new Error("The payment verification response was invalid.");
  }

  return {
    donation_id: getString(body.donation_id),
    message: getString(body.message),
    payment_status: getString(body.payment_status),
    status: getString(body.status),
  };
}

async function monitorPaystackPayment(
  paystackReference: string,
  checkoutWindow: Window | null,
) {
  if (!paystackReference) {
    checkoutWindow?.close();
    toast.error("The Paystack payment reference is missing.");
    return;
  }

  if (activePaystackVerifications.has(paystackReference)) {
    return;
  }

  activePaystackVerifications.add(paystackReference);
  const maximumAttempts = 100;

  try {
    for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
      if (attempt > 0) {
        await wait(3000);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/payments/paystack/verify/${encodeURIComponent(
            paystackReference,
          )}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
            },
          },
        );
        const responseBody = await parseJsonResponse(response);

        if (!response.ok) {
          continue;
        }

        const verification = parsePaymentVerificationResponse(responseBody);

        if (verification.payment_status === "paid") {
          sessionStorage.removeItem(pendingPaystackReferenceKey);
          checkoutWindow?.close();
          toast.success(
            verification.message || "Payment verified successfully.",
          );
          window.setTimeout(
            () => window.location.replace(window.location.pathname),
            1200,
          );
          return;
        }
      } catch {
        // A temporary verification failure should not interrupt checkout.
      }
    }

    toast.error(
      "Payment verification timed out. Refresh the campaign to check the latest donation status.",
    );
  } finally {
    activePaystackVerifications.delete(paystackReference);
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getPatientStatement(body: Record<string, unknown>) {
  const directStatement =
    getString(body.patient_statement) ||
    getString(body.statement);

  if (directStatement) {
    return directStatement;
  }

  const patientDeclaration =
    body.patient_declaration && typeof body.patient_declaration === "object"
      ? (body.patient_declaration as Record<string, unknown>)
      : null;
  const declaration =
    body.declaration && typeof body.declaration === "object"
      ? (body.declaration as Record<string, unknown>)
      : null;

  if (patientDeclaration) {
    return getString(patientDeclaration.statement);
  }

  return declaration
    ? getString(declaration.statement)
    : getString(body.patient_declaration);
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function getObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function formatPaymentLabel(value: string) {
  return value
    .replace(/_kobo$/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPaymentValue(key: string, value: unknown) {
  if (key.endsWith("_kobo") && typeof value === "number") {
    return formatNairaFromKobo(value);
  }

  if (
    (key.endsWith("_at") || key.includes("expires")) &&
    typeof value === "string"
  ) {
    return formatCaseDate(value);
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

async function fetchPublicCase(publicSlug: string) {
  const maximumAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cases/${encodeURIComponent(publicSlug)}`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );
      const responseBody = await parseJsonResponse(response);

      if (response.status === 404) {
        throw new Error("Medical case was not found.");
      }

      if (response.ok) {
        return responseBody;
      }

      const error = new Error(
        getApiMessage(
          responseBody,
          "We could not reconnect to this campaign. Please try again.",
        ),
      );

      if (response.status < 500) {
        throw error;
      }

      lastError = error;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Medical case was not found."
      ) {
        throw error;
      }

      lastError = error;
    }

    if (attempt < maximumAttempts - 1) {
      await wait(1000 * (attempt + 1));
    }
  }

  throw new Error(
    lastError instanceof Error && lastError.message !== "Failed to fetch"
      ? lastError.message
      : "We could not reconnect to this campaign. Check your connection and try again.",
  );
}

function getApiMessage(responseBody: unknown, fallbackMessage: string) {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "message" in responseBody &&
    typeof responseBody.message === "string"
  ) {
    return responseBody.message;
  }

  if (
    responseBody &&
    typeof responseBody === "object" &&
    "detail" in responseBody &&
    typeof responseBody.detail === "string"
  ) {
    return responseBody.detail;
  }

  return fallbackMessage;
}

function getDonationErrorMessage(status: number, responseBody: unknown) {
  const backendMessage = getApiMessage(responseBody, "");

  if (backendMessage) {
    return backendMessage;
  }

  if (status === 409) {
    return "This donation cannot be accepted because donations are closed or the amount exceeds the campaign's remaining balance.";
  }

  if (status === 404) {
    return "This medical campaign could not be found.";
  }

  if (status === 400) {
    return "The donation details are invalid. Please check the amount, email, and payment method.";
  }

  return "We could not start this donation. Please try again.";
}
