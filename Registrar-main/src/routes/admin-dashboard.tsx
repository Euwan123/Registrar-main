import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProtectedPortal } from "@/components/protected-portal";
import { clearAuthSession } from "@/lib/auth-client";
import {
  getRequests,
  isDatabaseMode,
  resetDemoData,
  STORE_EVENT,
  updateRequestStatus,
  type RegistrarRequest,
  type RequestStatus,
} from "@/lib/registrar-store";
import { StatusBadge as StatusBadgeShim } from "@/components/registrar-ui";
import birdLogo from "@/assets/Bird.jfif";
import yanoGoLogo from "@/assets/YanoGo.jfif";

export const Route = createFileRoute("/admin-dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — USeP Virtual Registrar" },
      { name: "description", content: "Registrar operations dashboard with analytics, queue management, and institutional metrics." },
      { property: "og:title", content: "Admin Dashboard — USeP Virtual Registrar" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminDashboardPage,
});

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="YanoGo home"
      className={`flex items-center gap-0 ${light ? "rounded-md bg-background px-1.5 py-0.5" : ""}`}
    >
      <img
        src={birdLogo}
        alt=""
        className="brand-mark relative z-10 h-12 w-12 shrink-0 object-contain mix-blend-multiply sm:h-14 sm:w-14"
      />
      <img
        src={yanoGoLogo}
        alt="YanoGo — request it, get it, go!"
        className="brand-mark -ml-5 h-12 w-[9.25rem] object-cover object-[12%_center] mix-blend-multiply sm:h-14 sm:w-[10.75rem]"
      />
    </Link>
  );
}

function AdminPortalHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[4.5rem] max-w-[1560px] items-center justify-between gap-4 px-4 sm:px-6">
        
        <button
          onClick={onMenuClick}
          className="flex lg:hidden p-2 rounded-md hover:bg-secondary text-primary border-2 border-primary"
          aria-label="Toggle menu"
          style={{minWidth: '44px', minHeight: '44px'}}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center lg:justify-start">
          <div className="-mr-1 hidden rounded-md bg-secondary/70 px-1 sm:block">
            <Brand />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-sm bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline-flex">
            <ShieldCheck className="mr-1 size-3.5" /> Admin view
          </span>
          <Button variant="outline" size="sm" onClick={() => { clearAuthSession(); navigate({ to: "/login" }); }} className="hidden sm:flex">
            <LogOut className="mr-2" /> Sign out
          </Button>
          <Button variant="outline" size="icon" onClick={() => { clearAuthSession(); navigate({ to: "/login" }); }} className="sm:hidden">
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}

const NAV_SECTIONS = [
  {
    label: "Registrar Operations",
    items: [
      { key: "dashboard", icon: "analytics", label: "Dashboard" },
      { key: "document-queue", icon: "description", label: "Document Queue" },
    ],
  },
  {
    label: "Academic Transactions",
    items: [
      { key: "add-drop", icon: "swap_calls", label: "Add/Drop & Enrollment" },
      { key: "shifting-transfer", icon: "move_up", label: "Shifting & Transfer" },
      { key: "graduation-verification", icon: "school", label: "Graduation Verification" },
      { key: "loa-readmission", icon: "pause_circle", label: "LOA & Readmission" },
    ],
  },
];

