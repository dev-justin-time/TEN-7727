import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

/**
 * Kinship Collective schema.
 * All monetary values are stored in cents. In this build no real money moves —
 * wallets, escrow and payouts are simulated ledger entries.
 */

export const members = sqliteTable(
  "members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    handle: text("handle").notNull().unique(),
    displayName: text("display_name").notNull(),
    email: text("email").notNull().unique(),
    /** member | creator | admin — creators can also back projects */
    role: text("role").notNull().default("member"),
    /** 0 Prospect, 1 Associate, 2 Operator, 3 Syndicate, 4 Accredited Circle */
    level: integer("level").notNull().default(0),
    points: integer("points").notNull().default(0),
    clout: integer("clout").notNull().default(0),
    walletCents: integer("wallet_cents").notNull().default(25000),
    /** none | pending | verified | accredited */
    kycStatus: text("kyc_status").notNull().default("none"),
    /** private scores, 0-1000 */
    trustScore: integer("trust_score").notNull().default(500),
    socialScore: integer("social_score").notNull().default(500),
    /** underground | lab | prestige */
    world: text("world").notNull().default("underground"),
    /** forge | orbital | sole | hub */
    homeBrand: text("home_brand").notNull().default("forge"),
    bio: text("bio"),
    /** paid unlock for backing ongoing (non-stage-1) rounds */
    ongoingAccess: integer("ongoing_access", { mode: "boolean" }).notNull().default(false),
    /** Better Auth user that owns this passport. Null for unclaimed seeded/QA passports. */
    authUserId: text("auth_user_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("members_handle_idx").on(t.handle), uniqueIndex("members_auth_user_uq").on(t.authUserId)],
);

export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    creatorId: integer("creator_id").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    /** forge | orbital | sole */
    brand: text("brand").notNull().default("forge"),
    /** deep_tech | space | software | consumer | apparel | worn_apparel | media | service | other */
    category: text("category").notNull().default("other"),
    /** low | medium | high */
    riskTier: text("risk_tier").notNull().default("low"),
    capitalGoalCents: integer("capital_goal_cents").notNull(),
    pitchFeeCents: integer("pitch_fee_cents").notNull(),
    /** video | deck | drawing | prototype | writeup */
    pitchFormat: text("pitch_format").notNull().default("writeup"),
    pitchUrl: text("pitch_url"),
    /** live | funded | default_notice | foreclosed | redistributed | cancelled | closed */
    status: text("status").notNull().default("live"),
    /** 1..5 — point value doubles each stage, $10 cap never moves */
    stage: integer("stage").notNull().default(1),
    raisedCents: integer("raised_cents").notNull().default(0),
    backerCount: integer("backer_count").notNull().default(0),
    /** equity offered to the crowd, in basis points (10000 = 100%) */
    equityOfferedBp: integer("equity_offered_bp").notNull().default(1000),
    equityAllocatedBp: integer("equity_allocated_bp").notNull().default(0),
    escrowVendor: text("escrow_vendor"),
    escrowFeeCents: integer("escrow_fee_cents").notNull().default(20000),
    escrowStatus: text("escrow_status").notNull().default("pending"),
    lastActivityAt: integer("last_activity_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    graceUntil: integer("grace_until", { mode: "timestamp" }),
    defaultReason: text("default_reason"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("projects_status_idx").on(t.status), index("projects_creator_idx").on(t.creatorId)],
);

export const milestones = sqliteTable(
  "milestones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").notNull(),
    stage: integer("stage").notNull(),
    title: text("title").notNull(),
    requirement: text("requirement").notNull(),
    /** points awarded per $10 backed at this stage: 10, 20, 40, 80, 160 */
    pointValue: integer("point_value").notNull(),
    /** locked | open | submitted | verified | failed */
    status: text("status").notNull().default("locked"),
    evidence: text("evidence"),
    dueAt: integer("due_at", { mode: "timestamp" }),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
    submittedAt: integer("submitted_at", { mode: "timestamp" }),
    reviewerId: integer("reviewer_id"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
    reviewNote: text("review_note"),
  },
  (t) => [index("milestones_project_idx").on(t.projectId)],
);

