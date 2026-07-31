import type { Product } from "./data";

export type ScoreBreakdown = {
  role: number;
  capabilities: number;
  domain: number;
  location: number;
  seniority: number;
  penalties: number;
};

export type MatchDecision = "Strong fit" | "Review fit" | "Low fit";

export type JobMatch = {
  score: number;
  decision: MatchDecision;
  roleFamily: string;
  cvTrack: "Product & Business Operations" | "AI Workflow & Product";
  matchedSkills: string[];
  productIds: string[];
  strengths: string[];
  risks: string[];
  breakdown: ScoreBreakdown;
  recommendation: string;
};

type Rule = {
  label: string;
  pattern: RegExp;
  points: number;
};

const roleRules: Rule[] = [
  { label: "AI Operations / Workflow", pattern: /\b(ai operations?|ai workflow|automation lead|ai program|digital transformation)\b/i, points: 30 },
  { label: "Product Operations", pattern: /\b(product operations?|product ops)\b/i, points: 30 },
  { label: "Business Operations", pattern: /\b(business operations?|bizops|strategy and operations)\b/i, points: 27 },
  { label: "Logistics / Supply Chain Technology", pattern: /\b(logistics tech|logistics platform|supply chain tech|transport technology|fleet platform)\b/i, points: 27 },
  { label: "Program Management", pattern: /\b(program manager|programme manager|program operations|pmo)\b/i, points: 25 },
  { label: "Founder’s Office", pattern: /\b(founder'?s office|chief of staff)\b/i, points: 24 },
  { label: "Implementation / Customer Operations", pattern: /\b(implementation manager|customer operations|customer success operations)\b/i, points: 19 },
  { label: "Product Management", pattern: /\b(product manager|product management)\b/i, points: 14 },
];

const capabilityRules: Rule[] = [
  { label: "workflow design", pattern: /\b(workflows?|process design|process mapping|operating model)\b/i, points: 4 },
  { label: "process improvement", pattern: /\b(process improvement|continuous improvement|root cause|operational excellence)\b/i, points: 4 },
  { label: "requirements gathering", pattern: /\b(requirements?|user stor(?:y|ies)|acceptance criteria|business analysis)\b/i, points: 4 },
  { label: "stakeholder management", pattern: /\b(stakeholder|cross-functional|cross functional|executive alignment)\b/i, points: 4 },
  { label: "program execution", pattern: /\b(program|project management|execution|delivery|launch)\b/i, points: 4 },
  { label: "analytics and KPIs", pattern: /\b(analytics|kpi|metrics|dashboard|data-driven|reporting)\b/i, points: 4 },
  { label: "product discovery", pattern: /\b(product discovery|customer discovery|user research|customer pain points?)\b/i, points: 4 },
  { label: "AI and automation", pattern: /\b(ai|artificial intelligence|automation|llm|machine learning)\b/i, points: 4 },
  { label: "logistics and supply chain", pattern: /\b(logistics|supply chain|fleet|transport|warehouse|last mile)\b/i, points: 4 },
  { label: "business operations", pattern: /\b(business operations|commercial operations|operational planning|business process)\b/i, points: 4 },
  { label: "customer operations", pattern: /\b(customer operations|customer success|service operations|client operations)\b/i, points: 3 },
  { label: "B2B SaaS", pattern: /\b(b2b|saas|enterprise software|platform)\b/i, points: 3 },
];

const domainRules: Rule[] = [
  { label: "logistics or supply-chain domain", pattern: /\b(logistics|supply chain|fleet|transport|warehouse|last mile)\b/i, points: 8 },
  { label: "AI-enabled product domain", pattern: /\b(ai|artificial intelligence|automation|llm|machine learning)\b/i, points: 7 },
  { label: "B2B or enterprise software", pattern: /\b(b2b|saas|enterprise software|platform)\b/i, points: 5 },
  { label: "operationally complex environment", pattern: /\b(operations|manufacturing|field operations|multi-site|cross-border)\b/i, points: 4 },
];

const preferredLocation =
  /\b(remote|india|bengaluru|bangalore|mumbai|pune|hyderabad|chennai|delhi|gurugram|gurgaon|noida|uae|united arab emirates|dubai|abu dhabi)\b/i;
const outOfScopeLocation =
  /\b(united states|usa|u\.s\.|canada|united kingdom|uk only|europe only|germany|france|australia|singapore only)\b/i;

function unique(values: string[]) {
  return [...new Set(values)];
}

function selectProducts(source: string, products: Product[]) {
  return products
    .filter((product) => product.public && product.status !== "Needs details")
    .map((product) => ({
      id: product.id,
      score: product.tags.reduce((total, tag) => total + (source.includes(tag.toLowerCase()) ? 1 : 0), 0),
    }))
    .filter((product) => product.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((product) => product.id);
}

export function scoreJob(input: {
  title: string;
  description: string;
  location: string;
  products: Product[];
}): JobMatch {
  const source = `${input.title} ${input.description}`.toLowerCase();
  const locationSource = `${input.location} ${input.description}`;
  const role = roleRules.find((rule) => rule.pattern.test(source));
  const matchedCapabilityRules = capabilityRules.filter((rule) => rule.pattern.test(source));
  const matchedDomainRules = domainRules.filter((rule) => rule.pattern.test(source));
  const matchedSkills = unique(matchedCapabilityRules.map((rule) => rule.label));
  const strengths: string[] = [];
  const risks: string[] = [];

  const roleScore = role?.points ?? 4;
  if (role && role.points >= 24) strengths.push(`Target role family: ${role.label}`);
  if (!role) risks.push("Role family is outside the current target list");

  const capabilities = Math.min(
    30,
    matchedCapabilityRules.reduce((total, rule) => total + rule.points, 0),
  );
  if (matchedSkills.length >= 4) strengths.push(`${matchedSkills.length} relevant capabilities found`);
  if (matchedSkills.length < 2) risks.push("Few transferable capabilities are explicit in the description");

  const domain = Math.min(
    15,
    matchedDomainRules.reduce((total, rule) => total + rule.points, 0),
  );
  if (matchedDomainRules.length) strengths.push(matchedDomainRules[0].label);

  let location = 4;
  if (preferredLocation.test(locationSource)) {
    location = 10;
    strengths.push("Location matches India, UAE, or remote scope");
  } else if (outOfScopeLocation.test(locationSource)) {
    location = -8;
    risks.push("Location appears outside the current India, UAE, and remote scope");
  } else {
    risks.push("Location or work-authorisation fit needs manual verification");
  }

  let seniority = 5;
  if (/\b(intern|internship|graduate program|entry[- ]level|fresher)\b/i.test(source)) {
    seniority = -10;
    risks.push("Role appears materially below the target seniority");
  } else if (/\b(vice president|vp|director|c-level|chief product officer)\b/i.test(source)) {
    seniority = -5;
    risks.push("Role may require executive-level functional ownership");
  } else if (/\b(senior manager|manager|lead|principal|program manager|head of operations)\b/i.test(source)) {
    seniority = 9;
    strengths.push("Seniority is broadly consistent with the operating record");
  }

  let penalties = 0;
  if (/\b(software engineer|full[- ]stack developer|data scientist|machine learning engineer)\b/i.test(source)) {
    penalties -= 24;
    risks.push("Role is primarily a specialist engineering position");
  }
  if (/\b(consumer social|mobile gaming|growth product|consumer mobile)\b/i.test(source)) {
    penalties -= 14;
    risks.push("Deep consumer-product experience is not part of the verified evidence base");
  }
  if (/\b(?:5|6|7|8|9|10)\+?\s+years?.{0,24}(?:product management|product manager)\b/i.test(source)) {
    penalties -= 10;
    risks.push("Formal product-management tenure requirement needs careful verification");
  }
  if (/\b(quota carrying|quota-carrying|cold calling|enterprise sales hunter)\b/i.test(source)) {
    penalties -= 10;
    risks.push("The role appears primarily quota-carrying sales");
  }

  const rawScore = 10 + roleScore + capabilities + domain + location + seniority + penalties;
  const score = Math.max(8, Math.min(96, rawScore));
  const decision: MatchDecision = score >= 78 ? "Strong fit" : score >= 60 ? "Review fit" : "Low fit";
  const recommendation =
    decision === "Strong fit"
      ? "Prepare a tailored packet and review it for approval."
      : decision === "Review fit"
        ? "Review the listed gaps before spending time on a tailored application."
        : "Do not apply unless a referral or missing evidence materially changes the fit.";

  const cvTrack =
    /\b(ai|automation|digital transformation|workflow)\b/i.test(source)
      ? "AI Workflow & Product"
      : "Product & Business Operations";

  return {
    score,
    decision,
    roleFamily: role?.label ?? "Outside target role families",
    cvTrack,
    matchedSkills: matchedSkills.slice(0, 8),
    productIds: selectProducts(source, input.products),
    strengths: unique(strengths).slice(0, 5),
    risks: unique(risks).slice(0, 5),
    breakdown: {
      role: roleScore,
      capabilities,
      domain,
      location,
      seniority,
      penalties,
    },
    recommendation,
  };
}
