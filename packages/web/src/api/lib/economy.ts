import { logDecision } from "./log";
/**
 * Kinship Collective economy rules — one source of truth for the API.
 * Money is in cents. In this build nothing settles to a real processor.
 */

export const HOUSE_RATE = 0.1; // 10% of every transaction
export const RESERVE_RATE = 0.25; // share of the house take parked in the Mutual Cover Reserve
export const MAX_INVEST_CENTS = 1000; // $10 hard cap per member per project, every stage
export const ESCROW_FEE_CENTS = 20000; // $200 per project, vetted local escrow professional
export const PITCH_FEE_BASE_CENTS = 1000; // $10 floor
export const CANCEL_CLAWBACK_RATE = 0.25; // creator cancels -> 25% retained
export const ONGOING_UNLOCK_CENTS = 500; // $5 to back rounds already past stage 1
export const GRACE_DAYS = 21; // default notice -> foreclosure window

export type RiskTier = "low" | "medium" | "high";

export const RISK_FACTOR: Record<RiskTier, number> = {
  low: 1,
  medium: 1.35,
  high: 1.8,
};

export const LEVELS = [
  {
    level: 0,
    name: "Prospect",
    drawsPerWeek: 3,
    feeCents: 0,
    pointCost: 0,
    perks: ["3 draws a week", "Stage-1 rounds only", "Own scores visible to you"],
  },
  {
    level: 1,
    name: "Associate",
    drawsPerWeek: 5,
    feeCents: 900,
    pointCost: 250,
    perks: ["5 draws a week", "Comment verdicts carry weight", "Task board unlocked"],
  },
  {
    level: 2,
    name: "Operator",
    drawsPerWeek: 8,
    feeCents: 2900,
    pointCost: 1000,
    perks: ["8 draws a week", "Back ongoing rounds", "Equity Book access"],
  },
  {
    level: 3,
    name: "Syndicate",
    drawsPerWeek: 12,
    feeCents: 9900,
    pointCost: 4000,
    perks: ["12 draws a week", "Foreclosure lots first look", "Diligence panel seat"],
  },
  {
    level: 4,
    name: "Accredited Circle",
    drawsPerWeek: 25,
    feeCents: 29900,
    pointCost: 12000,
    perks: ["25 draws a week", "Score lookups on other members", "Orbital Works deep-tech track"],
  },
] as const;

export function levelConfig(level: number) {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, level))];
}

/**
 * Pitch fee: $10 base, scaled by capital goal and risk.
 * Anchor from spec: low risk + $10,000 goal = $99.
 */
export function pitchFeeCents(capitalGoalCents: number, riskTier: RiskTier) {
  const goalUsd = capitalGoalCents / 100;
  const scaled = 8900 * (goalUsd / 10000) * RISK_FACTOR[riskTier];
  const total = PITCH_FEE_BASE_CENTS + scaled;
  logDecision("pitch", "Risk-scaled fee calculated", { capitalGoalCents, riskTier, total });
  return Math.max(PITCH_FEE_BASE_CENTS, Math.min(Math.round(total / 100) * 100, 250000));
}

/** Points per $10 backed: doubles every stage, while the $10 cap stays put. */
export function pointValueForStage(stage: number) {
  return 10 * Math.pow(2, Math.max(0, stage - 1));
}

/** Equity in basis points earned by a $10 ticket, relative to the offered slice. */
export function equityBpForTicket(
  amountCents: number,
  capitalGoalCents: number,
  equityOfferedBp: number,
) {
  if (capitalGoalCents <= 0) return 0;
  return Math.max(1, Math.round((amountCents / capitalGoalCents) * equityOfferedBp));
}

export function houseFeeCents(amountCents: number) {
  return Math.round(amountCents * HOUSE_RATE);
}

/** ISO week key, e.g. 2026-W39 — the window The Draw resets on. */
export function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86400000);
}

/**
 * Trust score, 0-1000, private by default.
 * Deliberately legible: every factor is shown to the member it describes.
 */
export function trustFactors(input: {
  decisionsMade: number;
  decisionsPending: number;
  investments: number;
  tasksApproved: number;
  defaults: number;
  milestonesVerified: number;
  kycStatus: string;
  accountAgeDays: number;
}) {
  const factors = [
    {
      label: "Decision discipline",
      detail: "Draws answered instead of left hanging",
      points: Math.min(180, input.decisionsMade * 12) - Math.min(90, input.decisionsPending * 15),
      max: 180,
    },
    {
      label: "Capital at work",
      detail: "Tickets placed and held through milestones",
      points: Math.min(180, input.investments * 15),
      max: 180,
    },
    {
      label: "Contribution",
      detail: "Approved tasks: marketing, diligence, moderation",
      points: Math.min(150, input.tasksApproved * 18),
      max: 150,
    },
    {
      label: "Delivery record",
      detail: "Milestones verified on projects you run",
      points: Math.min(200, input.milestonesVerified * 25),
      max: 200,
    },
    {
      label: "Identity assurance",
      detail: "KYC tier completed with the third-party vendor",
      points:
        input.kycStatus === "accredited"
          ? 150
          : input.kycStatus === "verified"
            ? 110
            : input.kycStatus === "pending"
              ? 40
              : 0,
      max: 150,
    },
    {
      label: "Tenure",
      detail: "Days as a member in good standing",
      points: Math.min(80, Math.round(input.accountAgeDays * 1.5)),
      max: 80,
    },
    {
      label: "Defaults",
      detail: "Unresolved default notices against you",
      points: -Math.min(220, input.defaults * 110),
      max: 0,
    },
  ];
  const raw = 350 + factors.reduce((sum, f) => sum + f.points, 0);
  return { score: Math.max(0, Math.min(1000, raw)), factors };
}

export function scoreBand(score: number) {
  if (score >= 850) return { label: "Cornerstone", note: "Reserve claims fast-tracked" };
  if (score >= 700) return { label: "Trusted", note: "Grace period extended to 45 days" };
  if (score >= 550) return { label: "Standing", note: "Standard terms" };
  if (score >= 400) return { label: "Watch", note: "Escrow release in two tranches" };
  return { label: "Probation", note: "Recovery path offered before any limit applies" };
}
