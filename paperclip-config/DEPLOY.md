# DEPLOY.md — Standing Paperclip up on Railway + Cloudflare

This is the dashboard-by-dashboard playbook for taking ImmigroNews's
agent control plane live. End state: `https://paperclip.immigronews.com`
serves the Paperclip dashboard, gated by Cloudflare Access (email OTP),
running on Railway, persisting state to a 5 GB volume, no public ports,
no inbound IP exposure.

Total time, end to end: ~45 minutes if nothing goes sideways.

## Pre-flight

You should already have:
- A Railway account with at least the Hobby plan ($5/mo)
- A Cloudflare account with `immigronews.com` on it
- Your GitHub `Kintupercy` account
- `gh` CLI authenticated locally
- `openssl` available locally (Mac/Linux/WSL has it; Git Bash on
  Windows has it)

You will create:
- A fork of `paperclipai/paperclip` to your account
- One Railway project with two services
- One Cloudflare Tunnel
- One Cloudflare Access application

## Cost expectation

| Item | Monthly |
|---|---|
| Railway Hobby workspace | $5 |
| Paperclip service compute (always-on small box) | ~$10–15 |
| Volume (5 GB) | ~$1.25 |
| cloudflared sidecar (low resource) | ~$2–4 |
| Cloudflare Tunnel + Access (free tier ≤50 users) | $0 |
| **Infra subtotal** | **~$18–25/mo** |

LLM costs from agent heartbeats are separate and dominate the bill —
see `IMMIGRO_OPS.md` §7 for the budgets.

---

## Phase 1 — Generate the auth secret (1 min)

