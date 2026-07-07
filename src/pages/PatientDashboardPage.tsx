import {
  Activity,
  Copy,
  ExternalLink,
  Heart,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Menu,
  MessageSquareText,
  MessageCircle,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";
import { API_BASE_URL } from "../config/api";
import {
  clearPatientSession,
  formatNairaFromKobo,
  getPatientSession,
  type MedicalCase,
} from "../lib/auth";

type DashboardSection = "dashboard" | "progress" | "sharing" | "supporters";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "progress", label: "Progress Hub", icon: Activity },
  { key: "sharing", label: "Sharing Toolkit", icon: Share2 },
  { key: "supporters", label: "Supporter Feed", icon: Users },
] satisfies Array<{
  key: DashboardSection;
  label: string;
  icon: typeof LayoutDashboard;
}>;

type DonationProgressCase = {
  amount_raised_kobo: number;
  bill_amount_kobo: number;
  medical_case_id: string;
  public_link: string;
  public_slug: string;
  remaining_amount_kobo: number;
  status: string;
  title: string;
};

type ProgressDonor = {
  amount_kobo: number;
  display_name: string;
  id: string;
  method: string;
  paid_at: string;
  sui_transaction_url: string;
};

type DonationProgress = {
  case: DonationProgressCase;
  donor_count: number;
  donors: ProgressDonor[];
  percentage_left: number;
  percentage_paid: number;
};

type ShareLinkDetails = {
  medical_case_id: string;
  message: string;
  public_link: string;
  public_slug: string;
  share_url: string;
  title: string;
};

const sectionCopy: Record<DashboardSection, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Welcome back",
    subtitle: "Here is the latest progress on your funding journey.",
  },
  progress: {
    title: "Progress Hub",
    subtitle: "Track the current open medical case and recent donation activity.",
  },
  sharing: {
    title: "Sharing Toolkit",
    subtitle: "Campaign sharing tools will appear here once a case is active.",
  },
  supporters: {
    title: "Supporter Feed",
    subtitle: "Supporter activity will appear here once donations begin.",
  },
};

const placeholderSections: Record<Exclude<DashboardSection, "dashboard" | "progress" | "sharing">, {
  icon: typeof Share2;
  title: string;
  body: string;
}> = {
  supporters: {
    icon: Users,
    title: "Supporter feed is waiting for donations",
    body: "Recent donor names, messages, and payment activity will show here when your campaign receives support.",
  },
};

type PatientDeclaration = {
  created_at: string;
  id: string;
  patient_id: string;
  statement: string;
  updated_at: string;
};

