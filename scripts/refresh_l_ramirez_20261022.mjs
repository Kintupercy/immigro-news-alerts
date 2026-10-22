import { createClient } from '@supabase/supabase-js';

const id = '1f56ba18-996e-46d0-b4c9-c2afb32e1f93';
const source = 'https://www.justice.gov/eoir/media/1466591/dl?inline';
const index = 'https://www.justice.gov/eoir/volume-30';
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing database service key');
const db = createClient('https://xybpgorbkiaitimxiqej.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const content = `The Board of Immigration Appeals ruled on October 16, 2026 that filing a prima facie approvable U visa petition does not create a presumption that an immigration judge will pause removal proceedings. In Matter of L. RAMIREZ, 30 I&N Dec. 157 (BIA 2026), the Board overruled the continuance standard in Matter of Sanchez Sosa. The decision concerns requests to continue removal proceedings while a visa petition is pending; it does not say that U visa petitions are automatically denied.

## What did the Board decide?

An immigration judge considering a continuance based on a pending visa petition or future visa availability must assess good cause under the balancing test in Matter of L-A-B-R-. The Board said the main considerations are whether the person is likely to obtain the other relief and whether it would materially affect the removal case. Other relevant factors include diligence, DHS's position, the requested delay's length and the case's procedural history. The Board said good cause does not exist if visa availability is remote.

In this case, the Board acknowledged that the main factors favored the respondent, but said the indefinite, lengthy continuance request and DHS's opposition weighed strongly against another delay. It dismissed his appeal. The decision also reaffirmed Matter of Quintero: a person is not entitled to delay completion of removal proceedings solely to wait for a visa to become available.

## What should readers take from this?

A pending U visa petition does not by itself guarantee a postponement of immigration court proceedings. The decision requires a case-specific balancing of relevant factors, rather than a blanket rule that every request must be denied. If you have a pending petition and removal proceedings, discuss the record and any deadlines with a licensed immigration attorney or DOJ-accredited representative; this article cannot assess your case.

For the full holding, read the [official BIA decision](${source}) and the [DOJ EOIR Volume 30 decision index](${index}).

This is general information, not legal advice.`;
const patch = {
  title: 'U Visa and Immigration Court Delays: What Matter of L. RAMIREZ Changes',
  summary: 'The BIA says a pending U visa petition no longer creates a presumption of a continuance in removal proceedings. Judges must weigh good cause case by case.',
  content,
  source_url: source,
  source_verified: true,
  category: 'refugees-asylees',
  updated_at: new Date().toISOString(),
};
const { data: before, error: beforeError } = await db.from('immigration_news').select('id,status,title,source_url,source_verified').eq('id', id).single();
if (beforeError || before?.status !== 'published' || !before.title.includes('L. RAMIREZ')) throw new Error('Unexpected target: '+JSON.stringify({before,beforeError}));
const { error: writeError } = await db.from('immigration_news').update(patch).eq('id', id).select('id').single();
if (writeError) throw writeError;
const { data: after, error: readError } = await db.from('immigration_news').select('id,status,title,summary,content,source_url,source_verified,category,updated_at').eq('id',id).single();
if (readError || after.status !== 'published' || Object.entries(patch).some(([key,value]) => key !== 'updated_at' && after[key] !== value)) throw new Error('Readback mismatch: '+JSON.stringify({readError,id:after?.id}));
console.log(JSON.stringify({before, after: {id:after.id,status:after.status,title:after.title,summary:after.summary,source_url:after.source_url,source_verified:after.source_verified,category:after.category,content_match:after.content===content,updated_at:after.updated_at}},null,2));
