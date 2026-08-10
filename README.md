# elastic-books — obsolete

**This repository is no longer where the Elastic Admin web app is developed.**

The front-end now lives in the Ava Adminbot monorepo, under `web/`:

### 👉 https://github.com/Elastic-Admin/Ava-adminbot/tree/development/web

Everything in this repo was imported there with `git subtree add --prefix web`,
so all 242 commits of history and blame came across intact. Nothing was lost,
and there is nothing here that isn't there.

## Why

The front-end is ~5,600 lines against ~31,000 lines of Supabase edge functions.
It was 15% of the codebase carrying 100% of a second repo's overhead — its own
branch model (this repo had none), its own deploy path, its own drift. Living in
the monorepo it inherits the branch flow (`feature/*` → `development` → `main`)
and ships alongside the backend it talks to.

The `dev/` folder here was not a dev environment either: it was a hand-copied,
partly *stale* duplicate of the root, pointed at the production database. It was
dropped in the move and replaced by a real `dev.elasticadmin.com` preview
environment.

## Where things go now

| Then (here) | Now (monorepo) |
|---|---|
| Edit HTML/JS on `main`, push | Branch off `development`, PR into `development` |
| GitHub Pages + `CNAME` | Vercel project `elastic-admin-web`, root directory `web/` |
| `main` → `app.elasticadmin.com` | `main` → `app.elasticadmin.com` |
| `dev/` folder, hand-copied | `development` → `dev.elasticadmin.com` |
| — | any PR → generated preview URL |

Background and the full migration plan:
[`docs/DEV_ENVIRONMENT.md`](https://github.com/Elastic-Admin/Ava-adminbot/blob/development/docs/DEV_ENVIRONMENT.md).

## ⚠️ One thing still points here

`app.elasticadmin.com` currently still resolves to **this repo's GitHub Pages**
— the DNS cutover to Vercel is the last outstanding step. So until that record
moves, a push to `main` here would still change production.

**Don't.** Make the change in
[`Ava-adminbot/web/`](https://github.com/Elastic-Admin/Ava-adminbot/tree/development/web)
instead. Once DNS points at Vercel, this repo gets archived read-only.
