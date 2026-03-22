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
