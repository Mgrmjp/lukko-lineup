// @ts-nocheck
import { describe, expect, it } from 'vitest'
import {
  assignPlayerToSlot,
  canAssignPlayerToSlot,
  createDefaultRoster,
  createEmptyRoster,
  decodeRoster,
  encodeRoster,
  getAvailablePlayers,
  getContractedActivePlayers,
  hydrateRoster,
  summarizeRoster,
} from '../data/roster.js'

const players = [
  { id: 'g1', name: 'Maalivahti', actual_position: 'MV', status: 'aktiivinen', contract_year: 2027 },
  { id: 'd1', name: 'Puolustaja', actual_position: 'PV', status: 'aktiivinen', contract_year: 2027 },
  { id: 'c1', name: 'Keskushyokkaaja', actual_position: 'KH', status: 'aktiivinen', contract_year: 2027 },
  { id: 'w1', name: 'Laituri', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
  { id: 'i1', name: 'Loukkaantunut', actual_position: 'LH', status: 'loukkaantunut', contract_year: 2027 },
  { id: 'l1', name: 'Lainapelaaja', actual_position: 'PV', status: 'lainalla', contract_year: 2027 },
  { id: 'u1', name: 'Sopimukseton', actual_position: 'PV', status: 'aktiivinen' },
]

describe('roster rules', () => {
  it('exposes only active players with contract years', () => {
    expect(
      getContractedActivePlayers([
        { ...players[0], contract_year: 2027 },
        { ...players[1], contract_year: null },
        { ...players[4], contract_year: 2027 },
        { ...players[5], contract_year: 2027 },
      ]).map((player) => player.id)
    ).toEqual(['g1'])
  })

  it('allows only exact hockey position groups in lineup slots', () => {
    expect(canAssignPlayerToSlot(players[2], 'c').ok).toBe(true)
    expect(canAssignPlayerToSlot(players[2], 'lw').ok).toBe(false)
    expect(canAssignPlayerToSlot(players[3], 'rw').ok).toBe(true)
    expect(canAssignPlayerToSlot(players[1], 'rd').ok).toBe(true)
    expect(canAssignPlayerToSlot(players[0], 'ld').ok).toBe(false)
  })

  it('builds the intended default lineup instead of position-sorted lines', () => {
    const roster = createDefaultRoster([
      { id: 'lukko-daniel-salonen', actual_position: 'MV', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-antti-raanta', actual_position: 'MV', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-peetro-seppala', actual_position: 'PV', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-jakob-stenqvist', actual_position: 'PV', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-arttu-valila', actual_position: 'PV', status: 'aktiivinen', contract_year: 2029 },
      { id: 'lukko-nuutti-viitasalo', actual_position: 'PV', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-jirko-tukiainen', actual_position: 'PV', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-anton-olsson', actual_position: 'PV', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-chris-harpur', actual_position: 'PV', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-aleksi-saarela', actual_position: 'LH', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-mikael-ruohomaa', actual_position: 'KH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-alex-beaucage', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-jasu-mensonen', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-jami-krannila', actual_position: 'KH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-leo-tuuva', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-antti-saarela', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-santeri-virtanen', actual_position: 'KH', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-lenni-hamalainen', actual_position: 'LH', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-henri-ikonen', actual_position: 'LH', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-aapo-vanninen', actual_position: 'KH', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-topias-haapanen', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-daniil-trakht', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-felix-robert', actual_position: 'LH', status: 'aktiivinen', contract_year: 2027 },
      { id: 'lukko-heikki-liedes', actual_position: 'LH', status: 'aktiivinen', contract_year: 2028 },
      { id: 'lukko-jakub-floris', actual_position: 'PV', status: 'aktiivinen', contract_year: 2027 },
    ])

    expect(roster.forwards[0]).toMatchObject({
      lw: 'lukko-aleksi-saarela',
      c: 'lukko-mikael-ruohomaa',
      rw: 'lukko-alex-beaucage',
    })
    expect(roster.forwards[1]).toMatchObject({
      lw: 'lukko-heikki-liedes',
      c: 'lukko-santeri-virtanen',
      rw: 'lukko-felix-robert',
    })
    expect(roster.forwards[2]).toMatchObject({
      lw: 'lukko-antti-saarela',
      c: 'lukko-jami-krannila',
      rw: 'lukko-topias-haapanen',
    })
    expect(roster.forwards[3]).toMatchObject({
      lw: 'lukko-henri-ikonen',
      c: 'lukko-aapo-vanninen',
      rw: 'lukko-lenni-hamalainen',
    })
    expect(roster.defense[0]).toMatchObject({
      ld: 'lukko-peetro-seppala',
      rd: 'lukko-jakob-stenqvist',
    })
    expect(roster.defense[1]).toMatchObject({
      ld: 'lukko-chris-harpur',
      rd: 'lukko-nuutti-viitasalo',
    })
    expect(roster.defense[2]).toMatchObject({
      ld: 'lukko-arttu-valila',
      rd: 'lukko-anton-olsson',
    })
    expect(roster.extras).toEqual({
      mode: 'forward',
      forward: 'lukko-jasu-mensonen',
      defense: null,
    })
    expect(roster.goalies).toEqual(['lukko-antti-raanta', 'lukko-daniel-salonen'])
    expect(roster.powerplay[0]).toMatchObject({
      ppLeft: 'lukko-alex-beaucage',
      ppCenter: 'lukko-mikael-ruohomaa',
      ppRight: 'lukko-aleksi-saarela',
      ppLd: 'lukko-jakob-stenqvist',
      ppRd: 'lukko-antti-saarela',
    })
    expect(roster.powerplay[1]).toMatchObject({
      ppLeft: 'lukko-jami-krannila',
      ppCenter: 'lukko-santeri-virtanen',
      ppRight: 'lukko-felix-robert',
      ppLd: 'lukko-peetro-seppala',
      ppRd: 'lukko-heikki-liedes',
    })
    expect(roster.shorthanded[0]).toMatchObject({
      pkF1: 'lukko-mikael-ruohomaa',
      pkF2: 'lukko-topias-haapanen',
      pkD1: 'lukko-chris-harpur',
      pkD2: 'lukko-nuutti-viitasalo',
    })
    expect(roster.shorthanded[1]).toMatchObject({
      pkF1: 'lukko-santeri-virtanen',
      pkF2: 'lukko-henri-ikonen',
      pkD1: 'lukko-peetro-seppala',
      pkD2: 'lukko-anton-olsson',
    })
    expect(roster.scratches).toEqual(['lukko-jirko-tukiainen', 'lukko-leo-tuuva', 'lukko-daniil-trakht', 'lukko-jakub-floris'])
  })

  it('blocks injured and loaned players from active lineup slots', () => {
    expect(canAssignPlayerToSlot(players[4], 'lw')).toMatchObject({ ok: false })
    expect(canAssignPlayerToSlot(players[5], 'ld')).toMatchObject({ ok: false })
  })

  it('blocks active players without a contract year from active lineup slots', () => {
    expect(canAssignPlayerToSlot(players[6], 'ld')).toMatchObject({ ok: false })
  })

  it('moves a player instead of duplicating him across lines', () => {
    const roster = createEmptyRoster()

    assignPlayerToSlot(roster, players, 'w1', { kind: 'forward', index: 0, slot: 'lw' })
    assignPlayerToSlot(roster, players, 'w1', { kind: 'forward', index: 1, slot: 'rw' })

    expect(roster.forwards[0].lw).toBeNull()
    expect(roster.forwards[1].rw).toBe('w1')
  })

  it('hides already assigned active players from the available pool', () => {
    const roster = createEmptyRoster()
    assignPlayerToSlot(roster, players, 'c1', { kind: 'forward', index: 0, slot: 'c' })

    expect(getAvailablePlayers(players, roster, 'KH')).toEqual([])
  })

  it('keeps powerplay assignments separate from the active lineup', () => {
    const roster = createEmptyRoster()
    assignPlayerToSlot(roster, players, 'w1', { kind: 'forward', index: 0, slot: 'lw' })

    assignPlayerToSlot(roster, players, 'w1', { kind: 'powerplay', index: 0, slot: 'ppLeft' })

    expect(roster.forwards[0].lw).toBe('w1')
    expect(roster.powerplay[0].ppLeft).toBe('w1')
  })

  it('locks extra skater slots based on the selected mode', () => {
    const roster = createEmptyRoster()

    roster.extras.mode = 'defense'
    const lockedForward = assignPlayerToSlot(roster, players, 'w1', { kind: 'extraForward', slot: 'extraForward' })
    const result = assignPlayerToSlot(roster, players, 'd1', { kind: 'extraDefense', slot: 'extraDefense' })

    expect(lockedForward).toMatchObject({ ok: false })
    expect(result).toMatchObject({ ok: true })
    expect(roster.extras).toEqual({
      mode: 'defense',
      forward: null,
      defense: 'd1',
    })
  })

  it('blocks special teams assignments for players outside the active lineup', () => {
    const roster = createEmptyRoster()

    expect(assignPlayerToSlot(roster, players, 'w1', { kind: 'powerplay', index: 0, slot: 'ppLeft' })).toMatchObject({
      ok: false,
    })
  })

  it('hydrates older saved rosters into the new shape', () => {
    const hydrated = hydrateRoster({
      forwards: [{ lw: 'w1', c: 'c1', rw: null }],
      defense: [{ ld: 'd1', rd: null }],
      extras: { forward: 'w1', defense: 'd1' },
      goalies: ['g1', null],
    }, players)

    expect(hydrated.extras).toEqual({ mode: 'forward', forward: 'w1', defense: null })
    expect(hydrated.powerplay).toHaveLength(2)
    expect(hydrated.shorthanded).toHaveLength(2)
    expect(hydrated.forwards[0]).toMatchObject({ lw: 'w1', c: 'c1' })
    expect(hydrated.goalies[0]).toBe('g1')
  })

  it('infers 7D mode from older saves that only contain the extra defender slot', () => {
    const hydrated = hydrateRoster({
      extras: { defense: 'd1' },
    }, players)

    expect(hydrated.extras).toEqual({ mode: 'defense', forward: null, defense: 'd1' })
  })

  it('drops unknown and position-invalid player ids while hydrating shared data', () => {
    const hydrated = hydrateRoster({
      forwards: [{ lw: 'w1', c: 'ghost-player', rw: '<script>' }],
      defense: [{ ld: 'c1', rd: 'd1' }],
      extras: { mode: 'defense', forward: 'w1', defense: 'ghost-player' },
      goalies: ['w1', 'g1'],
      powerplay: [{ ppLeft: 'w1', ppCenter: 'c1', ppRight: 'ghost-player' }],
      scratches: ['c1', 'ghost-player', 'c1'],
    }, players)

    expect(hydrated.forwards[0]).toMatchObject({ lw: 'w1', c: null, rw: null })
    expect(hydrated.defense[0]).toMatchObject({ ld: null, rd: 'd1' })
    expect(hydrated.extras).toEqual({ mode: 'defense', forward: null, defense: null })
    expect(hydrated.goalies).toEqual([null, 'g1'])
    expect(hydrated.powerplay[0]).toMatchObject({ ppLeft: 'w1', ppCenter: null, ppRight: null })
    expect(hydrated.scratches).toEqual(['c1'])
  })

  it('decodes only bounded roster payloads', () => {
    const roster = createEmptyRoster()
    assignPlayerToSlot(roster, players, 'w1', { kind: 'forward', index: 0, slot: 'lw' })

    expect(decodeRoster(encodeRoster(roster), players)?.forwards[0].lw).toBe('w1')
    expect(decodeRoster('x'.repeat(12001), players)).toBeNull()
  })

  it('summarizes gameday skaters and goalies separately', () => {
    const roster = createEmptyRoster()
    assignPlayerToSlot(roster, players, 'w1', { kind: 'forward', index: 0, slot: 'lw' })
    assignPlayerToSlot(roster, players, 'c1', { kind: 'forward', index: 0, slot: 'c' })
    assignPlayerToSlot(roster, players, 'd1', { kind: 'defense', index: 0, slot: 'ld' })
    assignPlayerToSlot(roster, players, 'g1', { kind: 'goalie', index: 0, slot: 'goalie' })
    roster.scratches = ['u1']

    expect(summarizeRoster(players, roster)).toMatchObject({
      filled: 4,
      free: 17,
      lineupCount: 4,
      skaters: 3,
      skaterLimit: 19,
      goalies: 1,
      goalieLimit: 2,
    })
  })
})