type DeclarationMode = "create" | "update";

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);
  const [declarationMode, setDeclarationMode] =
    useState<DeclarationMode>("create");
  const [declaration, setDeclaration] = useState<PatientDeclaration | null>(
    null,
  );
  const [isLoadingDeclaration, setIsLoadingDeclaration] = useState(false);
  const [donationProgress, setDonationProgress] =
    useState<DonationProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [progressRequestCount, setProgressRequestCount] = useState(0);
  const [selectedProgressCaseId, setSelectedProgressCaseId] =
    useState("current");
  const [shareLinkDetails, setShareLinkDetails] =
    useState<ShareLinkDetails | null>(null);
  const [isLoadingShareLink, setIsLoadingShareLink] = useState(false);
  const [shareLinkError, setShareLinkError] = useState("");
  const [shareLinkRequestCount, setShareLinkRequestCount] = useState(0);
  const session = useMemo(() => getPatientSession(), []);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    let isMounted = true;

    const loadDeclaration = async () => {
      setIsLoadingDeclaration(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/patients/declaration`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        const responseBody = await parseJsonResponse(response);

        if (response.status === 404) {
          if (isMounted) {
            setDeclaration(null);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            getApiMessage(responseBody, "Unable to load declaration."),
          );
        }

        if (isMounted) {
          setDeclaration(parsePatientDeclaration(responseBody));
        }
      } catch (error) {
        if (isMounted) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load declaration.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingDeclaration(false);
        }
      }
    };

    void loadDeclaration();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (activeSection !== "progress" || !session?.access_token) {
      return;
    }

    let isMounted = true;

    const loadProgress = async () => {
      setIsLoadingProgress(true);
      setProgressError("");

      try {
        const progressEndpoint =
          selectedProgressCaseId === "current"
            ? "/api/v1/patients/cases/current/donation-progress"
            : `/api/v1/patients/cases/${encodeURIComponent(
                selectedProgressCaseId,
              )}/donation-progress`;
        const response = await fetch(`${API_BASE_URL}${progressEndpoint}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const responseBody = await parseJsonResponse(response);

        if (response.status === 404) {
          if (isMounted) {
            setDonationProgress(null);
            setProgressError(
              selectedProgressCaseId === "current"
                ? "Patient has no open medical case."
                : "Medical case was not found for this patient.",
            );
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            getApiMessage(responseBody, "Unable to load donation progress."),
          );
        }

        if (isMounted) {
          setDonationProgress(parseDonationProgress(responseBody));
        }
      } catch (error) {
        if (isMounted) {
          setDonationProgress(null);
          setProgressError(
            error instanceof Error
              ? error.message
              : "Unable to load donation progress.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingProgress(false);
        }
      }
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [activeSection, progressRequestCount, selectedProgressCaseId, session]);

  useEffect(() => {
    if (activeSection !== "sharing" || !session?.access_token) {
      return;
    }

    let isMounted = true;

    const loadShareLink = async () => {
      setIsLoadingShareLink(true);
      setShareLinkError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/patients/cases/current/share-link`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        const responseBody = await parseJsonResponse(response);

        if (response.status === 404) {
          if (isMounted) {
            setShareLinkDetails(null);
            setShareLinkError("Patient has no open medical case.");
          }
          return;
        }

        if (response.status === 409) {
          if (isMounted) {
            setShareLinkDetails(null);
            setShareLinkError(
              "This medical case does not have a public donation link yet.",
            );
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            getApiMessage(responseBody, "Unable to load sharing link."),
          );
        }

        if (isMounted) {
          setShareLinkDetails(parseShareLinkDetails(responseBody));
        }
      } catch (error) {
        if (isMounted) {
          setShareLinkDetails(null);
          setShareLinkError(
            error instanceof Error
              ? error.message
              : "Unable to load sharing link.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingShareLink(false);
        }
      }
    };

    void loadShareLink();

    return () => {
      isMounted = false;
    };
  }, [activeSection, shareLinkRequestCount, session]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const medicalCases = Array.isArray(session.medical_cases)
    ? session.medical_cases
    : [];
  const activeCase = medicalCases[0] ?? null;
  const patientDisplayName =
    session.patient.username ||
    session.patient.first_name ||
    session.patient.full_name ||
    "Patient";
  const currentSection = sectionCopy[activeSection];

  const logout = () => {
    clearPatientSession();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-no-repeat lg:left-[260px] xl:left-[280px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,250,252,0.58),rgba(248,250,252,0.78)),url('/patient-dashboard-care-bg.png')",
          backgroundPosition: "70% center",
        }}
      />
      <PatientSidebar
        patientName={patientDisplayName}
        activeSection={activeSection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
        hasDeclaration={Boolean(declaration)}
        isLoadingDeclaration={isLoadingDeclaration}
        onOpenDeclaration={(mode) => {
          setDeclarationMode(mode);
          setIsDeclarationOpen(true);
          setIsSidebarOpen(false);
        }}
        onSelectSection={(section) => {
          setActiveSection(section);
          setIsSidebarOpen(false);
        }}
      />

      <div className="relative z-10 min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:hidden">
          <Link to="/" className="text-3xl">
            <BrandLogo />
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
              {activeSection === "dashboard"
                ? `${currentSection.title}, ${patientDisplayName}`
                : currentSection.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              {currentSection.subtitle}
            </p>
          </div>

          {activeSection === "dashboard" &&
            (activeCase ? (
              <PatientCaseDashboard medicalCase={activeCase} />
            ) : (
              <NoMedicalCaseState
                patientName={patientDisplayName}
                declaration={declaration}
                isLoadingDeclaration={isLoadingDeclaration}
                onOpenDeclaration={(mode) => {
                  setDeclarationMode(mode);
                  setIsDeclarationOpen(true);
                }}
              />
            ))}

          {activeSection === "progress" && (
            <ProgressHubSection
              progress={donationProgress}
              isLoading={isLoadingProgress}
              errorMessage={progressError}
              cases={medicalCases}
              selectedCaseId={selectedProgressCaseId}
              onCaseChange={setSelectedProgressCaseId}
              onRetry={() => setProgressRequestCount((count) => count + 1)}
            />
          )}

          {activeSection === "sharing" && (
            <SharingToolkitSection
              shareLink={shareLinkDetails}
              isLoading={isLoadingShareLink}
              errorMessage={shareLinkError}
              onRetry={() => setShareLinkRequestCount((count) => count + 1)}
            />
          )}

          {activeSection === "supporters" && (
            <PlaceholderSection section={activeSection} />
          )}
        </main>
      </div>

      <DeclarationModal
        key={`${isDeclarationOpen}-${declarationMode}-${
          declaration?.updated_at ?? declaration?.id ?? "new"
        }`}
        isOpen={isDeclarationOpen}
        accessToken={session.access_token}
        mode={declarationMode}
        declaration={declaration}
        onClose={() => setIsDeclarationOpen(false)}
        onSaved={(savedDeclaration) => setDeclaration(savedDeclaration)}
      />
    </div>
  );
}

type PatientSidebarProps = {
  patientName: string;
  activeSection: DashboardSection;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  hasDeclaration: boolean;
  isLoadingDeclaration: boolean;
  onOpenDeclaration: (mode: DeclarationMode) => void;
  onSelectSection: (section: DashboardSection) => void;
};

function PatientSidebar({
  patientName,
  activeSection,
  isOpen,
  onClose,
  onLogout,
  hasDeclaration,
  isLoadingDeclaration,
  onOpenDeclaration,
  onSelectSection,
}: PatientSidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(18rem,calc(100vw-2rem))] flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5 xl:px-6">
          <Link to="/" className="text-3xl">
            <BrandLogo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-5 xl:px-6 xl:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-xl font-bold text-teal-900">
              {patientName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">Patient {patientName}</p>
              <p className="text-sm text-slate-600">Managing your journey</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5 xl:py-6">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectSection(key)}
              className={`flex w-full items-center gap-4 rounded-lg px-5 py-4 text-left text-sm font-semibold transition ${
                activeSection === key
                  ? "bg-teal-50 text-teal-900"
                  : "text-slate-700 hover:bg-slate-50 hover:text-teal-900"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              onOpenDeclaration(hasDeclaration ? "update" : "create")
            }
            disabled={isLoadingDeclaration}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg bg-teal-800 px-4 py-4 text-sm font-bold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <MessageSquareText className="h-5 w-5" />
            {hasDeclaration ? "Update declaration" : "Start declaration"}
          </button>
        </nav>

        <div className="space-y-2 border-t border-slate-200 px-4 py-5 xl:py-6">
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-lg px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-5 w-5" />
            Security Settings
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-4 rounded-lg px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function PatientCaseDashboard({ medicalCase }: { medicalCase: MedicalCase }) {
  const raised = medicalCase.amount_raised_kobo;
  const target = medicalCase.bill_amount_kobo;
  const percentage = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
  const publicLink =
    medicalCase.public_link ||
    `https://korede.health/donate/${medicalCase.public_slug || medicalCase.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicLink);
    toast.success("Campaign link copied.");
  };

  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="grid gap-8 lg:grid-cols-[minmax(220px,320px)_1fr] lg:items-center">
          <div className="relative mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-full bg-teal-50">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="104"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="20"
              />
              <circle
                cx="128"
                cy="128"
                r="104"
                fill="none"
                stroke="#0f766e"
                strokeDasharray={`${percentage * 6.53} 653`}
                strokeLinecap="round"
                strokeWidth="20"
              />
            </svg>
            <div className="relative flex aspect-square w-[68%] flex-col items-center justify-center rounded-full bg-white">
              <span className="text-4xl font-bold text-teal-800 sm:text-5xl">
                {percentage}%
              </span>
              <span className="mt-2 text-sm font-bold uppercase text-slate-600">
                Funded
              </span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">
              <span className="h-2 w-2 rounded-full bg-teal-700" />
              {medicalCase.status || "Active Campaign"}
            </span>
            <h2 className="mt-6 break-words text-3xl font-bold tracking-tight sm:text-5xl">
              {formatNairaFromKobo(raised)}
            </h2>
            <p className="mt-3 text-xl text-slate-700">
              raised of {formatNairaFromKobo(target)} goal
            </p>
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="font-bold">{medicalCase.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {medicalCase.diagnosis_summary}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Share2 className="h-6 w-6" />
          </span>
          <h2 className="text-2xl font-bold">Share Your Case</h2>
        </div>
        <p className="mt-6 text-base leading-7 text-slate-700">
          Amplify your reach by sharing your secure funding link across your
          network.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {["WhatsApp", "Twitter", "Facebook"].map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-4 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold">Copy Unique Link</p>
          <div className="mt-2 flex overflow-hidden rounded-lg border border-slate-300 bg-slate-50">
            <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4">
              <LinkIcon className="h-5 w-5 shrink-0 text-slate-500" />
              <span className="truncate text-slate-700">{publicLink}</span>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="bg-teal-800 px-5 text-sm font-bold text-white"
            >
              Copy
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="text-2xl font-bold">Wall of Kindness</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold">
            Recent
          </span>
        </div>

        <div className="mt-8 space-y-4">
          {[
            ["Musa B.", "Donated N5,000", "Stay strong!"],
            ["Anonymous", "Donated N50,000", "Prayers with you."],
            ["Sarah J.", "Donated N10,000", "Get well soon!"],
          ].map(([name, donation, message]) => (
            <article key={name} className="rounded-xl border border-slate-200 p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm font-bold text-teal-800">{donation}</p>
                </div>
                <span className="text-xs text-slate-500">Recent</span>
              </div>
              <p className="mt-4 rounded-lg bg-slate-50 p-4 italic text-slate-700">
                "{message}"
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProgressHubSection({
  progress,
  isLoading,
  errorMessage,
  cases,
  selectedCaseId,
  onCaseChange,
  onRetry,
}: {
  progress: DonationProgress | null;
  isLoading: boolean;
  errorMessage: string;
  cases: MedicalCase[];
  selectedCaseId: string;
  onCaseChange: (caseId: string) => void;
  onRetry: () => void;
}) {
  const caseSelector = (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <label className="block min-w-0 flex-1">
        <span className="text-sm font-bold text-slate-800">
          Donation progress source
        </span>
        <select
          value={selectedCaseId}
          onChange={(event) => onCaseChange(event.target.value)}
          className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10"
        >
          <option value="current">Current open medical case</option>
          {cases.map((medicalCase) => (
            <option key={medicalCase.id} value={medicalCase.id}>
              {medicalCase.title || `Case ${medicalCase.id}`}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
      >
        Refresh progress
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <>
        {caseSelector}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 p-5">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-8 w-32 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  if (errorMessage || !progress) {
    return (
      <>
        {caseSelector}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white/95 p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Activity className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">No progress available</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {errorMessage || "Donation progress will appear once a medical case is open."}
          </p>
        </section>
      </>
    );
  }

  const paidPercentage = Math.max(0, Math.min(progress.percentage_paid, 100));
  const caseDetails = progress.case;

  return (
    <div className="grid gap-5">
      {caseSelector}
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">
              {caseDetails.status || "Current case"}
            </span>
            <h2 className="mt-5 break-words text-2xl font-bold sm:text-3xl">
              {caseDetails.title || "Medical case"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Case ID: {caseDetails.medical_case_id || "Unavailable"}
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 bg-teal-50 p-5 text-teal-950 lg:min-w-72">
            <p className="text-sm font-bold">Funding progress</p>
            <p className="mt-2 text-4xl font-bold">{paidPercentage}%</p>
            <p className="mt-1 text-sm font-medium text-teal-800">
              {progress.percentage_left}% left
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="h-4 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-teal-700 transition-all"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ProgressStat
            label="Raised"
            value={formatNairaFromKobo(caseDetails.amount_raised_kobo)}
          />
          <ProgressStat
            label="Goal"
            value={formatNairaFromKobo(caseDetails.bill_amount_kobo)}
          />
          <ProgressStat
            label="Remaining"
            value={formatNairaFromKobo(caseDetails.remaining_amount_kobo)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recent donors</h2>
            <p className="mt-1 text-sm text-slate-600">
              {progress.donor_count} total donor{progress.donor_count === 1 ? "" : "s"}
            </p>
          </div>
          {caseDetails.public_link && (
            <a
              href={caseDetails.public_link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
            >
              View public link
            </a>
          )}
        </div>

        {progress.donors.length > 0 ? (
          <div className="mt-6 grid gap-3">
            {progress.donors.map((donor) => (
              <article
                key={donor.id || `${donor.display_name}-${donor.paid_at}`}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {donor.display_name || "Anonymous donor"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatProgressDate(donor.paid_at)}
                      {donor.method ? ` · ${donor.method}` : ""}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-teal-800">
                    {formatNairaFromKobo(donor.amount_kobo)}
                  </p>
                </div>
                {donor.sui_transaction_url && (
                  <a
                    href={donor.sui_transaction_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-bold text-teal-800 hover:text-teal-950"
                  >
                    View transaction
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
            No donations have been recorded for this case yet.
          </p>
        )}
      </section>
    </div>
  );
}

function ProgressStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function SharingToolkitSection({
  shareLink,
  isLoading,
  errorMessage,
  onRetry,
}: {
  shareLink: ShareLinkDetails | null;
  isLoading: boolean;
  errorMessage: string;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
        <div className="h-6 w-44 rounded bg-slate-200" />
        <div className="mt-6 h-24 rounded-xl bg-slate-100" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  if (errorMessage || !shareLink) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white/95 p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Share2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">No share link available</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          {errorMessage ||
            "Your sharing toolkit will appear once your medical case has a public donation link."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
        >
          Refresh link
        </button>
      </section>
    );
  }

  const shareUrl = shareLink.share_url || shareLink.public_link;
  const shareText = shareLink.message || `Support ${shareLink.title}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const shareTargets = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: "Instagram",
      icon: Share2,
      href: "https://www.instagram.com/",
      copiesFirst: true,
    },
    {
      label: "Facebook",
      icon: Users,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X",
      icon: ExternalLink,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      icon: LinkIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied.");
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyShareLink();
      return;
    }

    await navigator.share({
      title: shareLink.title,
      text: shareText,
      url: shareUrl,
    });
  };

  const openShareTarget = async (target: (typeof shareTargets)[number]) => {
    if (target.copiesFirst) {
      await copyShareLink();
      toast.success("Link copied. Paste it into your Instagram post, story, or bio.");
    }

    window.open(target.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-8 grid gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">
              Ready to share
            </span>
            <h2 className="mt-5 break-words text-2xl font-bold sm:text-3xl">
              {shareLink.title || "Medical funding campaign"}
            </h2>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 sm:text-base">
              {shareText}
            </p>
          </div>

          <div className="rounded-xl border border-teal-100 bg-teal-50 p-5">
            <p className="text-sm font-bold text-teal-950">Campaign link</p>
            <div className="mt-3 flex overflow-hidden rounded-lg border border-teal-100 bg-white">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                <LinkIcon className="h-4 w-4 shrink-0 text-slate-500" />
                <span className="truncate text-sm font-semibold text-slate-700">
                  {shareUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={copyShareLink}
                aria-label="Copy share link"
                className="bg-teal-800 px-4 text-white transition hover:bg-teal-900"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={nativeShare}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-900"
            >
              <Share2 className="h-4 w-4" />
              Share from device
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Share on social media</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose a platform or copy the link for any app.
            </p>
          </div>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
          >
            <ExternalLink className="h-4 w-4" />
            Open link
          </a>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shareTargets.map((target) => {
            const Icon = target.icon;

            return (
              <button
                key={target.label}
                type="button"
                onClick={() => {
                  void openShareTarget(target);
                }}
                className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
              >
                <Icon className="h-4 w-4" />
                {target.label}
              </button>
            );
          })}
          <a
            href={`mailto:?subject=${encodeURIComponent(
              shareLink.title,
            )}&body=${encodedText}%0A%0A${encodedUrl}`}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
          >
            <Send className="h-4 w-4" />
            Email
          </a>
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
          >
            <Copy className="h-4 w-4" />
            Copy for other apps
          </button>
        </div>
      </section>
    </div>
  );
}

function PlaceholderSection({
  section,
}: {
  section: Exclude<DashboardSection, "dashboard" | "progress" | "sharing">;
}) {
  const placeholder = placeholderSections[section];
  const Icon = placeholder.icon;

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white/95 p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-800">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-bold">{placeholder.title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
        {placeholder.body}
      </p>
    </section>
  );
}

function NoMedicalCaseState({
  patientName,
  declaration,
  isLoadingDeclaration,
  onOpenDeclaration,
}: {
  patientName: string;
  declaration: PatientDeclaration | null;
  isLoadingDeclaration: boolean;
  onOpenDeclaration: (mode: DeclarationMode) => void;
}) {
  if (declaration) {
    return (
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-teal-100 bg-teal-50/60 p-5">
          <p className="text-sm font-bold text-teal-900">Your declaration</p>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
            {declaration.statement}
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => onOpenDeclaration("update")}
            disabled={isLoadingDeclaration}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-teal-800 px-6 py-4 text-sm font-bold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <MessageSquareText className="h-4 w-4" />
            Update declaration
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:p-8 lg:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-800">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
        No medical case yet{patientName ? `, ${patientName}` : ""}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        Your patient account is ready. Once a verified hospital creates or links
        a case for you, your funding progress, public link, and supporter updates
        will appear here.
      </p>
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => onOpenDeclaration("create")}
          disabled={isLoadingDeclaration}
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-teal-800 px-6 py-4 text-sm font-bold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
        >
          <MessageSquareText className="h-4 w-4" />
          {isLoadingDeclaration ? "Checking declaration..." : "Start declaration"}
        </button>
      </div>
    </section>
  );
}

function DeclarationModal({
  isOpen,
  accessToken,
  mode,
  declaration,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  accessToken: string;
  mode: DeclarationMode;
  declaration: PatientDeclaration | null;
  onClose: () => void;
  onSaved: (declaration: PatientDeclaration) => void;
}) {
  const [statement, setStatement] = useState(() =>
    mode === "update" ? declaration?.statement ?? "" : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedStatement = statement.trim();

  if (!isOpen) {
    return null;
  }

  const submitDeclaration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedStatement) {
      toast.error("Please write a short declaration before submitting.");
      return;
    }

    if (!accessToken) {
      toast.error("Please login again before submitting your declaration.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/patients/declaration`, {
        method: mode === "update" ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statement: trimmedStatement }),
      });
      const responseBody = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiMessage(responseBody, "Unable to submit declaration."),
        );
      }

      const savedDeclaration = parsePatientDeclaration(responseBody);

      toast.success(getApiMessage(responseBody, "Patient declaration saved."));
      onSaved(savedDeclaration);
      setStatement("");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit declaration.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="declaration-title"
    >
      <form
        onSubmit={submitDeclaration}
        className="max-h-[calc(100dvh-3rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="declaration-title" className="text-xl font-bold">
              {mode === "update" ? "Update declaration" : "Start declaration"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Share a short statement about yourself and your situation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close declaration modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-slate-950">
            Declaration statement
          </span>
          <textarea
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            rows={5}
            maxLength={700}
            placeholder="Tell us a little about yourself..."
            className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-teal-800 focus:ring-4 focus:ring-teal-800/10"
          />
        </label>

        <div className="mt-2 text-right text-xs font-medium text-slate-500">
          {trimmedStatement.length}/700
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-bold text-slate-800 transition hover:border-teal-800 hover:text-teal-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-800 px-5 text-sm font-bold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting
              ? "Submitting..."
              : mode === "update"
                ? "Update declaration"
                : "Submit declaration"}
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function parsePatientDeclaration(responseBody: unknown): PatientDeclaration {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid declaration response.");
  }

  const body = responseBody as Partial<PatientDeclaration>;

  if (typeof body.statement !== "string") {
    throw new Error("Invalid declaration response.");
  }

  return {
    created_at: body.created_at ?? "",
    id: body.id ?? "",
    patient_id: body.patient_id ?? "",
    statement: body.statement,
    updated_at: body.updated_at ?? "",
  };
}

