# OpenBreak — Claude Code Context

## App
Pool tournament management platform for 8-ball, 9-ball, and 10-ball.
Multi-tenant: one organization per venue. Free for all orgs.

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Auth.js v5 (NextAuth) — credentials provider
- Prisma ORM v7 + PostgreSQL
- pnpm package manager

## Repo
- GitHub: git@github.com:jjee33/openbreak.git
- ArgoCD target: homelab-k3s/apps/openbreak/

## K3s Cluster (Production)
- Traefik ingress IP: 10.0.10.63
- Longhorn storage class: longhorn
- MetalLB pool: 10.0.10.60–99
- ArgoCD: https://10.0.10.75
- Production URL: openbreak.pro
- GitOps rule: NO direct kubectl apply — push to Git, ArgoCD syncs
- Secrets: SOPS + Age encrypted in homelab-k3s repo

## Local Dev
- DB: postgresql://openbreak:Parrot21!@localhost:5432/openbreak_dev
- Dev server: http://localhost:3000
- Run dev: pnpm dev
- Prisma studio: npx prisma studio
- Run migrations: npx prisma migrate dev

## Multi-Tenancy
- Organization: one per venue, slug used for URL routing
- OrgMember: users scoped to org (ADMIN or STAFF role)
- SUPER_ADMIN: platform-wide access
- Players: anonymous by default, can optionally claim a profile

## Bracket Formats
- SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN
- Game types: EIGHT_BALL, NINE_BALL, TEN_BALL
- Team types: INDIVIDUAL, PAIRS

## Key Conventions
- No direct kubectl apply — GitOps only via ArgoCD
- All K8s manifests in /k8s/
- Prisma migrations committed to /prisma/migrations/
- Dark mode first (Tailwind dark: prefix)
- Mobile-first responsive
- Custom SVG bracket renderer — no third-party bracket libs

## Claude Code Skills
Skills are in .claude/skills/ — reference them by folder name when needed.
- kubernetes-*, terraform-*, helm-* — use during Phase 5 K8s deployment
- systematic-debugging, test-driven-development — use during feature development
- verification-before-completion — run before any PR or deploy

## Phase Status
- Phase 1: COMPLETE (scaffold, MCP, dependencies)
- Phase 2: COMPLETE (Prisma 7, Auth.js v5, proxy.ts)
- Phase 3: COMPLETE (core features — registration, dashboard, tournaments, players, brackets)
- Phase 4: COMPLETE (public pages — homepage, search, org profiles, player profiles, nav)
- Phase 5: COMPLETE (K8s manifests, Dockerfile, GitHub Actions CI)

## K8s Manifests (k8s/)
- k8s/namespace.yaml — openbreak namespace
- k8s/deployment.yaml — Next.js app, 2 replicas, ghcr.io/jjee33/openbreak:latest
- k8s/service.yaml — ClusterIP on port 3000
- k8s/ingress-route.yaml — Traefik IngressRoute for openbreak.pro + TLS + security headers
- k8s/configmap.yaml — non-secret env vars
- k8s/postgres/ — PostgreSQL 17 StatefulSet + PVC (Longhorn 10Gi) + Service
- k8s/secrets/openbreak.sops.yaml — SOPS template (encrypt before deploying)

## Deployment
- Docker image: ghcr.io/jjee33/openbreak:latest (built on push to main via GitHub Actions)
- ArgoCD watches homelab-k3s/apps/openbreak/ — copy k8s/ manifests there
- Secrets: encrypt k8s/secrets/openbreak.sops.yaml with SOPS + Age before pushing
- Health endpoint: /api/health (used by K8s probes)

## Agentic Workflow
- Use /new-feature for end-to-end feature builds
- Use /db-migrate for safe schema changes
- Use /fix-types to resolve TypeScript errors
- Use /review before every commit
- Self-correct: after every file edit run tsc --noEmit and fix errors immediately
- Do not stop to ask questions — make reasonable decisions and proceed

## Known Gotchas
- zsh: single-quote strings containing !
- pnpm approve-builds must run from project dir
- Prisma shadow DB requires CREATEDB on openbreak user
- Next.js 16: proxy.ts not middleware.ts
- Prisma 7: import from @/generated/prisma/client not @prisma/client
- AUTH_SECRET preferred over NEXTAUTH_SECRET in Auth.js v5
