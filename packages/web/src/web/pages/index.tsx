import { Link } from "wouter";
import { ArrowRight, Shield, Shuffle, Layers, Scale, Coins } from "lucide-react";
import { useBrands, useNetworkStats, useRules } from "../queries/network";
import { useReserve } from "../queries/clout";
import { Card, Loading, Stat } from "../components/bits";
import { money, num, ratio } from "../lib/format";

const SYSTEMS = [
  { icon: Shuffle, title: "The Draw", body: "One opportunity at a time, dealt at random. Yes or bye before the next unlocks. Three a week at Level 0. No going back, no backing the same round twice." },
  { icon: Layers, title: "$10 ceiling, rising points", body: "A ticket is capped at $10 per project at every stage. What grows is the points it earns: 10 at stage 1, doubling each verified milestone." },
  { icon: Coins, title: "Simulated slices", body: "Demo tickets record stated equity in basis points against what the creator offered. Income runs pay holders pro-rata. Holdings resell on the Equity Book." },
  { icon: Scale, title: "Grace before force", body: "Quiet projects get a grace notice and a written cure plan. Only after the cure window closes is anything foreclosed — and backers keep their equity." },
  { icon: Shield, title: "One Reserve, four clubs", body: "A quarter of every house fee goes to the Mutual Cover Reserve before the house keeps a cent. If one club is halted, the Reserve covers its members up to the published ratio." },
];

export default function Index() {
  const stats = useNetworkStats();
  const brands = useBrands();
  const reserve = useReserve();
  const rules = useRules();

  return (
    <div className="space-y-24">
      <section className="grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="k-deal">
          <span className="k-tape inline-block px-3 py-1 font-mono text-xs">Pitch anything legal</span>
          <h1 className="k-display mt-6 text-6xl md:text-8xl">
            Back an idea. Ten dollars at a time.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Space mining, a sock label, a kitchen that runs at night. Creators pay with equity, backers hold it, the house takes
            10% and says so. Explore simulated ownership, milestone releases and income shares. No real equity is sold here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/join" className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground">
              Get a passport <ArrowRight className="size-4" />
            </Link>
            <Link to="/forge/pitch" className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-5 py-3 font-semibold hover:border-primary">
              Pitch from $10
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.isLoading ? (
            <Loading />
          ) : (
            <>
              <Stat label="Members" value={num(stats.data?.members)} />
              <Stat label="Rounds" value={num(stats.data?.projects)} />
              <Stat label="Tickets" value={num(stats.data?.tickets)} />
              <Stat label="Backed (sim)" value={money(stats.data?.backedCents)} />
            </>
          )}
        </div>
      </section>

      <section>
        <div className="k-label">How it works</div>
        <h2 className="k-display mt-2 text-4xl md:text-5xl">Five systems, no fine print</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {SYSTEMS.map((s) => (
            <Card key={s.title}>
              <s.icon className="size-6 text-primary" />
              <div className="k-display mt-4 text-2xl">{s.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="k-label">The network</div>
        <h2 className="k-display mt-2 text-4xl md:text-5xl">Four clubs. Separate entities. One cover.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The proposed structure separates each club’s entity, accounts and books to limit shared exposure. This prototype has not formed or licensed those entities.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {brands.isLoading && <Loading />}
          {brands.data?.map((b) => (
            <Link key={b.key} to={b.key === "hub" ? "/hub" : b.key === "forge" ? "/forge" : `/${b.key}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <div className="flex items-center justify-between">
                  <span className="k-chip">{b.role}</span>
                  <span className="font-mono text-xs text-muted-foreground">{b.domain}</span>
                </div>
                <div className="k-display mt-4 text-3xl">{b.name}</div>
                <p className="mt-2 text-sm">{b.pitch}</p>
                <div className="mt-4 grid gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span><b className="text-foreground">Planned entity:</b> {b.entity}</span>
                  <span><b className="text-foreground">Design risk:</b> {b.risk}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="k-label">Mutual Cover Reserve</div>
          {reserve.isLoading ? (
            <Loading />
          ) : (
            <>
              <div className="k-display k-num mt-3 text-5xl">{money(reserve.data?.reserveCents)}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                against {money(reserve.data?.exposureCents)} of simulated escrow exposure — coverage {ratio(reserve.data?.coverageRatio ?? 0)} (target 25%; not a guarantee)
              </p>
              <p className="mt-4 text-sm">{reserve.data?.honest}</p>
            </>
          )}
        </Card>
        <Card>
          <div className="k-label">The rules, verbatim</div>
          {rules.isLoading ? (
            <Loading />
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              <li>{rules.data?.drawRule}</li>
              <li>{rules.data?.ceilingRule}</li>
              <li>{rules.data?.houseRule}</li>
            </ul>
          )}
        </Card>
      </section>

      <section className="k-card p-8 text-center md:p-14">
        <h2 className="k-display text-4xl md:text-6xl">Your first three draws are waiting.</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Starting balance is simulated club credit. Nothing here can cost you real money in this build.
        </p>
        <Link to="/join" className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Join the club <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
