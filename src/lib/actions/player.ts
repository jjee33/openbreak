'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type PlayerActionState = {
  error?: string
}

async function getOrgId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user) return null

  const membership = await db.orgMember.findFirst({
    where: { userId: session.user.id },
    select: { orgId: true },
  })

  return membership?.orgId ?? null
}

export async function createPlayer(
  _prevState: PlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  const orgId = await getOrgId()
  if (!orgId) {
    return { error: 'You must be logged in and belong to an organization' }
  }

  const displayName = (formData.get('displayName') as string)?.trim()
  if (!displayName) {
    return { error: 'Display name is required' }
  }

  try {
    await db.player.create({
      data: { displayName, orgId },
    })
  } catch {
    return { error: 'Failed to add player. Please try again.' }
  }

  revalidatePath('/dashboard/players')
  return {}
}

export async function deletePlayer(
  _prevState: PlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  const orgId = await getOrgId()
  if (!orgId) {
    return { error: 'You must be logged in and belong to an organization' }
  }

  const playerId = formData.get('playerId') as string
  if (!playerId) {
    return { error: 'Player ID is required' }
  }

  const player = await db.player.findUnique({
    where: { id: playerId },
    select: { orgId: true },
  })

  if (!player || player.orgId !== orgId) {
    return { error: 'Player not found or does not belong to your organization' }
  }

  try {
    await db.player.delete({ where: { id: playerId } })
  } catch {
    return { error: 'Failed to delete player. Please try again.' }
  }

  revalidatePath('/dashboard/players')
  return {}
}
