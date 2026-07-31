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
    "IIM Lucknow MBA and NITK engineer with 10+ years turning complex operating problems into scalable workflows, products, and measurable business outcomes.",
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
    "digital transformation",
    "ai workflow",
    "founder's office",
    "operational excellence",
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
    name: "SearchOS",
    strapline: "Evidence-led job intake, scoring, preparation, and tracking",
    description:
      "A local-first control plane for JD intake, explainable fit scoring, verified evidence selection, approval gates, and application pipeline visibility.",
    tags: ["ai", "workflow automation", "product operations", "analytics"],
    status: "Deployed",
    public: true,
    liveUrl: "",
    githubUrl: "https://github.com/nikhilmeshramwork-bot/searchos",
    caseStudyUrl: "https://github.com/nikhilmeshramwork-bot/searchos#readme",
  },
  {
    id: "powercost-lab",
    name: "PowerCost Lab",
    strapline: "Global electricity-cost intelligence with transparent assumptions",
    description:
      "A live product with 12 focused calculation models, 30 localized pages, reference guidance for 11 verified markets, and a privacy-safe evidence workflow.",
    tags: ["energy", "analytics", "product operations", "workflow automation", "b2b saas"],
    status: "Deployed",
    public: true,
    liveUrl: "https://powercostlab.com",
    githubUrl: "https://github.com/nikhilmeshramwork-bot/powercost-lab",
    caseStudyUrl: "https://github.com/nikhilmeshramwork-bot/powercost-lab#readme",
  },
  {
    id: "inkwell",
    name: "Inkwell",
    strapline: "Writer-controlled AI workspace for finishing nonfiction books",
    description:
      "A connected book workspace spanning source material, AI-supported understanding, writer-controlled structure, manuscript drafting, and whole-book review.",
    tags: ["ai", "ai workflow", "workflow automation", "product discovery", "user journeys"],
    status: "Case study",
    public: true,
    liveUrl: "",
    githubUrl: "https://github.com/nikhilmeshramwork-bot/inkwell-product-showcase",
    caseStudyUrl: "https://github.com/nikhilmeshramwork-bot/inkwell-product-showcase#readme",
  },
  {
    id: "mainscraft",
    name: "MainsCraft",
    strapline: "Mobile-first answer-writing improvement system",
    description:
      "A product blueprint for structured practice, evaluation, reattempt comparison, progress memory, and educator workflows.",
    tags: ["ai", "edtech", "product discovery", "user journeys"],
    status: "Case study",
    public: true,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "fleet-operations",
    name: "Cross-border Fleet Operations",
    strapline: "Cargo-progress and execution visibility across four African markets",
    description:
      "Translated real transport coordination, cargo movement, customer follow-up, and exception-management needs into practical operating workflows.",
    tags: ["logistics", "supply chain", "product operations", "customer operations", "analytics"],
    status: "Case study",
    public: true,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
  {
    id: "micro-crm",
    name: "Micro CRM",
    strapline: "Product details awaiting verification",
    description:
      "Keep this draft out of application packets until its scope, evidence, and public link are verified.",
    tags: ["workflow automation", "customer operations", "b2b saas", "analytics"],
    status: "Needs details",
    public: false,
    liveUrl: "",
    githubUrl: "",
    caseStudyUrl: "",
  },
];
