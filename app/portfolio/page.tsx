import { defaultProducts, profile } from "../data";

export default function Portfolio() {
  const products = defaultProducts.filter((product) => product.public);

  return (
    <main className="portfolio-page">
      <nav className="portfolio-nav">
        <a className="brand" href="/portfolio"><span className="brand-mark">NM</span><span><b>Nikhil Meshram</b><small>Product Operations & AI</small></span></a>
        <div><a href="#work">Selected work</a><a href="#experience">Experience</a><a className="nav-cta" href={`mailto:${profile.email}`}>Start a conversation</a></div>
      </nav>

      <section className="portfolio-hero">
        <p className="eyebrow lime">OPERATOR × PRODUCT BUILDER</p>
        <h1>I turn complex operations into useful, testable products.</h1>
        <p className="portfolio-lede">{profile.summary}</p>
        <div className="portfolio-actions"><a className="light-button" href="#work">Explore selected work ↓</a><a className="outline-light" href={profile.linkedin}>LinkedIn ↗</a></div>
        <div className="proof-strip">{profile.proof.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
      </section>

      <section className="portfolio-work" id="work">
        <div className="section-kicker"><p className="eyebrow">SELECTED WORK</p><p>AI products and operational systems built around real workflows—not generic chatbot wrappers.</p></div>
        <div className="portfolio-products">
          {products.map((product, index) => (
            <article key={product.id}>
              <div className="case-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="case-copy"><div className="tag-row">{product.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><h2>{product.name}</h2><h3>{product.strapline}</h3><p>{product.description}</p>
                <div className="case-links">
                  {product.liveUrl && <a href={product.liveUrl}>Live product ↗</a>}
                  {product.caseStudyUrl && <a href={product.caseStudyUrl}>Case study ↗</a>}
                  {product.githubUrl && <a href={product.githubUrl}>GitHub ↗</a>}
                  {!product.liveUrl && !product.caseStudyUrl && !product.githubUrl && <span>Evidence links being prepared</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="experience-section" id="experience">
        <div><p className="eyebrow lime">OPERATING RANGE</p><h2>Product judgment grounded in execution.</h2></div>
        <div className="experience-list">
          <article><span>2024–2025</span><div><h3>General Manager · Transport & Growth Operations</h3><p>Led cross-border logistics coordination across Mozambique, Zambia, Malawi, and Zimbabwe.</p></div></article>
          <article><span>2017–2022</span><div><h3>Entrepreneur · Operations & Strategy</h3><p>Scaled operations across three districts, delivering 20× revenue growth and approximately 40% higher sales conversion.</p></div></article>
          <article><span>2013–2016</span><div><h3>Assistant Manager · Coal India</h3><p>Led 80+ people across production, transportation, safety, and compliance in complex mining operations.</p></div></article>
        </div>
      </section>

      <footer className="portfolio-footer">
        <p className="eyebrow">LET’S BUILD SOMETHING USEFUL</p>
        <h2>Looking for Product Operations, AI workflow, and logistics-tech opportunities.</h2>
        <a href={`mailto:${profile.email}`}>{profile.email} ↗</a>
        <div><span>India · Open to selected global and remote roles</span><span>IIM Lucknow · NITK Surathkal</span></div>
      </footer>
    </main>
  );
}
