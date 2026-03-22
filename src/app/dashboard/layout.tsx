import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const org = session.user.orgId
    ? await db.organization.findUnique({
        where: { id: session.user.orgId },
        select: { name: true },
      })
    : null

  return (
    <DashboardShell
      userName={session.user.name ?? null}
      userRole={session.user.role}
      orgName={org?.name ?? null}
    >
      {children}
    </DashboardShell>
  )
}
