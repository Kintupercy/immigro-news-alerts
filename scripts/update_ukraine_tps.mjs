import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xybpgorbkiaitimxiqej.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, KEY, { auth: { persistSession: false } });

const title = 'Ukraine TPS Ending Oct. 19, 2026: USCIS EAD Extension and I-9 Guidance';
const summary = 'USCIS will automatically extend expired TPS-based EADs for eligible Ukraine TPS recipients through Oct. 19, 2026. Here is who qualifies, what employers should verify on Form I-9 and in E-Verify, and which documents to keep on file.';

const content = `On August 14, 2026, U.S. Citizenship and Immigration Services (USCIS) published an alert confirming that the Temporary Protected Status (TPS) designation for Ukraine — along with the employment authorization and other benefits that come with it — is set to terminate on **October 19, 2026**. In the meantime, USCIS is putting a stopgap in place so that eligible Ukrainians with pending work-permit renewals are not penalized by processing backlogs. This article explains what was announced, exactly who it covers, what employers need to do for Form I-9 and E-Verify purposes, and where to find the official guidance.

## What USCIS announced

USCIS is sending notices to certain Ukraine TPS recipients informing them that their expired TPS-based Employment Authorization Documents (EADs) are **automatically extended until October 19, 2026** — the end of the Ukraine TPS designation. The notices go out both by mail and electronically to anyone who has a myUSCIS account. The extension exists because many renewal applications are still pending: without it, an applicant whose card expired while USCIS processes the renewal would have a gap in work authorization through no fault of their own.

## Who the extension applies to

The automatic extension is not universal. According to USCIS, it applies to Ukraine TPS recipients who:

- **Continue to be eligible for TPS** under the Ukraine designation;
- **Have a TPS-based EAD renewal application still pending** with USCIS; and
- **Have not yet received their renewed EAD** bearing category codes **A-12 or C-19**.

If someone's renewal has already been approved and a new card issued, or their application has been denied, this extension does not apply. Anyone unsure of their case status should check it on myUSCIS or consult an immigration attorney or accredited representative.

## What employers should verify

For Form I-9 purposes, USCIS says an employee covered by the notice may choose to present — as a **List A** combination valid until October 19, 2026 — both of the following together:

1. An EAD that shows an expiration date of **April 19, 2025** or **October 19, 2023**; and
2. **The USCIS notice** extending the EAD.

Employers should examine both documents, record them in Section 2 as they would any List A combination, and keep copies if their policy is to retain document copies. Reverification should not be triggered before the extended expiration date passes.

## Key dates and how to complete I-9 and E-Verify

When filling in the "Expiration Date (if any)" fields on Form I-9, employers must enter **"Oct. 19, 2026"** in both Section 1 and Section 2, and add a note in the Additional Information box referencing the automatic extension. Employers may also download USCIS's alert and its TPS Ukraine Automatic Employment Authorization (EAD) Extension webpage and attach them to the Form I-9 along with the employee's notice. For **E-Verify**, enter the same expiration date — **Oct. 19, 2026** — exactly as it appears on the completed Form I-9.

Key dates at a glance: the notice was released **August 14, 2026**; expired EADs dated April 19, 2025 or October 19, 2023 are extended through **October 19, 2026**, when the Ukraine TPS designation terminates.

## Official sources

- [USCIS alert: Update on Temporary Protected Status for Ukraine (Aug. 14, 2026)](https://www.uscis.gov/i-9-central/form-i-9-related-news/update-on-temporary-protected-status-for-ukraine-release-aug-14-2026)
- [USCIS Temporary Protected Status — Ukraine](https://www.uscis.gov/humanitarian/temporary-protected-status/TPS-Ukraine)
- Subscribe to Form I-9 and E-Verify updates via [Granicus Communications](https://public.govdelivery.com/accounts/USDHSCISEVERIFY/subscriber/new)

USCIS advises checking the TPS Ukraine webpage regularly, since details can change as the termination date approaches.

*This article is general legal information, not legal advice. Immigration situations vary; consult a licensed immigration attorney or a DOJ-accredited representative about your specific case. All operational instructions above are attributed to USCIS.*`;

const { data, error } = await supabase
  .from('immigration_news')
  .update({ title, summary, content, source_url: 'https://www.uscis.gov/i-9-central/form-i-9-related-news/update-on-temporary-protected-status-for-ukraine-release-aug-14-2026' })
  .eq('id', '1dfa69ea-b8f0-42c6-85e7-34256274332b')
  .select('id,title,status');

console.log(JSON.stringify({ error, data }, null, 1));
