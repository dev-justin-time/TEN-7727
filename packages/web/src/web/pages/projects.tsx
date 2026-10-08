import { useState } from "react";
import { Link } from "wouter";
import { useProjects } from "../queries/projects";
import { Bar, Card, Empty, ErrorLine, Loading, PageHead } from "../components/bits";
import { BRAND_LABEL, STATUS_LABEL, money, pct } from "../lib/format";

type Brand = "forge" | "orbital" | "sole";

export function ProjectGrid({ brand }: { brand?: Brand }) {
  const list = useProjects(brand ? { brand } : undefined);
  if (list.isLoading) return <Loading />;
  if (list.isError) return <ErrorLine error={list.error} />;
  if (!list.data?.length) return <Empty>No rounds here yet. <Link to="/forge/pitch" className="k-link">Pitch the first one.</Link></Empty>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.data.map((p) => (
        <Link key={p.id} to={`/forge/project/${p.id}`}>
          <Card className="h-full transition-colors hover:border-primary">
            <div className="flex flex-wrap gap-1.5">
              <span className="k-chip">{BRAND_LABEL[p.brand]}</span>
              <span className="k-chip">Stage {p.stage}</span>
              <span className={`k-chip ${p.status === "default_notice" ? "text-warn" : p.status === "live" ? "text-good" : ""}`}>{STATUS_LABEL[p.status] ?? p.status}</span>
            </div>
            <div className="k-display mt-4 text-2xl">{p.title}</div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
            <div className="mt-4"><Bar value={p.raisedCents / p.capitalGoalCents} /></div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground k-num">
              <span>{money(p.raisedCents)} of {money(p.capitalGoalCents)}</span>
              <span>{pct(p.equityOfferedBp)} offered</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">@{p.creatorHandle} · {p.backerCount} backers · {p.riskTier} risk</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const [brand, setBrand] = useState<Brand | undefined>();
  return (
    <div>
      <PageHead kicker="All clubs · Rounds" title="Every open book">
        Browsing is free. Backing goes through The Draw at L0–L1, or directly from a room once you hold ongoing-round access.
      </PageHead>
      <div className="mb-6 flex flex-wrap gap-2">
        {([undefined, "forge", "orbital", "sole"] as const).map((b) => (
          <button key={b ?? "all"} onClick={() => setBrand(b)} className={`k-chip ${brand === b ? "border-primary text-primary" : ""}`}>
            {b ? BRAND_LABEL[b] : "All"}
          </button>
        ))}
      </div>
      <ProjectGrid brand={brand} />
    </div>
  );
}