function parseDonationProgress(responseBody: unknown): DonationProgress {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid donation progress response.");
  }

  const body = responseBody as Record<string, unknown>;
  const caseBody =
    body.case && typeof body.case === "object"
      ? (body.case as Record<string, unknown>)
      : null;

  if (!caseBody) {
    throw new Error("Invalid donation progress response.");
  }

  return {
    case: {
      amount_raised_kobo: getNumber(caseBody.amount_raised_kobo),
      bill_amount_kobo: getNumber(caseBody.bill_amount_kobo),
      medical_case_id: getString(caseBody.medical_case_id),
      public_link: getString(caseBody.public_link),
      public_slug: getString(caseBody.public_slug),
      remaining_amount_kobo: getNumber(caseBody.remaining_amount_kobo),
      status: getString(caseBody.status),
      title: getString(caseBody.title),
    },
    donor_count: getNumber(body.donor_count),
    donors: Array.isArray(body.donors)
      ? body.donors.map((donor) => {
          const donorBody =
            donor && typeof donor === "object"
              ? (donor as Record<string, unknown>)
              : {};

          return {
            amount_kobo: getNumber(donorBody.amount_kobo),
            display_name: getString(donorBody.display_name),
            id: getString(donorBody.id),
            method: getString(donorBody.method),
            paid_at: getString(donorBody.paid_at),
            sui_transaction_url: getString(donorBody.sui_transaction_url),
          };
        })
      : [],
    percentage_left: getNumber(body.percentage_left),
    percentage_paid: getNumber(body.percentage_paid),
  };
}

function parseShareLinkDetails(responseBody: unknown): ShareLinkDetails {
  if (!responseBody || typeof responseBody !== "object") {
    throw new Error("Invalid sharing link response.");
  }

  const body = responseBody as Record<string, unknown>;
  const shareUrl = getString(body.share_url);
  const publicLink = getString(body.public_link);

  if (!shareUrl && !publicLink) {
    throw new Error("Invalid sharing link response.");
  }

  return {
    medical_case_id: getString(body.medical_case_id),
    message: getString(body.message),
    public_link: publicLink,
    public_slug: getString(body.public_slug),
    share_url: shareUrl,
    title: getString(body.title),
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatProgressDate(value: string) {
  if (!value) {
    return "Recent";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
