import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileClock,
  FileText,
  Filter,
  HelpCircle,
  History,
  IdCard,
  Landmark,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  PlusCircle,
  PlusSquare,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SquareKanban,
  Trash2,
  Upload,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BrandLogo } from "../components/BrandLogo";
import { API_BASE_URL } from "../config/api";
import {
  clearHospitalSession,
  getHospitalSession,
  type Hospital,
} from "../lib/auth";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "create-case", label: "Create Medical Case", icon: PlusSquare },
  { id: "active-cases", label: "Active Cases", icon: SquareKanban },
  { id: "completed-cases", label: "Completed Cases", icon: CheckCircle2 },
  { id: "settlement-history", label: "Settlement History", icon: History },
  { id: "hospital-profile", label: "Hospital Profile", icon: UserRound },
];

type HospitalDashboardView = (typeof navItems)[number]["id"];

type PatientLookup = {
  can_create_case: boolean;
  declaration?: {
    created_at?: string;
    exists?: boolean;
    statement?: string;
  };
  patient: {
    email_verified: boolean;
    first_name: string;
    id: string;
    last_name: string;
    username: string;
  };
};

type PatientDeclaration = {
  created_at: string;
  id: string;
  patient_id: string;
  statement: string;
  updated_at: string;
};

type BillingItemForm = {
  description: string;
  amount: string;
};

type CaseDocument = {
  content_base64: string;
  document_type: string;
  name: string;
  original_filename: string;
};

const metrics = [
  {
    label: "Total Active Cases",
    value: "42",
    delta: "+12%",
    icon: Activity,
    accent: "border-t-teal-300",
  },
  {
    label: "Total Funds Raising",
    value: "₦12,450,000",
    delta: "+5%",
    icon: WalletCards,
    accent: "border-t-teal-300",
  },
  {
    label: "Total Settled (MTD)",
    value: "₦4,200,000",
    icon: Building2,
    accent: "border-t-cyan-200",
  },
  {
    label: "Pending Verifications",
    value: "8",
    delta: "Action Req.",
    icon: FileClock,
    accent: "border-t-amber-600",
  },
];

const activeCases = [
  {
    initials: "OA",
    name: "Oluwaseun Adebayo",
    id: "PT-8829",
    progress: 85,
    amount: "2.5M / 3.0M",
    status: "Funding",
  },
  {
    initials: "CN",
    name: "Chioma Nnaji",
    id: "PT-9102",
    progress: 100,
    amount: "1.2M / 1.2M",
    status: "Awaiting Settl.",
  },
  {
    initials: "IE",
    name: "Ibrahim Eze",
    id: "PT-7741",
    progress: 40,
    amount: "800K / 2.0M",
    status: "Funding",
  },
];

const chartPoints = [
  { label: "Week 1", value: "0" },
  { label: "Week 2", value: "1.6M" },
  { label: "Week 3", value: "3.1M" },
  { label: "Now", value: "4.2M" },
];

export function HospitalDashboardPage() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] =
    useState<HospitalDashboardView>("overview");
  const [hospitalProfile, setHospitalProfile] = useState<Hospital | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const session = getHospitalSession();
  const accessToken = session?.access_token;

  useEffect(() => {
    if (!accessToken || activeView !== "hospital-profile" || hospitalProfile) {
      return;
    }

    let isMounted = true;

    async function loadHospitalProfile() {
      setIsProfileLoading(true);
      setProfileError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load the hospital profile.",
          );
        }

        if (isMounted) {
          setHospitalProfile(data as Hospital);
        }
      } catch (error) {
        if (isMounted) {
          setProfileError(
            error instanceof Error
              ? error.message
              : "Unable to load the hospital profile.",
          );
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    }

    void loadHospitalProfile();

    return () => {
      isMounted = false;
    };
  }, [accessToken, activeView, hospitalProfile]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const hospitalName = session.hospital?.name || session.email || "Hospital";
  const shortHospitalName =
    hospitalName.length > 18 ? `${hospitalName.slice(0, 18)}...` : hospitalName;

  const logout = () => {
    clearHospitalSession();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[260px_1fr]">
      <HospitalSidebar
        hospitalName={hospitalName}
        shortHospitalName={shortHospitalName}
        isOpen={isSidebarOpen}
        activeView={activeView}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
        onNavigate={(view) => {
          setActiveView(view);
          setIsSidebarOpen(false);
        }}
      />

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search patient names, IDs, or cases..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
              />
            </div>

            <div className="ml-auto hidden items-center gap-4 sm:flex">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>
              <button
                type="button"
                aria-label="Help"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Dr. Sarah K.
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-900 text-xs font-bold text-white">
                  SK
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {activeView === "hospital-profile" ? (
            <HospitalProfileView
              hospital={hospitalProfile}
              isLoading={isProfileLoading}
              error={profileError}
              onRetry={() => {
                setHospitalProfile(null);
                setProfileError("");
              }}
            />
          ) : activeView === "create-case" ? (
            <CreateMedicalCaseView accessToken={session.access_token} />
          ) : (
            <OverviewView shortHospitalName={shortHospitalName} />
          )}
        </main>
      </div>
    </div>
  );
}

