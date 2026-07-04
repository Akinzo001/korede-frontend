import {
  Activity,
  Heart,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Menu,
  MessageSquareText,
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

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Progress Hub", icon: Activity },
  { label: "Sharing Toolkit", icon: Share2 },
  { label: "Supporter Feed", icon: Users },
];

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);
  const [declarationMode, setDeclarationMode] =
    useState<DeclarationMode>("create");
  const [declaration, setDeclaration] = useState<PatientDeclaration | null>(
    null,
  );
  const [isLoadingDeclaration, setIsLoadingDeclaration] = useState(false);
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

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const activeCase = session.medical_cases[0] ?? null;
  const patientDisplayName =
    session.patient.username ||
    session.patient.first_name ||
    session.patient.full_name ||
    "Patient";

  const logout = () => {
    clearPatientSession();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
      <PatientSidebar
        patientName={patientDisplayName}
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
      />

      <div className="min-w-0">
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

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-5xl">
              Welcome back, {patientDisplayName}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              Here is the latest progress on your funding journey.
            </p>
          </div>

          {activeCase ? (
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
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  hasDeclaration: boolean;
  isLoadingDeclaration: boolean;
  onOpenDeclaration: (mode: DeclarationMode) => void;
};

function PatientSidebar({
  patientName,
  isOpen,
  onClose,
  onLogout,
  hasDeclaration,
  isLoadingDeclaration,
  onOpenDeclaration,
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
          {navItems.map(({ label, icon: Icon }, index) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-4 rounded-lg px-5 py-4 text-left text-sm font-semibold transition ${
                index === 0
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
        method: mode === "update" ? "PUT" : "POST",
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
