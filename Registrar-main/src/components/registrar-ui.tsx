import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { RequestStatus } from "@/lib/registrar-store";
import { clearAuthSession } from "@/lib/auth-client";
import birdLogo from "@/assets/Bird.jfif";
import yanoGoLogo from "@/assets/YanoGo.jfif";

export function Brand({ light = false }: { light?: boolean }) {
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
        className="brand-mark -ml-4 h-12 w-[9.25rem] object-cover object-[12%_center] mix-blend-multiply sm:h-14 sm:w-[10.75rem]"
      />
    </Link>
  );
}

export function PortalHeader({ role }: { role: "Student" | "Admin" }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  return <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
    <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
      <Brand />
      <div className="flex items-center gap-2">
        <span className="hidden rounded-sm bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline-flex"><ShieldCheck className="mr-1 size-3.5" />{role} view</span>
        <Button variant="ghost" size="icon" aria-label="Notifications" title="Notifications" className="hidden sm:inline-flex"><Bell /></Button>
        <Button variant="outline" size="sm" onClick={() => { clearAuthSession(); navigate({ to: "/login" }); }} className="hidden sm:inline-flex"><LogOut /> Sign out</Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="sm:hidden" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </Button>
      </div>
    </div>
    {menuOpen && (
      <div className="border-t border-border bg-background sm:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-secondary text-secondary-foreground text-sm font-semibold">
            <ShieldCheck className="size-4" />
            {role} view
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start" 
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            <Bell className="size-4" /> Notifications
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {
              setMenuOpen(false);
              clearAuthSession();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>
    )}
  </header>;
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="border-b border-border bg-surface-soft">
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-end md:justify-between">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-bold text-primary sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{action}
    </div>
  </div>;
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const cls = ["Pending", "Pending Review", "Needs More Info"].includes(status) ? "status-pending" : ["Processing", "Under Review"].includes(status) ? "status-processing" : ["Ready for Pickup/Delivery", "Approved"].includes(status) ? "status-ready" : status === "Completed" ? "status-completed" : "status-declined";
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) { return <div className="rounded-md border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">{children}</div>; }

export function SectionHeading({ title, description, link }: { title: string; description: string; link?: { label: string; to: "/login" | "/student" | "/admin" } }) {
  return <div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="font-display text-2xl font-bold text-primary">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{link && <Link to={link.to} className="hidden items-center text-sm font-semibold text-primary sm:flex">{link.label}<ChevronRight className="size-4" /></Link>}</div>;
}
