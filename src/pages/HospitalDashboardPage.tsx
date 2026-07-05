import {
  Activity,
  Bell,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileClock,
  Filter,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusSquare,
  Search,
  ShieldCheck,
  SquareKanban,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  clearHospitalSession,
  getHospitalSession,
} from "../lib/auth";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Active Cases", icon: SquareKanban },
  { label: "Completed Cases", icon: CheckCircle2 },
  { label: "Settlement History", icon: History },
  { label: "Hospital Profile", icon: PlusSquare },
];

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
  const session = getHospitalSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const hospitalName = session.hospital.name || "Hospital";
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
        onClose={() => setIsSidebarOpen(false)}
        onLogout={logout}
      />

      <div className="min-w-0">
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
        </main>
      </div>
    </div>
  );
}

function HospitalSidebar({
  hospitalName,
  shortHospitalName,
  isOpen,
  onClose,
  onLogout,
}: {
  hospitalName: string;
  shortHospitalName: string;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
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
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(18rem,calc(100vw-2rem))] flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
              <PlusSquare className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-teal-800">Korede</p>
              <p className="text-xs font-medium text-slate-500">
                Command Center
              </p>
            </div>
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
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                active
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
