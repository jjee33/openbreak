/**
 * Bracket generation logic for tournament formats.
 * Returns arrays of match create payloads ready for Prisma createMany.
 */

export interface Participant {
  id: string
  name: string
}

export interface MatchInput {
  round: number
  matchNumber: number
  bracketSlot: string
  player1Id?: string | null
  player2Id?: string | null
  team1Id?: string | null
  team2Id?: string | null
}

type ParticipantField = 'player1Id' | 'player2Id' | 'team1Id' | 'team2Id'

function assignParticipants(
  useTeams: boolean,
  p1: Participant | null,
  p2: Participant | null
): Pick<MatchInput, ParticipantField> {
  if (useTeams) {
    return {
      team1Id: p1?.id ?? null,
      team2Id: p2?.id ?? null,
    }
  }
  return {
    player1Id: p1?.id ?? null,
    player2Id: p2?.id ?? null,
  }
}

/**
 * Pad participants to next power of 2 with null byes.
 */
function padToPowerOf2(participants: Participant[]): (Participant | null)[] {
  const n = participants.length
  let size = 1
  while (size < n) size *= 2
  const padded: (Participant | null)[] = [...participants]
  while (padded.length < size) padded.push(null)
  return padded
}

/**
 * Seed ordering: top seed vs bottom seed pattern.
 * For 8 participants: [1,8,4,5,2,7,3,6] (standard bracket seeding).
 */
function seedOrder(size: number): number[] {
  if (size === 1) return [0]
  const half = seedOrder(size / 2)
  const result: number[] = []
  for (const i of half) {
    result.push(i, size - 1 - i)
  }
  return result
}

/**
 * Generate single elimination bracket.
 */
export function generateSingleElim(
  participants: Participant[],
  useTeams = false
): MatchInput[] {
  if (participants.length < 2) return []

  const padded = padToPowerOf2(participants)
  const size = padded.length
  const totalRounds = Math.log2(size)
  const order = seedOrder(size)
  const seeded = order.map((i) => padded[i])
  const matches: MatchInput[] = []

  let matchCounter = 0

  // Round 1: pair seeded participants
  for (let i = 0; i < seeded.length; i += 2) {
    matchCounter++
    const p1 = seeded[i]
    const p2 = seeded[i + 1]
    matches.push({
      round: 1,
      matchNumber: matchCounter,
      bracketSlot: `W-R1-M${matchCounter}`,
      ...assignParticipants(useTeams, p1, p2),
    })
  }

  // Subsequent rounds: empty matches for winners to advance into
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round)
    for (let m = 1; m <= matchesInRound; m++) {
      matchCounter++
      matches.push({
        round,
        matchNumber: matchCounter,
        bracketSlot: `W-R${round}-M${m}`,
        ...assignParticipants(useTeams, null, null),
      })
    }
  }

  return matches
}

/**
 * Generate double elimination bracket.
 * Winner bracket + loser bracket + grand finals.
 */
export function generateDoubleElim(
  participants: Participant[],
  useTeams = false
): MatchInput[] {
  if (participants.length < 2) return []

  // Winner bracket is same as single elim
  const winnerMatches = generateSingleElim(participants, useTeams)

  const padded = padToPowerOf2(participants)
  const size = padded.length
  const winnerRounds = Math.log2(size)

  const matches: MatchInput[] = [...winnerMatches]
  let matchCounter = winnerMatches.length

  // Loser bracket: losers from each winner round drop down.
  // Loser bracket has (winnerRounds - 1) * 2 rounds.
  // Each "phase" has a drop-down round then a regular round.
  const loserRounds = (winnerRounds - 1) * 2

  for (let lr = 1; lr <= loserRounds; lr++) {
    // In odd loser rounds: matches from drop-downs (halves each time)
    // In even loser rounds: consolidation matches
    let matchesInRound: number
    if (lr === 1) {
      matchesInRound = size / 4
    } else if (lr % 2 === 0) {
      // Even rounds: same count as previous odd round
      matchesInRound = Math.max(1, size / Math.pow(2, Math.floor(lr / 2) + 1))
    } else {
      // Odd rounds after first: half of previous
      matchesInRound = Math.max(1, size / Math.pow(2, Math.floor(lr / 2) + 1))
    }

    for (let m = 1; m <= matchesInRound; m++) {
      matchCounter++
      matches.push({
        round: lr,
        matchNumber: matchCounter,
        bracketSlot: `L-R${lr}-M${m}`,
        ...assignParticipants(useTeams, null, null),
      })
    }
  }

  // Grand finals: winner bracket champion vs loser bracket champion
  matchCounter++
  matches.push({
    round: 1,
    matchNumber: matchCounter,
    bracketSlot: 'GF-M1',
    ...assignParticipants(useTeams, null, null),
  })

  // Potential reset match
  matchCounter++
  matches.push({
    round: 2,
    matchNumber: matchCounter,
    bracketSlot: 'GF-M2',
    ...assignParticipants(useTeams, null, null),
  })

  return matches
}

/**
 * Generate round robin schedule.
 * Every participant plays every other participant once.
 * Uses circle method for even scheduling across rounds.
 */
export function generateRoundRobin(
  participants: Participant[],
  useTeams = false
): MatchInput[] {
  if (participants.length < 2) return []

  // For odd count, add a bye participant
  const list: (Participant | null)[] = [...participants]
  if (list.length % 2 !== 0) list.push(null)

  const n = list.length
  const totalRounds = n - 1
  const matches: MatchInput[] = []
  let matchCounter = 0

  // Circle method: fix first participant, rotate the rest
  const rotating = list.slice(1)

  for (let round = 0; round < totalRounds; round++) {
    const roundParticipants = [list[0], ...rotating]
    const matchesInRound = n / 2

    for (let m = 0; m < matchesInRound; m++) {
      const p1 = roundParticipants[m]
      const p2 = roundParticipants[n - 1 - m]

      // Skip bye matches (where one participant is null)
      if (!p1 || !p2) continue

      matchCounter++
      matches.push({
        round: round + 1,
        matchNumber: matchCounter,
        bracketSlot: `RR-R${round + 1}-M${m + 1}`,
        ...assignParticipants(useTeams, p1, p2),
      })
    }

    // Rotate: move last element to second position
    const last = rotating.pop()!
    rotating.unshift(last)
  }

  return matches
}