export const investments = sqliteTable(
  "investments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").notNull(),
    memberId: integer("member_id").notNull(),
    amountCents: integer("amount_cents").notNull(),
    pointsAwarded: integer("points_awarded").notNull(),
    equityBp: integer("equity_bp").notNull().default(0),
    stage: integer("stage").notNull(),
    houseFeeCents: integer("house_fee_cents").notNull(),
    /** held | released | refunded | clawback_settled */
    escrowStatus: text("escrow_status").notNull().default("held"),
    /** primary (ticket into escrow) | secondary (historical resale row, pre-ledger) */
    kind: text("kind").notNull().default("primary"),
    /** cents still held in simulated escrow for this ticket; 0 once released/refunded/settled */
    heldCents: integer("held_cents").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("investments_member_idx").on(t.memberId),
    index("investments_project_idx").on(t.projectId),
  ],
);

/** The Draw — one decision at a time, no going backward. */
export const draws = sqliteTable(
  "draws",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull(),
    projectId: integer("project_id").notNull(),
    weekKey: text("week_key").notNull(),
    /** pending | yes | bye */
    decision: text("decision").notNull().default("pending"),
    drawnAt: integer("drawn_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    decidedAt: integer("decided_at", { mode: "timestamp" }),
  },
  (t) => [
    index("draws_member_week_idx").on(t.memberId, t.weekKey),
    uniqueIndex("draws_member_project_uq").on(t.memberId, t.projectId),
    uniqueIndex("draws_one_pending_uq").on(t.memberId).where(sql`decision = 'pending'`),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").notNull(),
    memberId: integer("member_id").notNull(),
    body: text("body").notNull(),
    /** neutral | try | bye — the verdict attached to a comment */
    verdict: text("verdict").notNull().default("neutral"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("comments_project_idx").on(t.projectId)],
);

/** Points Exchange — price discovered by open asks and fills. */
export const pointListings = sqliteTable("point_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sellerId: integer("seller_id").notNull(),
  points: integer("points").notNull(),
  priceCentsPerPoint: integer("price_cents_per_point").notNull(),
  /** open | filled | cancelled */
  status: text("status").notNull().default("open"),
  buyerId: integer("buyer_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  filledAt: integer("filled_at", { mode: "timestamp" }),
});

/** Equity Book — creators and backers resell project equity. */
export const equityListings = sqliteTable("equity_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  equityBp: integer("equity_bp").notNull(),
  askCents: integer("ask_cents").notNull(),
  /** open | filled | cancelled | foreclosed_lot */
  status: text("status").notNull().default("open"),
  buyerId: integer("buyer_id"),
  /** member (seller keeps proceeds) | foreclosure (proceeds go to the feature fund) */
  lotKind: text("lot_kind").notNull().default("member"),
  filledAt: integer("filled_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Every cent that touches the platform, including the 10% house take. */
export const ledger = sqliteTable(
  "ledger",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** pitch_fee | house_fee | escrow_fee | level_up | ongoing_unlock | points_trade |
     *  equity_trade | investment | refund | clawback | redistribution | reserve_contribution |
     *  feature_funding | task_reward */
    kind: text("kind").notNull(),
    amountCents: integer("amount_cents").notNull(),
    memberId: integer("member_id"),
    projectId: integer("project_id"),
    /** house | reserve | member | creator | escrow | feature_fund */
    bucket: text("bucket").notNull().default("house"),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("ledger_kind_idx").on(t.kind)],
);

/** Grace periods, default notices and cure paths — accommodation is policy. */
export const notices = sqliteTable(
  "notices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id"),
    memberId: integer("member_id").notNull(),
    /** grace | default_notice | cure_plan | foreclosure | reinstatement | reserve_claim */
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    recoveryPath: text("recovery_path"),
    dueAt: integer("due_at", { mode: "timestamp" }),
    resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("notices_member_idx").on(t.memberId)],
);

