// @ts-check
import lukkoPlayers from './lukko_roster.json'

export const ROSTER_LIMIT = 22
export const CURRENT_CONTRACT_YEAR = 2026

export const SLOT_LABELS = {
  lw: 'VL',
  c: 'KH',
  rw: 'OL',
  ld: 'VP',
  rd: 'OP',
  goalie: 'MV',
  extraForward: '13. hyökkääjä',
  extraDefense: '7. puolustaja',
  ppLd: 'KÄRKI',
  ppLeft: 'VL',
  ppCenter: 'SLOTTI',
  ppRight: 'OL',
  ppRd: 'MAALINEDUSTA',
  pkF1: 'YLÄ-H1',
  pkF2: 'YLÄ-H2',
  pkD1: 'ALA-P1',
  pkD2: 'ALA-P2',
  scratch: 'Extra',
}

const SLOT_POSITION_RULES = {
  lw: ['LH'],
  rw: ['LH'],
  c: ['KH'],
  ld: ['PV'],
  rd: ['PV'],
  goalie: ['MV'],
  extraForward: ['KH', 'LH'],
  extraDefense: ['PV'],
  ppLd: ['PV', 'KH', 'LH'],
  ppLeft: ['PV', 'KH', 'LH'],
  ppCenter: ['PV', 'KH', 'LH'],
  ppRight: ['PV', 'KH', 'LH'],
  ppRd: ['PV', 'KH', 'LH'],
  pkF1: ['PV', 'KH', 'LH'],
  pkF2: ['PV', 'KH', 'LH'],
  pkD1: ['PV', 'KH', 'LH'],
  pkD2: ['PV', 'KH', 'LH'],
  scratch: ['MV', 'PV', 'KH', 'LH'],
}

export const SLOT_PREFERRED_POSITIONS = {
  ppLd: 'PV',
  ppLeft: 'LH',
  ppCenter: 'KH',
  ppRight: 'LH',
  ppRd: 'LH',
  pkF1: 'LH',
  pkF2: 'LH',
  pkD1: 'PV',
  pkD2: 'PV',
}

export const DEFAULT_ROSTER_IDS = {
  forwards: [
    {
      lw: 'lukko-aleksi-saarela',
      c: 'lukko-mikael-ruohomaa',
      rw: 'lukko-alex-beaucage',
    },
    {
      lw: 'lukko-heikki-liedes',
      c: 'lukko-santeri-virtanen',
      rw: 'lukko-felix-robert',
    },
    {
      lw: 'lukko-antti-saarela',
      c: 'lukko-jami-krannila',
      rw: 'lukko-topias-haapanen',
    },
    {
      lw: 'lukko-henri-ikonen',
      c: 'lukko-aapo-vanninen',
      rw: 'lukko-lenni-hamalainen',
    },
  ],
  defense: [
    {
      ld: 'lukko-peetro-seppala',
      rd: 'lukko-jakob-stenqvist',
    },
    {
      ld: 'lukko-chris-harpur',
      rd: 'lukko-nuutti-viitasalo',
    },
    {
      ld: 'lukko-arttu-valila',
      rd: 'lukko-anton-olsson',
    },
  ],
  goalies: ['lukko-antti-raanta', 'lukko-daniel-salonen'],
  extras: {
    forward: 'lukko-jasu-mensonen',
    defense: null,
  },
  powerplay: [
    {
      ppLeft: 'lukko-alex-beaucage',
      ppCenter: 'lukko-mikael-ruohomaa',
      ppRight: 'lukko-aleksi-saarela',
      ppLd: 'lukko-jakob-stenqvist',
      ppRd: 'lukko-antti-saarela',
    },
    {
      ppLeft: 'lukko-jami-krannila',
      ppCenter: 'lukko-santeri-virtanen',
      ppRight: 'lukko-felix-robert',
      ppLd: 'lukko-peetro-seppala',
      ppRd: 'lukko-heikki-liedes',
    },
  ],
  shorthanded: [
    {
      pkF1: 'lukko-mikael-ruohomaa',
      pkF2: 'lukko-topias-haapanen',
      pkD1: 'lukko-chris-harpur',
      pkD2: 'lukko-nuutti-viitasalo',
    },
    {
      pkF1: 'lukko-santeri-virtanen',
      pkF2: 'lukko-henri-ikonen',
      pkD1: 'lukko-peetro-seppala',
      pkD2: 'lukko-anton-olsson',
    },
  ],
}

const FORWARD_SLOTS = ['lw', 'c', 'rw']
const DEFENSE_SLOTS = ['ld', 'rd']
const POWERPLAY_SLOTS = ['ppLeft', 'ppCenter', 'ppRight', 'ppLd', 'ppRd']
const SHORTHANDED_SLOTS = ['pkF1', 'pkF2', 'pkD1', 'pkD2']

