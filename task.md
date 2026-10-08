# Task: authenticated backend completion (approved plan: /home/user/kinship-backend-plan.md)

## Status
- [x] Install better-auth@1.6.19, @better-auth/expo@1.6.19, @runablehq/managed-auth@0.4.0
- [ ] Auth config + generated schema + mount + middleware (public / member / admin bases)
- [ ] Schema: members.authUserId (unique), audit_events, idempotency_keys, wallet_entries,
      equity_positions, identity_requests; review metadata on milestones/tasks; governance columns;
      investments.kind + held_cents; unique indexes (draws, votes, feature votes, distributions)
- [ ] Backfill: equity positions (creator = 10000 - crowd), held cents, secondary rows tagged
- [ ] Services (lib/services/*): wallet, ledger/fees, idempotency, audit, tickets, equity, escrow
- [ ] Rewrite routes onto authed bases; no client-supplied member ids
- [ ] Admin bootstrap CLI (scripts/grant-admin.ts)
- [ ] Web: auth client, session provider, /join tabs + onboarding, query hooks, pages
- [ ] Isolated integration tests (file: DB) incl. rollback/replay/concurrency/foreclosure
- [ ] Live API + browser tests, typecheck/lint/build, deliver

## Decisions
- Equity ownership authority = equity_positions (creator holds an explicit row; project total = 10000 bp).
- Escrow held per primary ticket in investments.held_cents; projects.raised_cents stays historical.
- Service fees (pitch, level, unlock, IP desk): wallet −F → house (F − reserve) + reserve (2.5% of F). No double count.
- Trades: buyer −G, seller +G−fee, house fee−reserve, reserve 25% of fee.
- $200 retainer recorded as kind escrow_retainer, bucket "vendor" (not member exposure).
- Historical anomalies (duplicate task reward ledger rows, foreclosure-lot mint risk) surfaced by reconciliation, not rewritten.
