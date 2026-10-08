import { useState } from "react";
import { Btn, Card, ErrorLine, Field, Loading, NeedPassport, PageHead } from "../components/bits";
import { useSession } from "../components/session";
import { useAttorneyReview, useGenerateFiling, useIpPreview, useIpTemplates, useMyFilings } from "../queries/ipdesk";
import { money } from "../lib/format";

export default function IpDeskPage() { return <NeedPassport><Desk /></NeedPassport>; }
function Desk() {
  const { memberId } = useSession();
  const templates = useIpTemplates();
  type Kind = NonNullable<typeof templates.data>[number]["kind"];
  const [kind, setKind] = useState<Kind>("nda");
  const [form, setForm] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const preview = useIpPreview(kind, form);
  const filings = useMyFilings(memberId);
  const generate = useGenerateFiling();
  const review = useAttorneyReview();
  const t = templates.data?.find((item) => item.kind === kind);
  function download(text: string, name: string) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `${name.replace(/[^a-z0-9-]/gi, "_")}.txt`; a.click(); URL.revokeObjectURL(url);
  }
  return <div>
    <PageHead kicker="Forge Club · IP Desk" title="Protect the work">Document preparation, not legal representation. No submission to a government office happens here.</PageHead>
    <Card className="mb-6 border-primary"><b>Review required.</b><p className="mt-2 text-sm text-muted-foreground">These are drafts, not legal advice. Have a licensed attorney in the relevant jurisdiction review every document before signing or filing. A review request here is a simulated queue, not an attorney engagement.</p></Card>
    {templates.isLoading ? <Loading /> : <div className="grid gap-6 lg:grid-cols-2">
      <Card><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (memberId) generate.mutate({ memberId, kind, title, formData: form }); }}>
        <Field label="Document"><select className="k-input" value={kind} onChange={(e) => { setKind(e.target.value as Kind); setForm({}); }}>{templates.data?.map((item) => <option key={item.kind} value={item.kind}>{item.title}</option>)}</select></Field>
        <p className="text-sm text-muted-foreground">{t?.blurb}</p>
        <Field label="Draft title"><input className="k-input" required minLength={2} maxLength={140} aria-label="Draft title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        {t?.fields.map((f) => <Field key={f.name} label={`${f.label}${f.required ? " *" : ""}`} help={f.help}>
          {f.type === "textarea" ? <textarea className="k-input min-h-24" aria-label={f.label} required={f.required} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} /> : f.type === "select" ? <select className="k-input" aria-label={f.label} required={f.required} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}><option value="">Select…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select> : <input className="k-input" type={f.type} aria-label={f.label} required={f.required} value={form[f.name] ?? ""} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />}
        </Field>)}
        <div className="border-t border-border pt-4 text-sm"><p>Desk preparation fee (sim): <b>{money(t?.deskFeeCents)}</b></p><p className="mt-2 text-muted-foreground">Government fee: separate, paid directly to the office. {t?.govFeeNote} Listed figures are unverified historical estimates; check the official schedule.</p></div>
        <Btn type="submit" loading={generate.isPending}>Save draft · {money(t?.deskFeeCents)}</Btn><ErrorLine error={generate.error} />
        {generate.isSuccess && <output className="text-sm text-good">Draft saved below. No filing has been made.</output>}
      </form></Card>
      <Card><div className="k-label">Live draft · not filed</div>{preview.isLoading ? <Loading /> : <pre className="mt-4 max-h-[800px] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">{preview.data?.documentText}</pre>}<ErrorLine error={preview.error} /></Card>
    </div>}
    <ErrorLine error={templates.error} />
    <h2 className="k-display mt-10 text-3xl">Your documents</h2>
    {filings.isLoading ? <Loading /> : <div className="mt-4 space-y-4">{!filings.data?.length && <p className="text-muted-foreground">No drafts yet.</p>}{filings.data?.map((f) => <Card key={f.id}><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="font-semibold">{f.title}</h3><span className="k-chip mt-2">{f.status.replaceAll("_", " ")}</span></div><div className="flex gap-2"><Btn variant="outline" onClick={() => download(f.documentText, f.title)}>Download draft</Btn><Btn disabled={f.status === "attorney_review"} loading={review.isPending} onClick={() => memberId && review.mutate({ memberId, filingId: f.id })}>Request review</Btn></div></div></Card>)}</div>}
    <ErrorLine error={filings.error ?? review.error} />{review.data && <output className="mt-4 text-sm">{review.data.message}</output>}
  </div>;
}