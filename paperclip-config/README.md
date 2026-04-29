# paperclip-config/

Agent personality, operating instructions, and tool grants for the four
ImmigroNews agents that run on Paperclip.

## Why this lives in git

Paperclip's official onboarding flow is dashboard-driven — you create agents
in the UI, paste their config into form fields, and the server writes files
to `~/.paperclip/instances/default/workspaces/<uuid>/agents/<role>/`. That
works for one-off setup but it means agent personalities aren't reviewable,
diffable, or recoverable if the host disk dies.

This directory is the canonical source. Each agent's working volume on the
Paperclip host is a clone (or git-sync) of the matching subdirectory below.
Changes to agent behavior happen the same way as changes to code: PR, review,
merge, then the agent picks up the new instructions on its next heartbeat.

## Layout

```
paperclip-config/
├── README.md           ← this file
├── ceo/
│   ├── AGENTS.md       ← Paperclip adapter config
│   ├── SOUL.md         ← identity, mission, KPIs
│   ├── HEARTBEAT.md    ← per-tick checklist
│   ├── TOOLS.md        ← tool/permission grants
│   ├── memory/         ← long-term memory (gitignored content)
│   └── life/           ← short-term state (gitignored content)
├── cto/   (same)
├── sales/ (same)
└── content/ (same)
```

The four `.md` files at the top of each agent dir are the durable contract.
The `memory/` and `life/` directories are runtime scratch — only their
`.gitkeep` is tracked. Real memory writes from the agent stay local to the
Paperclip host or get rsynced to a separate persistence target.

## Source of truth

Agent KPIs, budgets, and the org chart all derive from
[`IMMIGRO_OPS.md`](../IMMIGRO_OPS.md) at the repo root. When the two
disagree, `IMMIGRO_OPS.md` wins and the agent file gets corrected. Don't
update one without the other.

## How a Paperclip host consumes this

When you stand up the Paperclip server (see the deployment plan in chat
history), point each agent's working directory at:

```
/data/paperclip/agents/ceo
/data/paperclip/agents/cto
/data/paperclip/agents/sales
/data/paperclip/agents/content
```

…and seed those directories from this folder via a deploy script (rsync from
git checkout, or git clone of this repo into the volume). Every agent picks
up its `SOUL.md`, `HEARTBEAT.md`, and `TOOLS.md` at heartbeat time.

## What's NOT in here

- API keys, tokens, secrets — those live in Paperclip's encrypted secret store
  (instance secrets and company secrets). `TOOLS.md` lists which secrets each
  agent expects by name.
- Live-state memory contents — every `memory/` and `life/` is gitignored
  past `.gitkeep`.
- Model identifiers and budgets — those live in the Paperclip dashboard
  agent record, not in these files. The `AGENTS.md` adapter stub just
  documents what is configured there.
