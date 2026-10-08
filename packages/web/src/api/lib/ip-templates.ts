/**
 * IP Desk document templates.
 * These render complete, filing-ready drafts from member answers. They are documents,
 * not legal advice, and every one carries a review notice — the platform is not a law firm.
 */

export type FilingKind =
  | "provisional_patent"
  | "copyright_registration"
  | "trademark_intent"
  | "nda"
  | "work_for_hire"
  | "ip_assignment";

export type FieldSpec = {
  name: string;
  label: string;
  help?: string;
  type: "text" | "textarea" | "date" | "select";
  options?: string[];
  required: boolean;
};

export type TemplateSpec = {
  kind: FilingKind;
  title: string;
  blurb: string;
  /** What it actually gets you, stated without inflation. */
  outcome: string;
  govFeeNote: string;
  fields: FieldSpec[];
};

const REVIEW_NOTICE =
  "REVIEW NOTICE: This document was assembled from your answers by Kinship Collective's IP Desk, a document preparation service. It is not legal advice and no attorney-client relationship is created. Have a licensed attorney in the relevant jurisdiction review it before filing or signing. Filing fees are paid to the government office, not to Kinship Collective.";

export const TEMPLATES: TemplateSpec[] = [
  {
    kind: "provisional_patent",
    title: "Provisional Patent Application",
    blurb:
      "A USPTO provisional application: a dated, legally recognized filing that secures your priority date for 12 months while you build, test, or raise.",
    outcome:
      "A 12-month priority date and the right to say patent pending. It does not become a patent by itself — a non-provisional must be filed within 12 months or the priority lapses.",
    govFeeNote:
      "USPTO micro-entity fee is $65 as of the last check, $130 small entity, $325 large. Verify the current fee schedule at uspto.gov before filing.",
    fields: [
      { name: "inventorNames", label: "Inventor name(s)", type: "text", required: true, help: "Everyone who contributed to conception. Getting this wrong can invalidate a patent." },
      { name: "residence", label: "Inventor residence (city, state, country)", type: "text", required: true },
      { name: "inventionTitle", label: "Title of the invention", type: "text", required: true, help: "Descriptive and technical, not a brand name." },
      { name: "field", label: "Technical field", type: "text", required: true },
      { name: "problem", label: "The problem in the existing art", type: "textarea", required: true },
      { name: "summary", label: "Summary of the invention", type: "textarea", required: true },
      { name: "detailed", label: "Detailed description — how to make and use it", type: "textarea", required: true, help: "Enablement is the whole point. A reader skilled in the field must be able to build it from this text." },
      { name: "embodiments", label: "Alternative embodiments and variations", type: "textarea", required: false },
      { name: "drawings", label: "Drawing descriptions (Fig. 1, Fig. 2, ...)", type: "textarea", required: false },
      { name: "advantages", label: "Advantages over the existing art", type: "textarea", required: false },
    ],
  },
  {
    kind: "copyright_registration",
    title: "Copyright Registration Worksheet",
    blurb:
      "Everything the U.S. Copyright Office eCO form asks for, gathered and formatted, plus a deposit checklist for your work type.",
    outcome:
      "Registration creates a public record and unlocks statutory damages and attorney fees for infringement after the effective date. Copyright exists the moment you fix the work — registration is what makes it enforceable in court.",
    govFeeNote:
      "Single author, single work, not for hire: $45 as of the last check. Standard application $65. Verify at copyright.gov.",
    fields: [
      { name: "workTitle", label: "Title of work", type: "text", required: true },
      { name: "workType", label: "Type of work", type: "select", required: true, options: ["Literary work", "Visual art", "Photograph", "Sound recording", "Musical composition", "Motion picture / video", "Computer program", "Choreography", "Architectural work"] },
      { name: "authorName", label: "Author legal name", type: "text", required: true },
      { name: "authorCitizenship", label: "Author citizenship or domicile", type: "text", required: true },
      { name: "yearCompleted", label: "Year of completion", type: "text", required: true },
      { name: "published", label: "Publication status", type: "select", required: true, options: ["Unpublished", "Published"] },
      { name: "publicationDate", label: "First publication date, if published", type: "date", required: false },
      { name: "workForHire", label: "Work made for hire?", type: "select", required: true, options: ["No", "Yes"] },
      { name: "preexisting", label: "Pre-existing material included (samples, quotes, stock)", type: "textarea", required: false, help: "Anything you did not create must be excluded from the claim." },
      { name: "claimant", label: "Copyright claimant, if not the author", type: "text", required: false },
    ],
  },
  {
    kind: "trademark_intent",
    title: "Trademark Intent-to-Use Prep (§1(b))",
    blurb:
      "Mark description, class selection, and a knockout-search checklist for a USPTO intent-to-use application before you have sales.",
    outcome:
      "A prepared 1(b) application package. Registration still requires a Statement of Use once you sell in commerce, and the examiner can refuse on likelihood of confusion — a knockout search first is not optional.",
    govFeeNote:
      "TEAS filing is $350 per class as of the last check, plus $150 per class for the later Statement of Use. Verify at uspto.gov.",
    fields: [
      { name: "applicant", label: "Applicant legal name and entity type", type: "text", required: true },
      { name: "mark", label: "The mark, exactly as used", type: "text", required: true },
      { name: "markType", label: "Mark type", type: "select", required: true, options: ["Standard character (word only)", "Design / logo", "Combined word and design"] },
      { name: "goodsServices", label: "Goods and services description", type: "textarea", required: true, help: "Use the USPTO ID Manual wording where possible — free-form descriptions draw office actions." },
      { name: "classes", label: "International class(es)", type: "text", required: true },
      { name: "firstUse", label: "Intended first use date", type: "date", required: false },
      { name: "knockout", label: "Knockout search results (similar marks found)", type: "textarea", required: false },
    ],
  },
  {
    kind: "nda",
    title: "Mutual Non-Disclosure Agreement",
    blurb: "A two-way NDA for pitch conversations, diligence, and vendor talks.",
    outcome:
      "A signed contract obligating both sides to keep disclosed information confidential for a fixed term, with carve-outs courts actually enforce.",
    govFeeNote: "No filing fee. Execute by signature; keep a countersigned copy with each party.",
    fields: [
      { name: "partyA", label: "Party A legal name and address", type: "text", required: true },
      { name: "partyB", label: "Party B legal name and address", type: "text", required: true },
      { name: "purpose", label: "Purpose of disclosure", type: "textarea", required: true },
      { name: "termYears", label: "Confidentiality term in years", type: "text", required: true },
      { name: "governingLaw", label: "Governing law (state / country)", type: "text", required: true },
      { name: "effectiveDate", label: "Effective date", type: "date", required: true },
    ],
  },
  {
    kind: "work_for_hire",
    title: "Work-for-Hire / Contractor IP Agreement",
    blurb:
      "For paying a designer, developer, model, or writer — makes clear who owns the output before the work starts.",
    outcome:
      "Ownership assigned to the hiring party on payment, with a moral-rights waiver where permitted and a license fallback if assignment fails in that jurisdiction.",
    govFeeNote: "No filing fee. Sign before work begins — a retroactive assignment is a weaker document.",
    fields: [
      { name: "client", label: "Hiring party legal name", type: "text", required: true },
      { name: "contractor", label: "Contractor legal name", type: "text", required: true },
      { name: "deliverables", label: "Deliverables", type: "textarea", required: true },
      { name: "fee", label: "Fee and payment schedule", type: "text", required: true },
      { name: "creditLine", label: "Credit / portfolio rights granted to contractor", type: "text", required: false },
      { name: "governingLaw", label: "Governing law", type: "text", required: true },
      { name: "effectiveDate", label: "Effective date", type: "date", required: true },
    ],
  },
  {
    kind: "ip_assignment",
    title: "IP Assignment into the Project Entity",
    blurb:
      "Moves the IP from a founder's personal name into the project entity backers funded — the single thing most crowd-funded projects forget.",
    outcome:
      "A recorded assignment of the named IP to the entity, so the asset backers hold equity in actually owns what it claims.",
    govFeeNote:
      "Patent assignments should be recorded with the USPTO Assignment Recordation Branch (electronic recordation is currently free). Trademark assignments are recorded separately.",
    fields: [
      { name: "assignor", label: "Assignor (current owner) legal name", type: "text", required: true },
      { name: "assignee", label: "Assignee entity legal name and state", type: "text", required: true },
      { name: "ipDescription", label: "IP being assigned (applications, serial numbers, works)", type: "textarea", required: true },
      { name: "consideration", label: "Consideration (equity, cash, or both)", type: "text", required: true },
      { name: "governingLaw", label: "Governing law", type: "text", required: true },
      { name: "effectiveDate", label: "Effective date", type: "date", required: true },
    ],
  },
];

