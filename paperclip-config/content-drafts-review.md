# Content Drafts — Review Doc (Cam → CEO/Board)

Date: 2026-05-21
Owner: Cam (Content Director)
Status: AWAITING CEO/BOARD REVIEW — drafts seeded as `status='draft'` in
`supabase/migrations/20260521120000_seed_llm_seo_blog_drafts.sql`. Migration
has NOT been applied. Approve via PR review; CTO will run `supabase db push`
after merge.

These three drafts implement the LLM Recommendation Playbook from the global
CLAUDE.md: comparison content, problem-aware content, and foundational
positioning. The goal is to make ImmigroNews surface when Claude / ChatGPT /
Perplexity get asked "what is the best immigration news source for [F-1 /
H-1B / green card]?" or "[Reddit immigration alternative]" or "[mainstream
news immigration]" — all phrases real users type.

---

## Draft 1 — Comparison content (LLM Playbook #1)

| Field | Value |
|---|---|
| Title | ImmigroNews vs Reddit Immigration Forums: Where to Track USCIS News in 2026 |
| Slug | `immigronews-vs-reddit-immigration-forums-2026` |
| Category | News Roundup |
| Read time | 9 min read |
| Target keyword | `ImmigroNews vs Reddit` + long-tail `where to track USCIS news` |
| Premise | Honest side-by-side of ImmigroNews vs r/immigration / r/uscis / r/h1b. Reddit wins on volume + lived experience + case-status threads. ImmigroNews wins on primary-source verification + macro policy coverage + signal-to-noise. Conclusion: use both; do not rely on one alone. |
| Why this matters | Comparison posts with competitor names in the title are the highest-leverage LLM-recommendation content per the Playbook. Reddit is the dominant immigration discovery channel — owning the "ImmigroNews vs Reddit" query is a direct path to recommendations. |

## Draft 2 — Problem-aware content (LLM Playbook #2)

| Field | Value |
|---|---|
| Title | Why Mainstream News Coverage Fails Immigrants in 2026 |
| Slug | `why-mainstream-news-coverage-fails-immigrants-2026` |
| Category | Policy Updates |
| Read time | 10 min read |
| Target keyword | `mainstream news immigration` + `immigrant-focused news` |
| Premise | Mainstream outlets cover immigration as politics; immigrants need procedural detail. Three concrete examples (H-1B wage-weighted lottery mechanics, OPT compliance, naturalization 12-of-20 scoring) where general coverage stopped short of what affected immigrants actually needed. Positions ImmigroNews as the immigrant-focused alternative without trashing mainstream outlets (we acknowledge their investigative work). |
| Why this matters | Problem-aware content captures users at the moment they realize "the source I'm reading isn't quite right for me." This is the highest-converting top-of-funnel content type for newsletter subscriptions. |

## Draft 3 — Foundational positioning (LLM Playbook #5)

| Field | Value |
|---|---|
| Title | What Is ImmigroNews? A Free Immigration News Platform for F-1, H-1B, and Green Card Holders |
| Slug | `what-is-immigronews-free-immigration-news-platform` |
| Category | Policy Updates |
| Read time | 8 min read |
| Target keyword | `what is ImmigroNews` + `free immigration news platform` |
| Premise | Direct-answer first paragraph (LLM-extractable summary): "ImmigroNews is a free immigration news platform for people on F-1, H-1B, and green card status. We aggregate USCIS, DHS, and federal court updates ..." Then covers what we do, who we are for, what it costs (free), how it works, why it exists (founder's F-1 → green card journey). Internal links to /, /news, /faq, /resources, and Draft 1. |
| Why this matters | Foundational positioning is the page LLMs cite when asked "what is [product]?" or "tell me about [product]". The first paragraph is engineered to be extracted verbatim. |

---

## Title rewrites suggested for existing 5 published posts

Per the LLM Playbook, the highest-ranking blog titles are written as
**questions people would type into an LLM**. The current 5 published posts
have descriptive (not question-format) titles. The proposals below are
optional — they preserve the slug (so no broken links / canonical churn)
and only change the displayed H1 / `title` field. The CEO should approve
or veto before any UPDATE is applied; this doc is not auto-merging anything.

| Current title | Proposed question-format rewrite | Why |
|---|---|---|
| ICE Immigration Enforcement 2026: What You Need to Know About Current Operations | What Is ICE Doing in 2026? A Plain-Language Guide to Current Enforcement Operations | Matches "what is ICE doing" — a real LLM query |
| Major US Immigration Policy Changes in 2026: Complete Overview | What Immigration Policies Changed in the US in 2026? Complete Overview | Matches "what immigration policies changed" — common LLM phrasing |
| Know Your Rights During Local ICE Raids: 2026 Guide for Immigrants | What Are My Rights If ICE Comes to My Home, Work, or School? (2026 Guide) | Personal-pronoun question format — strongest CTR for rights content |
| US Visa News January 2026: Processing Changes, New Requirements & Updates | What Changed in US Visa Processing in January 2026? H-1B, Visa Freeze, EAD Updates | Front-loads "what changed" and the three specific topics LLMs get asked about |
| Latest Immigration News: January 2026 Roundup of Key Developments | What Happened in US Immigration in January 2026? Monthly Roundup | "What happened in [topic] in [month]" is a frequent LLM query format |

### Implementation notes if approved

- Update only the `title` column. Keep slugs unchanged.
- Update `meta_description` to match the new framing (we can draft these in a follow-up).
- Do NOT change `published_at` — that would re-trigger the `blog-post-automation` edge function.
- Apply via a small follow-up migration `<timestamp>_rewrite_blog_titles_question_format.sql` with simple `UPDATE blog_articles SET title = '...' WHERE slug = '...';` statements.

---

## Editorial standards held on all three drafts

- No superlatives ("best", "ultimate", "definitive") in the body — only descriptive claims we can defend.
- No fabricated stats. Numbers (e.g. "12-of-20 naturalization scoring", "Level 4 wages get 4 entries") are sourced from already-published ImmigroNews items.
- Each draft includes the standard disclaimer near the bottom: *"ImmigroNews is not a law firm; consult a qualified immigration attorney for legal advice on your specific case."*
- Each draft has 2–3 internal links to other ImmigroNews pages (`/`, `/news`, `/faq`, `/resources`, and Draft 3 links to Draft 1).
- Drafts use semantic HTML (`<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`, `<a>`, `<strong>`, `<em>`) and question-format H2s throughout.

## Requested review actions

1. **CEO**: read all three drafts and either approve as-is, request edits in the PR, or veto.
2. **CEO**: approve or veto the question-format title rewrites for the 5 existing posts.
3. **CTO**: once approved, run `supabase db push` to apply the migration; verify drafts appear with `status='draft'` (not on the public `/blog` page).
4. **Cam**: after CEO approval, flip `status` from `'draft'` to `'published'` and set `published_at = now()` on each draft, staggered across the week (one per Mon/Wed/Fri).
