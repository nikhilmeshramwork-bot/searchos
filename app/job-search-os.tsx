"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultProducts, Product, profile } from "./data";

type JobStatus = "Review" | "Qualified" | "Approved" | "Applied" | "Interview" | "Archived";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  score: number;
  status: JobStatus;
  matchedSkills: string[];
  productIds: string[];
  createdAt: string;
};

const demoJobs: Job[] = [
  {
    id: "demo-1",
    title: "Product Operations Manager",
    company: "FleetFlow (example)",
    location: "Bengaluru · Hybrid",
    url: "",
    description:
      "Own product operations for a B2B logistics platform. Improve workflows, gather requirements, coordinate cross-functional launches, and use analytics to improve customer operations.",
    score: 91,
    status: "Review",
    matchedSkills: ["product operations", "logistics", "workflow automation", "analytics"],
    productIds: ["fleet-management", "job-application-agent"],
    createdAt: "Today",
  },
  {
    id: "demo-2",
    title: "Founder’s Office — AI Operations",
    company: "Workgrid AI (example)",
    location: "Remote · India",
    url: "",
    description:
      "Work with founders across AI workflow design, business operations, customer discovery, and program management.",
    score: 82,
    status: "Qualified",
    matchedSkills: ["ai", "workflow automation", "business operations", "product discovery"],
    productIds: ["job-application-agent", "micro-crm"],
    createdAt: "Yesterday",
  },
  {
    id: "demo-3",
    title: "Senior Consumer Product Manager",
    company: "Orbit Social (example)",
    location: "Mumbai",
    url: "",
    description:
      "Lead a consumer social product with experimentation, growth loops, and five years of consumer PM experience.",
    score: 31,
    status: "Archived",
    matchedSkills: ["product discovery"],
    productIds: [],
    createdAt: "2 days ago",
  },
];

const navItems = [
  ["overview", "Overview"],
  ["jobs", "Job pipeline"],
  ["products", "Product evidence"],
  ["automation", "Automation"],
] as const;

function scoreJob(description: string, products: Product[]) {
  const source = description.toLowerCase();
  const matchedSkills = profile.skills.filter((skill) => source.includes(skill));
  const productMatches = products
    .filter((product) => product.status !== "Needs details")
    .map((product) => ({
      id: product.id,
      score: product.tags.filter((tag) => source.includes(tag)).length,
    }))
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((product) => product.id);

  const roleBoost = /product operations|business operations|program manager|founder'?s office|logistics|supply chain/.test(
    source,
  )
    ? 22
    : 0;
  const score = Math.min(96, 35 + matchedSkills.length * 7 + roleBoost);

  return { score, matchedSkills: matchedSkills.slice(0, 6), productIds: productMatches };
}

