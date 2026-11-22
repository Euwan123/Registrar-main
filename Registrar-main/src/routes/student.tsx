import { createFileRoute } from "@tanstack/react-router";
import { BookOpenCheck, Check, ChevronDown, ClipboardList, FilePenLine, Plus, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, PageTitle, PortalHeader, StatusBadge } from "@/components/registrar-ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedPortal } from "@/components/protected-portal";
import { authHeaders } from "@/lib/auth-client";
import { DOCUMENTS, getRequests, STORE_EVENT, submitDocumentRequests, submitRecordCorrection, type RegistrarRequest } from "@/lib/registrar-store";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [
    { title: "Student Dashboard — USeP Virtual Registrar" }, { name: "description", content: "Request registrar documents, submit student record corrections, and track their status." },
    { property: "og:title", content: "Student Dashboard — USeP Virtual Registrar" }, { property: "og:description", content: "A connected student workspace for documents, corrections, payments, and request tracking." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: StudentPage,
});

function RequestReviewModal({
  isOpen,
  onClose,
  items,
  amount,
  purpose,
  fulfillment,
  paymentMethod,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ name: string; price: number }>;
  amount: number;
  purpose: string;
  fulfillment: string;
  paymentMethod: string;
  onConfirm: () => Promise<void>;
}) {
  if (!isOpen) return null;
  const [submitting, setSubmitting] = useState(false);
  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-background shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between rounded-t-lg border-b border-border bg-primary px-5 py-4">
          <div className="flex items-center gap-2 text-primary-foreground">
            <ClipboardList className="size-5" />
            <h2 className="font-display text-lg font-bold">Review your request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <h3 className="font-display text-lg font-bold text-primary">Selected documents</h3>
            <ul className="mt-3 divide-y divide-border rounded-md border border-border px-3">
              {items.map((item) => (
                <li key={item.name} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{item.name}</span>
                  <strong className="shrink-0 text-primary">₱{item.price}</strong>
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid gap-3 rounded-md bg-surface-soft p-4 text-sm sm:grid-cols-2">
            <div><dt className="text-muted-foreground">Purpose</dt><dd className="mt-1 font-medium">{purpose}</dd></div>
            <div><dt className="text-muted-foreground">Fulfillment</dt><dd className="mt-1 font-medium">{fulfillment}</dd></div>
            <div><dt className="text-muted-foreground">Payment preference</dt><dd className="mt-1 font-medium">{paymentMethod}</dd></div>
            <div><dt className="text-muted-foreground">Request total</dt><dd className="mt-1 font-display text-lg font-bold text-primary">₱{amount}</dd></div>
          </dl>
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Demo checkout: no payment will be processed. Submitting sends your request to the Registrar for review.
          </p>
          <Button onClick={confirm} disabled={submitting} className="w-full" size="lg" variant="gold">
            <WalletCards className="mr-2 size-4" />
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentPage() {
  return (
    <ProtectedPortal role="student">
      <StudentPortal />
    </ProtectedPortal>
  );
}

function StudentPortal() {
  const [requests, setRequests] = useState<RegistrarRequest[]>([]);
  const [profile, setProfile] = useState<{
    name: string;
    number: string;
    course: string;
  } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [purpose, setPurpose] = useState("Employment");
  const [delivery, setDelivery] = useState("Pickup at Registrar's Office");
  const [payment, setPayment] = useState("GCash");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const studentProfile = profile ?? { name: "Student", number: "Loading…", course: "" };
  const selectedDocuments = useMemo(
    () => DOCUMENTS.filter((doc) => selected.includes(doc.name)),
    [selected],
  );
  const total = selectedDocuments.reduce((sum, doc) => sum + doc.price, 0);
  
  const toggleDocument = (name: string) => {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((selectedName) => selectedName !== name)
        : [...current, name]
    );
  };

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", { headers: authHeaders() });
        const result = await response.json() as {
          error?: string;
          profile?: {
            first_name: string;
            last_name: string;
            university_id: string;
            program: string | null;
          };
        };
        if (!response.ok || !result.profile) {
          throw new Error(result.error || "Could not load your student profile.");
        }
        if (active) {
          setProfile({
            name: `${result.profile.first_name} ${result.profile.last_name}`,
            number: result.profile.university_id,
            course: result.profile.program ?? "",
          });
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Could not load your student profile.");
          setMessageIsError(true);
        }
      }
    };
    loadProfile();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!profile) return;
    const refresh = async () => {
      const allRequests = await getRequests();
      setRequests(allRequests.filter((r) => r.studentNumber === profile.number));
    };
    refresh(); 
    window.addEventListener(STORE_EVENT, refresh); 
    return () => window.removeEventListener(STORE_EVENT, refresh); 
  }, [profile]);
  
  const openRequestReview = () => {
    if (selected.length === 0) return;
    setShowCheckout(true);
  };

  const handlePaymentClick = (event: React.FormEvent) => {
    event.preventDefault();
    openRequestReview();
  };
  
  const handleSubmitRequest = async () => {
    try {
      const fulfillmentMethod = delivery.toLowerCase().includes("courier")
        ? "delivery"
        : delivery.toLowerCase().includes("digital")
          ? "digital"
          : "pickup";
      const result = await submitDocumentRequests({
        requestTypes: selected,
        purpose,
        fulfillmentMethod,
        paymentMethod: payment,
      });
      setMessage(
        `Request submitted successfully for ${selected.length} document${selected.length === 1 ? "" : "s"}.` +
          (result.purpose_saved === false
            ? " Your request was saved, but its purpose could not be stored because the database needs migration 004."
            : ""),
      );
      setMessageIsError(false);
      setSelected([]);
      setShowCheckout(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit the request.");
      setMessageIsError(true);
    }
  };
  
  const submitCorrection = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    const form = event.currentTarget;
    const data = new FormData(event.currentTarget); 
    try {
      await submitRecordCorrection({
        category: String(data.get("category")),
        currentValue: String(data.get("currentValue")),
        proposedValue: String(data.get("proposedValue")),
        contactNumber: String(data.get("contactNumber")),
        reason: String(data.get("reason")),
      });
      form.reset();
      setMessage("Your records correction request was submitted.");
      setMessageIsError(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit the correction request.");
      setMessageIsError(true);
    }
  };
  return <main className="min-h-screen bg-surface-soft">
    <PortalHeader role="Student" />
    <PageTitle 
      eyebrow={`Welcome, ${studentProfile.name}`} 
      title="Student Registrar Dashboard" 
      description="Request official documents, correct your student record, and follow every update." 
      action={<div className="profile-chip"><span>Student no.</span><strong>{studentProfile.number}</strong><small>{studentProfile.course}</small></div>} 
    />
    
    
    <RequestReviewModal
      isOpen={showCheckout}
      onClose={() => setShowCheckout(false)}
      items={selectedDocuments.map(({ name, price }) => ({ name, price }))}
      amount={total}
      purpose={purpose}
      fulfillment={delivery}
      paymentMethod={payment}
      onConfirm={handleSubmitRequest}
    />
    
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 anim-fade-up">
      {message && <div className={`mb-6 flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium ${messageIsError ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-success/30 bg-success-soft text-success"}`}><Check className="size-4" />{message}<button className="ml-auto" onClick={() => setMessage("")} aria-label="Dismiss">×</button></div>}
      <Tabs defaultValue="marketplace">
        <TabsList className="student-portal-tabs">
          <TabsTrigger value="marketplace"><BookOpenCheck /><span>Documents</span></TabsTrigger>
          <TabsTrigger value="corrections"><FilePenLine /><span>Records Correction</span></TabsTrigger>
          <TabsTrigger value="tracker"><ClipboardList /><span>Request Tracker</span></TabsTrigger>
        </TabsList>
        <TabsContent value="marketplace" className="mt-7 pb-20 lg:pb-0">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-primary">Document Marketplace</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select one or more official documents, then complete the request details.</p>
          </div>
          <form onSubmit={handlePaymentClick} className="grid gap-7 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {DOCUMENTS.map((doc, index) => {
                    const active = selected.includes(doc.name);
                    const inputId = `document-option-${index}`;
                    return (
                      <article
                        key={doc.name}
                        className={`document-option flex min-h-40 flex-col ${active ? "document-option-active" : ""}`}
                        onClick={(event) => {
                          const target = event.target;
                          if (target instanceof HTMLElement && target.closest("label, details")) return;
                          toggleDocument(doc.name);
                        }}
                      >
                        <label htmlFor={inputId} className="flex flex-1 cursor-pointer items-start gap-3">
                          <input
                            id={inputId}
                            type="checkbox"
                            className="mt-1 size-4 shrink-0 accent-primary"
                            checked={active}
                            onChange={() => toggleDocument(doc.name)}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words font-semibold leading-5">{doc.name}</h3>
                            <strong className="mt-2 block text-sm text-primary">₱{doc.price}</strong>
                          </div>
                        </label>
                        <details className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
                          <summary className="flex cursor-pointer items-center gap-1 font-medium text-primary">
                            Description <ChevronDown className="size-3" />
                          </summary>
                          <p className="mt-2 leading-5">{doc.description}</p>
                        </details>
                      </article>
                    );
                  })}
              </div>
            </div>
            <aside className="h-fit rounded-md border border-border bg-background p-5 shadow-panel lg:sticky lg:top-6">
              <h3 className="font-display text-xl font-bold text-primary">Request details</h3>
              <section className="mt-4 rounded-md border border-border bg-surface-soft p-3" aria-label="Selected documents">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold">Selected documents</h4>
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {selected.length}
                  </span>
                </div>
                {selectedDocuments.length ? (
                  <ul className="mt-2 divide-y divide-border">
                    {selectedDocuments.map((doc) => (
                      <li key={doc.name} className="flex items-start justify-between gap-2 py-2 text-sm">
                        <span className="min-w-0">{doc.name}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <strong className="text-primary">₱{doc.price}</strong>
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                            aria-label={`Remove ${doc.name}`}
                            onClick={() => setSelected((current) => current.filter((name) => name !== doc.name))}
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Choose a document to start your request.</p>
                )}
              </section>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="form-label">Purpose</label>
                  <select className="form-input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    <option>Employment</option>
                    <option>School transfer</option>
                    <option>Graduate school</option>
                    <option>Board examination</option>
                    <option>Scholarship</option>
                    <option>Personal copy</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Fulfillment</label>
                  <select className="form-input" value={delivery} onChange={(e) => setDelivery(e.target.value)}>
                    <option>Pickup at Registrar's Office</option>
                    <option>Courier delivery</option>
                    <option>Digital certified copy</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Payment preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["GCash","Maya","Card"].map((method) => <Button type="button" size="sm" variant={payment === method ? "default" : "outline"} onClick={() => setPayment(method)} key={method}>{method}</Button>)}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Demo only — no payment is processed.</p>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Request total</span>
                    <strong className="text-lg text-primary">₱{total}</strong>
                  </div>
                  <Button type="submit" variant="gold" size="lg" className="mt-4 w-full" disabled={!selected.length}>
                    <WalletCards /> Review & submit
                  </Button>
                </div>
              </div>
            </aside>
          </form>
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-panel backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{selected.length} selected</p>
                <strong className="text-primary">₱{total}</strong>
              </div>
              <Button type="button" variant="gold" size="sm" disabled={!selected.length} onClick={openRequestReview}>
                Review & submit
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="corrections" className="mt-7"><div className="grid gap-7 lg:grid-cols-[1fr_320px]"><form onSubmit={submitCorrection} className="rounded-md border border-border bg-background p-6 shadow-panel"><h2 className="font-display text-2xl font-bold text-primary">Student Records Correction</h2><p className="mt-2 text-sm text-muted-foreground">Submit a formal review request. Registrar staff may contact you for supporting records.</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><div><label className="form-label" htmlFor="correctionType">Correction type</label><select id="correctionType" name="category" className="form-input"><option>Name correction</option><option>Birthdate correction</option><option>Curriculum / academic record concern</option></select></div><div><label className="form-label" htmlFor="contact">Contact number</label><input id="contact" name="contactNumber" className="form-input" placeholder="09XX XXX XXXX" required /></div><div><label className="form-label" htmlFor="currentValue">Current record</label><input id="currentValue" name="currentValue" className="form-input" required /></div><div><label className="form-label" htmlFor="proposedValue">Correct information</label><input id="proposedValue" name="proposedValue" className="form-input" required /></div><div className="sm:col-span-2"><label className="form-label" htmlFor="reason">Reason and supporting context</label><textarea id="reason" name="reason" className="form-input min-h-32" required /></div><div className="sm:col-span-2"><label className="form-label" htmlFor="evidence">Supporting document (optional)</label><input id="evidence" type="file" className="form-input file:mr-3 file:rounded-sm file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:font-semibold" /><p className="mt-1 text-xs text-muted-foreground">File uploads are not saved yet.</p></div></div><Button className="mt-6" variant="gold" type="submit"><Plus /> Submit Correction Request</Button></form><aside className="rounded-md bg-primary p-6 text-primary-foreground"><FilePenLine className="size-7 text-gold" /><h3 className="mt-5 font-display text-xl font-bold">Before submitting</h3><ul className="mt-4 space-y-3 text-sm text-primary-foreground/75"><li>• Use your official student details.</li><li>• Explain exactly what must be corrected.</li><li>• Prepare a valid government or school record.</li><li>• Monitor the tracker for registrar feedback.</li></ul></aside></div></TabsContent>
        <TabsContent value="tracker" className="mt-7"><div className="mb-6"><h2 className="font-display text-2xl font-bold text-primary">Request Tracker</h2><p className="mt-1 text-sm text-muted-foreground">Status changes made by the registrar appear here automatically.</p></div><div className="table-shell">{requests.length ? <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Request ID</th><th>Type</th><th>Request</th><th>Date</th><th>Status</th></tr></thead><tbody>{requests.map((item) => <tr key={item.id}><td className="font-mono text-xs font-semibold">{item.id}</td><td>{item.kind}</td><td><strong>{item.requestType}</strong><small>{item.purpose}</small></td><td>{item.createdAt}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <EmptyState>No requests yet. Choose a document to begin.</EmptyState>}</div></TabsContent>
      </Tabs></div></main>;
}
