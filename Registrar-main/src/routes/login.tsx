import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, GraduationCap, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/registrar-ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveAuthSession } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Portal Sign In — USeP Virtual Registrar" },
    { name: "description", content: "Choose the student or administrator demonstration portal for USeP registrar services." },
    { property: "og:title", content: "Portal Sign In — USeP Virtual Registrar" },
    { property: "og:description", content: "Access the student document request and registrar administration prototype." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: LoginPage,
});

function LoginPanel({ role }: { role: "student" | "admin" }) {
  const navigate = useNavigate();
  const isStudent = role === "student";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json() as {
        error?: string;
        access_token?: string;
        refresh_token?: string;
        user?: { email: string; role: "student" | "admin" };
      };
      if (!response.ok || !result.access_token || !result.refresh_token || !result.user) {
        setError(result.error || "Unable to sign in.");
        return;
      }
      if (result.user.role !== role) {
        setError(`This account is not authorized for the ${role} portal.`);
        return;
      }

      saveAuthSession({
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        role: result.user.role,
        email: result.user.email,
      });
      navigate({ to: isStudent ? "/student" : "/admin-dashboard", replace: true });
    } catch {
      setError("Could not reach the sign-in service. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <form className="mt-4" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}} onSubmit={submit}>
    <div>
      <label className="form-label" style={{fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block'}} htmlFor={`${role}-email`}>
        Email address
      </label>
      <input id={`${role}-email`} type="email" autoComplete="username" required className="form-input" style={{width: '100%'}} value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
    <div>
      <div className="flex justify-between" style={{marginBottom: '0.5rem'}}>
        <label className="form-label" style={{fontSize: '0.75rem', marginBottom: 0}} htmlFor={`${role}-password`}>Password</label>
      </div>
      <input id={`${role}-password`} type="password" autoComplete="current-password" required className="form-input" style={{width: '100%'}} value={password} onChange={(e) => setPassword(e.target.value)} />
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" variant="gold" size="lg" className="w-full" style={{fontSize: '0.875rem'}}>
      {isSubmitting ? "Signing in…" : `Sign in as ${isStudent ? "Student" : "Admin"}`}
    </Button>
    <p style={{textAlign: 'center', fontSize: '0.625rem'}} className="text-muted-foreground">
      <LockKeyhole className="mr-1 inline size-3" />Use your registered email and password.
    </p>
    <p style={{textAlign: 'center', fontSize: '0.75rem'}} className="text-muted-foreground">
      <a href="mailto:registrar@usep.edu.ph" className="font-medium text-primary hover:underline">
        registrar@usep.edu.ph
      </a>
    </p>
  </form>;
}

function LoginPage() {
  return <main className="min-h-svh bg-surface-soft" style={{overflowX: 'hidden'}}>
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <Link
          to="/"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface-soft px-3 text-xs font-semibold text-primary transition-colors hover:bg-secondary sm:h-10 sm:px-4 sm:text-sm"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </div>
    </header>
    <div className="mx-auto px-4 py-8 sm:px-6 sm:py-10" style={{maxWidth: '80rem', minHeight: 'calc(100vh - 4.5rem)'}}>
      <div style={{display: 'flex', minHeight: 'calc(100vh - 140px)', alignItems: 'center', justifyContent: 'center'}}>
        <div className="w-full" style={{maxWidth: '100%'}}>
          <div className="hidden lg:block anim-fade-up" style={{marginBottom: '2rem'}}>
            <p className="eyebrow">One registrar. Two workspaces.</p>
            <h1 className="mt-4 font-display text-4xl lg:text-5xl font-bold leading-tight text-primary" style={{maxWidth: '40rem'}}>University services, routed to the right people.</h1>
          </div>
          <section className="login-card w-full mx-auto rounded-2xl border border-border bg-background shadow-panel" style={{maxWidth: '32rem', padding: '1.5rem'}}>
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">USeP Virtual Registrar</p>
                <h2 className="font-display font-bold text-primary" style={{fontSize: '1.5rem'}}>Enter the portal</h2>
              </div>
            </div>
            <p className="mt-2 text-muted-foreground" style={{fontSize: '0.875rem'}}>Sign in with an account assigned to the selected portal.</p>
            <Tabs defaultValue="student" className="mt-4">
              <TabsList className="grid w-full grid-cols-2" style={{height: 'auto', gap: '0.25rem', padding: '0.25rem'}}>
                <TabsTrigger value="student" style={{padding: '0.5rem', fontSize: '0.875rem'}}>Student Login</TabsTrigger>
                <TabsTrigger value="admin" style={{padding: '0.5rem', fontSize: '0.875rem'}}>Admin Portal</TabsTrigger>
              </TabsList>
              <TabsContent value="student"><LoginPanel role="student" /></TabsContent>
              <TabsContent value="admin"><LoginPanel role="admin" /></TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  </main>;
}
