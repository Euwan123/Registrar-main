import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Info,
} from "lucide-react";
import heroImage from "@/assets/Main BG.jfif";
import { Brand, SectionHeading } from "@/components/registrar-ui";
import { Button } from "@/components/ui/button";
import { DOCUMENTS } from "@/lib/registrar-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "USeP Virtual Registrar Portal — Documents, Records & Academic Transactions",
      },
      {
        name: "description",
        content:
          "Request registrar documents, submit student record corrections, pay online, and track academic transactions at USeP Main.",
      },
      { property: "og:title", content: "USeP Virtual Registrar Portal" },
      {
        property: "og:description",
        content:
          "Registrar documents, student data corrections, and academic transactions in one connected portal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const steps = [
  [FileCheck2, "Request Online", "Choose a document or submit a records correction."],
  [CreditCard, "Pay Digitally", "Select a simulated online payment method."],
  [Clock3, "Registrar Processes", "Follow each approval and processing update."],
  [PackageCheck, "Receive or Complete", "Collect documents or close an academic transaction."],
] as const;

const faqs = [
  {
    q: "How can an authorized representative claim my document?",
    a: "Authorized representatives must bring: (1) Signed Authorization Letter from the student/alumnus, (2) Photocopy of the student's valid ID with 3 specimen signatures, and (3) The representative's original valid government ID.",
  },
  {
    q: "Can I request official Transcript of Records if I have a pending clearance?",
    a: "No, all university clearances must be settled before you can request official documents like the Transcript of Records.",
  },
  {
    q: "How do I track my nationwide courier delivery parcel?",
    a: "Once your document is dispatched, you will receive a tracking number via email and on your portal dashboard to monitor its delivery status.",
  },
  {
    q: "What are the acceptable online payment methods?",
    a: "We currently accept payments through standard online banking channels, credit/debit cards, and major e-wallets like GCash and Maya.",
  },
];