function HospitalSidebar({
  hospitalName,
  shortHospitalName,
  isOpen,
  activeView,
  onClose,
  onLogout,
  onNavigate,
}: {
  hospitalName: string;
  shortHospitalName: string;
  isOpen: boolean;
  activeView: HospitalDashboardView;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (view: HospitalDashboardView) => void;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(18rem,calc(100vw-2rem))] flex-col border-r border-slate-200 bg-white transition-transform lg:w-[260px] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <div className="min-w-0">
            <BrandLogo />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                activeView === id
                  ? "bg-teal-50 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-teal-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-3 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-900 text-xs font-bold text-white">
                {hospitalName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{shortHospitalName}</p>
                <p className="text-xs text-slate-500">ID: HOSP-8492</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function OverviewView({ shortHospitalName }: { shortHospitalName: string }) {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hospital Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          Real-time overview of active fundraising cases and financial
          settlements.
        </p>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, delta, icon: Icon, accent }) => (
          <article
            key={label}
            className={`rounded-xl border border-slate-200 border-t-4 ${accent} bg-white p-5 shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                <Icon className="h-5 w-5" />
              </span>
              {delta && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    delta.includes("Action")
                      ? "bg-amber-100 text-amber-800"
                      : "bg-teal-50 text-teal-800"
                  }`}
                >
                  {delta}
                </span>
              )}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-2 break-words text-3xl font-bold">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
        <ActiveCasesPanel />
        <aside className="grid gap-5">
          <FundingVelocityPanel />
          <TrustLedgerCard hospitalName={shortHospitalName} />
        </aside>
      </section>
    </>
  );
}

