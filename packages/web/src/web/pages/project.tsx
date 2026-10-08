import { useState } from "react";
import { useParams } from "wouter";
import { CheckCircle2, Circle, Clock, Lock } from "lucide-react";
import { useComment, useProject } from "../queries/projects";
import { useInvest } from "../queries/draw";
import { useBuyEquity, useListEquity } from "../queries/exchange";
import { useDistributions } from "../queries/payouts";
import { useSession } from "../components/session";
import { Bar, Btn, Card, Empty, ErrorLine, Loading, Stat } from "../components/bits";
import { BRAND_LABEL, STATUS_LABEL, ago, date, money, pct } from "../lib/format";

const MS_ICON = { verified: CheckCircle2, open: Circle, submitted: Clock, locked: Lock, failed: Lock } as const;

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const { memberId, member } = useSession();
  const q = useProject(pid, memberId);
  const dist = useDistributions(pid);
  const invest = useInvest();
  const comment = useComment();
  const buy = useBuyEquity();
  const list = useListEquity();
  const [amt, setAmt] = useState(10);
  const [body, setBody] = useState("");
  const [verdict, setVerdict] = useState<"neutral" | "try" | "bye">("neutral");
  const [sellPct, setSellPct] = useState("");
  const [ask, setAsk] = useState("");

  if (q.isLoading) return <Loading />;
  if (!q.data) return <Empty>Round not found.</Empty>;
  const { project: p, creator, milestones, backers, comments, equityBook, viewer, pointValueNow } = q.data;
  const isOwner = memberId === p.creatorId;
  const remaining = 1000 - viewer.investedCents;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap gap-2">
          <span className="k-chip">{BRAND_LABEL[p.brand]}</span>
          <span className="k-chip">Stage {p.stage}/5</span>
          <span className="k-chip">{p.riskTier} risk</span>
          <span className="k-chip">{STATUS_LABEL[p.status] ?? p.status}</span>
          <span className="k-chip">Escrow: {p.escrowVendor ?? "pending"}</span>
        </div>
        <h1 className="k-display mt-4 text-5xl md:text-7xl">{p.title}</h1>
        <p className="mt-2 text-lg">{p.tagline}</p>
        <p className="mt-1 text-sm text-muted-foreground">by {creator.displayName} @{creator.handle} · L{creator.level}</p>
        {p.status === "default_notice" && (
          <div className="mt-4 rounded-[var(--radius)] border border-warn/50 p-4 text-sm">
            <b className="text-warn">Default notice open.</b> {p.defaultReason} Cure window closes {date(p.graceUntil)}. Escrow is frozen, not seized.
          </div>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Escrowed" value={money(p.raisedCents)} sub={`of ${money(p.capitalGoalCents)} goal`} />
        <Stat label="Crowd equity" value={pct(p.equityAllocatedBp)} sub={`of ${pct(p.equityOfferedBp)} offered`} />
        <Stat label="Points per $10 now" value={pointValueNow} sub="doubles each verified stage" />
        <Stat label="Your position" value={money(viewer.investedCents)} sub={`${pct(viewer.equityBp, 3)} · ${viewer.points} pts`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="k-label">The pitch · {p.pitchFormat}</div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{p.description}</p>
            {p.pitchUrl && <a href={p.pitchUrl} target="_blank" rel="noreferrer" className="k-link mt-3 inline-block text-sm">Open pitch material</a>}
          </Card>

          <Card>
            <div className="k-label">Milestones — escrow releases only on verified evidence</div>
            <ol className="mt-4 space-y-4">
              {milestones.map((m) => {
                const Icon = MS_ICON[m.status as keyof typeof MS_ICON] ?? Circle;
                return (
                  <li key={m.id} className="flex gap-3">
                    <Icon className={`mt-0.5 size-5 shrink-0 ${m.status === "verified" ? "text-good" : m.status === "open" ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <div className="font-semibold">{m.title} <span className="k-chip ml-1">{m.pointValue} pts/$10</span> <span className="k-chip">{m.status}</span></div>
                      <p className="text-sm text-muted-foreground">{m.requirement}</p>
                      {m.evidence && <p className="mt-1 text-xs italic">Evidence: {m.evidence}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card>
            <div className="k-label">Income runs</div>
            {dist.isLoading ? <Loading /> : !dist.data?.length ? (
              <p className="mt-3 text-sm text-muted-foreground">No distributions yet. When the creator reports revenue, the house takes 10%, holders split the rest by ownership, and every run is published here.</p>
            ) : (
              <table className="mt-3 w-full text-sm k-num">
                <thead className="text-left text-xs text-muted-foreground"><tr><th className="py-1">Period</th><th>Gross</th><th>House</th><th>Holders</th><th>Creator</th></tr></thead>
                <tbody>
                  {dist.data.map((d) => (
                    <tr key={d.id} className="border-t border-border"><td className="py-2">{d.period}</td><td>{money(d.grossCents)}</td><td>{money(d.houseCents)}</td><td>{money(d.holdersCents)}</td><td>{money(d.creatorCents)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card>
            <div className="k-label">The room — try it, or say bye</div>
            {memberId && (
              <form
                className="mt-3 grid gap-2"
                onSubmit={(e) => { e.preventDefault(); comment.mutate({ memberId, projectId: p.id, body, verdict }, { onSuccess: () => setBody("") }); }}
              >
                <textarea className="k-input" rows={2} required minLength={2} aria-label="Room comment" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Questions, diligence, a verdict with reasons" />
                <div className="flex gap-2">
                  {(["neutral", "try", "bye"] as const).map((v) => (
                    <button type="button" key={v} onClick={() => setVerdict(v)} className={`k-chip ${verdict === v ? "border-primary text-primary" : ""}`}>{v}</button>
                  ))}
                  <Btn type="submit" className="ml-auto py-1.5 text-xs" loading={comment.isPending}>Post (+2 clout)</Btn>
                </div>
                <ErrorLine error={comment.error} />
              </form>
            )}
            <ul className="mt-4 space-y-3">
              {comments.length === 0 && <li className="text-sm text-muted-foreground">Quiet so far.</li>}
              {comments.map((c) => (
                <li key={c.id} className="border-t border-border pt-3 text-sm">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <b className="text-foreground">@{c.handle}</b> L{c.level} · {ago(c.createdAt)}
                    {c.verdict !== "neutral" && <span className={`k-chip ${c.verdict === "try" ? "text-good" : "text-destructive"}`}>{c.verdict}</span>}
                  </div>
                  <p className="mt-1">{c.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="k-label">Back this round</div>
            {!memberId ? (
              <p className="mt-2 text-sm text-muted-foreground">Get a passport to back rounds.</p>
            ) : isOwner ? (
              <p className="mt-2 text-sm text-muted-foreground">Your round. Manage it from the Studio.</p>
            ) : remaining <= 0 ? (
              <p className="mt-2 text-sm">You hold the $10 maximum here. That ceiling never moves.</p>
            ) : (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <input type="range" min={1} max={remaining / 100} aria-label="Ticket amount" value={Math.min(amt, remaining / 100)} onChange={(e) => setAmt(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
                  <span className="k-display k-num text-2xl">${Math.min(amt, remaining / 100)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {member?.ongoingAccess ? "Direct backing is open to you." : "At L0–L1 rounds reach you through The Draw; direct backing needs ongoing-round access."}
                </p>
                <Btn className="mt-3 w-full" loading={invest.isPending} onClick={() => invest.mutate({ memberId, projectId: p.id, amountCents: Math.min(amt, remaining / 100) * 100 })}>
                  Back ${Math.min(amt, remaining / 100)}
                </Btn>
                <ErrorLine error={invest.error} />
              </>
            )}
          </Card>

          <Card>
            <div className="k-label">Equity Book for this round</div>
            {equityBook.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No open lots.</p> : (
              <ul className="mt-3 space-y-2">
                {equityBook.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="k-num">{pct(l.equityBp, 3)} for {money(l.askCents)}</span>
                    {memberId && l.sellerId !== memberId && (
                      <Btn variant="outline" className="py-1 text-xs" loading={buy.isPending && buy.variables?.listingId === l.id} onClick={() => buy.mutate({ memberId, listingId: l.id })}>Buy</Btn>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <ErrorLine error={buy.error} />
            {memberId && (viewer.equityBp > 0 || isOwner) && (
              <form className="mt-4 grid gap-2 border-t border-border pt-4" onSubmit={(e) => {
                e.preventDefault();
                list.mutate({ memberId, projectId: p.id, equityBp: Math.round(Number(sellPct) * 100), askCents: Math.round(Number(ask) * 100) }, { onSuccess: () => { setSellPct(""); setAsk(""); } });
              }}>
                <div className="k-label">Sell part of your stake</div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="k-input" type="number" step="0.01" min="0.01" placeholder="% to sell" aria-label="Equity percentage to sell" value={sellPct} onChange={(e) => setSellPct(e.target.value)} required />
                  <input className="k-input" type="number" step="0.01" min="1" placeholder="Ask $" aria-label="Asking price in dollars" value={ask} onChange={(e) => setAsk(e.target.value)} required />
                </div>
                <p className="text-xs text-muted-foreground">You hold {isOwner ? pct(10000 - p.equityAllocatedBp) : pct(viewer.equityBp, 3)}. 10% house fee on fill.</p>
                <Btn type="submit" variant="outline" className="text-xs" loading={list.isPending}>List on the Equity Book</Btn>
                <ErrorLine error={list.error} />
              </form>
            )}
          </Card>

          <Card>
            <div className="k-label">Backers ({backers.length})</div>
            <ul className="mt-3 max-h-72 space-y-1.5 overflow-auto text-sm">
              {backers.map((b) => (
                <li key={b.id} className="flex justify-between k-num">
                  <span>@{b.handle}</span><span className="text-muted-foreground">{money(b.amountCents)} · {pct(b.equityBp, 3)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3"><Bar value={p.raisedCents / p.capitalGoalCents} /></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
