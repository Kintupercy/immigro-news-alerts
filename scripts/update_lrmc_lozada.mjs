import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xybpgorbkiaitimxiqej.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

const id = '51ae81e2-30cc-4ff1-b783-955db726817f';
const title = 'BIA Clarifies Lozada Bar Complaint Proof for Ineffective-Assistance Motions';
const summary = 'The Board of Immigration Appeals says a motion to reopen based on ineffective assistance of counsel must include both a copy of the bar complaint and proof it was filed, unless the person explains why no complaint was filed.';
const source_url = 'https://www.justice.gov/eoir/media/1452566/dl?inline';

const content = `On July 15, 2026, the Board of Immigration Appeals (BIA) issued a precedential decision in **Matter of L-R-M-C- & V-A-M-M-, 29 I&N Dec. 757 (BIA 2026)**. The decision clarifies what evidence a person must provide when asking to reopen an immigration case based on ineffective assistance of counsel.

## What the BIA clarified

The BIA says a motion to reopen based on ineffective assistance of counsel must include **both**:

- A copy of the bar complaint filed with the appropriate disciplinary authority; and
- Proof that the complaint was actually filed.

If no bar complaint was filed, the motion must explain why not. The BIA said this requirement follows **Matter of Lozada**, the long-standing decision that sets out procedural requirements for ineffective-assistance claims in immigration proceedings.

## Why this matters

A motion to reopen is an extraordinary request asking immigration authorities to revisit a case after a decision has already been made. When the request is based on former counsel's alleged mistake or misconduct, the BIA wants enough documentation to evaluate whether the claim is genuine and whether the same conduct was reported to disciplinary authorities.

The decision says the bar complaint requirement helps deter meritless claims, reduces the risk of collusion, and helps disciplinary authorities identify possible patterns of attorney misconduct.

## What happened in this case

The respondents, a mother and minor daughter from Honduras, missed the deadline to appeal an Immigration Judge's denial of relief. They later argued that ineffective assistance of counsel caused the late appeal. The Tenth Circuit sent the case back to the BIA after noting that the Board had not clearly specified what evidence was required to show that a bar complaint had been filed.

On remand, the BIA clarified the rule: proof of mailing or a statement that a complaint was filed is not enough if the motion does not also include the substance of the complaint, or a valid explanation for not filing one.

## Practical takeaway

For people and attorneys preparing an ineffective-assistance motion to reopen, the decision points to a documentation checklist: include the respondent's detailed affidavit, show former counsel was notified and allowed to respond, and include the actual bar complaint plus proof of filing unless there is a stated reason no complaint was filed.

This is a procedural immigration decision, not a guarantee that any motion will be granted. People facing removal deadlines should speak with a licensed immigration attorney or DOJ-accredited representative about their own facts.

## Official source

- [Department of Justice / EOIR: Matter of L-R-M-C- & V-A-M-M-, 29 I&N Dec. 757 (BIA 2026)](https://www.justice.gov/eoir/media/1452566/dl?inline)

*This article is general immigration information, not legal advice. The summary above is based on the BIA decision linked in the official source.*`;

const { data, error } = await supabase
  .from('immigration_news')
  .update({ title, summary, content, source_url, category: 'legal-updates', source_verified: true })
  .eq('id', id)
  .select('id,title,summary,source_url,status,updated_at');

console.log(JSON.stringify({ error, data }, null, 2));