function createPowerplayUnits() {
  return [1, 2].map((unit) => ({
    unit,
    ppLeft: null,
    ppCenter: null,
    ppRight: null,
    ppLd: null,
    ppRd: null,
  }))
}

function createShorthandedUnits() {
  return [1, 2].map((unit) => ({
    unit,
    pkF1: null,
    pkF2: null,
    pkD1: null,
    pkD2: null,
  }))
}

function applyDefaultUnit(unit, defaults, eligibleIds) {
  for (const [slot, playerId] of Object.entries(defaults || {})) {
    unit[slot] = eligibleIds.has(playerId) ? playerId : null
  }
}

export function getLukkoPlayers() {
  return getContractedActivePlayers(lukkoPlayers.map(normalizePlayer))
}

export function hasContractYear(player) {
  return player.contract_year !== null && player.contract_year !== undefined && player.contract_year !== ''
}

export function getContractedActivePlayers(players) {
  return players.filter((player) => player.status === 'aktiivinen' && hasContractYear(player))
}

export function normalizePlayer(player) {
  return {
    ...player,
    actual_position: player.actual_position || player.position,
    status: player.status || 'aktiivinen',
  }
}

export function createEmptyRoster() {
  return {
    forwards: [1, 2, 3, 4].map((line) => ({
      line,
      lw: null,
      c: null,
      rw: null,
      toi: line === 1 ? 18 : line === 4 ? 9 : 14,
      role: 'even-strength',
    })),
    defense: [1, 2, 3].map((pair) => ({
      pair,
      ld: null,
      rd: null,
      toi: pair === 1 ? 21 : pair === 3 ? 14 : 18,
      role: 'even-strength',
    })),
    extras: {
      forward: null,
      defense: null,
    },
    goalies: [null, null],
    powerplay: createPowerplayUnits(),
    shorthanded: createShorthandedUnits(),
    scratches: [],
  }
}

export function hydrateRoster(value) {
  const roster = createEmptyRoster()
  if (!value || typeof value !== 'object') return roster

  if (Array.isArray(value.forwards)) {
    roster.forwards = roster.forwards.map((line, index) => ({
      ...line,
      ...(value.forwards[index] || {}),
      line: line.line,
    }))
  }

  if (Array.isArray(value.defense)) {
    roster.defense = roster.defense.map((pair, index) => ({
      ...pair,
      ...(value.defense[index] || {}),
      pair: pair.pair,
    }))
  }

  if (value.extras && typeof value.extras === 'object') {
    roster.extras = {
      forward: value.extras.forward || null,
      defense: value.extras.defense || null,
    }
  }

  if (Array.isArray(value.goalies)) {
    roster.goalies = roster.goalies.map((goalieId, index) => value.goalies[index] || goalieId)
  }

  if (Array.isArray(value.powerplay)) {
    roster.powerplay = roster.powerplay.map((unit, index) => ({
      ...unit,
      ...(value.powerplay[index] || {}),
      unit: unit.unit,
    }))
  }

  if (Array.isArray(value.shorthanded)) {
    roster.shorthanded = roster.shorthanded.map((unit, index) => ({
      ...unit,
      ...(value.shorthanded[index] || {}),
      unit: unit.unit,
    }))
  }

  if (Array.isArray(value.scratches)) {
    roster.scratches = [...new Set(value.scratches.filter(Boolean))]
  }

  return roster
}

export function createDefaultRoster(players = getLukkoPlayers()) {
  const roster = createEmptyRoster()
  const contractedActive = getContractedActivePlayers(players)
  const availableIds = new Set(contractedActive.map((player) => player.id))

  roster.forwards.forEach((line, index) => {
    const defaults = DEFAULT_ROSTER_IDS.forwards[index]
    line.lw = availableIds.has(defaults.lw) ? defaults.lw : null
    line.c = availableIds.has(defaults.c) ? defaults.c : null
    line.rw = availableIds.has(defaults.rw) ? defaults.rw : null
  })

  roster.defense.forEach((pair, index) => {
    const defaults = DEFAULT_ROSTER_IDS.defense[index]
    pair.ld = availableIds.has(defaults.ld) ? defaults.ld : null
    pair.rd = availableIds.has(defaults.rd) ? defaults.rd : null
  })

  roster.goalies = DEFAULT_ROSTER_IDS.goalies.map((playerId) =>
    availableIds.has(playerId) ? playerId : null
  )

  roster.extras.forward = availableIds.has(DEFAULT_ROSTER_IDS.extras.forward)
    ? DEFAULT_ROSTER_IDS.extras.forward
    : null
  roster.extras.defense = availableIds.has(DEFAULT_ROSTER_IDS.extras.defense)
    ? DEFAULT_ROSTER_IDS.extras.defense
    : null

  const specialTeamsEligibleIds = getActiveLineupPlayerIds(roster)

  roster.powerplay.forEach((unit, index) => {
    applyDefaultUnit(unit, DEFAULT_ROSTER_IDS.powerplay[index], specialTeamsEligibleIds)
  })

  roster.shorthanded.forEach((unit, index) => {
    applyDefaultUnit(unit, DEFAULT_ROSTER_IDS.shorthanded[index], specialTeamsEligibleIds)
  })

  roster.scratches = contractedActive
    .filter((player) => !getAssignedPlayerIds(roster).has(player.id))
    .map((player) => player.id)

  return roster
}

