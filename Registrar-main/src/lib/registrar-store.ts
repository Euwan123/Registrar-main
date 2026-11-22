import { authHeaders } from "@/lib/auth-client";

export type RequestStatus = "Pending Review" | "Processing" | "Ready for Pickup" | "Declined" | "Completed" | "Under Review" | "Needs More Info" | "Approved" | "Rejected";
export type RequestKind = "Document" | "Records Correction";

export type RegistrarRequest = {
  id: string;
  studentName: string;
  studentNumber: string;
  course: string;
  kind: RequestKind;
  requestType: string;
  purpose: string;
  delivery: string;
  payment: string;
  status: RequestStatus;
  createdAt: string;
};

export type AcademicTransaction = {
  id: string;
  studentName: string;
  studentNumber: string;
  course: string;
  category: string;
  detail: string;
  status: RequestStatus;
  createdAt: string;
};

export type DashboardStats = {
  total_queue: number;
  pending_review: number;
  in_process: number;
  completed: number;
};

export type DocumentQueueStats = {
  active_queue: number;
  prioritized_intake: number;
  ready_for_pickup: number;
  under_evaluation: number;
  pending_validation: number;
  action_required: number;
};

type ApiRequest = {
  tracking_code: string;
  student_name: string;
  student_number: string;
  course: string;
  program?: string;
  kind?: RequestKind;
  items?: Array<{ document_name: string }>;
  purpose?: string;
  fulfillment_method: string;
  payment_method: string;
  status: RequestStatus;
  created_at: string;
};

export const DOCUMENTS = [
  { name: "Transcript of Records (TOR)", category: "Academic Records", price: 150, description: "Official academic record for employment, transfer, or graduate school." },
  { name: "Certificate of Enrollment (COE)", category: "Enrollment", price: 80, description: "Proof of current enrollment status for scholarships, benefits, or verification." },
  { name: "Certificate of Grades / Certified Grades", category: "Academic Records", price: 100, description: "Certified semester or subject grades overview." },
  { name: "Certificate of Graduation", category: "Graduation", price: 100, description: "Official proof that degree requirements have been completed." },
  { name: "Diploma", category: "Graduation", price: 350, description: "Post-graduation diploma release or duplicate tracking." },
  { name: "Honorable Dismissal / Transfer Credential", category: "Transfer", price: 150, description: "Required credential for transfer to another institution." },
  { name: "Authentication / Certification of Documents", category: "Certification", price: 80, description: "Certified true copies of registrar-issued documents." },
] as const;

const REQUESTS_KEY = "usep-registrar-requests-v1";
const TRANSACTIONS_KEY = "usep-academic-transactions-v1";
export const STORE_EVENT = "usep-registrar-updated";

function read<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  const saved = window.localStorage.getItem(key);
  if (!saved) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try { return JSON.parse(saved) as T[]; } catch { return fallback; }
}

const DEMO_REQUEST_IDS = new Set(["REG-260914", "REG-260903", "COR-260827"]);
const DEMO_TRANSACTION_IDS = new Set(["ACA-26071", "ACA-26068", "ACA-26055", "ACA-26043"]);

function write<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(STORE_EVENT));
}

function getLocalRequests(): RegistrarRequest[] {
  const saved = read<RegistrarRequest>(REQUESTS_KEY, []);
  const actual = saved.filter((request) => !DEMO_REQUEST_IDS.has(request.id));
  if (actual.length !== saved.length) write(REQUESTS_KEY, actual);
  return actual;
}

function getLocalTransactions(): AcademicTransaction[] {
  const saved = read<AcademicTransaction>(TRANSACTIONS_KEY, []);
  const actual = saved.filter((transaction) => !DEMO_TRANSACTION_IDS.has(transaction.id));
  if (actual.length !== saved.length) write(TRANSACTIONS_KEY, actual);
  return actual;
}

async function getLocalStudentProfile() {
  try {
    const response = await fetch("/api/auth/me", { headers: authHeaders() });
    const result = await response.json() as {
      profile?: { first_name: string; last_name: string; university_id: string; program: string | null };
    };
    if (response.ok && result.profile) {
      return {
        studentName: `${result.profile.first_name} ${result.profile.last_name}`,
        studentNumber: result.profile.university_id,
        course: result.profile.program ?? "",
      };
    }
  } catch {
    // Use the demo profile below if profile loading is unavailable.
  }
  return {
    studentName: "Joshua Pearce",
    studentNumber: "2021-04182",
    course: "BS Computer Science",
  };
}

function isDatabaseEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('usep-use-database') === 'true';
}

