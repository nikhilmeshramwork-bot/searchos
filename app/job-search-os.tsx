"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultProducts, Product, profile } from "./data";
import { JobMatch, scoreJob } from "./scoring";

type JobStatus = "Review" | "Qualified" | "Approved" | "Applied" | "Interview" | "Archived";
type JobSource = "Manual" | "LinkedIn" | "Company site" | "Referral" | "Job board" | "Email alert";
type PipelineFilter = "All" | "Decision queue" | "Approved" | "Applied" | "Archived";

type Job = JobMatch & {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: JobSource;
  description: string;
  status: JobStatus;
  createdAt: string;
};

const storageKeys = {
  jobs: "nikhil-searchos-jobs-v2",
  products: "nikhil-searchos-products-v2",
};

function suggestedStatus(match: JobMatch): JobStatus {
  return match.decision === "Strong fit" ? "Review" : match.decision === "Review fit" ? "Qualified" : "Archived";
}

function buildDemoJob(input: {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  createdAt: string;
}): Job {
  const match = scoreJob({
    title: input.title,
    description: input.description,
    location: input.location,
    products: defaultProducts,
  });
  return {
    ...input,
    ...match,
    url: "",
    source: "Manual",
    status: suggestedStatus(match),
  };
}

const demoJobs: Job[] = [
  buildDemoJob({
    id: "demo-1",
    title: "Product Operations Manager",
    company: "FleetFlow (example)",
    location: "Bengaluru · Hybrid",
    description:
      "Own product operations for a B2B logistics platform. Improve workflows, gather requirements, coordinate cross-functional launches, and use analytics and KPIs to improve customer operations.",
    createdAt: "Today",
  }),
  buildDemoJob({
    id: "demo-2",
    title: "Founder’s Office — AI Operations",
    company: "Workgrid AI (example)",
    location: "Remote · India",
    description:
      "Work with founders across AI workflow automation, business operations, customer discovery, stakeholder alignment, and program execution for a B2B SaaS platform.",
    createdAt: "Yesterday",
  }),
  buildDemoJob({
    id: "demo-3",
    title: "Senior Consumer Product Manager",
    company: "Orbit Social (example)",
    location: "Mumbai",
    description:
      "Lead a consumer social and growth product. Requires 8+ years of formal product management experience across mobile experimentation and growth loops.",
    createdAt: "2 days ago",
  }),
];

