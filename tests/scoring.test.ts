import assert from "node:assert/strict";
import test from "node:test";
import { defaultProducts } from "../app/data.ts";
import { scoreJob } from "../app/scoring.ts";

test("scores a target product-operations role strongly and explains the fit", () => {
  const result = scoreJob({
    title: "Product Operations Manager",
    location: "Bengaluru · Hybrid",
    description:
      "Own product operations for a B2B logistics platform. Improve workflows, gather requirements, coordinate cross-functional launches, and use analytics and KPIs to improve customer operations.",
    products: defaultProducts,
  });

  assert.equal(result.decision, "Strong fit");
  assert.ok(result.score >= 78);
  assert.equal(result.roleFamily, "Product Operations");
  assert.ok(result.matchedSkills.includes("workflow design"));
  assert.ok(result.productIds.includes("powercost-lab"));
  assert.ok(result.strengths.length > 0);
});

test("routes an AI workflow role to the AI resume", () => {
  const result = scoreJob({
    title: "AI Workflow Program Manager",
    location: "Remote · India",
    description:
      "Lead AI workflow automation, stakeholder alignment, process design, program execution, analytics, and customer discovery for a B2B SaaS platform.",
    products: defaultProducts,
  });

  assert.equal(result.cvTrack, "AI Workflow & Product");
  assert.equal(result.decision, "Strong fit");
  assert.ok(result.productIds.includes("inkwell"));
});

test("penalizes a specialist engineering role outside the target scope", () => {
  const result = scoreJob({
    title: "Senior Machine Learning Engineer",
    location: "United States · On-site",
    description:
      "Build production ML infrastructure as a software engineer. Requires eight years of engineering experience.",
    products: defaultProducts,
  });

  assert.equal(result.decision, "Low fit");
  assert.ok(result.score < 60);
  assert.ok(result.risks.some((risk) => risk.includes("engineering")));
  assert.ok(result.risks.some((risk) => risk.includes("outside")));
});

test("never selects draft or unverified products as evidence", () => {
  const products = defaultProducts.map((product) =>
    product.id === "powercost-lab" ? { ...product, public: false } : product,
  );
  const result = scoreJob({
    title: "Product Operations Manager",
    location: "Dubai",
    description: "Own product operations, analytics, workflows, and requirements for an energy platform.",
    products,
  });

  assert.ok(!result.productIds.includes("powercost-lab"));
});
