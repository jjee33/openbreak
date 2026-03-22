'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  generateSingleElim,
  generateDoubleElim,
  generateRoundRobin,
  type Participant,
} from '@/lib/bracket'

export type BracketActionState = {
  error?: string
}

async function verifyTournamentOwnership(tournamentId: string) {
  const session = await auth()
  if (!session?.user) return null

  const membership = await db.orgMember.findFirst({
    where: { userId: session.user.id },
    select: { orgId: true },
  })
  if (!membership) return null

  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      teams: { include: { members: { include: { player: true } } } },
    },
  })
  if (!tournament || tournament.orgId !== membership.orgId) return null

  return tournament
}

export async function startTournament(
  _prevState: BracketActionState,
  formData: FormData
): Promise<BracketActionState> {
  const tournamentId = formData.get('tournamentId') as string
  if (!tournamentId) return { error: 'Tournament ID is required' }

  const tournament = await verifyTournamentOwnership(tournamentId)
  if (!tournament) return { error: 'Tournament not found or access denied' }

  if (tournament.status !== 'DRAFT' && tournament.status !== 'REGISTRATION') {
    return { error: 'Tournament must be in DRAFT or REGISTRATION status to start' }
  }

  const useTeams = tournament.teamType === 'PAIRS'

  let participants: Participant[]

  if (useTeams) {
    if (tournament.teams.length < 2) {
      return { error: 'Need at least 2 teams to start a tournament' }
    }
    participants = tournament.teams.map((t) => ({ id: t.id, name: t.name }))
  } else {
    // For INDIVIDUAL tournaments, get players from the org
    const players = await db.player.findMany({
      where: { orgId: tournament.orgId },
      select: { id: true, displayName: true },
    })
    if (players.length < 2) {
      return { error: 'Need at least 2 players to start a tournament' }
    }
    participants = players.map((p) => ({ id: p.id, name: p.displayName }))
  }

  let matchInputs
  switch (tournament.format) {
    case 'SINGLE_ELIMINATION':
      matchInputs = generateSingleElim(participants, useTeams)
      break
    case 'DOUBLE_ELIMINATION':
      matchInputs = generateDoubleElim(participants, useTeams)
      break
    case 'ROUND_ROBIN':
      matchInputs = generateRoundRobin(participants, useTeams)
      break
    default:
      return { error: 'Unknown tournament format' }
  }

  try {
    await db.$transaction(async (tx) => {
      // Delete any existing matches (in case of restart)
      await tx.match.deleteMany({ where: { tournamentId } })

      // Insert all generated matches
      await tx.match.createMany({
        data: matchInputs.map((m) => ({
          tournamentId,
          round: m.round,
          matchNumber: m.matchNumber,
          bracketSlot: m.bracketSlot,
          player1Id: m.player1Id ?? null,
          player2Id: m.player2Id ?? null,
          team1Id: m.team1Id ?? null,
          team2Id: m.team2Id ?? null,
        })),
      })

      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'ACTIVE' },
      })
    })
  } catch {
    return { error: 'Failed to start tournament. Please try again.' }
  }

  revalidatePath(`/dashboard/tournaments/${tournamentId}`)
  revalidatePath(`/dashboard/tournaments/${tournamentId}/bracket`)
  return {}
}

export async function updateScore(
  _prevState: BracketActionState,
  formData: FormData
): Promise<BracketActionState> {
  const matchId = formData.get('matchId') as string
  const score1Str = formData.get('score1') as string
  const score2Str = formData.get('score2') as string
  const winnerId = formData.get('winnerId') as string | null

  if (!matchId) return { error: 'Match ID is required' }

  const session = await auth()
  if (!session?.user) return { error: 'You must be logged in' }

  const membership = await db.orgMember.findFirst({
    where: { userId: session.user.id },
    select: { orgId: true },
  })
  if (!membership) return { error: 'Access denied' }

  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { tournament: { select: { orgId: true, teamType: true } } },
  })

  if (!match || match.tournament.orgId !== membership.orgId) {
    return { error: 'Match not found or access denied' }
  }

  const score1 = score1Str ? parseInt(score1Str, 10) : null
  const score2 = score2Str ? parseInt(score2Str, 10) : null

  const useTeams = match.tournament.teamType === 'PAIRS'

  try {
    await db.match.update({
      where: { id: matchId },
      data: {
        score1,
        score2,
        winnerId: useTeams ? null : (winnerId || null),
        winnerTeamId: useTeams ? (winnerId || null) : null,
        completedAt: winnerId ? new Date() : null,
      },
    })
  } catch {
    return { error: 'Failed to update score. Please try again.' }
  }

  revalidatePath(`/dashboard/tournaments/${match.tournamentId}/bracket`)
  revalidatePath(`/tournaments/${match.tournamentId}`)
  return {}
}
