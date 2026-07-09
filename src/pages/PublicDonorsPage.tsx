import {
  ArrowLeft,
  ExternalLink,
  HeartHandshake,
  ReceiptText,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { API_BASE_URL } from "../config/api";
import { formatNairaFromKobo } from "../lib/auth";

type PublicDonor = {
  amount_kobo: number;
  display_name: string;
  id: string;
  method: string;
  paid_at: string;
  sui_transaction_url: string;
};

type DonorsResponse = {
  donors: PublicDonor[];
  title: string;
};

export function PublicDonorsPage() {
  const { publicSlug } = useParams();
  const [campaign, setCampaign] = useState<DonorsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(publicSlug));

  useEffect(() => {
    if (!publicSlug) {
      return;
    }

    let isMounted = true;

    async function loadDonors() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cases/${encodeURIComponent(publicSlug ?? "")}`,
          {
            cache: "no-store",
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Campaign not found."
              : "Unable to load donors right now.",
          );
        }

        const responseBody = (await response.json()) as unknown;
        const parsedCampaign = parseDonorsResponse(responseBody);

        if (isMounted) {
          setCampaign(parsedCampaign);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load donors right now.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDonors();

    return () => {
      isMounted = false;
    };
  }, [publicSlug]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Go to Korede home">
            <BrandLogo size="lg" />
          </Link>
          <Link
            to={`/cases/${encodeURIComponent(publicSlug ?? "")}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Campaign
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Campaign donors</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              {campaign?.title || "Verified contributions to this medical case"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <DonorsSkeleton />
        ) : !publicSlug || errorMessage ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
            {errorMessage || "Campaign not found."}
          </div>
        ) : campaign && campaign.donors.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[1fr_160px_210px_130px] gap-4 border-b border-slate-200 bg-slate-100 px-5 py-3 text-xs font-bold uppercase text-slate-500 md:grid">
              <span>Donor</span>
              <span>Amount</span>
              <span>Donated</span>
              <span>Transaction</span>
            </div>
            <div className="divide-y divide-slate-200">
              {campaign.donors.map((donor) => (
                <article
                  key={donor.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_160px_210px_130px] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-800">
                      {getInitials(donor.display_name)}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words font-bold">
                        {donor.display_name || "Anonymous donor"}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-slate-500">
                        {donor.method.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                  <DonorField
                    label="Amount"
                    value={formatNairaFromKobo(donor.amount_kobo)}
                  />
                  <DonorField
                    label="Donated"
                    value={formatDonationTime(donor.paid_at)}
                  />
                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase text-slate-500 md:hidden">
                      Transaction
                    </span>
                    {isSafeExternalUrl(donor.sui_transaction_url) ? (
                      <a
                        href={donor.sui_transaction_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-teal-800 hover:text-teal-950"
                      >
                        View on SuiScan
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500">Pending</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <HeartHandshake className="mx-auto h-10 w-10 text-teal-700" />
            <h2 className="mt-4 text-xl font-bold">No donors yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              The first verified contribution will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function DonorField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-bold uppercase text-slate-500 md:hidden">
        {label}
      </span>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function DonorsSkeleton() {
  return (
    <div className="mt-8 space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function parseDonorsResponse(responseBody: unknown): DonorsResponse {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid campaign response.");
  }

  const body = responseBody as Record<string, unknown>;
  const donors = Array.isArray(body.donors) ? body.donors : [];

  return {
    title: getString(body.title),
    donors: donors
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
      })),
  };
}

function formatDonationTime(value: string) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getInitials(name: string) {
  if (!name) {
    return <ReceiptText className="h-4 w-4" />;
  }

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function isSafeExternalUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