export function templateFor(kind: FilingKind) {
  return TEMPLATES.find((t) => t.kind === kind);
}

const v = (data: Record<string, string>, key: string, fallback = "[not provided]") =>
  data[key]?.trim() ? data[key].trim() : fallback;

const today = () => new Date().toISOString().slice(0, 10);

export function renderDocument(kind: FilingKind, data: Record<string, string>) {
  const head = (title: string) =>
    `${title}\nPrepared ${today()} via Kinship Collective IP Desk\n${"=".repeat(64)}\n`;

  let body = "";

  if (kind === "provisional_patent") {
    body = `${head("PROVISIONAL APPLICATION FOR PATENT COVER SHEET")}
TITLE OF INVENTION: ${v(data, "inventionTitle")}
INVENTOR(S): ${v(data, "inventorNames")}
RESIDENCE: ${v(data, "residence")}
ENTITY STATUS: Micro / small entity — verify eligibility on USPTO form SB/15A or SB/15B.

SPECIFICATION

1. TECHNICAL FIELD
${v(data, "field")}

2. BACKGROUND AND PROBLEM IN THE EXISTING ART
${v(data, "problem")}

3. SUMMARY OF THE INVENTION
${v(data, "summary")}

4. BRIEF DESCRIPTION OF THE DRAWINGS
${v(data, "drawings", "No drawings submitted with this provisional application.")}

5. DETAILED DESCRIPTION — MAKING AND USING THE INVENTION
${v(data, "detailed")}

6. ALTERNATIVE EMBODIMENTS
${v(data, "embodiments", "The description above is not limiting; equivalents apparent to a person skilled in the art are contemplated.")}

7. ADVANTAGES OVER THE EXISTING ART
${v(data, "advantages", "[not provided]")}

8. STATEMENT OF ENABLEMENT
The foregoing description sets out the invention in sufficient detail to enable a person of ordinary skill in the relevant field to make and use it without undue experimentation.

FILING CHECKLIST
[ ] Cover sheet (USPTO form SB/16) completed
[ ] Specification (this document)
[ ] Drawings, if any, in black ink on white
[ ] Micro-entity certification, if claiming that rate
[ ] Filing fee paid through USPTO Patent Center
[ ] Calendar the 12-month non-provisional deadline: ${new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)}
`;
  } else if (kind === "copyright_registration") {
    body = `${head("COPYRIGHT REGISTRATION WORKSHEET (U.S. COPYRIGHT OFFICE eCO)")}
TITLE OF WORK: ${v(data, "workTitle")}
TYPE OF WORK: ${v(data, "workType")}

AUTHOR
Name: ${v(data, "authorName")}
Citizenship / domicile: ${v(data, "authorCitizenship")}
Work made for hire: ${v(data, "workForHire", "No")}
Year work was completed: ${v(data, "yearCompleted")}

PUBLICATION
Status: ${v(data, "published")}
Date of first publication: ${v(data, "publicationDate", "N/A — unpublished")}

CLAIMANT
${v(data, "claimant", "Same as author named above.")}

LIMITATION OF CLAIM — MATERIAL EXCLUDED
${v(data, "preexisting", "None. All material in the deposit is original to the author named above.")}

DEPOSIT CHECKLIST
[ ] Deposit copy in an accepted format for a ${v(data, "workType").toLowerCase()}
[ ] Title matches the deposit exactly
[ ] Pre-existing material excluded from the claim
[ ] Correspondence address and phone entered in eCO
[ ] Filing fee paid at copyright.gov
`;
  } else if (kind === "trademark_intent") {
    body = `${head("TRADEMARK APPLICATION PREP — INTENT TO USE, 15 U.S.C. §1051(b)")}
APPLICANT: ${v(data, "applicant")}
MARK: ${v(data, "mark")}
MARK TYPE: ${v(data, "markType")}
INTERNATIONAL CLASS(ES): ${v(data, "classes")}

GOODS AND SERVICES
${v(data, "goodsServices")}

BASIS FOR FILING
Section 1(b) — applicant has a bona fide intention to use the mark in commerce. Intended first use: ${v(data, "firstUse", "not yet determined")}.

KNOCKOUT SEARCH FINDINGS
${v(data, "knockout", "No search recorded. Do not file before searching TESS and common-law use — this is the most common and most expensive mistake at this stage.")}

FILING CHECKLIST
[ ] TESS and common-law knockout search completed
[ ] Specimen plan for the later Statement of Use
[ ] Class fee per class paid through TEAS
[ ] Docket the 6-month Notice of Allowance response window
`;
  } else if (kind === "nda") {
    body = `${head("MUTUAL NON-DISCLOSURE AGREEMENT")}
This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of ${v(data, "effectiveDate", today())} between:

Party A: ${v(data, "partyA")}
Party B: ${v(data, "partyB")}

1. PURPOSE. The parties wish to explore ${v(data, "purpose")} and may disclose confidential information to one another for that purpose.

2. CONFIDENTIAL INFORMATION means non-public information disclosed by one party (the "Discloser") to the other (the "Recipient"), in any form, that is marked confidential or that a reasonable person would understand to be confidential.

3. OBLIGATIONS. The Recipient shall (a) use Confidential Information solely for the Purpose, (b) protect it with at least the care it uses for its own confidential information, and (c) disclose it only to employees, contractors, and advisors bound by equivalent obligations.

4. EXCLUSIONS. This Agreement does not apply to information that is or becomes public through no fault of the Recipient, was already known to the Recipient without obligation, is independently developed without use of the Confidential Information, or is rightfully received from a third party without restriction.

5. COMPELLED DISCLOSURE. The Recipient may disclose Confidential Information as required by law or court order, provided it gives the Discloser prompt notice where lawful so the Discloser may seek protection.

6. TERM. The obligations in this Agreement survive for ${v(data, "termYears", "3")} year(s) from the Effective Date.

7. NO LICENSE. Nothing here transfers any ownership, license, or right in intellectual property. All Confidential Information remains the property of the Discloser.

8. NO OBLIGATION. Neither party is obligated to proceed with any transaction.

9. RETURN. On written request, the Recipient shall return or destroy Confidential Information, except for one archival copy retained for compliance purposes and copies in routine backups.

10. REMEDIES. The parties agree that breach may cause irreparable harm for which monetary damages are inadequate, and that injunctive relief is an appropriate remedy in addition to any other available at law.

11. GOVERNING LAW. This Agreement is governed by the laws of ${v(data, "governingLaw")}, without regard to its conflict-of-laws rules.

12. ENTIRE AGREEMENT. This Agreement is the entire understanding between the parties on this subject and may be amended only in a writing signed by both.

PARTY A                                  PARTY B

______________________________           ______________________________
Signature                                Signature

Name:                                    Name:
Title:                                   Title:
Date:                                    Date:
`;
  } else if (kind === "work_for_hire") {
    body = `${head("WORK-FOR-HIRE AND INTELLECTUAL PROPERTY AGREEMENT")}
Effective ${v(data, "effectiveDate", today())} between ${v(data, "client")} ("Client") and ${v(data, "contractor")} ("Contractor").

1. SERVICES. Contractor shall deliver:
${v(data, "deliverables")}

2. COMPENSATION. ${v(data, "fee")}

3. WORK MADE FOR HIRE. The deliverables are commissioned as works made for hire under 17 U.S.C. §101 and, upon creation, are owned by Client.

4. ASSIGNMENT FALLBACK. To the extent any deliverable does not qualify as a work made for hire, Contractor irrevocably assigns to Client all right, title, and interest in it, including all copyrights, patent rights, and trade secrets, and agrees to execute any documents needed to perfect or record that assignment.

5. MORAL RIGHTS. To the extent permitted by applicable law, Contractor waives moral rights in the deliverables. Where waiver is not permitted, Contractor grants Client an unrestricted license to exercise those rights.

6. PRE-EXISTING AND THIRD-PARTY MATERIAL. Contractor shall identify in writing any pre-existing or third-party material incorporated in a deliverable and grants Client a perpetual, worldwide, royalty-free license to use it as part of that deliverable.

7. WARRANTIES. Contractor warrants the deliverables are original, that Contractor has the right to grant the rights in this Agreement, and that the deliverables do not knowingly infringe the rights of any third party.

8. CREDIT AND PORTFOLIO. ${v(data, "creditLine", "Contractor may display the deliverables in a personal portfolio after public release, unless Client requests otherwise in writing.")}

9. INDEPENDENT CONTRACTOR. Contractor is an independent contractor, not an employee, and is responsible for their own taxes and insurance.

10. CONFIDENTIALITY. Contractor shall keep Client's non-public information confidential during and after the engagement.

11. GOVERNING LAW. ${v(data, "governingLaw")}.

CLIENT                                   CONTRACTOR

______________________________           ______________________________
Name:                                    Name:
Date:                                    Date:
`;
  } else {
    body = `${head("INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT")}
Effective ${v(data, "effectiveDate", today())}.

ASSIGNOR: ${v(data, "assignor")}
ASSIGNEE: ${v(data, "assignee")}

1. ASSIGNMENT. For the consideration described below, Assignor hereby irrevocably sells, assigns, and transfers to Assignee all right, title, and interest, worldwide, in and to the following intellectual property, together with all rights to sue and recover for past infringement:

${v(data, "ipDescription")}

2. CONSIDERATION. ${v(data, "consideration")}

3. FURTHER ASSURANCES. Assignor shall execute all documents and take all actions reasonably requested by Assignee to perfect, record, prosecute, or enforce the assigned rights, including recordation with the USPTO Assignment Recordation Branch and any foreign registry.

4. REPRESENTATIONS. Assignor represents that it is the sole owner of the assigned IP, that the IP is free of liens and encumbrances, and that no license or option in the IP has been granted to any third party except as disclosed in writing to Assignee.

5. NO ENCUMBRANCE ON MEMBERS' INTEREST. Assignor acknowledges that backers hold equity in Assignee in reliance on this assignment, and that any conflicting transfer of the assigned IP is void.

6. GOVERNING LAW. ${v(data, "governingLaw")}.

ASSIGNOR                                 ASSIGNEE

______________________________           ______________________________
Name:                                    Name:
Date:                                    Date:

RECORDATION CHECKLIST
[ ] Patent assignments recorded electronically with the USPTO
[ ] Trademark assignments recorded with the USPTO Assignment Center
[ ] Copyright transfers recorded with the U.S. Copyright Office (recommended for priority)
[ ] Signed copy filed in the project room for backers to inspect
`;
  }

  return `${body}\n${"-".repeat(64)}\n${REVIEW_NOTICE}\n`;
}