export function getPlayerById(players, playerId) {
  return players.find((player) => player.id === playerId) || null
}

export function canAssignPlayerToSlot(player, slot) {
  if (!player) return { ok: false, reason: 'Pelaajaa ei löytynyt.' }
  if (player.status !== 'aktiivinen' || !hasContractYear(player)) {
    return {
      ok: false,
      reason: `${player.name} ei ole aktiivinen sopimuspelaaja.`,
    }
  }
  if (player.status === 'loukkaantunut') {
    return {
      ok: false,
      reason: `${player.name} on loukkaantunut eikä häntä voi sijoittaa ketjuun.`,
    }
  }
  if (player.status === 'lainalla') {
    return {
      ok: false,
      reason: `${player.name} on lainalla eikä ole aktiivisessa kokoonpanossa.`,
    }
  }

  const allowed = SLOT_POSITION_RULES[slot] || []
  if (!allowed.includes(player.actual_position)) {
    return {
      ok: false,
      reason: `${player.name} (${player.actual_position}) ei kuulu paikkaan ${SLOT_LABELS[slot] || slot}.`,
    }
  }

  const preferred = SLOT_PREFERRED_POSITIONS[slot]
  if (preferred && player.actual_position !== preferred) {
    return {
      ok: true,
      reason: `${player.name} on ${player.actual_position}, mutta ${SLOT_LABELS[slot]} on yleensä ${preferred}.`,
    }
  }

  return { ok: true, reason: '' }
}

export function getAssignedPlayerIds(roster) {
  const ids = new Set()

  for (const line of roster.forwards) {
    for (const slot of FORWARD_SLOTS) {
      if (line[slot]) ids.add(line[slot])
    }
  }

  for (const pair of roster.defense) {
    for (const slot of DEFENSE_SLOTS) {
      if (pair[slot]) ids.add(pair[slot])
    }
  }

  if (roster.extras?.forward) ids.add(roster.extras.forward)
  if (roster.extras?.defense) ids.add(roster.extras.defense)

  for (const goalieId of roster.goalies) {
    if (goalieId) ids.add(goalieId)
  }

  for (const scratchId of roster.scratches || []) {
    if (scratchId) ids.add(scratchId)
  }

  return ids
}

export function getActiveLineupPlayerIds(roster) {
  const ids = new Set()

  for (const line of roster.forwards) {
    for (const slot of FORWARD_SLOTS) {
      if (line[slot]) ids.add(line[slot])
    }
  }

  for (const pair of roster.defense) {
    for (const slot of DEFENSE_SLOTS) {
      if (pair[slot]) ids.add(pair[slot])
    }
  }

  if (roster.extras?.forward) ids.add(roster.extras.forward)
  if (roster.extras?.defense) ids.add(roster.extras.defense)

  for (const goalieId of roster.goalies) {
    if (goalieId) ids.add(goalieId)
  }

  return ids
}

export function applyDefaultsToEmptySpecialTeams(roster, players) {
  const contractedActive = getContractedActivePlayers(players)
  const availableIds = new Set(contractedActive.map((p) => p.id))
  const activeIds = getActiveLineupPlayerIds(roster)

  ;(roster.powerplay || []).forEach((unit, index) => {
    const defaults = DEFAULT_ROSTER_IDS.powerplay[index]
    if (!defaults) return
    for (const [slot, playerId] of Object.entries(defaults)) {
      if (!unit[slot] && activeIds.has(playerId) && availableIds.has(playerId)) {
        unit[slot] = playerId
      }
    }
  })

  ;(roster.shorthanded || []).forEach((unit, index) => {
    const defaults = DEFAULT_ROSTER_IDS.shorthanded[index]
    if (!defaults) return
    for (const [slot, playerId] of Object.entries(defaults)) {
      if (!unit[slot] && activeIds.has(playerId) && availableIds.has(playerId)) {
        unit[slot] = playerId
      }
    }
  })
}

export function removePlayerFromSpecialTeams(roster, playerId, group = null) {
  if (!playerId) return

  if (!group || group === 'powerplay') {
    for (const unit of roster.powerplay || []) {
      for (const slot of POWERPLAY_SLOTS) {
        if (unit[slot] === playerId) unit[slot] = null
      }
    }
  }

  if (!group || group === 'shorthanded') {
    for (const unit of roster.shorthanded || []) {
      for (const slot of SHORTHANDED_SLOTS) {
        if (unit[slot] === playerId) unit[slot] = null
      }
    }
  }
}

