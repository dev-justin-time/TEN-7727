import { Link } from "wouter";
import { Card, PageHead } from "../components/bits";
import { useSession } from "../components/session";
import { ProjectGrid } from "./projects";

export default function OrbitalPage() {
  const { member } = useSession();
  const accredited = member?.kycStatus === "accredited" || (member?.level ?? 0) >= 4 || member?.role === "admin";
  return <div><PageHead kicker="Orbital Works · Deep tech" title="Evidence before orbit">Hard science, long horizons, measurable milestones. Accreditation is an access requirement, never a claim that a project is safe.</PageHead>
    <Card className="mb-6 border-primary"><div className="k-label">Accredited-only backing</div><p className="mt-3 text-sm">{accredited ? "Your demo passport has access. Production requires independent verification." : "Browse the rooms freely. Backing requires an accredited passport; in production a third-party service verifies it."} <Link to="/portfolio" className="k-link">View your identity tier</Link></p></Card>
    <div className="mb-8 grid gap-4 md:grid-cols-3">{[["Technical diligence", "Show the hypothesis, testing method, contrary evidence and independent validation. Credentials are context, not proof."], ["Long-run risk", "Hardware delays, technical failure, regulation and dilution can erase capital. No target return is promised."], ["Small exposure", "The $10 per-project ceiling remains at every stage. A $5 unlock or Level 2 is still needed for ongoing rounds."]].map(([title, text]) => <Card key={title}><h2 className="k-display text-2xl">{title}</h2><p className="mt-3 text-sm text-muted-foreground">{text}</p></Card>)}</div>
    <h2 className="k-display mb-4 text-3xl">The research book</h2><ProjectGrid brand="orbital" />
  </div>;
}