function Sidebar({ active, onNavigate, isOpen, onClose }: { active: string; onNavigate: (key: string) => void; isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      
      <aside className={`fixed left-0 top-0 h-full w-72 bg-primary text-primary-foreground z-50 flex flex-col justify-between shadow-lg transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col flex-1 overflow-y-auto">
        
        <div className="h-16 px-4 flex items-center gap-3 bg-primary border-b border-white/10">
          <Link to="/" aria-label="USeP e-Registrar home" className="flex min-w-0 items-center gap-3 px-2" onClick={onClose}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gold font-display text-lg font-bold text-primary">U</span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display text-base font-bold text-primary-foreground">USeP e-Registrar</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">Admin Portal</span>
            </span>
          </Link>
        </div>

        <nav className="flex flex-col px-2 py-4 gap-0.5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-2 pt-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/50">{section.label}</span>
              </div>
              {section.items.map((item) => {
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onNavigate(item.key);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-semibold text-sm ${
                      isActive
                        ? "bg-white/20 text-primary-foreground shadow-sm"
                        : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full bg-gold text-primary-deep text-[10px] font-bold">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3 bg-primary border-t border-white/10">
        <div className="p-3 rounded-lg bg-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold text-primary font-bold text-sm flex items-center justify-center">RA</div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-primary-foreground">Registrar Admin</span>
              <span className="text-[10px] text-primary-foreground/60">Head Evaluator</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { clearAuthSession(); navigate({ to: "/login" }); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10 transition-colors" title="Sign out">
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

function KpiCard({ label, value, sub, icon }: {
  label: string; value: number; sub: string; icon: string;
}) {
  return (
    <div className="bg-background p-5 rounded-xl border border-border shadow-sm hover:shadow-panel transition-shadow flex flex-col justify-between gap-3 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors text-[22px]">{icon}</span>
      </div>
      <span className="font-display text-3xl font-bold text-primary">{value}</span>
      <div className="bg-muted/50 rounded-md px-3 py-2">
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function RequestActivityChart({ requests }: { requests: RegistrarRequest[] }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: requests.filter((request) => request.createdAt.slice(0, 10) === key).length,
    };
  });
  const maxCount = Math.max(1, ...days.map((day) => day.count));
  const hasRecentRequests = days.some((day) => day.count > 0);

  return (
    <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DATABASE ACTIVITY</p>
      <h2 className="font-display text-base font-bold text-primary mt-0.5 mb-5">Requests submitted · last 7 days</h2>
      {hasRecentRequests ? (
        <div className="h-44 flex items-end justify-between gap-3 pb-2 px-2">
          {days.map((day) => (
            <div key={day.key} className="flex-1 flex flex-col items-center h-full justify-end">
              <span className="text-xs font-mono pb-1 text-muted-foreground">{day.count}</span>
              <div
                className="w-full max-w-[42px] bg-primary rounded-t"
                style={{ height: `${day.count ? Math.max(8, (day.count / maxCount) * 100) : 0}%` }}
              />
              <span className="text-xs pt-2 font-medium text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex min-h-44 items-center justify-center text-sm text-muted-foreground">No requests were submitted in the last 7 days.</p>
      )}
    </div>
  );
}

function RequestStatusChart({ requests }: { requests: RegistrarRequest[] }) {
  const counts = requests.reduce<Record<string, number>>((result, request) => {
    result[request.status] = (result[request.status] ?? 0) + 1;
    return result;
  }, {});
  const statuses = Object.entries(counts).sort(([first], [second]) => first.localeCompare(second));
  const maxCount = Math.max(1, ...statuses.map(([, count]) => count));

  return (
    <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DATABASE BREAKDOWN</p>
      <h2 className="font-display text-base font-bold text-primary mt-0.5 mb-5">Requests by status</h2>
      {statuses.length ? (
        <div className="flex flex-col gap-4">
          {statuses.map(([status, count]) => (
            <div key={status} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{status}</span>
                <span className="font-mono font-bold text-primary">{count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex min-h-44 items-center justify-center text-sm text-muted-foreground">No requests in the database.</p>
      )}
    </div>
  );
}

function RequestTypeChart({ requests }: { requests: RegistrarRequest[] }) {
  const types = [
    { label: "Document requests", count: requests.filter((request) => request.kind === "Document").length },
    { label: "Record corrections", count: requests.filter((request) => request.kind === "Records Correction").length },
  ];
  const maxCount = Math.max(1, ...types.map((type) => type.count));

  return (
    <div className="bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DATABASE BREAKDOWN</p>
      <h2 className="font-display text-base font-bold text-primary mt-0.5 mb-5">Requests by type</h2>
      {requests.length ? (
        <div className="flex flex-col gap-5">
          {types.map((type) => (
            <div key={type.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{type.label}</span>
                <span className="font-mono font-bold text-primary">{type.count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(type.count / maxCount) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex min-h-44 items-center justify-center text-sm text-muted-foreground">No requests in the database.</p>
      )}
    </div>
  );
}

function getRequestActions(request: RegistrarRequest): Array<{
  label: string;
  status: RequestStatus;
  variant: "default" | "destructive";
}> {
  if (["Pending Review", "Under Review", "Needs More Info"].includes(request.status)) {
    return [
      { label: "Accept", status: "Processing", variant: "default" },
      { label: "Decline", status: "Declined", variant: "destructive" },
    ];
  }
  if (request.status === "Processing") {
    return [
      {
        label: request.kind === "Document" ? "Mark ready" : "Complete",
        status: request.kind === "Document" ? "Ready for Pickup" : "Completed",
        variant: "default",
      },
      { label: "Decline", status: "Declined", variant: "destructive" },
    ];
  }
  if (request.status === "Ready for Pickup") {
    return [{ label: "Complete", status: "Completed", variant: "default" }];
  }
  return [];
}

function QueueTable({ requests, search, onStatusChange }: {
  requests: RegistrarRequest[];
  search: string;
  onStatusChange: (id: string, status: RequestStatus) => void;
}) {
  const filtered = requests.filter((request) =>
    `${request.studentName} ${request.id} ${request.requestType} ${request.studentNumber}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="overflow-x-auto w-full">
      <table className="data-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Student / ID</th>
            <th>Request</th>
            <th>Submission Date</th>
            <th>Status</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((request) => (
            <tr key={request.id}>
              <td><span className="font-mono text-xs font-bold text-primary">{request.id}</span></td>
              <td>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-secondary text-primary font-bold text-xs flex items-center justify-center">
                    {request.studentName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <strong>{request.studentName}</strong>
                    <small>{request.studentNumber} · {request.course}</small>
                  </div>
                </div>
              </td>
              <td>
                <strong>{request.requestType}</strong>
                <small>{request.kind}</small>
              </td>
              <td className="text-xs text-muted-foreground">{request.createdAt}</td>
              <td><StatusBadgeShim status={request.status} /></td>
              <td className="text-right">
                <div className="flex justify-end gap-1">
                  {getRequestActions(request).map((action) => (
                    <Button
                      key={action.label}
                      type="button"
                      size="sm"
                      variant={action.variant}
                      onClick={() => onStatusChange(request.id, action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
          {!filtered.length && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                {requests.length ? "No requests match your search." : "No requests in the database need attention."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminWorkspace({
  activeNav,
  requests,
  search,
  onSearchChange,
  onStatusChange,
}: {
  activeNav: string;
  requests: RegistrarRequest[];
  search: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (id: string, status: RequestStatus) => void;
}) {
  const isDocumentQueue = activeNav === "document-queue";
  const title = isDocumentQueue
    ? "Document Queue"
    : activeNav === "add-drop"
      ? "Add/Drop & Enrollment"
      : activeNav === "shifting-transfer"
        ? "Shifting & Transfer"
        : activeNav === "graduation-verification"
          ? "Graduation Verification"
          : "LOA & Readmission";

  const filteredRequests = requests.filter((item) =>
    `${item.id} ${item.studentName} ${item.studentNumber} ${item.requestType}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="rounded-xl border border-border bg-background shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Registrar Operations</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-primary">{title}</h2>
        </div>
        <input
          className="form-input md:w-72"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search records"
        />
      </div>
      {isDocumentQueue ? (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Request</th><th>Student</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {filteredRequests.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.requestType}</strong><small>{item.id}</small></td>
                  <td><strong>{item.studentName}</strong><small>{item.studentNumber}</small></td>
                  <td><StatusBadgeShim status={item.status} /></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      {getRequestActions(item).map((action) => (
                        <Button
                          key={action.label}
                          type="button"
                          size="sm"
                          variant={action.variant}
                          onClick={() => onStatusChange(item.id, action.status)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredRequests.length && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    {requests.length ? "No requests match your search." : "No requests in the database."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground">
          These academic workflows do not have a connected database table yet. No sample or browser-only records are shown.
        </div>
      )}
    </section>
  );
}

function AdminDashboardPage() {
  return (
    <ProtectedPortal role="admin">
      <AdminDashboardContent />
    </ProtectedPortal>
  );
}

function AdminDashboardContent() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [resetError, setResetError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<RegistrarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    try {
      if (!isDatabaseMode()) {
        throw new Error("Database mode is disabled. This dashboard only displays database records.");
      }
      setRequests(await getRequests());
      setLoadError("");
    } catch (error) {
      setRequests([]);
      setLoadError(error instanceof Error ? error.message : "Could not load requests from the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    window.addEventListener(STORE_EVENT, loadRequests);
    return () => window.removeEventListener(STORE_EVENT, loadRequests);
  }, []);

  const handleReset = async () => {
    if (!window.confirm("Delete all requests and record corrections? User accounts and passwords will be kept.")) return;
    setResetError("");
    try {
      await resetDemoData();
      await loadRequests();
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Could not reset registrar activity.");
    }
  };

  const handleExport = () => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      ["Request ID", "Student", "Student ID", "Kind", "Request", "Status", "Submitted"],
      ...requests.map((request) => [
        request.id,
        request.studentName,
        request.studentNumber,
        request.kind,
        request.requestType,
        request.status,
        request.createdAt,
      ]),
    ].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "registrar-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    try {
      await updateRequestStatus(id, status);
      await loadRequests();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not update the database record.");
    }
  };

  const pendingCount = requests.filter((request) => request.status === "Pending Review").length;
  const inProgressCount = requests.filter((request) => ["Processing", "Under Review"].includes(request.status)).length;
  const completedCount = requests.filter((request) => ["Completed", "Approved"].includes(request.status)).length;
  const actionableRequests = requests.filter((request) => getRequestActions(request).length > 0);
  const dataReady = !loading && !loadError;

  return (
    <div className="min-h-screen bg-surface-soft">
      <Sidebar 
        active={activeNav} 
        onNavigate={setActiveNav} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        
        <AdminPortalHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 bg-surface-soft">
          <div className="px-6 py-6 flex flex-col gap-6 max-w-[1560px] mx-auto w-full">

            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-secondary px-2 py-0.5 rounded">REGISTRAR OPERATIONS</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${dataReady ? "bg-green-600" : "bg-muted-foreground"}`} />
                    {loadError ? "Database unavailable" : loading ? "Loading database" : "Database records"}
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Requests and corrections loaded from the connected database.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExport}
                  disabled={!dataReady || requests.length === 0}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md bg-background hover:bg-muted text-foreground transition-all text-xs font-semibold border border-border shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span> <span className="hidden sm:inline">Export CSV Report</span>
                </button>
                <button
                  onClick={loadRequests}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md bg-background hover:bg-muted text-foreground transition-all text-xs font-semibold border border-border shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span> <span className="hidden sm:inline">Refresh database</span>
                </button>
                <button
                  onClick={handleReset}
                  disabled={!isDatabaseMode() || loading}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md bg-primary hover:bg-primary-deep text-primary-foreground text-xs font-semibold shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span> <span className="hidden sm:inline">Reset activity</span>
                </button>
              </div>
            </div>
            {resetError && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{resetError}</p>}

            {loadError ? (
              <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                Could not load database records: {loadError}
              </p>
            ) : loading ? (
              <p className="rounded-md border border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                Loading requests from the database…
              </p>
            ) : activeNav === "dashboard" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KpiCard label="TOTAL SUBMISSIONS" value={requests.length} icon="inbox" sub="Requests and corrections in the database" />
                  <KpiCard label="AWAITING REVIEW" value={pendingCount} icon="hourglass_top" sub="Status: Pending Review" />
                  <KpiCard label="IN PROGRESS" value={inProgressCount} icon="pending_actions" sub="Status: Processing or Under Review" />
                  <KpiCard label="COMPLETED / APPROVED" value={completedCount} icon="verified" sub="Status: Completed or Approved" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <RequestActivityChart requests={requests} />
                  <RequestStatusChart requests={requests} />
                  <RequestTypeChart requests={requests} />
                </div>

                <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border bg-muted/20">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold text-primary">Open Requests</h2>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {actionableRequests.length} actionable
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Open requests and corrections from the database.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[16px]">search</span>
                      <input
                        id="queue-search"
                        className="form-input pl-9"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Filter requests, names, IDs..."
                      />
                    </div>
                  </div>
                  <QueueTable
                    requests={actionableRequests}
                    search={search}
                    onStatusChange={handleStatusChange}
                  />
                  <div className="px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                    Showing {actionableRequests.length} actionable database record{actionableRequests.length === 1 ? "" : "s"}.
                  </div>
                </div>
              </>
            ) : (
              <AdminWorkspace
                activeNav={activeNav}
                requests={requests}
                search={search}
                onSearchChange={setSearch}
                onStatusChange={handleStatusChange}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
