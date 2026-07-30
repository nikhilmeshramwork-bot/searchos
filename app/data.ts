export type Product = {
  id: string;
  name: string;
  strapline: string;
  description: string;
  tags: string[];
  status: "Deployed" | "Prototype" | "Case study" | "Needs details";
  public: boolean;
  liveUrl: string;
  githubUrl: string;
  caseStudyUrl: string;
};

export const profile = {
  name: "Nikhil Meshram",
  email: "nikhilmeshram.work@gmail.com",
  linkedin: "https://www.linkedin.com/in/nikhilmeshram31",
  headline: "Product Operations & AI Workflow Builder",
  summary:
    "IIM Lucknow MBA and NITK engineer with 8+ years turning complex operating problems into scalable workflows, products, and measurable business outcomes.",
  skills: [
    "product operations",
    "workflow automation",
    "logistics",
    "supply chain",
    "process improvement",
    "requirements gathering",
    "stakeholder management",
    "product discovery",
    "user journeys",
    "business operations",
    "program management",
    "ai",
    "analytics",
    "cross-functional execution",
    "customer operations",
    "b2b saas",
  ],
  proof: [
    { value: "20×", label: "revenue growth" },
    { value: "40%", label: "conversion improvement" },
    { value: "80+", label: "people led" },
    { value: "4", label: "African markets operated" },
  ],
};

export const defaultProducts: Product[] = [
  {
    id: "job-application-agent",
    name: "Job Application Agent",
    strapline: "AI-enabled job discovery, scoring, preparation, and tracking",
    description:
      "A structured workflow for JD intake, fit scoring, application packet generation, quality gates, manual approval, and pipeline visibility.",
    tags: ["ai", "workflow automation", "product operations", "analytics"],
    status: "Prototype",
    public: true,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "mainscraft",
    name: "MainsCraft V2",
    strapline: "Mobile-first AI answer-writing and evaluation product",
    description:
      "Practice modes, realistic scoring, saved attempts, reattempt comparison, performance statistics, and structured AI feedback loops.",
    tags: ["ai", "edtech", "product discovery", "user journeys"],
    status: "Prototype",
    public: true,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "fleet-management",
    name: "Fleet Management System",
    strapline: "Cargo-progress visibility across cross-border logistics",
    description:
      "Translated fleet and cargo tracking needs into practical workflows that improved operational visibility and follow-up.",
    tags: ["logistics", "supply chain", "product operations", "b2b saas"],
    status: "Case study",
    public: true,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "micro-crm",
    name: "Micro CRM",
    strapline: "Lightweight lead, reminder, and workflow system",
    description:
      "A small-business productivity system for lead tracking, follow-ups, dashboards, reminders, and task visibility.",
    tags: ["workflow automation", "customer operations", "b2b saas", "analytics"],
    status: "Prototype",
    public: true,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "powercostlabs",
    name: "PowerCostLabs",
    strapline: "Product details awaiting verification",
    description:
      "Connect the repository, live product, and a verified one-line value proposition before this is used in an application.",
    tags: ["ai", "analytics"],
    status: "Needs details",
    public: false,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "inkwell",
    name: "Inkwell",
    strapline: "Product details awaiting verification",
    description:
      "Connect the repository, live product, and a verified one-line value proposition before this is used in an application.",
    tags: ["ai", "workflow automation"],
    status: "Needs details",
    public: false,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
];
