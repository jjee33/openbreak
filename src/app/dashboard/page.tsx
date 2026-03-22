import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function DashboardPage() {
  const session = await auth()
  const org = session?.user?.orgId
    ? await db.organization.findUnique({ where: { id: session.user.orgId } })
    : null

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      {org && <p className="mt-2 text-gray-400">{org.name}</p>}
      <div className="mt-8 rounded-lg border border-gray-800 bg-gray-900 p-6">
        <p className="text-gray-300">
          Welcome, {session?.user?.name}. Your tournament management dashboard is coming soon.
        </p>
      </div>
    </div>
  )
}
