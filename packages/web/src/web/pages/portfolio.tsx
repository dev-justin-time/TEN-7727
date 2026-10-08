import { Link } from "wouter";
import { usePortfolio } from "../queries/payouts";
import { useMyNotices } from "../queries/house";
import { useKyc, useTopUp } from "../queries/members";
import { useSession } from "../components/session";
import { Btn, Card, Empty, ErrorLine, Loading, NeedPassport, PageHead, Stat } from "../components/bits";
import { BRAND_LABEL, STATUS_LABEL, date, money, pct } from "../lib/format";

export default function PortfolioPage() {
  return <NeedPassport><Portfolio /></NeedPassport>;
}

function Portfolio() {
  const { memberId, member } = useSession();
  const pf = usePortfolio(memberId);
  const notices = useMyNotices(memberId);
  const topUp = useTopUp();
  const kyc = useKyc();
  if (pf.isLoading) return <Loading />;
  const t = pf.data?.totals;

  return (
    <div>
      <PageHead kicker={`@${member?.handle} · Portfolio`} title="What you own">
        {pf.data && "disclaimer" in pf.data ? pf.data.disclaimer : "Cost, ownership and income received, per round."}
      </PageHead>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Wallet (sim)" value={money(member?.walletCents)} sub={`${member?.points ?? 0} points · ${member?.clout ?? 0} clout`} />
        <Stat label="Cost basis" value={money(t?.costCents)} />
        <Stat label="Income received" value={money(t?.incomeCents)} sub="from published income runs" />
        <Stat label="Estimated mark" value={money(t?.markCents)} sub="not an offer" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="k-label">Positions</div>
          {!pf.data?.positions.length ? (
            <div className="mt-4"><Empty>No positions yet. <Link to="/forge" className="k-link">Draw your first card.</Link></Empty></div>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm k-num">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr><th className="py-2">Round</th><th>Status</th><th>Own</th><th>Cost</th><th>Income</th><th>Mark</th></tr>
                </thead>
                <tbody>
                  {pf.data.positions.map((p) => (
                    <tr key={p.projectId} className="border-t border-border">
                      <td className="py-2.5"><Link to={`/forge/project/${p.projectId}`} className="k-link">{p.title}</Link><div className="text-xs text-muted-foreground">{BRAND_LABEL[p.brand]} · stage {p.stage}</div></td>
                      <td>{STATUS_LABEL[p.status] ?? p.status}</td>
                      <td>{pct(p.equityBp, 3)}</td>
                      <td>{money(p.costCents)}</td>
                      <td className="text-good">{money(p.incomeCents)}</td>
                      <td title={p.markMethod}>{money(p.markCents)}<div className="text-[10px] text-muted-foreground">{p.markMethod}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="k-label">Simulated wallet</div>
            <p className="mt-2 text-xs text-muted-foreground">Adds club credit. No card is charged; nothing here is withdrawable.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1000, 5000, 20000].map((c) => (
                <Btn key={c} variant="outline" className="text-xs" loading={topUp.isPending && topUp.variables?.amountCents === c} onClick={() => memberId && topUp.mutate({ memberId, amountCents: c })}>+{money(c)}</Btn>
              ))}
            </div>
            <ErrorLine error={topUp.error} />
          </Card>
          <Card>
            <div className="k-label">Identity tier — {member?.kycStatus}</div>
            <p className="mt-2 text-xs text-muted-foreground">Simulated. In production a KYC vendor writes this, never the platform. Orbital Works requires verified or above.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Btn variant="outline" className="text-xs" loading={kyc.isPending && kyc.variables?.tier === "verified"} onClick={() => memberId && kyc.mutate({ memberId, tier: "verified" })}>Verified</Btn>
              <Btn variant="outline" className="text-xs" loading={kyc.isPending && kyc.variables?.tier === "accredited"} onClick={() => memberId && kyc.mutate({ memberId, tier: "accredited" })}>Accredited</Btn>
            </div>
          </Card>
          <Card>
            <div className="k-label">Notices</div>
            {notices.isLoading ? <Loading /> : !notices.data?.length ? <p className="mt-2 text-sm text-muted-foreground">Nothing open.</p> : (
              <ul className="mt-3 space-y-3">
                {notices.data.map((n) => (
                  <li key={n.id} className="border-t border-border pt-3 text-sm">
                    <div className="flex items-center gap-2"><span className="k-chip">{n.kind.replace("_", " ")}</span><span className="text-xs text-muted-foreground">{date(n.createdAt)}</span></div>
                    <div className="mt-1 font-semibold">{n.title}</div>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    {n.recoveryPath && <p className="mt-1 text-xs"><b>Recovery path:</b> {n.recoveryPath}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
