import { Card, ErrorLine, Loading, PageHead } from "../components/bits";
import { useCompliance } from "../queries/network";

export default function CompliancePage() {
  const q = useCompliance();
  return <div><PageHead kicker="Kinship Hub · Compliance roadmap" title="The path to real">This is a simulated prototype. Nothing here establishes regulatory clearance, a licensed portal or a legal entity.</PageHead>
    {q.isLoading ? <Loading /> : <><Card className="mb-6 border-primary"><p>{q.data?.posture}</p><p className="mt-3 text-sm text-muted-foreground">The current demo accepts member IDs without authentication, self-assigned identity tiers and automatic task approval. Before real money: authenticated server-side authorization, vendor verification, atomic transactions, idempotency, reconciliation, privacy controls and independent legal review are required. Cost figures below are planning estimates, not current vendor quotes.</p></Card><div className="grid gap-6 md:grid-cols-2">{q.data?.tracks.map((t) => <Card key={t.title}><h2 className="k-display text-2xl">{t.title}</h2><p className="mt-3 text-sm"><b>Today:</b> {t.now}</p><ol className="my-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">{t.path.map((p) => <li key={p}>{p}</li>)}</ol><p className="border-t border-border pt-3 text-xs"><b>Planning cost:</b> {t.cost}</p></Card>)}</div><Card className="mt-6"><div className="k-label">Guiding principle</div><p className="mt-3">{q.data?.principle}</p></Card></>}
    <ErrorLine error={q.error} />
  </div>;
}