async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API error ${response.status}: ${detail}`);
  }
  
  return response.json();
}

export const getRequests = async (): Promise<RegistrarRequest[]> => {
  if (isDatabaseEnabled()) {
    const data = await fetchFromApi<ApiRequest[]>('/api/requests');
    return data.map(req => ({
      id: req.tracking_code,
      studentName: req.student_name,
      studentNumber: req.student_number,
      course: req.course || req.program || "",
      kind: (req.kind || "Document") as RequestKind,
      requestType: req.items?.map((item) => item.document_name).join(", ") || "Unknown",
      purpose: req.purpose || "Not specified",
      delivery: req.fulfillment_method === 'pickup' ? 'Pickup' : 'Courier delivery',
      payment: req.payment_method,
      status: req.status,
      createdAt: new Date(req.created_at).toISOString().slice(0, 10),
    }));
  }
  return getLocalRequests();
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (isDatabaseEnabled()) {
    return fetchFromApi<DashboardStats>('/api/stats/dashboard');
  }

  const requests = getLocalRequests();
  return {
    total_queue: requests.length,
    pending_review: requests.filter(r => r.status === 'Pending Review').length,
    in_process: requests.filter(r => r.status === 'Processing').length,
    completed: requests.filter(r => ['Completed', 'Approved'].includes(r.status)).length,
  };
};

export const getDocumentQueueStats = async (): Promise<DocumentQueueStats> => {
  if (isDatabaseEnabled()) {
    return fetchFromApi<DocumentQueueStats>('/api/stats/queue');
  }
  
  const requests = getLocalRequests();
  return {
    active_queue: requests.filter(r => ['Pending Review', 'Processing'].includes(r.status)).length,
    prioritized_intake: requests.filter(r => r.status === 'Pending Review').length,
    ready_for_pickup: requests.filter(r => r.status === 'Ready for Pickup').length,
    under_evaluation: requests.filter(r => r.status === 'Processing').length,
    pending_validation: requests.filter(r => r.status === 'Pending Review').length,
    action_required: requests.filter(r => r.status === 'Pending Review').length,
  };
};

export const saveRequests = (items: RegistrarRequest[]) => write(REQUESTS_KEY, items);

function addLocalRequest(
  item: Omit<RegistrarRequest, "id" | "createdAt" | "status">,
): RegistrarRequest {
  const prefix = item.kind === "Document" ? "REG" : "COR";
  const request: RegistrarRequest = { ...item, id: `${prefix}-${String(Date.now()).slice(-6)}`, createdAt: new Date().toISOString().slice(0, 10), status: "Pending Review" };
  saveRequests([request, ...getLocalRequests()]);
  return request;
}

export const addRequest = async (item: Omit<RegistrarRequest, "id" | "createdAt" | "status">) => {
  if (isDatabaseEnabled() && item.kind === "Document") {
    const fulfillmentMethod = item.delivery.toLowerCase().includes("courier")
      ? "delivery"
      : item.delivery.toLowerCase().includes("digital")
        ? "digital"
        : "pickup";
    return submitDocumentRequests({
      requestTypes: [item.requestType],
      purpose: item.purpose,
      fulfillmentMethod,
      paymentMethod: item.payment,
    });
  }

  return addLocalRequest(item);
};

export async function submitDocumentRequests(input: {
  requestTypes: string[];
  purpose: string;
  fulfillmentMethod: "pickup" | "delivery" | "digital";
  paymentMethod: string;
}): Promise<{ tracking_code: string; purpose_saved?: boolean }> {
  if (!isDatabaseEnabled()) {
    const profile = await getLocalStudentProfile();
    const request = addLocalRequest({
      studentName: profile.studentName,
      studentNumber: profile.studentNumber,
      course: profile.course,
      kind: "Document",
      requestType: input.requestTypes.join(", "),
      purpose: input.purpose,
      delivery: input.fulfillmentMethod,
      payment: input.paymentMethod,
    });
    return { tracking_code: request.id, purpose_saved: true };
  }

  const response = await fetchFromApi<{ tracking_code: string }>("/api/requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
  window.dispatchEvent(new Event(STORE_EVENT));
  return response;
}

export async function submitRecordCorrection(input: {
  category: string;
  currentValue: string;
  proposedValue: string;
  contactNumber: string;
  reason: string;
}): Promise<{ tracking_code: string }> {
  if (isDatabaseEnabled()) {
    const response = await fetchFromApi<{ tracking_code: string }>("/api/corrections", {
      method: "POST",
      body: JSON.stringify(input),
    });
    window.dispatchEvent(new Event(STORE_EVENT));
    return response;
  }

  const profile = await getLocalStudentProfile();
  const request = addLocalRequest({
    studentName: profile.studentName,
    studentNumber: profile.studentNumber,
    course: profile.course,
    kind: "Records Correction",
    requestType: input.category,
    purpose: `${input.currentValue} → ${input.proposedValue}. ${input.reason}`,
    delivery: "Not applicable",
    payment: "Not applicable",
  });
  return { tracking_code: request.id };
}

export const updateRequestStatus = async (id: string, status: RequestStatus) => {
  if (isDatabaseEnabled()) {
    await fetchFromApi('/api/requests/update-status', {
      method: 'POST',
      body: JSON.stringify({ tracking_code: id, status }),
    });
    window.dispatchEvent(new Event(STORE_EVENT));
  } else {
    saveRequests(getLocalRequests().map((item) => item.id === id ? { ...item, status } : item));
  }
};

export const getTransactions = () => isDatabaseEnabled() ? [] : getLocalTransactions();
export const saveTransactions = (items: AcademicTransaction[]) => write(TRANSACTIONS_KEY, items);
export const updateTransactionStatus = (id: string, status: RequestStatus) => {
  if (isDatabaseEnabled()) {
    throw new Error("Academic transactions are not connected to the database.");
  }
  saveTransactions(getTransactions().map((item) => item.id === id ? { ...item, status } : item));
};
export const resetDemoData = async () => {
  if (isDatabaseEnabled()) {
    await fetchFromApi<{ success: boolean }>('/api/admin/reset-activity', { method: 'POST' });
  }
  write(REQUESTS_KEY, []);
  write(TRANSACTIONS_KEY, []);
};

export const setDatabaseMode = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('usep-use-database', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event(STORE_EVENT));
  }
};

export const isDatabaseMode = () => isDatabaseEnabled();
