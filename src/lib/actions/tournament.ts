'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { TournamentFormat, GameType, TeamType } from '@/generated/prisma/enums'

export type CreateTournamentState = {
  error?: string
}

export async function createTournament(
  _prevState: CreateTournamentState,
  formData: FormData
): Promise<CreateTournamentState> {
  const session = await auth()
  if (!session?.user) {
    return { error: 'You must be logged in' }
  }

  const membership = await db.orgMember.findFirst({
    where: { userId: session.user.id },
    select: { orgId: true },
  })

  if (!membership) {
    return { error: 'You are not a member of any organization' }
  }

  const name = formData.get('name') as string
  const format = formData.get('format') as TournamentFormat
  const gameType = formData.get('gameType') as GameType
  const teamType = formData.get('teamType') as TeamType
  const startDateStr = formData.get('startDate') as string

  if (!name || !format || !gameType || !teamType) {
    return { error: 'Name, format, game type, and team type are required' }
  }

  let newId: string
  try {
    const tournament = await db.tournament.create({
      data: {
        name,
        format,
        gameType,
        teamType,
        startDate: startDateStr ? new Date(startDateStr) : null,
        orgId: membership.orgId,
      },
    })
    newId = tournament.id
  } catch {
    return { error: 'Failed to create tournament. Please try again.' }
  }

  revalidatePath('/dashboard/tournaments')
  redirect(`/dashboard/tournaments/${newId}`)
}