Paperclip uses [BetterAuth](https://better-auth.com) and needs a 32-byte
signing secret. Generate it locally — never paste it into chat.

```bash
openssl rand -hex 32
```

That's a 64-character hex string. Copy it, you'll paste it into Railway
as a service env var in Phase 3.

**Don't reuse this secret anywhere else.** It's specific to this
Paperclip deployment. If you ever rotate it, all existing agent
sessions invalidate (which is fine — you re-login via Cloudflare Access
+ Paperclip's own auth).

---

## Phase 2 — Fork Paperclip (1 min)

```bash
gh repo fork paperclipai/paperclip --clone=false
```

This creates `github.com/Kintupercy/paperclip` as a fork. We fork (not
just point Railway at upstream) for two reasons:
1. You control when to pull updates from upstream — Paperclip is alpha,
   you don't want a breaking upstream change auto-deploying at 3am.
2. If you ever need to patch Paperclip itself (file a bug fix), the
   fork is where the patch lives.

Set the fork to **not** sync automatically with upstream. In the GitHub
fork's Settings → General, you can leave that as default; just don't
click "Sync fork" until you're ready to test the upstream change.

---

## Phase 3 — Railway: Paperclip service + volume (10 min)

### 3a. Create the project

1. Go to https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select `Kintupercy/paperclip` (the fork from Phase 2)
4. Project name: `paperclip-immigro`

Railway will auto-detect the Dockerfile and start building. Let it.

### 3b. Add the persistent volume

1. In your service, click the **"Volumes"** tab → **"New Volume"**
2. Mount path: `/paperclip` (this matches `PAPERCLIP_HOME`)
3. Size: 5 GB

This volume holds:
- Paperclip's embedded Postgres data
- Agent workspace dirs (`/paperclip/instances/default/workspaces/.../agents/`)
- Local file storage
- Encrypted secret store

If you ever need to back this up, Railway has a volume snapshot feature
on Pro plans, or you can rsync via `railway run`.

### 3c. Set env vars

The Dockerfile already sets `HOST=0.0.0.0`, `PORT=3100`,
`PAPERCLIP_HOME=/paperclip`, `NODE_ENV=production`, and
`PAPERCLIP_DEPLOYMENT_MODE=authenticated` as image defaults — you do
NOT need to re-set those in Railway. Only override if you have a
specific reason.

In the service → **"Variables"** tab, add only these:

| Variable | Value |
|---|---|
| `BETTER_AUTH_SECRET` | (paste the 64-char hex from Phase 1) |
| `BETTER_AUTH_BASE_URL` | `https://paperclip.immigronews.com` (set after Phase 4 tunnel exists) |
| `PAPERCLIP_TELEMETRY_DISABLED` | `1` |
| `DO_NOT_TRACK` | `1` |

**Port note**: despite the Dockerfile's `EXPOSE 3100`, Paperclip's
server actually listens on **`:8080`** at runtime. The Cloudflare
Tunnel public hostname must target port `8080`, not 3100.

Mark `BETTER_AUTH_SECRET` as a sealed secret if Railway gives that
option (it'll then never display the value again, only update or
delete).

> ⚠️ Do NOT add `ANTHROPIC_API_KEY` or any agent provider key here yet.
> Those go in *Paperclip's own secret store* via the Paperclip dashboard
> (Phase 6) so the per-agent runtime injection works correctly. Setting
> them as Railway env vars puts them in every process, which is broader
> than you want.

### 3d. Don't expose a public domain (yet)

In the service → **"Settings"** tab → **"Networking"** section, make
sure there is **no public domain** generated. Railway exposes services
internally over `paperclip.railway.internal`; that's how the
cloudflared sidecar will reach it in Phase 4.

If a `*.up.railway.app` domain is auto-created, **delete it now**.
Leaving Paperclip on the public internet without auth is a serious
mistake — its dashboard has full control over the agents.

### 3e. Deploy and verify

Railway should be deploying. When the build finishes (5-10 min first
time), check the **"Deployments"** tab. Logs should show Paperclip's
ASCII banner, "All checks passed", and "Starting Paperclip server..."

If the build fails, the most likely reasons are:
- Dockerfile path mismatch — check Settings → Build → Dockerfile path
- Volume not mounted at `/paperclip` — re-check Phase 3b
- Missing `BETTER_AUTH_SECRET` — re-check Phase 3c

Don't proceed until logs show the server up and listening on `:3100`.

---

## Phase 4 — Cloudflare Tunnel (10 min)

The tunnel exposes Paperclip's `:3100` to the public internet via
`paperclip.immigronews.com`, with no inbound port open on Railway.
cloudflared runs as a second Railway service inside the same project.

### 4a. Create the tunnel in Cloudflare

1. Go to https://one.dash.cloudflare.com/ → **Networks → Tunnels**
2. Click **"Create a tunnel"**
3. Connector type: **Cloudflared**
4. Tunnel name: `paperclip-tunnel`
5. **"Save tunnel"**
6. The next page shows install commands. Scroll down to find
   **"If you don't have an environment yet"** — copy the
   `cloudflared tunnel run --token eyJ...` value. The string after
   `--token` is your tunnel token. Save it for Phase 4b.
7. **Don't add a public hostname yet** — we'll do that after the
   sidecar is connected.

### 4b. Add cloudflared as a Railway service

In the same Railway project (`paperclip-immigro`):

1. Click **"+ Create"** → **"Empty service"**, name it `cloudflared`
2. Settings → **Source** → **Deploy from a Docker image**
   - Image: `cloudflare/cloudflared:latest`
3. Settings → **Deploy** → **Custom Start Command**:
   - `cloudflared tunnel --no-autoupdate run --token $CLOUDFLARED_TOKEN`
4. Variables → Add:
   - `CLOUDFLARED_TOKEN` = (the `eyJ...` token from Phase 4a, sealed)
5. Settings → **Networking** → make sure no public domain is created
   (cloudflared doesn't need an inbound — it dials out to Cloudflare)

Deploy. Logs should within ~30 seconds show:
```
INF Connection registered ... connIndex=0
INF Connection registered ... connIndex=1
...
```

### 4c. Verify in Cloudflare

Back at Cloudflare → Networks → Tunnels → `paperclip-tunnel`. The
status should now show **"HEALTHY"** with 2-4 active connections.

### 4d. Add the public hostname

1. Click into the tunnel → **"Public Hostname"** tab → **"Add a public
   hostname"**
2. Subdomain: `paperclip`
3. Domain: `immigronews.com`
4. Type: `HTTP`
5. URL: `paperclip.railway.internal:8080`
   *(this is Railway's internal DNS — works because cloudflared is in
   the same Railway project as paperclip; if Railway's internal DNS
   schema differs, it may be `paperclip-immigro.railway.internal:3100`
   — match whatever the Paperclip service's "internal hostname" reads
   in its Networking tab)*
6. Save

After ~30 seconds, https://paperclip.immigronews.com should resolve
through Cloudflare to the Paperclip service. **It will be open to the
public internet right now.** Do not visit yet without Phase 5 in
place.

---

## Phase 5 — Cloudflare Access (5 min)

Adds email-OTP auth in front of the dashboard. Without this, anyone
who finds the URL can take over the Paperclip instance.

### 5a. Create the Access application

1. https://one.dash.cloudflare.com/ → **Access → Applications** →
   **"Add an application"** → **"Self-hosted"**
2. Application name: `Paperclip Dashboard`
3. Session duration: `24 hours` (re-prompt for OTP daily)
4. Application domain: `paperclip.immigronews.com`
5. Identity providers: leave **One-time PIN** enabled (free, email-OTP)
6. **"Next"**

### 5b. Create the policy

1. Policy name: `Owner only`
2. Action: **Allow**
3. Configure rules → **Include** → **Emails** →
   add `kintupercy@gmail.com`
4. **"Next"** → **"Add application"**

### 5c. Test it

Visit `https://paperclip.immigronews.com` in a fresh browser window
(or incognito). You should:
1. See Cloudflare's login page asking for an email
2. Enter your email, get a 6-digit PIN, paste it in
3. Land on the Paperclip dashboard

If anything else (a Cloudflare error, a 502, the bare Paperclip page
without auth in front), stop and debug before continuing — you do not
want the Paperclip dashboard exposed publicly even briefly.

---

## Phase 6 — First-time Paperclip onboarding (5 min)

You're now logged into the dashboard for the first time.

### 6a. Create the company

The Dockerfile sets `PAPERCLIP_DEPLOYMENT_MODE=authenticated` by
default — Paperclip's own login layer is on. So you'll be prompted
twice to authenticate the first time you visit:
1. Cloudflare Access email-OTP (the outer gate from Phase 5)
2. Paperclip's own account creation (the inner gate)

Both layers are intentional: Cloudflare Access controls *who can reach
the URL at all*, Paperclip's own auth controls *who can act as
operator inside the dashboard*. Don't disable either.

Walk through Paperclip's onboarding wizard:
1. Set up your operator account (this is YOU, the Board) — email and
   password. Use a strong unique password (1Password generator).
2. Company name: `ImmigroNews`
3. **Skip the "create your first agent" step** — we'll do that
   manually with our own config in Phase 7.

You should land in the dashboard with `ImmigroNews` selected as the
active company and zero agents.

### 6b. Add company secrets

Paperclip → Company settings → Secrets. Add:

| Name | Value | Used by |
|---|---|---|
| `ANTHROPIC_API_KEY` | (your Anthropic key) | All agents (Claude Code adapter) |
| `SUPABASE_SERVICE_ROLE_KEY` | (the same `sb_secret_...` you put in Vault) | CTO agent |
| `SUPABASE_ACCESS_TOKEN` | (same as the GitHub Actions secret, separate token) | CTO agent (for `supabase` CLI) |
| `GITHUB_TOKEN` | (a fresh PAT scoped to `Kintupercy/immigro-news-alerts`) | CTO agent (for `gh` CLI) |
| `PERPLEXITY_API_KEY` | (already in your edge function env; reuse) | Content Director |

Don't add `RESEND_OUTREACH_API_KEY`, `TWITTER_*`, or `LINKEDIN_*` yet —
Sales Director and Content Director's outbound capabilities can wait.

---

## Phase 7 — Hire the CEO (10 min)

We onboard one agent first, watch it for 48 hours, then bring in the
others. Per `IMMIGRO_OPS.md`, the CEO is "Elon".

### 7a. Sync agent files onto the volume

The agent's working directory needs our `paperclip-config/ceo/` files
on the Railway volume. The Paperclip image already includes `git`,
`gh`, `ripgrep`, `jq`, and the Claude Code / Codex / OpenCode CLIs —
no apt-get needed.

Open a shell in the running Paperclip service from your local machine:

```bash
# One-time install if you don't have Railway CLI
npm i -g @railway/cli
railway login

# Then:
railway link    # pick the paperclip-immigro project
railway shell --service paperclip
```

Inside the shell:

```bash
mkdir -p /paperclip/repos
cd /paperclip/repos
git clone https://github.com/Kintupercy/immigro-news-alerts.git
ls /paperclip/repos/immigro-news-alerts/paperclip-config/ceo/
exit
```

You should see `SOUL.md`, `HEARTBEAT.md`, `TOOLS.md`, `AGENTS.md` in
that listing.

### 7b. Hire Elon in the dashboard

Paperclip → ImmigroNews → **+ New Agent**:

| Field | Value |
|---|---|
| Adapter | Claude Code (CLI adapter) |
| Name | Elon |
| Title | CEO |
| Reports to | (leave blank — Board) |
| Model | `claude-opus-4-7` |
| Heartbeat schedule | `0 * * * *` (top of every hour) |
| Monthly budget | **$20** (deliberately low for the first 48h) |
| Working directory | `/paperclip/repos/immigro-news-alerts/paperclip-config/ceo` |
| Boss | (none) |
| Thinking mode | extended |
| Chrome browser | disabled |
| Prompt template | (leave empty — known Paperclip alpha bug) |

Job description (paste into Capabilities field):

> Run ImmigroNews. Watch the six north-star metrics in IMMIGRO_OPS.md
> on every heartbeat. Delegate work to CTO, Sales Director, and Content
> Director through Paperclip issues with clear acceptance criteria and
> due dates. Post a weekly Board summary to Kintu on Sundays. Approve
> sensitive actions per IMMIGRO_OPS.md §6. Do not write code, do not
> send subscriber emails, do not negotiate sponsor deals.

Save. Don't trigger a heartbeat yet.

### 7c. Manually trigger one heartbeat as a smoke test

In Elon's agent page, find the **"Run heartbeat now"** button (or
equivalent). Watch the logs:

You should see:
1. The Claude Code adapter starts
2. It reads `SOUL.md`, `HEARTBEAT.md`, `TOOLS.md`, then
   `../../IMMIGRO_OPS.md` (which is two levels up from the agent dir
   → resolves correctly)
3. It runs through the heartbeat checklist
4. It either files an issue ("Set up north-star metrics dashboard")
   or writes a "first heartbeat — read everything, no actions taken"
   note to `memory/decisions.md`
5. It exits with a cost report

If it errors:
- `"ANTHROPIC_API_KEY not found"` → re-check Phase 6b
- `"permission denied on /paperclip/..."` → volume mount or container
  user mismatch — check the volume tab in Railway
- `"claude: command not found"` → Claude Code is installed globally in
  the image (`@anthropic-ai/claude-code`); if missing, the image build
  is broken — check Railway build logs
- Budget exceeded → re-check Phase 7b's $20 cap was actually applied
- Auth/login loop in the Paperclip dashboard → `BETTER_AUTH_SECRET`
  may have changed between deploys; check it's stable

### 7d. Watch for 48 hours

Don't add more agents yet. Let Elon run hourly heartbeats for 48
hours. Check the dashboard once or twice a day:

- Are heartbeats actually happening on schedule?
- Is the budget burn sane (~$0.30-1 per heartbeat is normal for Opus
  doing ~15 min of light work)?
- Is the agent generating actually-useful output, or just thrashing?
- Are any P0/P1 issues being filed?

If Elon spends >$10 in the first 24 hours doing nothing useful, **kill
the heartbeat and revise SOUL.md / HEARTBEAT.md.** Don't bring in
other agents on top of a malfunctioning CEO.

---

## Phase 8 — Onboard the rest (after 48h soak)

Once Elon is steady:

- **CTO (Ada)** — same flow, working dir
  `/paperclip/repos/immigro-news-alerts/paperclip-config/cto`,
  budget $40 first week.
- **Sales Director (Sam)** — same flow,
  `/paperclip/repos/immigro-news-alerts/paperclip-config/sales`,
  budget $20 first week. **Pre-req:** provision
  `outreach@immigronews.com` in Resend before Sam can do anything
  outbound.
- **Content Director (Cam)** — same flow,
  `/paperclip/repos/immigro-news-alerts/paperclip-config/content`,
  budget $40 first week.

Set the approval gates per `IMMIGRO_OPS.md` §6 in the Paperclip
governance settings.

---

## Phase 9 — Keeping agent files in sync

Whenever you update `paperclip-config/<role>/*.md` in this repo,
the changes need to land on the Railway volume. Two options:

**Manual** (fine for v1):
```bash
railway run --service paperclip bash
> cd /paperclip/repos/immigro-news-alerts && git pull
```

**Automated** (when this becomes annoying): add a small cron inside
the Paperclip container or a separate Railway service that runs
`git pull` every 5 min on the volume. File this as a CTO standing
task once Ada is onboarded.

---

## Rollback

If anything goes sideways during stand-up:

- **Paperclip service won't start** → check Railway logs, fix the env
  var or volume issue, redeploy. The volume persists state across
  redeploys, so you don't lose the company config.
- **Cloudflare Tunnel unhealthy** → check the cloudflared service
  logs. Usually a stale token or the wrong URL in the public hostname
  config.
- **Cloudflare Access not prompting** → re-check the Application
  domain matches `paperclip.immigronews.com` exactly, and the policy
  includes your email.
- **Agent eating budget on nothing** → in the Paperclip dashboard,
  pause the agent, revise its `HEARTBEAT.md` in this repo, push, then
  `git pull` on the volume, then resume.
- **Total nuclear** → delete the Railway project. Cloudflare Tunnel
  goes unhealthy automatically; delete it and the Access app. You're
  back to before Phase 1, no production impact (no live ImmigroNews
  surface area was ever touched).

---

## What this does NOT do

- Does not change anything on the live ImmigroNews website.
- Does not change anything in the ImmigroNews Supabase project's data
  (agents read via service_role; nothing is written without explicit
  agent action via approved issues).
- Does not affect the GitHub Actions deploy pipeline (independent).
- Does not auto-rotate the agent files on the volume — that's manual
  for now (Phase 9).

## What's next, after this is up

Per `IMMIGRO_OPS.md` and the agent onboarding sequence:

1. CEO (Elon) runs solo for 48h. Verify metrics-watching, issue-filing.
2. Add CTO (Ada). Her first standing task: wire up Phase 9 git-sync,
   add Vitest skeleton, build the `/admin` route.
3. Add Sales (Sam) + Content (Cam) in parallel.
4. After 4 weeks of clean operation, relax some approval gates per
   `IMMIGRO_OPS.md` §6.