export function removePlayerFromRoster(roster, playerId) {
  for (const line of roster.forwards) {
    for (const slot of FORWARD_SLOTS) {
      if (line[slot] === playerId) line[slot] = null
    }
  }

  for (const pair of roster.defense) {
    for (const slot of DEFENSE_SLOTS) {
      if (pair[slot] === playerId) pair[slot] = null
    }
  }

  if (roster.extras?.forward === playerId) roster.extras.forward = null
  if (roster.extras?.defense === playerId) roster.extras.defense = null
  roster.goalies = roster.goalies.map((id) => (id === playerId ? null : id))
  roster.scratches = (roster.scratches || []).filter((id) => id !== playerId)
}

export function assignPlayerToSlot(roster, players, playerId, target) {
  const player = getPlayerById(players, playerId)
  const validation = canAssignPlayerToSlot(player, target.slot)
  if (!validation.ok) return { ok: false, reason: validation.reason }

  if (target.kind === 'powerplay' || target.kind === 'shorthanded') {
    if (!getActiveLineupPlayerIds(roster).has(playerId)) {
      return {
        ok: false,
        reason: `Sijoita ${player.name} ensin kokoonpanoon ennen erikoistilanneroolia.`,
      }
    }

    removePlayerFromSpecialTeams(roster, playerId, target.kind)
    roster[target.kind][target.index][target.slot] = playerId
    return { ok: true, reason: '' }
  }

  removePlayerFromRoster(roster, playerId)

  if (target.kind === 'forward') {
    roster.forwards[target.index][target.slot] = playerId
  } else if (target.kind === 'defense') {
    roster.defense[target.index][target.slot] = playerId
  } else if (target.kind === 'extraForward') {
    roster.extras.forward = playerId
  } else if (target.kind === 'extraDefense') {
    roster.extras.defense = playerId
  } else if (target.kind === 'goalie') {
    roster.goalies[target.index] = playerId
  } else if (target.kind === 'scratch') {
    roster.scratches = [...new Set([...(roster.scratches || []), playerId])]
  }

  return { ok: true, reason: '' }
}

export function clearSlot(roster, target) {
  let removedPlayerId = null

  if (target.kind === 'forward') {
    removedPlayerId = roster.forwards[target.index][target.slot]
    roster.forwards[target.index][target.slot] = null
  } else if (target.kind === 'defense') {
    removedPlayerId = roster.defense[target.index][target.slot]
    roster.defense[target.index][target.slot] = null
  } else if (target.kind === 'extraForward') {
    removedPlayerId = roster.extras.forward
    roster.extras.forward = null
  } else if (target.kind === 'extraDefense') {
    removedPlayerId = roster.extras.defense
    roster.extras.defense = null
  } else if (target.kind === 'goalie') {
    removedPlayerId = roster.goalies[target.index]
    roster.goalies[target.index] = null
  } else if (target.kind === 'powerplay' || target.kind === 'shorthanded') {
    roster[target.kind][target.index][target.slot] = null
    return
  }

  if (removedPlayerId && !getActiveLineupPlayerIds(roster).has(removedPlayerId)) {
    removePlayerFromSpecialTeams(roster, removedPlayerId)
  }
}

export function getAvailablePlayers(players, roster, position = null) {
  const assigned = getAssignedPlayerIds(roster)
  return players.filter((player) => {
    if (assigned.has(player.id)) return false
    if (player.status !== 'aktiivinen' || !hasContractYear(player)) return false
    if (!position) return true
    return player.actual_position === position
  })
}

export function getActiveLineupPlayers(players, roster, position = null) {
  const activeIds = getActiveLineupPlayerIds(roster)
  return players.filter((player) => {
    if (!activeIds.has(player.id)) return false
    if (player.status !== 'aktiivinen' || !hasContractYear(player)) return false
    if (!position) return true
    return player.actual_position === position
  })
}

export function summarizeRoster(players, roster, limit = ROSTER_LIMIT) {
  const assigned = getAssignedPlayerIds(roster)
  const lineupCount = assigned.size - (roster.scratches?.length || 0)

  return {
    filled: lineupCount,
    limit,
    free: Math.max(limit - lineupCount, 0),
    over: Math.max(lineupCount - limit, 0),
    lineupCount,
  }
}

export function encodeRoster(roster) {
  return btoa(encodeURIComponent(JSON.stringify(roster)))
}

export function decodeRoster(value) {
  try {
    return hydrateRoster(JSON.parse(decodeURIComponent(atob(value))))
  } catch (_error) {
    return null
  }
}
