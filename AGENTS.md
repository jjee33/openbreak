# OpenBreak — AI Agent Context

## Project
Pool tournament management platform. Multi-tenant (one org per venue).
Game types: 8-ball, 9-ball, 10-ball. Formats: single elim, double elim, round robin.

## Stack
- Next.js 16.2 (App Router, Turbopack, proxy.ts NOT middleware.ts)
- TypeScript strict mode
- Tailwind CSS (dark mode first)
- Auth.js v5 beta (JWT strategy, credentials provider)
- Prisma 7.5 + PostgreSQL (adapter-pg required)
- pnpm

## Critical Rules
- NEVER use middleware.ts — Next.js 16 uses proxy.ts
- NEVER import PrismaClient from @prisma/client — import from @/generated/prisma/client
- NEVER instantiate PrismaClient without { adapter } argument
- NEVER write url in schema.prisma datasource block — it lives in prisma.config.ts
- NEVER use `next lint` — removed in Next.js 16, use ESLint directly
- ALWAYS run `npx prisma generate` after schema changes
- ALWAYS run `npx prisma migrate dev` after schema changes
- ALWAYS use server actions for form mutations (no API routes for forms)
- ALWAYS use `db` from @/lib/db, never instantiate PrismaClient directly
- ALWAYS use `auth()` from @/lib/auth for session access

## Auth Pattern
```typescript
import { auth } from '@/lib/auth'
const session = await auth()
if (!session?.user) redirect('/login')
```

## Server Action Pattern
```typescript
'use server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createTournament(data: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  // ...
  revalidatePath('/dashboard/tournaments')
}
```

## File Naming
- Pages: src/app/[route]/page.tsx
- Layouts: src/app/[route]/layout.tsx
- Server actions: src/lib/actions/[domain].ts
- Components: src/components/[domain]/ComponentName.tsx
- Utilities: src/lib/[name].ts

## Role Checks
```typescript
if (session.user.role !== 'SUPER_ADMIN') throw new Error('Forbidden')
if (session.user.role !== 'ORG_ADMIN') redirect('/dashboard')
```

## Styling
- Dark mode first: bg-gray-900 text-white
- Accent: cyan-400 or emerald-400
- All components mobile-first responsive
- No inline styles — Tailwind only

## Production Deployment
- Docker image: ghcr.io/jjee33/openbreak:latest
- K8s manifests in k8s/ — copy to homelab-k3s/apps/openbreak/ for ArgoCD
- PostgreSQL: in-cluster StatefulSet with Longhorn PVC
- Traefik IngressRoute: openbreak.pro with TLS via cert-manager
- Health endpoint: /api/health
- next.config.ts has output: 'standalone' for Docker builds