const navItems = [
  ["overview", "Overview"],
  ["jobs", "Job pipeline"],
  ["products", "Product evidence"],
  ["automation", "Automation"],
] as const;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function JobSearchOS() {
  const [view, setView] = useState<(typeof navItems)[number][0]>("overview");
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("All");
  const [showIntake, setShowIntake] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setJobs(safeParse(window.localStorage.getItem(storageKeys.jobs), demoJobs));
    setProducts(safeParse(window.localStorage.getItem(storageKeys.products), defaultProducts));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKeys.jobs, JSON.stringify(jobs));
  }, [hydrated, jobs]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKeys.products, JSON.stringify(products));
  }, [hydrated, products]);

  const metrics = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.status !== "Archived");
    return {
      decisions: jobs.filter((job) => ["Review", "Qualified"].includes(job.status)).length,
      approved: jobs.filter((job) => job.status === "Approved").length,
      applied: jobs.filter((job) => job.status === "Applied").length,
      interviews: jobs.filter((job) => job.status === "Interview").length,
      average: Math.round(activeJobs.reduce((sum, job) => sum + job.score, 0) / Math.max(activeJobs.length, 1)),
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (pipelineFilter === "All") return jobs;
    if (pipelineFilter === "Decision queue") return jobs.filter((job) => ["Review", "Qualified"].includes(job.status));
    return jobs.filter((job) => job.status === pipelineFilter);
  }, [jobs, pipelineFilter]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2000);
  }

  function addJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const company = String(form.get("company") || "").trim();
    const location = String(form.get("location") || "").trim();
    const description = String(form.get("description") || "").trim();
    const match = scoreJob({ title, description, location, products });
    const job: Job = {
      id: crypto.randomUUID(),
      title,
      company,
      location,
      url: String(form.get("url") || "").trim(),
      source: String(form.get("source") || "Manual") as JobSource,
      description,
      status: suggestedStatus(match),
      createdAt: "Just now",
      ...match,
    };
    setJobs((current) => [job, ...current]);
    setShowIntake(false);
    setSelectedJob(job);
    event.currentTarget.reset();
  }

  function updateStatus(id: string, status: JobStatus) {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)));
    setSelectedJob((current) => (current?.id === id ? { ...current, status } : current));
    showNotice(`Moved to ${status}`);
  }

  function rescoreJob(job: Job) {
    const match = scoreJob({
      title: job.title,
      description: job.description,
      location: job.location,
      products,
    });
    const status = ["Review", "Qualified", "Archived"].includes(job.status) ? suggestedStatus(match) : job.status;
    const updated = { ...job, ...match, status };
    setJobs((current) => current.map((item) => (item.id === job.id ? updated : item)));
    setSelectedJob(updated);
    showNotice("Score and evidence refreshed");
  }

  function updateProduct(id: string, key: keyof Product, value: string | boolean) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              [key]: value,
              status:
                key !== "status" &&
                product.status === "Needs details" &&
                product.strapline !== "Product details awaiting verification"
                  ? "Prototype"
                  : product.status,
            }
          : product,
      ),
    );
  }

  async function copyPacket(job: Job) {
    const evidence = products.filter((product) => job.productIds.includes(product.id));
    const packet = [
      `${job.title} — ${job.company}`,
      `${job.location} | ${job.source}${job.url ? ` | ${job.url}` : ""}`,
      "",
      `Decision: ${job.decision} (${job.score}%)`,
      `Role family: ${job.roleFamily}`,
      `CV track: ${job.cvTrack}`,
      `Recommendation: ${job.recommendation}`,
      "",
      "Verified profile summary:",
      profile.summary,
      "",
      `Relevant capabilities: ${job.matchedSkills.join(", ") || "Review manually"}`,
      `Selected evidence: ${evidence.map((item) => item.name).join(", ") || "No verified product selected"}`,
      "",
      "Strengths:",
      ...(job.strengths.length ? job.strengths.map((item) => `- ${item}`) : ["- None detected"]),
      "",
      "Risks to verify:",
      ...(job.risks.length ? job.risks.map((item) => `- ${item}`) : ["- No deterministic risk flags"]),
      "",
      "Approval checklist:",
      "- Confirm eligibility, location, and work-authorisation requirements.",
      "- Confirm every claim and metric against the verified CV/evidence library.",
      "- Tailor the opening summary to the role without inventing experience.",
      "- Review all form answers before submission.",
      "",
      "SearchOS prepares this packet but does not submit the application.",
    ].join("\n");
    await navigator.clipboard.writeText(packet);
    showNotice("Decision packet copied");
  }

  return (
    <main className="os-shell">
      <aside className="sidebar">
        <div>
          <a className="brand" href="/">
            <span className="brand-mark">NM</span>
            <span>
              <b>SearchOS</b>
              <small>Evidence-led applications</small>
            </span>
          </a>
          <nav aria-label="Primary navigation">
            {navItems.map(([id, label]) => (
              <button className={view === id ? "active" : ""} key={id} onClick={() => setView(id)}>
                <span className="nav-dot" />
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-foot">
          <div className="approval-note">
            <span className="pulse" />
            <div>
              <b>Approval mode on</b>
              <small>Nothing is submitted automatically</small>
            </div>
          </div>
          <a className="portfolio-link" href="/portfolio">
            Open public portfolio <span>↗</span>
          </a>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">INDIA · UAE · REMOTE</p>
            <h1>
              {view === "overview" && "Good afternoon, Nikhil."}
              {view === "jobs" && "Job pipeline"}
              {view === "products" && "Product evidence"}
              {view === "automation" && "Automation control room"}
            </h1>
          </div>
          <button className="primary-button" onClick={() => setShowIntake(true)}>
            <span>＋</span> Add job
          </button>
        </header>

        {view === "overview" && (
          <>
            <section className="hero-panel">
              <div>
                <p className="eyebrow lime">TODAY’S FOCUS</p>
                <h2>
                  Spend application time only
                  <br /> where the evidence supports it.
                </h2>
                <p>
                  SearchOS scores role fit across six visible factors, identifies risks, selects verified proof, and waits for your approval.
                </p>
              </div>
              <div className="focus-score">
                <span>Average active fit</span>
                <strong>{metrics.average}</strong>
                <small>excluding archived roles</small>
              </div>
            </section>

            <section className="metrics-grid" aria-label="Pipeline metrics">
              <article><span>Needs decision</span><strong>{metrics.decisions}</strong><small>review or qualify</small></article>
              <article><span>Approved</span><strong>{metrics.approved}</strong><small>packets cleared</small></article>
              <article><span>Applied</span><strong>{metrics.applied}</strong><small>awaiting response</small></article>
              <article><span>Interviews</span><strong>{metrics.interviews}</strong><small>conversion outcome</small></article>
            </section>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">APPROVAL QUEUE</p><h3>Roles needing a decision</h3></div>
                  <button className="text-button" onClick={() => { setPipelineFilter("Decision queue"); setView("jobs"); }}>View queue →</button>
                </div>
                <div className="job-list">
                  {jobs.filter((job) => ["Review", "Qualified"].includes(job.status)).slice(0, 4).map((job) => (
                    <JobRow job={job} key={job.id} onSelect={setSelectedJob} />
                  ))}
                  {!metrics.decisions && <p className="empty-state">No roles need approval. Add a job description to score the next opportunity.</p>}
                </div>
              </section>

              <section className="panel evidence-panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">EVIDENCE HEALTH</p><h3>Product readiness</h3></div>
                </div>
                <div className="evidence-ring">
                  <strong>{products.filter((product) => product.public).length}/{products.length}</strong>
                  <span>products ready</span>
                </div>
                <div className="evidence-list">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id}><span>{product.name}</span><b className={product.status === "Needs details" ? "warn" : ""}>{product.status}</b></div>
                  ))}
                </div>
                <button className="secondary-button full" onClick={() => setView("products")}>Review product evidence</button>
              </section>
            </div>
          </>
        )}

        {view === "jobs" && (
          <section className="panel pipeline-panel">
            <div className="panel-heading pipeline-heading">
              <div><p className="eyebrow">ROLE INTAKE → DECISION → OUTCOME</p><h3>{filteredJobs.length} opportunities</h3></div>
              <div className="filter-row" aria-label="Pipeline filters">
                {(["All", "Decision queue", "Approved", "Applied", "Archived"] as PipelineFilter[]).map((filter) => (
                  <button className={pipelineFilter === filter ? "active" : ""} key={filter} onClick={() => setPipelineFilter(filter)}>{filter}</button>
                ))}
              </div>
            </div>
            <div className="pipeline-table">
              <div className="table-head"><span>Opportunity</span><span>Fit</span><span>Decision</span><span>Status</span><span /></div>
              {filteredJobs.map((job) => (
                <button className="table-row" key={job.id} onClick={() => setSelectedJob(job)}>
                  <span><b>{job.title}</b><small>{job.company} · {job.location || "Location not stated"} · {job.source}</small></span>
                  <span><Score score={job.score} /></span>
                  <span className={`decision-label decision-${job.decision.toLowerCase().replace(" ", "-")}`}>{job.decision}<small>{job.roleFamily}</small></span>
                  <span><Status status={job.status} /></span>
                  <span className="row-arrow">→</span>
                </button>
              ))}
              {!filteredJobs.length && <p className="empty-state table-empty">No roles in this view.</p>}
            </div>
          </section>
        )}

        {view === "products" && (
          <>
            <section className="intro-row">
              <div><p className="eyebrow">CENTRAL EVIDENCE LIBRARY</p><h2>One source of truth. Different proof for every role.</h2></div>
              <p>Only products marked public and verified can appear in a generated decision packet.</p>
            </section>
            <section className="product-grid">
              {products.map((product) => (
                <article className={`product-editor ${product.public ? "" : "draft"}`} key={product.id}>
                  <div className="product-top">
                    <span className="product-index">{String(products.indexOf(product) + 1).padStart(2, "0")}</span>
                    <label className="switch-label">
                      <input type="checkbox" checked={product.public} onChange={(event) => updateProduct(product.id, "public", event.target.checked)} />
                      <span>{product.public ? "Public" : "Draft"}</span>
                    </label>
                  </div>
                  <h3>{product.name}</h3>
                  <input aria-label={`${product.name} value proposition`} value={product.strapline} onChange={(event) => updateProduct(product.id, "strapline", event.target.value)} />
                  <textarea aria-label={`${product.name} description`} value={product.description} onChange={(event) => updateProduct(product.id, "description", event.target.value)} />
                  <div className="link-fields">
                    <input aria-label={`${product.name} live URL`} placeholder="Live product URL" value={product.liveUrl} onChange={(event) => updateProduct(product.id, "liveUrl", event.target.value)} />
                    <input aria-label={`${product.name} GitHub URL`} placeholder="GitHub repository URL" value={product.githubUrl} onChange={(event) => updateProduct(product.id, "githubUrl", event.target.value)} />
                    <input aria-label={`${product.name} case study URL`} placeholder="Case study URL" value={product.caseStudyUrl} onChange={(event) => updateProduct(product.id, "caseStudyUrl", event.target.value)} />
                  </div>
                  <div className="tag-row">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </section>
          </>
        )}

        {view === "automation" && (
          <div className="automation-layout">
            <section className="panel automation-map">
              <p className="eyebrow">WORKFLOW</p>
              <h2>Automate preparation. Preserve judgment.</h2>
              {[
                ["01", "Discover", "Collect approved job alerts and career-page roles", "Next layer"],
                ["02", "Qualify", "Score role, capabilities, domain, location, seniority, and risks", "Live"],
                ["03", "Assemble", "Select CV track, verified evidence, and review checklist", "Live"],
                ["04", "Approve", "Verify claims, eligibility, and submission details", "You"],
                ["05", "Follow through", "Track outcomes and prepare scheduled follow-ups", "Next layer"],
              ].map(([number, title, copy, state]) => (
                <div className="automation-step" key={number}>
                  <span>{number}</span><div><b>{title}</b><p>{copy}</p></div><i className={state === "Live" ? "on" : ""}>{state}</i>
                </div>
              ))}
            </section>
            <section className="integration-stack">
              <h3>Control boundary</h3>
              {[
                ["Role intake", "Manual paste", "Live"],
                ["Deterministic scoring", "SearchOS", "Live"],
                ["Verified product proof", "GitHub", "Linked"],
                ["Final submission", "Browser", "Approval required"],
              ].map(([name, service, status]) => (
                <article key={name}><span className="integration-icon">{service.slice(0, 1)}</span><div><b>{name}</b><small>{service}</small></div><em>{status}</em></article>
              ))}
              <div className="safety-card"><b>Safety rule</b><p>SearchOS never invents a metric, selects a draft product, or submits an application without approval.</p></div>
            </section>
          </div>
        )}
      </section>

      {showIntake && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowIntake(false)}>
          <section className="modal intake-modal" role="dialog" aria-modal="true" aria-labelledby="intake-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setShowIntake(false)} aria-label="Close">×</button>
            <p className="eyebrow">NEW OPPORTUNITY</p>
            <h2 id="intake-title">Paste a job. Get an explainable decision.</h2>
            <form onSubmit={addJob}>
              <div className="form-pair"><label>Role title<input name="title" required placeholder="Product Operations Manager" /></label><label>Company<input name="company" required placeholder="Company name" /></label></div>
              <div className="form-pair"><label>Location<input name="location" placeholder="Bengaluru · Hybrid" /></label><label>Source<select name="source" defaultValue="Manual"><option>Manual</option><option>LinkedIn</option><option>Company site</option><option>Referral</option><option>Job board</option><option>Email alert</option></select></label></div>
              <label>Job URL<input name="url" type="url" placeholder="https://…" /></label>
              <label>Complete job description<textarea name="description" required rows={11} placeholder="Paste responsibilities, requirements, location, and seniority details…" /></label>
              <p className="form-note">The score is deterministic and inspectable. It does not infer eligibility or invent missing experience.</p>
              <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setShowIntake(false)}>Cancel</button><button className="primary-button" type="submit">Score and prepare</button></div>
            </form>
          </section>
        </div>
      )}

      {selectedJob && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedJob(null)}>
          <section className="modal job-modal" role="dialog" aria-modal="true" aria-labelledby="job-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedJob(null)} aria-label="Close">×</button>
            <div className="job-modal-head">
              <div>
                <p className="eyebrow">{selectedJob.company} · {selectedJob.source}</p>
                <h2 id="job-title">{selectedJob.title}</h2>
                <p>{selectedJob.location || "Location not stated"} · {selectedJob.roleFamily}</p>
              </div>
              <Score score={selectedJob.score} large />
            </div>

            <div className={`decision-banner decision-${selectedJob.decision.toLowerCase().replace(" ", "-")}`}>
              <div><span>{selectedJob.decision}</span><b>{selectedJob.recommendation}</b></div>
              <small>Use: {selectedJob.cvTrack} CV</small>
            </div>

            <div className="packet-section">
              <span>Score breakdown</span>
              <div className="breakdown-grid">
                <Breakdown label="Role" value={selectedJob.breakdown.role} />
                <Breakdown label="Capabilities" value={selectedJob.breakdown.capabilities} />
                <Breakdown label="Domain" value={selectedJob.breakdown.domain} />
                <Breakdown label="Location" value={selectedJob.breakdown.location} />
                <Breakdown label="Seniority" value={selectedJob.breakdown.seniority} />
                <Breakdown label="Risk penalty" value={selectedJob.breakdown.penalties} />
              </div>
            </div>

            <div className="reason-grid packet-section">
              <div><span>Why it matches</span>{selectedJob.strengths.length ? <ul>{selectedJob.strengths.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No strong signals detected.</p>}</div>
              <div><span>What to verify</span>{selectedJob.risks.length ? <ul>{selectedJob.risks.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No deterministic risk flags.</p>}</div>
            </div>

            <div className="packet-section"><span>Matched capabilities</span><div className="tag-row">{selectedJob.matchedSkills.map((skill) => <b key={skill}>{skill}</b>)}{!selectedJob.matchedSkills.length && <p className="muted">No explicit capability matches.</p>}</div></div>

            <div className="packet-section"><span>Automatically selected verified evidence</span>
              <div className="selected-products">
                {products.filter((product) => selectedJob.productIds.includes(product.id)).map((product) => <article key={product.id}><b>{product.name}</b><p>{product.strapline}</p></article>)}
                {!selectedJob.productIds.length && <p className="muted">No verified product matched. Review manually before applying.</p>}
              </div>
            </div>

            <div className="packet-section approval-checklist">
              <span>Approval checklist</span>
              <label><input type="checkbox" /> Eligibility, location, and work authorisation verified</label>
              <label><input type="checkbox" /> Claims and metrics checked against the CV</label>
              <label><input type="checkbox" /> Tailored summary contains no invented experience</label>
              <label><input type="checkbox" /> Application answers reviewed before submission</label>
            </div>

            <div className="packet-section"><span>Decision</span><div className="decision-row">
              {selectedJob.url && <a className="secondary-button" href={selectedJob.url} target="_blank" rel="noreferrer">Open original role ↗</a>}
              <button className="secondary-button" onClick={() => rescoreJob(selectedJob)}>Rescore</button>
              <button className="secondary-button" onClick={() => updateStatus(selectedJob.id, "Archived")}>Archive</button>
              {!["Approved", "Applied", "Interview"].includes(selectedJob.status) && <button className="secondary-button" onClick={() => updateStatus(selectedJob.id, "Approved")}>Approve packet</button>}
              {selectedJob.status === "Approved" && <button className="secondary-button" onClick={() => updateStatus(selectedJob.id, "Applied")}>Mark applied</button>}
              {selectedJob.status === "Applied" && <button className="secondary-button" onClick={() => updateStatus(selectedJob.id, "Interview")}>Mark interview</button>}
              <button className="primary-button" onClick={() => copyPacket(selectedJob)}>Copy decision packet</button>
            </div></div>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}

function Score({ score, large = false }: { score: number; large?: boolean }) {
  return <span className={`score ${score >= 78 ? "high" : score >= 60 ? "mid" : "low"} ${large ? "large" : ""}`}><b>{score}</b><small>% match</small></span>;
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return <div className={value < 0 ? "negative" : ""}><span>{label}</span><b>{value > 0 ? `+${value}` : value}</b></div>;
}

function Status({ status }: { status: JobStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function JobRow({ job, onSelect }: { job: Job; onSelect: (job: Job) => void }) {
  return <button className="job-row" onClick={() => onSelect(job)}><Score score={job.score} /><span className="job-copy"><b>{job.title}</b><small>{job.company} · {job.decision} · {job.cvTrack}</small></span><Status status={job.status} /><span className="row-arrow">→</span></button>;
}
