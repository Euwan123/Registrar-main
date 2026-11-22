import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, RotateCcw, Search, SlidersHorizontal, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageTitle, PortalHeader, StatusBadge } from "@/components/registrar-ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedPortal } from "@/components/protected-portal";
import { getRequests, resetDemoData, STORE_EVENT, updateRequestStatus, type RegistrarRequest, type RequestStatus, getDashboardStats, type DashboardStats } from "@/lib/registrar-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Registrar Admin Portal — USeP Virtual Registrar" }, { name: "description", content: "Manage document requests, record corrections, approvals, and academic transactions." },
    { property: "og:title", content: "Registrar Admin Portal — USeP Virtual Registrar" }, { property: "og:description", content: "Operational registrar queues and academic transaction management in one dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: AdminPage,
});

function StatusActions({ status, onChange }: { status: RequestStatus; onChange: (status: RequestStatus) => void }) {
  return <div className="flex min-w-max gap-1"><Button size="sm" variant="outline" onClick={() => onChange("Processing")} disabled={status === "Processing"}><CheckCircle2 /> Accept</Button><Button size="sm" variant="outline" onClick={() => onChange("Declined")} disabled={status === "Declined"}><XCircle /> Decline</Button><Button size="sm" variant="default" onClick={() => onChange("Completed")} disabled={status === "Completed"}>Complete</Button></div>;
}

function Filters({ search, setSearch, type, setType, options, typeLabel = "All types" }: { search: string; setSearch: (v: string) => void; type: string; setType: (v: string) => void; options: string[]; typeLabel?: string }) {
  return <div className="mb-5 flex flex-col gap-3 rounded-md border border-border bg-background p-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input className="form-input pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, ID, course, or request" /></label><label className="relative sm:w-64"><SlidersHorizontal className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><select className="form-input pl-9" value={type} onChange={(e) => setType(e.target.value)}><option value="">{typeLabel}</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label></div>;
}

function AdminPage() {
  return (
    <ProtectedPortal role="admin">
      <AdminPageContent />
    </ProtectedPortal>
  );
}

function AdminPageContent() {
  const [requests, setRequests] = useState<RegistrarRequest[]>([]); 
  const [stats, setStats] = useState<DashboardStats>({
    total_queue: 0,
    pending_review: 0,
    in_process: 0,
    completed: 0,
  });
  const [requestSearch, setRequestSearch] = useState(""); 
  const [requestType, setRequestType] = useState("");
  const [resetError, setResetError] = useState("");
  const handleReset = async () => {
    if (!window.confirm("Delete all requests and record corrections? User accounts and passwords will be kept.")) return;
    setResetError("");
    try {
      await resetDemoData();
      await refresh();
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Could not reset registrar activity.");
    }
  };
  
  const refresh = async () => { 
    try {
      const [reqData, statsData] = await Promise.all([getRequests(), getDashboardStats()]);
      setRequests(reqData);
      setStats(statsData);
      setResetError("");
    } catch (error) {
      setRequests([]);
      setStats({ total_queue: 0, pending_review: 0, in_process: 0, completed: 0 });
      setResetError(error instanceof Error ? error.message : "Could not load records from the database.");
    }
  };

  const handleRequestStatusChange = async (id: string, status: RequestStatus) => {
    try {
      await updateRequestStatus(id, status);
      await refresh();
    } catch (error) {
      setResetError(error instanceof Error ? error.message : "Could not update the request.");
    }
  };
  
  useEffect(() => { 
    refresh(); 
    window.addEventListener(STORE_EVENT, refresh); 
    return () => window.removeEventListener(STORE_EVENT, refresh); 
  }, []);
  
  const filteredRequests = useMemo(() => requests.filter((r) => { 
    const haystack = `${r.studentName} ${r.studentNumber} ${r.course} ${r.requestType}`.toLowerCase(); 
    return haystack.includes(requestSearch.toLowerCase()) && (!requestType || r.kind === requestType || r.requestType === requestType); 
  }), [requests, requestSearch, requestType]);
  
  return <main className="min-h-screen bg-surface-soft"><PortalHeader role="Admin" /><PageTitle eyebrow="Registrar operations" title="Academic Management Dashboard" description="Review requests and record corrections stored in the database." action={<Button variant="outline" onClick={handleReset}><RotateCcw /> Reset activity</Button>} />
    {resetError && <p role="alert" className="mx-auto mt-4 max-w-7xl rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{resetError}</p>}
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="stat-card"><span>Total submissions</span><strong>{stats.total_queue}</strong><small>requests and corrections</small></div>
      <div className="stat-card"><span>Pending review</span><strong>{stats.pending_review}</strong><small>awaiting action</small></div>
      <div className="stat-card"><span>In process</span><strong>{stats.in_process}</strong><small>approved requests</small></div>
      <div className="stat-card"><span>Completed</span><strong>{stats.completed}</strong><small>completed or approved</small></div>
    </div>
      <Tabs defaultValue="requests"><TabsList className="portal-tabs"><TabsTrigger value="requests"><ClipboardCheck /> Document Requests Queue</TabsTrigger><TabsTrigger value="academic"><SlidersHorizontal /> Academic Transactions</TabsTrigger></TabsList>
        <TabsContent value="requests" className="mt-7"><div className="mb-5"><h2 className="font-display text-2xl font-bold text-primary">Document Requests & Corrections</h2><p className="mt-1 text-sm text-muted-foreground">Student submissions appear here instantly. Actions update the student's tracker.</p></div><Filters search={requestSearch} setSearch={setRequestSearch} type={requestType} setType={setRequestType} options={["Document", "Records Correction", ...Array.from(new Set(requests.map((r) => r.requestType)))]} /><div className="table-shell">{filteredRequests.length ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Request</th><th>Student</th><th>Course</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredRequests.map((item) => <tr key={item.id}><td><strong>{item.requestType}</strong><small>{item.id} · {item.kind}</small></td><td><strong>{item.studentName}</strong><small>{item.studentNumber}</small></td><td>{item.course}</td><td><StatusBadge status={item.status} /></td><td><StatusActions status={item.status} onChange={(status) => { void handleRequestStatusChange(item.id, status); }} /></td></tr>)}</tbody></table></div> : <EmptyState>No requests match these filters.</EmptyState>}</div></TabsContent>
        <TabsContent value="academic" className="mt-7"><div className="rounded-md border border-border bg-background p-8 text-center text-sm text-muted-foreground">Academic transaction records are not currently stored in the connected database, so none are shown here.</div></TabsContent>
      </Tabs></div></main>;
}
