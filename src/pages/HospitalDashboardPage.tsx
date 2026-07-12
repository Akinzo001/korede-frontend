import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
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
  formatNairaFromKobo,
  getHospitalSession,
  type Hospital,
  type MedicalCase,
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
  mime_type: string;
  original_filename: string;
};

type SettlementRecord = {
  account_name: string;
  account_number: string;
  amount_kobo: number;
  bank_code: string;
  bank_name: string;
  case_title: string;
  created_at: string;
  failed_at: string | null;
  failure_reason: string | null;
  id: string;
  initiated_at: string | null;
  medical_case_id: string;
  paid_at: string | null;
  patient_id: string;
  patient_name: string;
  paystack_transfer_code: string;
  public_link: string;
  public_slug: string;
  settlement_reference: string;
  status: string;
  updated_at: string;
};

type SettlementPagination = {
  limit: number;
  offset: number;
  total: number;
};

type SettlementFilters = {
  status: string;
  medicalCaseId: string;
  from: string;
  to: string;
  limit: string;
};

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
          ) : activeView === "active-cases" ? (
            <HospitalCasesView accessToken={session.access_token} type="active" />
          ) : activeView === "completed-cases" ? (
            <HospitalCasesView
              accessToken={session.access_token}
              type="completed"
            />
          ) : activeView === "settlement-history" ? (
            <SettlementHistoryView accessToken={session.access_token} />
          ) : (
            <OverviewView
              accessToken={session.access_token}
              onNavigate={setActiveView}
            />
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

function SettlementHistoryView({ accessToken }: { accessToken: string }) {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [pagination, setPagination] = useState<SettlementPagination>({
    limit: 20,
    offset: 0,
    total: 0,
  });
  const [filters, setFilters] = useState<SettlementFilters>({
    status: "",
    medicalCaseId: "",
    from: "",
    to: "",
    limit: "20",
  });
  const [appliedFilters, setAppliedFilters] =
    useState<SettlementFilters>(filters);
  const [offset, setOffset] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettlementHistory() {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (appliedFilters.status) {
        params.set("status", appliedFilters.status);
      }

      if (appliedFilters.medicalCaseId) {
        params.set("medical_case_id", appliedFilters.medicalCaseId);
      }

      if (appliedFilters.from) {
        params.set("from", appliedFilters.from);
      }

      if (appliedFilters.to) {
        params.set("to", appliedFilters.to);
      }

      params.set("limit", appliedFilters.limit || "20");
      params.set("offset", String(offset));

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/hospitals/settlements/history?${params.toString()}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load settlement history.",
          );
        }

        if (isMounted) {
          setSettlements(
            Array.isArray(data?.settlements) ? data.settlements : [],
          );
          setPagination({
            limit: Number(data?.pagination?.limit) || Number(appliedFilters.limit) || 20,
            offset: Number(data?.pagination?.offset) || offset,
            total: Number(data?.pagination?.total) || 0,
          });
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load settlement history.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettlementHistory();

    return () => {
      isMounted = false;
    };
  }, [accessToken, appliedFilters, offset, requestCount]);

  const totalSettled = settlements.reduce(
    (sum, settlement) => sum + settlement.amount_kobo,
    0,
  );
  const hasPrevious = pagination.offset > 0;
  const nextOffset = pagination.offset + pagination.limit;
  const hasNext = nextOffset < pagination.total;

  function updateFilter(key: keyof SettlementFilters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(filters);
  }

  function clearFilters() {
    const nextFilters = {
      status: "",
      medicalCaseId: "",
      from: "",
      to: "",
      limit: "20",
    };

    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setOffset(0);
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
            <History className="h-4 w-4" />
            Settlement records
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Settlement History
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Track transfers, payouts, failed settlements, and beneficiary
            account details across your hospital cases.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRequestCount((count) => count + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <ActiveCaseSummaryCard
          label="Displayed settlements"
          value={settlements.length.toString()}
        />
        <ActiveCaseSummaryCard
          label="Total matching"
          value={pagination.total.toString()}
        />
        <ActiveCaseSummaryCard
          label="Displayed amount"
          value={formatNairaFromKobo(totalSettled)}
        />
      </section>

      <form
        onSubmit={applyFilters}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Status
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="initiated">Initiated</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 xl:col-span-2">
            Medical case ID
            <input
              value={filters.medicalCaseId}
              onChange={(event) =>
                updateFilter("medicalCaseId", event.target.value)
              }
              placeholder="medical_case_id"
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            From
            <input
              type="date"
              value={filters.from}
              onChange={(event) => updateFilter("from", event.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            To
            <input
              type="date"
              value={filters.to}
              onChange={(event) => updateFilter("to", event.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Limit
            <input
              type="number"
              min="1"
              max="100"
              value={filters.limit}
              onChange={(event) => updateFilter("limit", event.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>
          <button
            type="submit"
            className="rounded-lg bg-teal-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-900"
          >
            Apply filters
          </button>
        </div>
      </form>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="grid min-h-[280px] place-items-center p-8 text-center">
            <div>
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-teal-800" />
              <p className="mt-4 font-bold">Loading settlement history...</p>
              <p className="mt-1 text-sm text-slate-500">
                Fetching the latest payout records.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="grid min-h-[280px] place-items-center p-8 text-center">
            <div className="max-w-md">
              <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
              <h2 className="mt-4 text-2xl font-bold">
                Unable to load settlements
              </h2>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => setRequestCount((count) => count + 1)}
                className="mt-5 rounded-lg bg-teal-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-900"
              >
                Try again
              </button>
            </div>
          </div>
        ) : settlements.length === 0 ? (
          <div className="grid min-h-[280px] place-items-center p-8 text-center">
            <div className="max-w-md">
              <Landmark className="mx-auto h-10 w-10 text-slate-500" />
              <h2 className="mt-4 text-2xl font-bold">No settlements yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                Settlement records for your hospital will appear here when
                payouts are initiated.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Case</th>
                    <th className="px-5 py-4">Patient</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Bank</th>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Paid</th>
                    <th className="px-5 py-4">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => (
                    <SettlementTableRow
                      key={settlement.id}
                      settlement={settlement}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 xl:hidden">
              {settlements.map((settlement) => (
                <SettlementMobileCard
                  key={settlement.id}
                  settlement={settlement}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {pagination.offset + 1}-
                {Math.min(pagination.offset + settlements.length, pagination.total)}{" "}
                of {pagination.total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!hasPrevious}
                  onClick={() =>
                    setOffset(Math.max(0, pagination.offset - pagination.limit))
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => setOffset(nextOffset)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function SettlementTableRow({
  settlement,
}: {
  settlement: SettlementRecord;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-5 py-4 align-top">
        <div className="max-w-xs">
          <p className="break-words font-bold">{settlement.case_title}</p>
          <p className="mt-1 break-all text-xs text-slate-500">
            ID: {settlement.medical_case_id}
          </p>
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <p className="font-semibold">{settlement.patient_name || "Patient"}</p>
        <p className="mt-1 break-all text-xs text-slate-500">
          {settlement.patient_id}
        </p>
      </td>
      <td className="px-5 py-4 align-top font-bold">
        {formatNairaFromKobo(settlement.amount_kobo)}
      </td>
      <td className="px-5 py-4 align-top">
        <SettlementStatusPill status={settlement.status} />
        {settlement.failure_reason && (
          <p className="mt-2 max-w-[180px] text-xs leading-5 text-red-600">
            {settlement.failure_reason}
          </p>
        )}
      </td>
      <td className="px-5 py-4 align-top">
        <p className="font-semibold">{settlement.bank_name || "Bank"}</p>
        <p className="mt-1 text-xs text-slate-500">
          {settlement.account_name}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {settlement.account_number}
        </p>
      </td>
      <td className="px-5 py-4 align-top">
        <p className="break-all text-xs font-semibold">
          {settlement.settlement_reference || "Not available"}
        </p>
        {settlement.paystack_transfer_code && (
          <p className="mt-2 break-all text-xs text-slate-500">
            {settlement.paystack_transfer_code}
          </p>
        )}
      </td>
      <td className="px-5 py-4 align-top text-slate-600">
        {formatCaseDate(settlement.paid_at || settlement.initiated_at)}
      </td>
      <td className="px-5 py-4 align-top">
        <SettlementPublicLink settlement={settlement} />
      </td>
    </tr>
  );
}

function SettlementMobileCard({
  settlement,
}: {
  settlement: SettlementRecord;
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold">
            {settlement.case_title}
          </h2>
          <p className="mt-1 break-all text-xs text-slate-500">
            {settlement.medical_case_id}
          </p>
        </div>
        <SettlementStatusPill status={settlement.status} />
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <SettlementDetail label="Patient" value={settlement.patient_name} />
        <SettlementDetail
          label="Amount"
          value={formatNairaFromKobo(settlement.amount_kobo)}
        />
        <SettlementDetail label="Bank" value={settlement.bank_name} />
        <SettlementDetail label="Account name" value={settlement.account_name} />
        <SettlementDetail
          label="Account number"
          value={settlement.account_number}
        />
        <SettlementDetail
          label="Paid"
          value={formatCaseDate(settlement.paid_at || settlement.initiated_at)}
        />
      </dl>

      {settlement.failure_reason && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {settlement.failure_reason}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SettlementPublicLink settlement={settlement} />
        <span className="break-all text-xs text-slate-500">
          {settlement.settlement_reference}
        </span>
      </div>
    </article>
  );
}

function SettlementDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold">{value || "Not set"}</dd>
    </div>
  );
}

function SettlementStatusPill({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() || "pending";
  const statusClass = normalizedStatus.includes("fail")
    ? "bg-red-50 text-red-700"
    : normalizedStatus.includes("paid") || normalizedStatus.includes("success")
      ? "bg-teal-50 text-teal-800"
      : "bg-amber-50 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass}`}
    >
      {status || "pending"}
    </span>
  );
}

function SettlementPublicLink({
  settlement,
}: {
  settlement: SettlementRecord;
}) {
  const href = settlement.public_link || `/cases/${settlement.public_slug}`;

  if (!href || href === "/cases/") {
    return <span className="text-sm text-slate-500">Not available</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-teal-100 px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-50"
    >
      View case
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function HospitalCasesView({
  accessToken,
  type,
}: {
  accessToken: string;
  type: "active" | "completed";
}) {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestCount, setRequestCount] = useState(0);
  const isCompleted = type === "completed";
  const endpoint = isCompleted ? "completed" : "active";
  const title = isCompleted ? "Completed Cases" : "Active Cases";
  const eyebrow = isCompleted ? "Completed medical cases" : "Active medical cases";
  const description = isCompleted
    ? "Cases that have finished their funding or medical support workflow for your hospital."
    : "Cases currently published or receiving public funding for your hospital.";

  useEffect(() => {
    let isMounted = true;

    async function loadHospitalCases() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/hospitals/cases/${endpoint}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || `Unable to load ${type} cases.`);
        }

        if (isMounted) {
          setCases(Array.isArray(data?.cases) ? data.cases : []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : `Unable to load ${type} cases.`,
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHospitalCases();

    return () => {
      isMounted = false;
    };
  }, [accessToken, endpoint, requestCount, type]);

  const totalRaised = cases.reduce(
    (sum, medicalCase) => sum + medicalCase.amount_raised_kobo,
    0,
  );
  const totalBill = cases.reduce(
    (sum, medicalCase) => sum + medicalCase.bill_amount_kobo,
    0,
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <SquareKanban className="h-4 w-4" />
            )}
            {eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRequestCount((count) => count + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <ActiveCaseSummaryCard label={title} value={cases.length.toString()} />
        <ActiveCaseSummaryCard
          label="Total raised"
          value={formatNairaFromKobo(totalRaised)}
        />
        <ActiveCaseSummaryCard
          label="Total bill"
          value={formatNairaFromKobo(totalBill)}
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="grid min-h-[280px] place-items-center p-8 text-center">
            <div>
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-teal-800" />
              <p className="mt-4 font-bold">Loading {type} cases...</p>
              <p className="mt-1 text-sm text-slate-500">
                Fetching the latest hospital case records.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="grid min-h-[280px] place-items-center p-8 text-center">
            <div className="max-w-md">
              <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
              <h2 className="mt-4 text-2xl font-bold">Unable to load cases</h2>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => setRequestCount((count) => count + 1)}
                className="mt-5 rounded-lg bg-teal-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-900"
              >
                Try again
              </button>
            </div>
          </div>
        ) : cases.length === 0 ? (
          <div className="grid min-h-[280px] place-items-center p-8 text-center">
            <div className="max-w-md">
              <FileText className="mx-auto h-10 w-10 text-slate-500" />
              <h2 className="mt-4 text-2xl font-bold">
                No {type} cases yet
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {isCompleted
                  ? "Completed medical cases for your hospital will appear here."
                  : "Active medical cases created by your hospital will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Case</th>
                    <th className="px-5 py-4">Funding</th>
                    <th className="px-5 py-4">Raised</th>
                    <th className="px-5 py-4">Bill</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Admitted</th>
                    <th className="px-5 py-4">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((medicalCase) => (
                    <ActiveCaseTableRow
                      key={medicalCase.id}
                      medicalCase={medicalCase}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 lg:hidden">
              {cases.map((medicalCase) => (
                <ActiveCaseMobileCard
                  key={medicalCase.id}
                  medicalCase={medicalCase}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function ActiveCaseSummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-bold text-slate-950">
        {value}
      </p>
    </article>
  );
}

function ActiveCaseTableRow({ medicalCase }: { medicalCase: MedicalCase }) {
  const progress = getFundingPercentage(medicalCase);

  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-5 py-4 align-top">
        <div className="max-w-xs">
          <p className="break-words font-bold">{medicalCase.title}</p>
          <p className="mt-1 break-all text-xs text-slate-500">
            ID: {medicalCase.id}
          </p>
          {medicalCase.diagnosis_summary && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
              {medicalCase.diagnosis_summary}
            </p>
          )}
        </div>
      </td>
      <td className="px-5 py-4 align-top">
        <FundingProgress value={progress} />
      </td>
      <td className="px-5 py-4 align-top font-bold">
        {formatNairaFromKobo(medicalCase.amount_raised_kobo)}
      </td>
      <td className="px-5 py-4 align-top font-bold">
        {formatNairaFromKobo(medicalCase.bill_amount_kobo)}
      </td>
      <td className="px-5 py-4 align-top">
        <StatusPill status={medicalCase.status} />
      </td>
      <td className="px-5 py-4 align-top text-slate-600">
        {formatCaseDate(medicalCase.admitted_at)}
      </td>
      <td className="px-5 py-4 align-top">
        <PublicCaseLink medicalCase={medicalCase} />
      </td>
    </tr>
  );
}

function ActiveCaseMobileCard({ medicalCase }: { medicalCase: MedicalCase }) {
  const progress = getFundingPercentage(medicalCase);

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold">{medicalCase.title}</h2>
          <p className="mt-1 break-all text-xs text-slate-500">
            ID: {medicalCase.id}
          </p>
        </div>
        <StatusPill status={medicalCase.status} />
      </div>

      {medicalCase.diagnosis_summary && (
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {medicalCase.diagnosis_summary}
        </p>
      )}

      <div className="mt-4">
        <FundingProgress value={progress} />
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Raised
          </dt>
          <dd className="mt-1 font-bold">
            {formatNairaFromKobo(medicalCase.amount_raised_kobo)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Bill
          </dt>
          <dd className="mt-1 font-bold">
            {formatNairaFromKobo(medicalCase.bill_amount_kobo)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Admitted
          </dt>
          <dd className="mt-1 text-slate-700">
            {formatCaseDate(medicalCase.admitted_at)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Public link
          </dt>
          <dd className="mt-1">
            <PublicCaseLink medicalCase={medicalCase} />
          </dd>
        </div>
      </dl>
    </article>
  );
}

function FundingProgress({ value }: { value: number }) {
  return (
    <div className="min-w-[140px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-teal-800">{value}%</span>
        <span className="text-xs text-slate-500">funded</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-teal-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-800">
      {status || "active"}
    </span>
  );
}

function PublicCaseLink({ medicalCase }: { medicalCase: MedicalCase }) {
  const href = medicalCase.public_link || `/cases/${medicalCase.public_slug}`;

  if (!href || href === "/cases/") {
    return <span className="text-sm text-slate-500">Not available</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-teal-100 px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-50"
    >
      View
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

function getFundingPercentage(medicalCase: MedicalCase) {
  if (!medicalCase.bill_amount_kobo) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (medicalCase.amount_raised_kobo / medicalCase.bill_amount_kobo) * 100,
      ),
    ),
  );
}

function formatCaseDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(date);
}

function OverviewView({
  accessToken,
  onNavigate,
}: {
  accessToken: string;
  onNavigate: (view: HospitalDashboardView) => void;
}) {
  const [activeCases, setActiveCases] = useState<MedicalCase[]>([]);
  const [completedCases, setCompletedCases] = useState<MedicalCase[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchJson(path: string) {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load dashboard data.");
      }

      return data;
    }

    async function loadOverview() {
      setIsLoading(true);
      setError("");

      try {
        const [activeData, completedData, settlementData] = await Promise.all([
          fetchJson("/api/v1/hospitals/cases/active"),
          fetchJson("/api/v1/hospitals/cases/completed"),
          fetchJson("/api/v1/hospitals/settlements/history?limit=5&offset=0"),
        ]);

        if (isMounted) {
          setActiveCases(Array.isArray(activeData?.cases) ? activeData.cases : []);
          setCompletedCases(
            Array.isArray(completedData?.cases) ? completedData.cases : [],
          );
          setSettlements(
            Array.isArray(settlementData?.settlements)
              ? settlementData.settlements
              : [],
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [accessToken, requestCount]);

  const activeRaised = activeCases.reduce(
    (sum, medicalCase) => sum + medicalCase.amount_raised_kobo,
    0,
  );
  const activeBill = activeCases.reduce(
    (sum, medicalCase) => sum + medicalCase.bill_amount_kobo,
    0,
  );
  const settledAmount = settlements
    .filter((settlement) => settlement.status?.toLowerCase().includes("paid"))
    .reduce((sum, settlement) => sum + settlement.amount_kobo, 0);
  const pendingSettlements = settlements.filter((settlement) => {
    const status = settlement.status?.toLowerCase() || "";
    return status.includes("pending") || status.includes("initiated");
  }).length;
  const failedSettlements = settlements.filter((settlement) =>
    settlement.status?.toLowerCase().includes("fail"),
  ).length;
  const averageFunding =
    activeBill > 0 ? Math.round((activeRaised / activeBill) * 100) : 0;
  const topActiveCases = activeCases.slice(0, 5);
  const recentSettlements = settlements.slice(0, 5);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
            <LayoutDashboard className="h-4 w-4" />
            Live hospital overview
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Hospital Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            A real-time operating view of cases, funding movement, and
            settlement activity for your hospital.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRequestCount((count) => count + 1)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewMetricCard
          icon={Activity}
          label="Active Cases"
          value={isLoading ? "..." : activeCases.length.toString()}
          detail={`${averageFunding}% average funding`}
        />
        <OverviewMetricCard
          icon={WalletCards}
          label="Funds Raising"
          value={isLoading ? "..." : formatNairaFromKobo(activeRaised)}
          detail={`against ${formatNairaFromKobo(activeBill)} in open bills`}
        />
        <OverviewMetricCard
          icon={CheckCircle2}
          label="Completed Cases"
          value={isLoading ? "..." : completedCases.length.toString()}
          detail="closed or completed case records"
        />
        <OverviewMetricCard
          icon={Landmark}
          label="Settled Amount"
          value={isLoading ? "..." : formatNairaFromKobo(settledAmount)}
          detail={`${pendingSettlements} pending settlement${
            pendingSettlements === 1 ? "" : "s"
          }`}
          tone={failedSettlements > 0 ? "alert" : "default"}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <OverviewCasesPreview
          cases={topActiveCases}
          isLoading={isLoading}
          onViewAll={() => onNavigate("active-cases")}
        />

        <aside className="grid gap-5">
          <OverviewActionPanel
            activeCount={activeCases.length}
            pendingSettlements={pendingSettlements}
            failedSettlements={failedSettlements}
            onNavigate={onNavigate}
          />
          <OverviewFundingPanel
            raised={activeRaised}
            bill={activeBill}
            averageFunding={averageFunding}
          />
        </aside>
      </section>

      <OverviewSettlementsPreview
        settlements={recentSettlements}
        isLoading={isLoading}
        onViewAll={() => onNavigate("settlement-history")}
      />
    </>
  );
}

function OverviewMetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "alert";
}) {
  return (
    <article
      className={`rounded-xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm ${
        tone === "alert" ? "border-t-amber-500" : "border-t-teal-300"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          tone === "alert"
            ? "bg-amber-50 text-amber-700"
            : "bg-teal-50 text-teal-800"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function OverviewCasesPreview({
  cases,
  isLoading,
  onViewAll,
}: {
  cases: MedicalCase[];
  isLoading: boolean;
  onViewAll: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Active Cases</h2>
          <p className="mt-1 text-sm text-slate-600">
            Open funding cases that may need monitoring.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
        >
          View all
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <OverviewLoadingBlock label="Loading active cases..." />
      ) : cases.length === 0 ? (
        <OverviewEmptyBlock
          icon={FileText}
          title="No active cases"
          detail="Newly published medical cases will appear here."
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {cases.map((medicalCase) => (
            <article
              key={medicalCase.id}
              className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words font-bold">{medicalCase.title}</h3>
                  <StatusPill status={medicalCase.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                  {medicalCase.diagnosis_summary || "No summary provided."}
                </p>
              </div>
              <FundingProgress value={getFundingPercentage(medicalCase)} />
              <div className="text-sm lg:text-right">
                <p className="font-bold">
                  {formatNairaFromKobo(medicalCase.amount_raised_kobo)}
                </p>
                <p className="text-slate-500">
                  of {formatNairaFromKobo(medicalCase.bill_amount_kobo)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function OverviewActionPanel({
  activeCount,
  pendingSettlements,
  failedSettlements,
  onNavigate,
}: {
  activeCount: number;
  pendingSettlements: number;
  failedSettlements: number;
  onNavigate: (view: HospitalDashboardView) => void;
}) {
  const actions = [
    {
      label: "Create medical case",
      detail: "Start a new verified patient case",
      icon: PlusSquare,
      view: "create-case" as HospitalDashboardView,
      tone: "primary",
    },
    {
      label: "Review active cases",
      detail: `${activeCount} active case${activeCount === 1 ? "" : "s"}`,
      icon: SquareKanban,
      view: "active-cases" as HospitalDashboardView,
      tone: "neutral",
    },
    {
      label: "Settlement history",
      detail:
        failedSettlements > 0
          ? `${failedSettlements} failed settlement${
              failedSettlements === 1 ? "" : "s"
            }`
          : `${pendingSettlements} pending settlement${
              pendingSettlements === 1 ? "" : "s"
            }`,
      icon: History,
      view: "settlement-history" as HospitalDashboardView,
      tone: failedSettlements > 0 ? "alert" : "neutral",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold">Action Center</h2>
      <p className="mt-1 text-sm text-slate-600">
        Fast paths for the work hospitals repeat most.
      </p>
      <div className="mt-5 grid gap-3">
        {actions.map(({ label, detail, icon: Icon, view, tone }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(view)}
            className={`flex items-center gap-3 rounded-lg border px-4 py-4 text-left transition ${
              tone === "primary"
                ? "border-teal-700 bg-teal-800 text-white hover:bg-teal-900"
                : tone === "alert"
                  ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  : "border-slate-200 bg-white text-slate-800 hover:border-teal-200 hover:bg-teal-50"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="min-w-0">
              <span className="block font-bold">{label}</span>
              <span
                className={`mt-1 block text-xs ${
                  tone === "primary" ? "text-teal-50" : "text-slate-500"
                }`}
              >
                {detail}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function OverviewFundingPanel({
  raised,
  bill,
  averageFunding,
}: {
  raised: number;
  bill: number;
  averageFunding: number;
}) {
  const remaining = Math.max(bill - raised, 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
          <WalletCards className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl font-bold">Funding Snapshot</h2>
          <p className="text-sm text-slate-600">Across active cases</p>
        </div>
      </div>
      <div className="mt-6">
        <FundingProgress value={averageFunding} />
      </div>
      <dl className="mt-6 grid gap-4 text-sm">
        <OverviewAmountRow label="Raised" value={formatNairaFromKobo(raised)} />
        <OverviewAmountRow label="Open bills" value={formatNairaFromKobo(bill)} />
        <OverviewAmountRow
          label="Remaining"
          value={formatNairaFromKobo(remaining)}
        />
      </dl>
    </section>
  );
}

function OverviewAmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-words text-right font-bold">{value}</dd>
    </div>
  );
}

function OverviewSettlementsPreview({
  settlements,
  isLoading,
  onViewAll,
}: {
  settlements: SettlementRecord[];
  isLoading: boolean;
  onViewAll: () => void;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recent Settlements</h2>
          <p className="mt-1 text-sm text-slate-600">
            Latest payout movement from your settlement ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-100"
        >
          View history
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <OverviewLoadingBlock label="Loading settlements..." />
      ) : settlements.length === 0 ? (
        <OverviewEmptyBlock
          icon={Landmark}
          title="No settlement records"
          detail="Settlement activity will appear here after payouts begin."
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {settlements.map((settlement) => (
            <article
              key={settlement.id}
              className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_150px_130px] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words font-bold">
                    {settlement.case_title || "Medical case"}
                  </h3>
                  <SettlementStatusPill status={settlement.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {settlement.patient_name || "Patient"} -{" "}
                  {settlement.bank_name || "Bank"}
                </p>
              </div>
              <p className="font-bold">
                {formatNairaFromKobo(settlement.amount_kobo)}
              </p>
              <p className="text-sm text-slate-500 md:text-right">
                {formatCaseDate(settlement.paid_at || settlement.initiated_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function OverviewLoadingBlock({ label }: { label: string }) {
  return (
    <div className="grid min-h-[220px] place-items-center p-8 text-center">
      <div>
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-teal-800" />
        <p className="mt-4 font-bold">{label}</p>
      </div>
    </div>
  );
}

function OverviewEmptyBlock({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof FileText;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid min-h-[220px] place-items-center p-8 text-center">
      <div className="max-w-sm">
        <Icon className="mx-auto h-10 w-10 text-slate-500" />
        <h3 className="mt-4 text-xl font-bold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      </div>
    </div>
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
        amount: Math.round(Number(item.amount)),
      }))
      .filter((item) => item.description && item.amount > 0);

    if (!title.trim() || !diagnosisSummary.trim()) {
      toast.error("Complete the case title and diagnosis summary.");
      return;
    }

    if (!preparedBillingItems.length) {
      toast.error("Add at least one valid billing item.");
      return;
    }

    if (!documents.length) {
      toast.error("Upload at least one case document.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/cases`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admitted_at: admittedAt || null,
          billing_items: preparedBillingItems,
          diagnosis_summary: diagnosisSummary.trim(),
          documents,
          patient_username: lookup.patient.username,
          title: title.trim(),
        }),
      });
      const responseText = await response.text();
      const data = parseApiResponse(responseText);

      if (!response.ok) {
        throw new Error(formatApiError(data, responseText));
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
                  Admission date (optional)
                </span>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
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
                      min="1"
                      step="1"
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

function parseApiResponse(responseText: string) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return null;
  }
}

function formatApiError(data: unknown, responseText: string) {
  if (data && typeof data === "object") {
    const body = data as {
      detail?: unknown;
      error?: unknown;
      errors?: unknown;
      message?: unknown;
    };

    const primaryMessage = stringifyApiErrorValue(body.message);
    const detailMessage = stringifyApiErrorValue(body.detail);
    const errorsMessage = stringifyApiErrorValue(body.errors);
    const errorMessage = stringifyApiErrorValue(body.error);

    return (
      primaryMessage ||
      detailMessage ||
      errorsMessage ||
      errorMessage ||
      "Unable to create medical case."
    );
  }

  return responseText || "Unable to create medical case.";
}

function stringifyApiErrorValue(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyApiErrorValue(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof value === "object") {
    const record = value as { loc?: unknown; msg?: unknown; message?: unknown };
    const location = Array.isArray(record.loc) ? record.loc.join(".") : "";
    const message = stringifyApiErrorValue(record.msg || record.message);

    if (location && message) {
      return `${location}: ${message}`;
    }

    if (message) {
      return message;
    }

    return JSON.stringify(value);
  }

  return String(value);
}

function readDocumentFile(file: File) {
  return new Promise<CaseDocument>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const [, contentBase64 = ""] = result.split(",");

      resolve({
        content_base64: contentBase64,
        document_type: "medical_report",
        mime_type: file.type || "application/octet-stream",
        original_filename: file.name,
      });
    };

    reader.onerror = () => {
      reject(new Error("Unable to read selected document."));
    };

    reader.readAsDataURL(file);
  });
}