export function JobSearchOS() {
  const [view, setView] = useState<(typeof navItems)[number][0]>("overview");
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [showIntake, setShowIntake] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedJobs = window.localStorage.getItem("nikhil-job-os-jobs");
    const savedProducts = window.localStorage.getItem("nikhil-job-os-products");
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("nikhil-job-os-jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    window.localStorage.setItem("nikhil-job-os-products", JSON.stringify(products));
  }, [products]);

  const metrics = useMemo(
    () => ({
      active: jobs.filter((job) => !["Archived", "Applied", "Interview"].includes(job.status)).length,
      approved: jobs.filter((job) => job.status === "Approved").length,
      applied: jobs.filter((job) => job.status === "Applied").length,
      interviews: jobs.filter((job) => job.status === "Interview").length,
      average: Math.round(jobs.reduce((sum, job) => sum + job.score, 0) / Math.max(jobs.length, 1)),
    }),
    [jobs],
  );

  function addJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "");
    const company = String(form.get("company") || "");
    const description = String(form.get("description") || "");
    const match = scoreJob(`${title} ${description}`, products);
    const job: Job = {
      id: crypto.randomUUID(),
      title,
      company,
      location: String(form.get("location") || ""),
      url: String(form.get("url") || ""),
      description,
      score: match.score,
      status: match.score >= 75 ? "Review" : match.score >= 55 ? "Qualified" : "Archived",
      matchedSkills: match.matchedSkills,
      productIds: match.productIds,
      createdAt: "Just now",
    };
    setJobs((current) => [job, ...current]);
    setShowIntake(false);
    setSelectedJob(job);
    event.currentTarget.reset();
  }

  function updateStatus(id: string, status: JobStatus) {
    setJobs((current) => current.map((job) => (job.id === id ? { ...job, status } : job)));
    setSelectedJob((current) => (current?.id === id ? { ...current, status } : current));
    setNotice(`Moved to ${status}`);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function updateProduct(id: string, key: keyof Product, value: string | boolean) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              [key]: value,
              status:
                key !== "status" && product.status === "Needs details" && product.strapline !== "Product details awaiting verification"
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
      `${profile.headline} — ${job.title} at ${job.company}`,
      "",
      `${profile.summary}`,
      "",
      `Role match: ${job.score}%`,
      `Relevant skills: ${job.matchedSkills.join(", ") || "Review manually"}`,
      `Selected evidence: ${evidence.map((item) => item.name).join(", ") || "No verified product selected"}`,
      "",
      "Approval note: verify every claim, location requirement, and application answer before submission.",
    ].join("\n");
    await navigator.clipboard.writeText(packet);
    setNotice("Application packet copied");
    window.setTimeout(() => setNotice(""), 1800);
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
            <p className="eyebrow">Thursday, 30 July</p>
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
                  Turn every relevant role into an
                  <br /> evidence-backed application.
                </h2>
                <p>
                  SearchOS scores the fit, selects the strongest proof, creates the packet, and waits for your approval.
                </p>
              </div>
              <div className="focus-score">
                <span>Average fit</span>
                <strong>{metrics.average}</strong>
                <small>across current pipeline</small>
              </div>
            </section>

            <section className="metrics-grid" aria-label="Pipeline metrics">
              <article><span>Active matches</span><strong>{metrics.active}</strong><small>ready for review</small></article>
              <article><span>Approved</span><strong>{metrics.approved}</strong><small>packets cleared</small></article>
              <article><span>Applied</span><strong>{metrics.applied}</strong><small>awaiting response</small></article>
              <article><span>Interviews</span><strong>{metrics.interviews}</strong><small>conversion target</small></article>
            </section>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-heading">
                  <div><p className="eyebrow">DECISION QUEUE</p><h3>Roles needing attention</h3></div>
                  <button className="text-button" onClick={() => setView("jobs")}>View pipeline →</button>
                </div>
                <div className="job-list">
                  {jobs.filter((job) => ["Review", "Qualified"].includes(job.status)).slice(0, 4).map((job) => (
                    <JobRow job={job} key={job.id} onSelect={setSelectedJob} />
                  ))}
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
                <button className="secondary-button full" onClick={() => setView("products")}>Complete product evidence</button>
              </section>
            </div>
          </>
        )}

        {view === "jobs" && (
          <section className="panel pipeline-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">ROLE INTAKE → DECISION → OUTCOME</p><h3>{jobs.length} opportunities</h3></div>
              <div className="legend"><span><i className="high" />75+ strong</span><span><i className="mid" />55–74 review</span></div>
            </div>
            <div className="pipeline-table">
              <div className="table-head"><span>Opportunity</span><span>Fit</span><span>Evidence</span><span>Status</span><span /></div>
              {jobs.map((job) => (
                <button className="table-row" key={job.id} onClick={() => setSelectedJob(job)}>
                  <span><b>{job.title}</b><small>{job.company} · {job.location}</small></span>
                  <span><Score score={job.score} /></span>
                  <span className="evidence-count">{job.productIds.length} products</span>
                  <span><Status status={job.status} /></span>
                  <span className="row-arrow">→</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {view === "products" && (
          <>
            <section className="intro-row">
              <div><p className="eyebrow">CENTRAL EVIDENCE LIBRARY</p><h2>One source of truth. Different proof for every role.</h2></div>
              <p>Only products marked public can appear in generated applications or the recruiter portfolio.</p>
            </section>
            <section className="product-grid">
              {products.map((product) => (
                <article className={`product-editor ${product.public ? "" : "draft"}`} key={product.id}>
                  <div className="product-top">
                    <span className="product-index">{String(products.indexOf(product) + 1).padStart(2, "0")}</span>
                    <label className="switch-label">
                      <input
                        type="checkbox"
                        checked={product.public}
                        onChange={(event) => updateProduct(product.id, "public", event.target.checked)}
                      />
                      <span>{product.public ? "Public" : "Draft"}</span>
                    </label>
                  </div>
                  <h3>{product.name}</h3>
                  <input
                    aria-label={`${product.name} value proposition`}
                    value={product.strapline}
                    onChange={(event) => updateProduct(product.id, "strapline", event.target.value)}
                  />
                  <textarea
                    aria-label={`${product.name} description`}
                    value={product.description}
                    onChange={(event) => updateProduct(product.id, "description", event.target.value)}
                  />
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
              <h2>Automation with a deliberate human gate.</h2>
              {[
                ["01", "Discover", "Collect job alerts and career-page roles"],
                ["02", "Qualify", "Check eligibility, fit, seniority, and location"],
                ["03", "Assemble", "Select CV track, evidence, and application answers"],
                ["04", "Approve", "Verify claims and submission details"],
                ["05", "Follow through", "Track, follow up, and measure conversion"],
              ].map(([number, title, copy], index) => (
                <div className="automation-step" key={number}>
                  <span>{number}</span><div><b>{title}</b><p>{copy}</p></div><i className={index < 3 ? "on" : ""}>{index < 3 ? "Automated" : index === 3 ? "You" : "Scheduled"}</i>
                </div>
              ))}
            </section>
            <section className="integration-stack">
              <h3>Connections</h3>
              {[
                ["Job alerts", "Gmail", "Ready to connect"],
                ["Repository proof", "GitHub", "Needs connection"],
                ["Application writer", "AI", "Rules configured"],
                ["Final submission", "Browser", "Approval required"],
              ].map(([name, service, status]) => (
                <article key={name}><span className="integration-icon">{service.slice(0, 1)}</span><div><b>{name}</b><small>{service}</small></div><em>{status}</em></article>
              ))}
              <div className="safety-card"><b>Safety rule</b><p>SearchOS never invents a metric, publishes a draft product, or submits an application without approval.</p></div>
            </section>
          </div>
        )}
      </section>

      {showIntake && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowIntake(false)}>
          <section className="modal intake-modal" role="dialog" aria-modal="true" aria-labelledby="intake-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setShowIntake(false)} aria-label="Close">×</button>
            <p className="eyebrow">NEW OPPORTUNITY</p>
            <h2 id="intake-title">Paste a job. Get a decision.</h2>
            <form onSubmit={addJob}>
              <div className="form-pair"><label>Role title<input name="title" required placeholder="Product Operations Manager" /></label><label>Company<input name="company" required placeholder="Company name" /></label></div>
              <div className="form-pair"><label>Location<input name="location" placeholder="Bengaluru · Hybrid" /></label><label>Job URL<input name="url" type="url" placeholder="https://…" /></label></div>
              <label>Job description<textarea name="description" required rows={10} placeholder="Paste the complete job description here…" /></label>
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
              <div><p className="eyebrow">{selectedJob.company}</p><h2 id="job-title">{selectedJob.title}</h2><p>{selectedJob.location}</p></div>
              <Score score={selectedJob.score} large />
            </div>
            <div className="packet-section"><span>Matched capabilities</span><div className="tag-row">{selectedJob.matchedSkills.map((skill) => <b key={skill}>{skill}</b>)}</div></div>
            <div className="packet-section"><span>Automatically selected evidence</span>
              <div className="selected-products">
                {products.filter((product) => selectedJob.productIds.includes(product.id)).map((product) => <article key={product.id}><b>{product.name}</b><p>{product.strapline}</p></article>)}
                {!selectedJob.productIds.length && <p className="muted">No verified product matched. Review manually before applying.</p>}
              </div>
            </div>
            <div className="packet-section"><span>Decision</span><div className="decision-row">
              <button className="secondary-button" onClick={() => updateStatus(selectedJob.id, "Archived")}>Archive</button>
              <button className="secondary-button" onClick={() => updateStatus(selectedJob.id, "Approved")}>Approve packet</button>
              <button className="primary-button" onClick={() => copyPacket(selectedJob)}>Copy packet</button>
            </div></div>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}

function Score({ score, large = false }: { score: number; large?: boolean }) {
  return <span className={`score ${score >= 75 ? "high" : score >= 55 ? "mid" : "low"} ${large ? "large" : ""}`}><b>{score}</b><small>% match</small></span>;
}

function Status({ status }: { status: JobStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{status}</span>;
}

function JobRow({ job, onSelect }: { job: Job; onSelect: (job: Job) => void }) {
  return <button className="job-row" onClick={() => onSelect(job)}><Score score={job.score} /><span className="job-copy"><b>{job.title}</b><small>{job.company} · {job.location}</small></span><Status status={job.status} /><span className="row-arrow">→</span></button>;
}
