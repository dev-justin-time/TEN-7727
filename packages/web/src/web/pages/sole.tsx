import { Link } from "wouter";
import { Card, PageHead } from "../components/bits";
import { ProjectGrid } from "./projects";

export default function SolePage() {
  return <div><PageHead kicker="Sole Society · Creator commerce" title="Wear your own lane">Feet and worn-apparel businesses with explicit consent, honest listings and independent brand books. Money is simulated here; no adult content is hosted.</PageHead>
    <div className="mb-8 grid gap-4 md:grid-cols-3">{[["Consent first", "Adults only for creator commerce. Age, ownership and consent verification must precede production listings. No unconsented imagery or illegal goods."], ["Clear provenance", "Describe what the buyer receives, condition, shipping and returns. No unverifiable claims. No off-platform payment pressure."], ["Separate the risk", "A dedicated operating entity and appropriate processor. No shared capital account with Forge Club or Orbital Works."]].map(([title, text]) => <Card key={title}><h2 className="k-display text-2xl">{title}</h2><p className="mt-3 text-sm text-muted-foreground">{text}</p></Card>)}</div>
    <h2 className="k-display mb-4 text-3xl">Creator rounds</h2><ProjectGrid brand="sole" />
    <Card className="mt-8"><div className="k-label">Roadmap · not live</div><h2 className="k-display mt-2 text-3xl">Adult content is phase 2</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground"><li>Phase 1: feet and worn-apparel business tools, storefront preparation and IP drafts in this simulation.</li><li>Before phase 2: independent counsel, verified age and consent, a records custodian, separate entity and a high-risk processor.</li><li>Phase 2: full adult content hosted by a compliant third party, not on this platform. No hosting migration is promised.</li></ol><Link className="k-link mt-4 inline-block text-sm" to="/compliance">Full compliance roadmap →</Link></Card>
  </div>;
}