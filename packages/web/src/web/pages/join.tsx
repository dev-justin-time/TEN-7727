import { useState } from "react";
import { useLocation } from "wouter";
import { useJoin, useMembersList } from "../queries/members";
import { useSeedRun, useSeedStatus } from "../queries/network";
import { useSession, type World } from "../components/session";
import { Btn, Card, ErrorLine, Field, Loading, PageHead } from "../components/bits";
import { money } from "../lib/format";

export default function JoinPage() {
  const [, go] = useLocation();
  const { setMemberId, world, setWorld } = useSession();
  const join = useJoin();
  const list = useMembersList();
  const seed = useSeedStatus();
  const runSeed = useSeedRun();
  const [f, setF] = useState({ displayName: "", handle: "", email: "", track: "both" as "backer" | "creator" | "both", homeBrand: "forge" as "forge" | "orbital" | "sole" | "hub", bio: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    join.mutate(
      { ...f, world, bio: f.bio || undefined },
      { onSuccess: (m) => { setMemberId(m.id); go("/forge"); } },
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <PageHead kicker="Kinship Hub · Passport" title="Get a passport">
          One identity across all four clubs. Starts at Level 0 with {money(25000)} of simulated club credit, three draws a week and a $10 per-project ceiling.
        </PageHead>
        <Card>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name">
                <input className="k-input" required aria-label="Display name" value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} />
              </Field>
              <Field label="Handle" help="lowercase, numbers, underscores">
                <input className="k-input" required aria-label="Handle" value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })} />
              </Field>
            </div>
            <Field label="Email">
              <input className="k-input" type="email" required aria-label="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Track">
                <select className="k-input" value={f.track} onChange={(e) => setF({ ...f, track: e.target.value as typeof f.track })}>
                  <option value="both">Back and pitch</option>
                  <option value="backer">Back only</option>
                  <option value="creator">Pitch only</option>
                </select>
              </Field>
              <Field label="Home club">
                <select className="k-input" value={f.homeBrand} onChange={(e) => setF({ ...f, homeBrand: e.target.value as typeof f.homeBrand })}>
                  <option value="forge">Forge Club</option>
                  <option value="orbital">Orbital Works</option>
                  <option value="sole">Sole Society</option>
                  <option value="hub">Kinship Hub</option>
                </select>
              </Field>
              <Field label="World">
                <select className="k-input" value={world} onChange={(e) => setWorld(e.target.value as World)}>
                  <option value="underground">Underground</option>
                  <option value="lab">Lab</option>
                  <option value="prestige">Prestige</option>
                </select>
              </Field>
            </div>
            <Field label="Bio (optional)">
              <textarea className="k-input" rows={2} maxLength={280} aria-label="Bio" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
            </Field>
            <p className="text-xs text-muted-foreground">
              No password in this build — the passport is a demo identity stored in this browser. Production uses real auth plus a third-party KYC vendor.
            </p>
            <Btn type="submit" loading={join.isPending}>Create passport</Btn>
            <ErrorLine error={join.error} />
          </form>
        </Card>
      </div>

      <div>
        <div className="k-label mb-3">Or step in as a demo member</div>
        <Card>
          {list.isLoading || seed.isLoading ? (
            <Loading />
          ) : !list.data?.length ? (
            <div className="text-sm">
              <p className="text-muted-foreground">The network is empty. Load seven demo members and eight live rounds.</p>
              <Btn className="mt-3" loading={runSeed.isPending} onClick={() => runSeed.mutate({ force: false })}>Load demo network</Btn>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {list.data.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{m.displayName} <span className="text-muted-foreground">@{m.handle}</span></div>
                    <div className="truncate text-xs text-muted-foreground">
                      L{m.level} · {m.role}{m.role === "admin" ? " (House desk)" : ""} · {money(m.walletCents)}
                    </div>
                  </div>
                  <Btn variant="outline" className="shrink-0 py-1.5 text-xs" onClick={() => { setMemberId(m.id); go(m.role === "admin" ? "/house" : "/forge"); }}>
                    Use
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