function CreateMedicalCaseView({ accessToken }: { accessToken: string }) {
  const [username, setUsername] = useState("");
  const [lookup, setLookup] = useState<PatientLookup | null>(null);
  const [declaration, setDeclaration] = useState<PatientDeclaration | null>(
    null,
  );
  const [lookupError, setLookupError] = useState("");
  const [isLookupLoading, setIsLookupLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [diagnosisSummary, setDiagnosisSummary] = useState("");
  const [admittedAt, setAdmittedAt] = useState("");
  const [billingItems, setBillingItems] = useState<BillingItemForm[]>([
    { description: "", amount: "" },
  ]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canShowCaseForm = lookup?.can_create_case && declaration;
  const patientName = lookup
    ? `${lookup.patient.first_name} ${lookup.patient.last_name}`.trim()
    : "";

  async function lookupPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setLookupError("Enter the patient username.");
      return;
    }

    setIsLookupLoading(true);
    setLookupError("");
    setLookup(null);
    setDeclaration(null);

    try {
      const patientResponse = await fetch(
        `${API_BASE_URL}/api/v1/hospitals/patients/${encodeURIComponent(
          trimmedUsername,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const patientData = await patientResponse.json().catch(() => null);

      if (!patientResponse.ok) {
        throw new Error(patientData?.message || "Patient was not found.");
      }

      const lookupResult = patientData as PatientLookup;
      setLookup(lookupResult);

      if (!lookupResult.can_create_case) {
        setLookupError(
          "This patient cannot have a new medical case created right now.",
        );
        return;
      }

      const declarationResponse = await fetch(
        `${API_BASE_URL}/api/v1/hospitals/patients/${encodeURIComponent(
          trimmedUsername,
        )}/declaration`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const declarationData = await declarationResponse
        .json()
        .catch(() => null);

      if (!declarationResponse.ok) {
        throw new Error(
          declarationData?.message || "Patient declaration was not found.",
        );
      }

      setDeclaration(declarationData as PatientDeclaration);
    } catch (error) {
      setLookupError(getErrorMessage(error, "Unable to prepare this case."));
    } finally {
      setIsLookupLoading(false);
    }
  }

  function updateBillingItem(
    index: number,
    field: keyof BillingItemForm,
    value: string,
  ) {
    setBillingItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addBillingItem() {
    setBillingItems((currentItems) => [
      ...currentItems,
      { description: "", amount: "" },
    ]);
  }

  function removeBillingItem(index: number) {
    setBillingItems((currentItems) =>
      currentItems.length === 1
        ? currentItems
        : currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleDocumentUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    try {
      const uploadedDocuments = await Promise.all(
        Array.from(files).map(readDocumentFile),
      );
      setDocuments((currentDocuments) => [
        ...currentDocuments,
        ...uploadedDocuments,
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to read selected document."));
    }
  }

  function removeDocument(index: number) {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((_, documentIndex) => documentIndex !== index),
    );
  }

  async function submitCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lookup || !declaration) {
      toast.error("Lookup a patient and review their declaration first.");
      return;
    }

    const preparedBillingItems = billingItems
      .map((item) => ({
        description: item.description.trim(),
        amount_kobo: Math.round(Number(item.amount) * 100),
      }))
      .filter((item) => item.description && item.amount_kobo > 0);

    if (!title.trim() || !diagnosisSummary.trim() || !admittedAt) {
      toast.error("Complete the case title, diagnosis summary, and admission date.");
      return;
    }

    if (!preparedBillingItems.length) {
      toast.error("Add at least one valid billing item.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/cases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admitted_at: new Date(admittedAt).toISOString(),
          billing_items: preparedBillingItems,
          diagnosis_summary: diagnosisSummary.trim(),
          documents,
          patient_username: lookup.patient.username,
          title: title.trim(),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to create medical case.");
      }

      toast.success("Medical case created successfully.");
      setTitle("");
      setDiagnosisSummary("");
      setAdmittedAt("");
      setBillingItems([{ description: "", amount: "" }]);
      setDocuments([]);
      setLookup(null);
      setDeclaration(null);
      setUsername("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create medical case."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
            Case Creation
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Create Medical Case
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Confirm the patient by username, review their declaration, then
            publish the verified medical case details.
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={lookupPatient}
          className="grid gap-4 lg:grid-cols-[1fr_auto]"
        >
          <label className="block">
            <span className="text-sm font-bold text-slate-800">
              Patient username
            </span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter patient username"
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            />
          </label>
          <button
            type="submit"
            disabled={isLookupLoading}
            className="inline-flex h-12 items-center justify-center gap-2 self-end rounded-lg bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLookupLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Check patient
          </button>
        </form>

        {lookupError && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{lookupError}</p>
          </div>
        )}
      </section>

      {lookup && (
        <section className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-900 text-sm font-bold text-white">
                {lookup.patient.first_name.slice(0, 1)}
                {lookup.patient.last_name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold">{patientName}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  @{lookup.patient.username}
                </p>
              </div>
            </div>
            <dl className="mt-6 space-y-4">
              <ProfileMeta label="Patient ID" value={lookup.patient.id} />
              <ProfileMeta
                label="Email Status"
                value={lookup.patient.email_verified ? "Verified" : "Not verified"}
              />
              <ProfileMeta
                label="Case Eligibility"
                value={lookup.can_create_case ? "Can create case" : "Blocked"}
              />
            </dl>
          </article>

          <article className="rounded-xl border border-teal-100 bg-teal-50/60 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-teal-800">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Patient Declaration</h2>
                <p className="text-sm font-semibold text-slate-500">
                  Read-only patient statement
                </p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-teal-100 bg-white p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                {declaration?.statement ||
                  lookup.declaration?.statement ||
                  "No declaration loaded yet."}
              </p>
            </div>
          </article>
        </section>
      )}

      {canShowCaseForm && (
        <form
          onSubmit={submitCase}
          className="mt-6 grid gap-5 xl:grid-cols-[1fr_360px]"
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                <PlusCircle className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold">Medical Case Details</h2>
            </div>

            <div className="mt-5 grid gap-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  Case title
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Emergency cardiac surgery support"
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  Diagnosis summary
                </span>
                <textarea
                  value={diagnosisSummary}
                  onChange={(event) => setDiagnosisSummary(event.target.value)}
                  rows={5}
                  placeholder="Summarize the diagnosis and care plan."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-800">
                  Admission date
                </span>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={admittedAt}
                    onChange={(event) => setAdmittedAt(event.target.value)}
                    className="h-12 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                  />
                </div>
              </label>
            </div>
          </section>

          <aside className="grid gap-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Billing Items</h2>
                <button
                  type="button"
                  onClick={addBillingItem}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {billingItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold">
                        Item {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeBillingItem(index)}
                        disabled={billingItems.length === 1}
                        aria-label="Remove billing item"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) =>
                        updateBillingItem(index, "description", event.target.value)
                      }
                      placeholder="Description"
                      className="mt-3 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount}
                      onChange={(event) =>
                        updateBillingItem(index, "amount", event.target.value)
                      }
                      placeholder="Amount in naira"
                      className="mt-3 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Documents</h2>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-teal-300 hover:bg-teal-50/40">
                <Upload className="h-6 w-6 text-teal-800" />
                <span className="mt-2 text-sm font-bold text-slate-800">
                  Upload case documents
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  PDF, JPG, PNG, or DOC files
                </span>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    void handleDocumentUpload(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((document, index) => (
                    <div
                      key={`${document.original_filename}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {document.original_filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        aria-label="Remove document"
                        className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit medical case
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}

function HospitalProfileView({
  hospital,
  isLoading,
  error,
  onRetry,
}: {
  hospital: Hospital | null;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-700">
          <RefreshCw className="h-5 w-5 animate-spin text-teal-700" />
          <span className="text-sm font-bold">Loading hospital profile...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Hospital Profile</h1>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!hospital) {
    return null;
  }

  const profileSections = [
    {
      title: "Contact Information",
      icon: Phone,
      items: [
        { label: "Email", value: hospital.email, icon: Mail },
        { label: "Phone Number", value: hospital.phone_number, icon: Phone },
        {
          label: "Official Address",
          value: hospital.official_address,
          icon: Building2,
        },
      ],
    },
    {
      title: "Registration Details",
      icon: IdCard,
      items: [
        {
          label: "CAC Registration Number",
          value: hospital.cac_registration_number,
          icon: IdCard,
        },
        {
          label: "Medical License Number",
          value: hospital.medical_license_number,
          icon: BadgeCheck,
        },
        {
          label: "Administrator",
          value: hospital.administrator_name,
          icon: UserRound,
        },
      ],
    },
    {
      title: "Settlement Account",
      icon: Landmark,
      items: [
        { label: "Bank Name", value: hospital.bank_name, icon: Landmark },
        {
          label: "Corporate Account Name",
          value: hospital.corporate_account_name,
          icon: WalletCards,
        },
        {
          label: "Corporate Account Number",
          value: hospital.corporate_account_number,
          icon: WalletCards,
        },
      ],
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
            Hospital Profile
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {hospital.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Verified hospital account details used for case creation, patient
            verification, and settlement processing.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            hospital.email_verified
              ? "bg-teal-50 text-teal-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          <BadgeCheck className="h-4 w-4" />
          {hospital.verification_status || "Profile active"}
        </span>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <ProfileSummaryCard
          label="Email Status"
          value={hospital.email_verified ? "Verified" : "Not verified"}
          detail={formatDate(hospital.email_verified_at)}
          icon={BadgeCheck}
        />
        <ProfileSummaryCard
          label="Dashboard Access"
          value={hospital.dashboard_access || "Enabled"}
          detail="Hospital workspace"
          icon={LayoutDashboard}
        />
        <ProfileSummaryCard
          label="Hospital ID"
          value={hospital.id}
          detail="Current account"
          icon={IdCard}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-3">
        {profileSections.map(({ title, icon: SectionIcon, items }) => (
          <article
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                <SectionIcon className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <dl className="mt-5 space-y-5">
              {items.map(({ label, value, icon: ItemIcon }) => (
                <div key={label} className="flex gap-3">
                  <ItemIcon className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
                      {value || "Not provided"}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">System Record</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ProfileMeta label="Created" value={formatDate(hospital.created_at)} />
          <ProfileMeta label="Last Updated" value={formatDate(hospital.updated_at)} />
        </div>
      </section>
    </div>
  );
}

function ProfileSummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 break-words text-xl font-bold text-slate-950">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

function ProfileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function readDocumentFile(file: File) {
  return new Promise<CaseDocument>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const [, contentBase64 = ""] = result.split(",");

      resolve({
        content_base64: contentBase64,
        document_type: getDocumentType(file),
        name: file.name.replace(/\.[^/.]+$/, "") || file.name,
        original_filename: file.name,
      });
    };

    reader.onerror = () => {
      reject(new Error("Unable to read selected document."));
    };

    reader.readAsDataURL(file);
  });
}

function getDocumentType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (file.type.includes("pdf") || extension === "pdf") {
    return "pdf";
  }

  if (file.type.includes("image") || ["jpg", "jpeg", "png"].includes(extension || "")) {
    return "image";
  }

  if (["doc", "docx"].includes(extension || "")) {
    return "document";
  }

  return extension || "document";
}

function ActiveCasesPanel() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Cases</h2>
          <p className="mt-1 text-sm text-slate-600">
            Patients currently receiving public funding.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Patient & ID</th>
              <th className="px-5 py-4">Funding Progress</th>
              <th className="px-5 py-4">Amount (₦)</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeCases.map((medicalCase) => (
              <tr key={medicalCase.id} className="border-b border-slate-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">
                      {medicalCase.initials}
                    </span>
                    <div>
                      <p className="font-bold">{medicalCase.name}</p>
                      <p className="text-xs text-slate-500">ID: {medicalCase.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-xs font-bold text-teal-800">
                      {medicalCase.progress}%
                    </span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          medicalCase.progress === 100
                            ? "bg-amber-700"
                            : "bg-teal-700"
                        }`}
                        style={{ width: `${medicalCase.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold">{medicalCase.amount}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      medicalCase.status.includes("Awaiting")
                        ? "bg-amber-100 text-amber-800"
                        : "bg-teal-50 text-teal-800"
                    }`}
                  >
                    {medicalCase.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="rounded-lg border border-teal-100 px-4 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-50"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 text-xs text-slate-500">
        <span>Showing 1-3 of 42 cases</span>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous page"
            className="rounded-lg border border-slate-200 p-2 text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            className="rounded-lg border border-slate-200 p-2 text-slate-500"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function FundingVelocityPanel() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold">Funding Velocity</h2>
      <p className="mt-1 text-sm text-slate-600">
        Donation trends across active cases (30d)
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex h-52 flex-col justify-end">
          <div className="relative h-40 border-b border-l border-slate-200">
            <svg
              viewBox="0 0 280 150"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="velocityFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 135 C 45 120, 60 88, 95 82 C 130 74, 155 42, 185 36 C 220 28, 245 52, 280 58 L280 150 L0 150 Z"
                fill="url(#velocityFill)"
              />
              <path
                d="M0 135 C 45 120, 60 88, 95 82 C 130 74, 155 42, 185 36 C 220 28, 245 52, 280 58"
                fill="none"
                stroke="#0f766e"
                strokeWidth="2"
              />
              <circle cx="95" cy="82" r="4" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
              <circle cx="185" cy="36" r="4" fill="#ecfeff" stroke="#0f766e" strokeWidth="2" />
            </svg>
            <span className="absolute right-4 top-4 rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white">
              Peak: ₦4.2M
            </span>
          </div>
          <div className="mt-3 grid grid-cols-4 text-center text-xs font-medium text-slate-500">
            {chartPoints.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustLedgerCard({ hospitalName }: { hospitalName: string }) {
  return (
    <section className="rounded-xl bg-teal-800 p-6 text-white shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <h2 className="text-2xl font-bold">Trust Ledger</h2>
      </div>
      <p className="mt-5 text-sm leading-6 text-teal-50">
        All funds settled to {hospitalName} are recorded immutably. Next
        settlement batch processing in progress.
      </p>
      <button
        type="button"
        className="mt-6 w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
      >
        View ledger
      </button>
    </section>
  );
}
