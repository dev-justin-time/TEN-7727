# Kinship Collective — Design

A multi-brand creator-investor network (web) where anyone can pitch a venture for a small fee and anyone can back it in $10 increments through a gated, game-theory-driven opportunity engine. Four cooperating brands under one trust layer, three switchable visual worlds, simulated money in this build.

## The Network (brands = separate domains/entities, one reserve)

| Brand | Route | Job | Entity posture |
|---|---|---|---|
| **Kinship Hub** | `/` `/hub` `/compliance` `/scores` | Trust layer: identity, Mutual Cover Reserve, member scores, governance votes, compliance roadmap | Parent co-op, holds the Reserve only — never touches project capital |
| **Forge Club** | `/forge` `/studio` `/exchange` `/ipdesk` | Core engine: The Draw, milestone investing, points/clout, equity resale, IP desk | Operating LLC, Reg CF/Reg D path |
| **Orbital Works** | `/orbital` | Deep-tech / space / hard-science vertical, PhD entranceway, diligence panels | Separate LLC, accredited-only track |
| **Sole Society** | `/sole` | Feet + worn-apparel creator commerce (adult content is a later, separately hosted phase) | Separate LLC, high-risk processor, third-party adult hosting in phase 2 |

The intended entity separation limits shared exposure; it is not an assurance that a halted brand cannot affect another. Reserve cover is partial, simulated and never guaranteed.

## Three visual worlds (user preference, persisted)

`data-world` on `<html>`: `underground` (default), `lab`, `prestige`. Same layout, different skin.

| Token | underground | lab | prestige |
|---|---|---|---|
| background | #0B0A0F | #07100F | #F6F1E7 |
| surface | #141220 | #0D1A19 | #FFFFFF |
| ink (text) | #F2ECFF | #D7F7F2 | #14110E |
| muted | #9A93B8 | #6E9C96 | #6B6256 |
| accent | #C6FF3D (acid) | #2BE0C8 (cyan) | #8C1D2F (oxblood) |
| accent-2 | #FF3DA5 (magenta) | #7FA1FF | #B9975B (brass) |
| border | rgba(255,255,255,.10) | rgba(43,224,200,.18) | rgba(20,17,14,.14) |

- **underground**: brutalist grid, sticker/tape edges, heavy display type, noise + scanline overlay
- **lab**: engineering grid, mono labels, data-dense tables, teal glow
- **prestige**: ivory paper, serif display, hairline rules, generous margins

## Typography

- Display: **Bebas Neue** (underground), **JetBrains Mono** (lab), **Fraunces** (prestige) — loaded from Google Fonts
- Body: **Poppins** everywhere; numerals tabular for money/points
- Hierarchy by size + weight, line-height 1.6 body / 0.95 display

## Pages

- `/` Hub landing — the network, the Reserve, the five systems, risk honesty, join
- `/join` Passport: handle, email, world preference, track (backer/creator), simulated KYC tiers
- `/forge` The Draw + backer portfolio (3 draws/wk at Level 0, decide before next unlocks)
- `/forge/pitch` Pitch submission + live fee calculator ($10 base → $99 low-risk/$10k)
- `/forge/project/:id` Project room: invest ($10 cap), milestones, investor comments (try or say bye), equity book
- `/studio` Creator dashboard: projects, milestone submissions, grace/default notices with cure paths, equity sales
- `/exchange` Points Exchange (supply/demand price) + Equity Book
- `/ipdesk` Provisional patent / copyright / trademark-intent / NDA generators, download-ready
- `/scores` Private Trust + Social score with factor breakdown; accredited can look up others
- `/house` Admin: 10% take ledger, defaults, foreclosure + redistribution into member-value features
- `/compliance` Self-sustaining compliance roadmap (escrow, KYC, securities path, DAO/token, hosting)
- `/sole`, `/orbital` Vertical landings with their own rules and live project filters

## Key flows

1. **The Draw** — backer opens `/forge`, sees exactly one unlocked opportunity, must answer YES (invest ≤$10) or BYE (permanent, no backward) before the next unlocks; 3/week at Level 0.
2. **Pitch → escrow → milestones** — creator pays risk-scaled pitch fee, project enters Stage 1, escrow professional assigned ($200/project), each verified milestone doubles point value while the $10 cap holds.
3. **Default → cure → foreclosure** — inactivity triggers a grace period and a written cure plan; unresolved projects are foreclosed and equity redistributed, funding member-value features.
4. **Points economy** — tasks and marketing earn points/clout; points trade on the Exchange at a supply/demand rate; levels unlock more draws and ongoing-round access.

## Language rules

Truthful persuasion only: every number shown is defined, every risk stated, no projections dressed as returns. A persistent banner states this build simulates all money movement.

## Architecture

oRPC procedures in `packages/web/src/api/routes/` (members, projects, draw, invest, exchange, ip, house, scores), Drizzle/SQLite schema, hooks in `src/web/queries/`, demo passport identity in localStorage (roadmap: Better Auth + KYC vendor).


## Completed web surfaces

- `/portfolio`: simulated wallet, cost basis, realized income, estimated mark (method stated), identity tier controls and notices.
- `/hub`: Reserve, clout tasks, proposals and feature voting.
- `/studio`: income reports and milestone evidence submission.
- `/house`: ledger, escrow review, grace/default/cure operations and foreclosure confirmation.
- Escrow review advances a verified stage and releases held ticket value; income runs split gross into a 10% house fee, holders' ownership share of net, and creator remainder.
- `/ipdesk`: six templates with live drafts, download, simulated attorney review, government fees separate from preparation.
- Private scores are absent from project cards, creator room summaries and the public demo member directory. This does not replace production authorization.

## Operational logging

Browser events: navigation, demo passport, theme and mutation outcomes use `[kinship:scope]`. API events: fee splits, ledger movements, pitch calculations, draw/ticket decisions, escrow reviews and permitted score lookups. Logs contain operational events, not internal reasoning, secrets or document answers. Browser logging can be disabled with `localStorage.setItem("kinship.log", "off")`.

## Verification and limitations

`verification.json` records route, browser and responsive/theme checks. `operations-verification.json` records the backing, distribution, equity, draft, grace/cure and access-rule checks. Test activity creates clearly named QA passports and rounds; seeded records were not deleted.

This remains a simulation: raw member IDs are not authenticated; multi-row financial operations need atomic transactions, idempotency and reconciliation before real funds. Expired-window foreclosure settlement was not exercised end-to-end because a newly opened 21-day window must not be bypassed. Early default and foreclosure are rejected by the API.
