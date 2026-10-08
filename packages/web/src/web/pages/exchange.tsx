import { useState } from "react";
import { Link } from "wouter";
import { useBuyEquity, useBuyPoints, useCancelListing, useEquityBook, useMyListings, usePointBook, usePointRate, useSellPoints } from "../queries/exchange";
import { useSession } from "../components/session";
import { Btn, Card, Empty, ErrorLine, Loading, PageHead, Stat } from "../components/bits";
import { BRAND_LABEL, ago, money, num, pct } from "../lib/format";

export default function ExchangePage() {
  const { memberId, member } = useSession();
  const rate = usePointRate();
  const book = usePointBook();
  const eq = useEquityBook();
  const mine = useMyListings(memberId);
  const sell = useSellPoints();
  const buy = useBuyPoints();
  const cancel = useCancelListing();
  const buyEq = useBuyEquity();
  const [pts, setPts] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div>
      <PageHead kicker="Forge Club · Exchange" title="Points and equity, priced by people">
        {rate.data?.method}
      </PageHead>
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Rate (VWAP)" value={rate.isLoading ? "…" : `${rate.data?.vwapCentsPerPoint}¢`} sub="per point" />
        <Stat label="Best ask" value={rate.data?.bestAskCentsPerPoint ? `${rate.data.bestAskCentsPerPoint}¢` : "—"} />
        <Stat label="Open depth" value={num(rate.data?.openDepthPoints)} sub="points for sale" />
        <Stat label="Floor" value={`${rate.data?.floorCentsPerPoint ?? 2}¢`} sub="minimum ask" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="k-label">Points book</div>
          {book.isLoading ? <Loading /> : !book.data?.length ? <p className="mt-3 text-sm text-muted-foreground">No asks.</p> : (
            <ul className="mt-3 divide-y divide-border">
              {book.data.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-2.5 text-sm k-num">
                  <span>{num(l.points)} pts @ {l.priceCentsPerPoint}¢ <span className="text-xs text-muted-foreground">= {money(l.points * l.priceCentsPerPoint)} · @{l.sellerHandle}</span></span>
                  {memberId && l.sellerId !== memberId && <Btn variant="outline" className="py-1 text-xs" loading={buy.isPending && buy.variables?.listingId === l.id} onClick={() => buy.mutate({ memberId, listingId: l.id })}>Buy</Btn>}
                </li>
              ))}
            </ul>
          )}
          <ErrorLine error={buy.error} />
          {memberId && (
            <form className="mt-5 grid gap-2 border-t border-border pt-4" onSubmit={(e) => { e.preventDefault(); sell.mutate({ memberId, points: Number(pts), priceCentsPerPoint: Number(price) }, { onSuccess: () => { setPts(""); setPrice(""); } }); }}>
              <div className="k-label">Sell points — you hold {num(member?.points)}</div>
              <div className="grid grid-cols-2 gap-2">
                <input className="k-input" type="number" min={10} placeholder="Points" aria-label="Points to sell" value={pts} onChange={(e) => setPts(e.target.value)} required />
                <input className="k-input" type="number" min={2} max={500} placeholder="¢ per point" aria-label="Price per point in cents" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <Btn type="submit" className="text-xs" loading={sell.isPending}>List</Btn>
              <p className="text-xs text-muted-foreground">Settles in club credit only. Cash-out waits on a money-transmitter analysis — see the compliance roadmap.</p>
              <ErrorLine error={sell.error} />
            </form>
          )}
        </Card>

        <Card>
          <div className="k-label">Equity Book — secondary stakes and foreclosure lots</div>
          {eq.isLoading ? <Loading /> : !eq.data?.length ? <div className="mt-3"><Empty>No lots open. Sell from any project room where you hold a stake.</Empty></div> : (
            <ul className="mt-3 divide-y divide-border">
              {eq.data.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <Link to={`/forge/project/${l.projectId}`} className="k-link">{l.projectTitle}</Link>
                    <div className="text-xs text-muted-foreground k-num">{pct(l.equityBp, 3)} for {money(l.askCents)} · {BRAND_LABEL[l.projectBrand]} · @{l.sellerHandle}{l.isForeclosureLot && " · foreclosure lot"}</div>
                  </div>
                  {memberId && l.sellerId !== memberId && <Btn variant="outline" className="py-1 text-xs" loading={buyEq.isPending && buyEq.variables?.listingId === l.id} onClick={() => buyEq.mutate({ memberId, listingId: l.id })}>Buy</Btn>}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Equity Book opens at Operator (L2). 10% house fee on every fill.</p>
          <ErrorLine error={buyEq.error} />
        </Card>
      </div>

      {memberId && (mine.data?.points.length || mine.data?.equity.length) ? (
        <Card className="mt-6">
          <div className="k-label">Your listings</div>
          <ul className="mt-3 divide-y divide-border text-sm">
            {mine.data.points.map((l) => (
              <li key={`p${l.id}`} className="flex items-center justify-between py-2">
                <span className="k-num">{num(l.points)} pts @ {l.priceCentsPerPoint}¢ · {l.status} · {ago(l.createdAt)}</span>
                {l.status === "open" && <Btn variant="ghost" className="py-1 text-xs" loading={cancel.isPending} onClick={() => cancel.mutate({ memberId, listingId: l.id })}>Cancel</Btn>}
              </li>
            ))}
            {mine.data.equity.map((l) => <li key={`e${l.id}`} className="py-2 k-num">{pct(l.equityBp, 3)} of round #{l.projectId} for {money(l.askCents)} · {l.status}</li>)}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
