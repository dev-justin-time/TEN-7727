import { useState } from "react";
import { Link } from "wouter";
import { useCancelProject, useMyProjects, useSubmitMilestone } from "../queries/projects";
import { useReportRevenue } from "../queries/payouts";
import { useSession } from "../components/session";
import { Bar, Btn, Card, Empty, ErrorLine, Loading, NeedPassport, PageHead } from "../components/bits";
import { BRAND_LABEL, STATUS_LABEL, currentPeriod, date, money, pct } from "../lib/format";

export default function StudioPage() {
  return <NeedPassport><Studio /></NeedPassport>;
}

function Studio() {
  const { memberId } = useSession();
  const mine = useMyProjects(memberId);
  if (mine.isLoading) return <Loading />;
  return (
    <div>
      <PageHead kicker="Forge Club · Creator Studio" title="Your rounds">
        Post milestone evidence, report revenue for income runs, answer notices. Inactivity is what triggers default — difficulty never does.
      </PageHead>
      <div className="mb-6"><Link to="/forge/pitch" className="rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">New pitch</Link></div>
      {!mine.data?.length ? <Empty>No rounds yet. Pitches start at $10.</Empty> : (
        <div className="space-y-6">{mine.data.map((p) => <StudioProject key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}

type P = NonNullable<ReturnType<typeof useMyProjects>["data"]>[number];

function StudioProject({ p }: { p: P }) {
  const { memberId } = useSession();
  const submit = useSubmitMilestone();
  const report = useReportRevenue();
  const cancel = useCancelProject();
  const [evidence, setEvidence] = useState("");
  const [gross, setGross] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [reason, setReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const open = p.milestones.find((m) => m.status === "open");
  const submitted = p.milestones.find((m) => m.status === "submitted");
  const closed = ["cancelled", "foreclosed", "redistributed"].includes(p.status);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex gap-1.5"><span className="k-chip">{BRAND_LABEL[p.brand]}</span><span className="k-chip">{STATUS_LABEL[p.status] ?? p.status}</span><span className="k-chip">Stage {p.stage}</span></div>
          <Link to={`/forge/project/${p.id}`} className="k-display mt-3 block text-3xl hover:text-primary">{p.title}</Link>
          <p className="text-sm text-muted-foreground k-num">{money(p.raisedCents)} escrowed · {p.backerCount} backers · {pct(p.equityAllocatedBp)} sold of {pct(p.equityOfferedBp)}</p>
        </div>
        <div className="w-48"><Bar value={p.raisedCents / p.capitalGoalCents} /><div className="mt-1 text-right text-xs text-muted-foreground">goal {money(p.capitalGoalCents)}</div></div>
      </div>

      {p.notices.length > 0 && (
        <div className="mt-4 space-y-2">
          {p.notices.map((n) => (
            <div key={n.id} className="rounded-[var(--radius)] border border-warn/40 p-3 text-sm">
              <b>{n.title}</b> <span className="text-xs text-muted-foreground">{n.dueAt ? `due ${date(n.dueAt)}` : ""}</span>
              <p className="text-xs text-muted-foreground">{n.body}</p>
              {n.recoveryPath && <p className="mt-1 text-xs"><b>Recovery:</b> {n.recoveryPath}</p>}
            </div>
          ))}
        </div>
      )}

      {!closed && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--radius)] border border-border p-4">
            <div className="k-label">Milestone evidence</div>
            {submitted ? <p className="mt-2 text-sm">{submitted.title} is with the escrow reviewer.</p> : open ? (
              <form className="mt-2 grid gap-2" onSubmit={(e) => { e.preventDefault(); if (memberId) submit.mutate({ memberId, milestoneId: open.id, evidence }, { onSuccess: () => setEvidence("") }); }}>
                <p className="text-sm font-semibold">{open.title}</p>
                <p className="text-xs text-muted-foreground">{open.requirement}</p>
                <textarea className="k-input" rows={3} minLength={10} required aria-label="Milestone evidence" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Links, numbers, documents — what a skeptic would need" />
                <Btn type="submit" className="text-xs" loading={submit.isPending}>Submit to escrow</Btn>
                <ErrorLine error={submit.error} />
              </form>
            ) : <p className="mt-2 text-sm">All stages verified.</p>}
          </div>
          <div className="rounded-[var(--radius)] border border-border p-4">
            <div className="k-label">Report revenue → income run</div>
            <form className="mt-2 grid gap-2" onSubmit={(e) => { e.preventDefault(); if (memberId) report.mutate({ memberId, projectId: p.id, grossCents: Math.round(Number(gross) * 100), period }, { onSuccess: () => setGross("") }); }}>
              <div className="grid grid-cols-2 gap-2">
                <input className="k-input" aria-label="Income period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" required />
                <input className="k-input" type="number" min="1" step="0.01" aria-label="Gross revenue in dollars" value={gross} onChange={(e) => setGross(e.target.value)} placeholder="Gross $" required />
              </div>
              <p className="text-xs text-muted-foreground">10% house, then holders paid by ownership ({pct(p.equityAllocatedBp)}), you keep the rest. Simulated. Published to the room.</p>
              <Btn type="submit" variant="outline" className="text-xs" loading={report.isPending}>Run distribution</Btn>
              {report.data && <p className="text-xs text-good">Paid {money(report.data.holdersCents)} to {report.data.holderCount} holders, kept {money(report.data.creatorCents)}.</p>}
              <ErrorLine error={report.error} />
            </form>
          </div>
        </div>
      )}

      {!closed && (
        <div className="mt-4 text-xs">
          {!showCancel ? <button className="text-muted-foreground underline" onClick={() => setShowCancel(true)}>Cancel this round…</button> : (
            <form className="grid gap-2 rounded-[var(--radius)] border border-destructive/40 p-3" onSubmit={(e) => { e.preventDefault(); if (memberId) cancel.mutate({ memberId, projectId: p.id, reason }); }}>
              <p>Cancelling returns 75% of escrowed principal to backers; 25% is retained under the clawback. Your trust score takes a hit, your standing does not.</p>
              <input className="k-input" required minLength={5} aria-label="Cancellation reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, shown to backers" />
              <div className="flex gap-2"><Btn type="submit" variant="danger" className="text-xs" loading={cancel.isPending}>Confirm cancel</Btn><Btn type="button" variant="ghost" className="text-xs" onClick={() => setShowCancel(false)}>Keep going</Btn></div>
              <ErrorLine error={cancel.error} />
            </form>
          )}
        </div>
      )}
    </Card>
  );
}