function HomePage() {
  return (
    <main className="bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#services" className="nav-link">Services</a>
            <a href="#process" className="nav-link">How It Works</a>
            <Link to="/login" className="nav-link">Track Request</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="gold"
              size="sm"
              className="anim-pop h-9 rounded-full px-4 shadow-md shadow-gold/20 sm:h-10 sm:px-5"
            >
              <Link to="/login">
                Sign In <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-[680px] overflow-hidden bg-primary text-primary-foreground sm:min-h-[82vh] lg:min-h-[88vh]">
        <img
          src={heroImage}
          alt="Office of the University Registrar waiting area at USeP Main Campus"
          width={1672}
          height={941}
          className="hero-media absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-14 sm:min-h-[82vh] sm:px-6 sm:py-20 lg:min-h-[88vh]">
          <div className="max-w-2xl">
            <h1 className="anim-fade-up font-display text-[2.55rem] font-bold leading-[1.08] sm:text-6xl lg:text-7xl">
              Every registrar request.{" "}
              <span className="text-gold">One connected portal.</span>
            </h1>
            <p className="anim-fade-up delay-2 mt-4 w-[22rem] max-w-full text-xs leading-[1.45] text-primary-foreground/90 sm:mt-5 sm:w-[30rem] sm:text-sm sm:leading-6">
              Alumni and students of USeP Main can now request official registrar
              documents, correct academic records, pay online, and track
              university transactions seamlessly from anywhere.
            </p>
            <div className="anim-fade-up delay-3 mt-6 flex flex-col gap-3 min-[420px]:flex-row sm:mt-8">
              <Button asChild variant="gold" size="lg" className="group h-12 w-full rounded-lg px-6 shadow-lg shadow-black/15 sm:w-auto">
                <Link to="/login">
                  Enter Portal <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="lg" className="h-12 w-full rounded-lg px-6 backdrop-blur-sm min-[420px]:w-auto">
                <Link to="/login">
                  <PackageCheck /> Track My Request
                </Link>
              </Button>
            </div>
            <div className="anim-fade-up delay-4 mt-8 grid grid-cols-3 gap-3 sm:mt-12 sm:flex sm:gap-10">
              <div>
                <strong className="metric">7</strong>
                <span>Document services</span>
              </div>
              <div>
                <strong className="metric">3</strong>
                <span>Correction types</span>
              </div>
              <div>
                <strong className="metric">5</strong>
                <span>Academic workflows</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="anim-fade-up">
            <SectionHeading
              title="Registrar Services"
              description="Official documents and student record services in one catalog."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DOCUMENTS.slice(0, 4).map((doc, i) => (
              <article className={`service-card anim-fade-up delay-${i + 1}`} key={doc.name}>
                <span className="service-icon">
                  <BookOpenCheck />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {doc.category}
                </p>
                <h3 className="mt-1 font-semibold text-foreground">{doc.name}</h3>
                <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">
                  {doc.description}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <strong className="text-primary">₱{doc.price}</strong>
                  <Link
                    to="/login"
                    className="rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-gold-foreground transition-transform duration-200 hover:scale-105"
                  >
                    Request
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="border-y border-border bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="anim-fade-up mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              <span className="size-1.5 rounded-full bg-gold" />
              Simple, step by step
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-primary sm:text-4xl">How It Works</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              From request to release in four clear steps.
            </p>
          </div>
          <div className="process-track relative mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {steps.map(([Icon, title, copy], index) => (
              <article
                className={`process-card ${index % 2 === 1 ? "process-card-gold" : ""} anim-fade-up delay-${index + 1}`}
                key={title}
              >
                <div className="relative z-10 mb-5 flex items-center justify-between">
                  <span className="process-number">0{index + 1}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Step {index + 1} of 4
                  </span>
                </div>
                <span className="process-icon">
                  <Icon />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-primary">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-soft py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="anim-fade-up">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                <MapPin className="size-3.5" />
                Campus Operations
              </span>
              <h2 className="mb-4 font-display text-3xl font-bold leading-tight text-primary sm:text-4xl">
                Office of the University
                <br />
                Registrar
              </h2>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:mb-8">
                Main counter releasing and on-campus document evaluations are open regular weekdays.
              </p>
              <div className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-panel sm:p-5">
                <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-gold/10 blur-2xl" />
                <div className="relative mb-4 flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                      <Clock3 className="size-4" />
                    </span>
                    <span className="text-sm font-semibold text-primary">Office hours</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold text-success">
                    <span className="size-1.5 animate-pulse rounded-full bg-success" />
                    WEEKDAY SERVICE
                  </span>
                </div>
                <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-surface-soft p-3">
                    <span className="text-xs text-muted-foreground">Days</span>
                    <p className="mt-1 text-sm font-semibold text-primary">Monday – Friday</p>
                  </div>
                  <div className="rounded-xl bg-surface-soft p-3">
                    <span className="text-xs text-muted-foreground">Hours</span>
                    <p className="mt-1 text-sm font-semibold text-primary">8:00 AM – 5:00 PM</p>
                  </div>
                  <div className="rounded-xl bg-surface-soft p-3">
                    <span className="text-xs text-muted-foreground">Noon break policy</span>
                    <p className="mt-1 text-sm font-semibold text-success">Continuous service</p>
                  </div>
                  <div className="rounded-xl bg-surface-soft p-3">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <p className="mt-1 text-sm font-semibold leading-5 text-primary">
                      Ground Floor, Administration Bldg., Obrero Campus
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-gold/35 bg-gold/10 p-4 text-sm text-gold-foreground shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                <Info className="size-5 shrink-0 text-primary" />
                <p className="leading-relaxed">
                  Please present your <strong>Request Reference Slip</strong> along with 1 valid
                  Government/Student ID upon claiming physical certificates.
                </p>
              </div>
            </div>
            <div className="anim-fade-up delay-2">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                <CheckCircle2 className="size-3.5" />
                Quick Answers
              </span>
              <h2 className="mb-3 font-display text-3xl font-bold leading-tight text-primary sm:mb-4 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mb-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mb-8">
                Quick guidance for common document requests and services.
              </p>
              <Accordion type="single" collapsible className="flex w-full flex-col gap-3">
                {faqs.map((item, i) => (
                  <AccordionItem
                    key={item.q}
                    value={`item-${i + 1}`}
                    className="rounded-xl border border-border bg-card px-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-panel data-[state=open]:border-primary/20 data-[state=open]:shadow-panel sm:px-5"
                  >
                    <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline sm:py-5 sm:text-[15px]">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gold/20 bg-primary-deep text-primary-foreground">
        <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-4 sm:px-6 sm:divide-x sm:divide-y-0 md:grid-cols-3">
          {[
            ["Official & Authentic", "Registrar-verified records and certified copies."],
            ["Live Status Updates", "Visual progress across every request stage."],
            ["Campus or Courier", "Flexible pickup and delivery options."],
          ].map(([title, copy]) => (
            <div className="flex gap-3 py-5 sm:px-5 md:px-6" key={title}>
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-primary-foreground/70">{copy}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gold/20">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 text-xs sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
            <div>
              <p className="font-semibold">University of Southeastern Philippines</p>
              <p className="mt-1 text-primary-foreground/60">Office of the University Registrar · Main Campus, Davao City · registrar@usep.edu.ph</p>
            </div>
            <p className="text-primary-foreground/60 sm:text-right">© 2026 USeP · UI concept prototype</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