/** Clout tasks: marketing, diligence, referrals. */
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  projectId: integer("project_id"),
  /** marketing | diligence | referral | moderation | translation */
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  proof: text("proof"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
  cloutAwarded: integer("clout_awarded").notNull().default(0),
  /** claimed | submitted | approved | rejected (rejected may be resubmitted) */
  status: text("status").notNull().default("claimed"),
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  reviewerId: integer("reviewer_id"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewNote: text("review_note"),
  revisionCount: integer("revision_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** IP Desk filings generated from templates. */
export const ipFilings = sqliteTable("ip_filings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull(),
  projectId: integer("project_id"),
  /** provisional_patent | copyright_registration | trademark_intent | nda | work_for_hire | ip_assignment */
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  /** JSON blob of the answers used to render the document */
  formData: text("form_data").notNull(),
  documentText: text("document_text").notNull(),
  /** draft | generated | attorney_review | filed */
  status: text("status").notNull().default("generated"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Governance votes at the Hub layer. */
export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  /** open | passed | rejected */
  status: text("status").notNull().default("open"),
  yesWeight: integer("yes_weight").notNull().default(0),
  noWeight: integer("no_weight").notNull().default(0),
  closesAt: integer("closes_at", { mode: "timestamp" }),
  authorId: integer("author_id"),
  voterCount: integer("voter_count").notNull().default(0),
  /** why it passed or failed once finalized */
  outcomeNote: text("outcome_note"),
  finalizedAt: integer("finalized_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const votes = sqliteTable(
  "votes",
  {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: integer("proposal_id").notNull(),
  memberId: integer("member_id").notNull(),
  choice: text("choice").notNull(),
  weight: integer("weight").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("votes_member_uq").on(t.proposalId, t.memberId)],
);

/** Member-value features funded by failed assets and the house take. */
export const features = sqliteTable("features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fundedCents: integer("funded_cents").notNull().default(0),
  targetCents: integer("target_cents").notNull(),
  /** proposed | funding | building | shipped */
  status: text("status").notNull().default("funding"),
  votes: integer("votes").notNull().default(0),
});


/** Income-share runs: creator reports revenue, holders are paid pro-rata through escrow (simulated). */
export const distributions = sqliteTable(
  "distributions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").notNull(),
    /** e.g. "2026-09" — one run per project per period */
    period: text("period").notNull(),
    grossCents: integer("gross_cents").notNull(),
    houseCents: integer("house_cents").notNull(),
    holdersCents: integer("holders_cents").notNull(),
    creatorCents: integer("creator_cents").notNull(),
    holderCount: integer("holder_count").notNull().default(0),
    /** total crowd equity at the time of the run, in basis points */
    crowdBp: integer("crowd_bp").notNull().default(0),
    note: text("note"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("distributions_project_idx").on(t.projectId),
    uniqueIndex("distributions_period_uq").on(t.projectId, t.period),
  ],
);

/** One vote per member per feature. */
export const featureVotes = sqliteTable(
  "feature_votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    featureId: integer("feature_id").notNull(),
    memberId: integer("member_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("feature_votes_uq").on(t.featureId, t.memberId)],
);

/** Authoritative ownership: every project's positions sum to 10,000 bp (creator holds the rest). */
export const equityPositions = sqliteTable(
  "equity_positions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id").notNull(),
    memberId: integer("member_id").notNull(),
    equityBp: integer("equity_bp").notNull().default(0),
    /** what this member paid for the position (primary tickets + secondary purchases) */
    costCents: integer("cost_cents").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("equity_positions_uq").on(t.projectId, t.memberId), index("equity_positions_member_idx").on(t.memberId)],
);

/** Every simulated wallet movement after the authenticated backend shipped, with balance after. */
export const walletEntries = sqliteTable(
  "wallet_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull(),
    deltaCents: integer("delta_cents").notNull(),
    balanceAfterCents: integer("balance_after_cents").notNull(),
    reason: text("reason").notNull(),
    projectId: integer("project_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("wallet_entries_member_idx").on(t.memberId)],
);

/** Retried financial requests return the first outcome; a changed payload cannot reuse a key. */
export const idempotencyKeys = sqliteTable(
  "idempotency_keys",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull(),
    scope: text("scope").notNull(),
    key: text("key").notNull(),
    fingerprint: text("fingerprint").notNull(),
    response: text("response").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("idempotency_uq").on(t.memberId, t.scope, t.key)],
);

/** Append-only application audit trail. No update or delete path exists in the API. */
export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorMemberId: integer("actor_member_id"),
    actorUserId: text("actor_user_id"),
    action: text("action").notNull(),
    /** accepted | rejected */
    outcome: text("outcome").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    summary: text("summary").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("audit_action_idx").on(t.action), index("audit_actor_idx").on(t.actorMemberId)],
);

/** Simulated identity/accreditation requests reviewed by an administrator. Not real verification. */
export const identityRequests = sqliteTable(
  "identity_requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull(),
    /** verified | accredited */
    tier: text("tier").notNull(),
    statement: text("statement").notNull(),
    /** pending | approved | rejected */
    status: text("status").notNull().default("pending"),
    reviewerId: integer("reviewer_id"),
    reviewNote: text("review_note"),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("identity_one_pending_uq").on(t.memberId).where(sql`status = 'pending'`)],
);
