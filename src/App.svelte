<script>
import { untrack } from 'svelte'
import LineBuilder from './lib/components/LineBuilder.svelte'
import PickerModal from './lib/components/PickerModal.svelte'
import RosterPlayerCard from './lib/components/RosterPlayerCard.svelte'
import Toast from './lib/components/Toast.svelte'
import lukkoLogo from './assets/lukkoyellow.svg'
import {
  applyDefaultsToEmptySpecialTeams,
  assignPlayerToSlot,
  canAssignPlayerToSlot,
  clearSlot,
  createDefaultRoster,
  createEmptyRoster,
  decodeRoster,
  encodeRoster,
  getActiveLineupPlayers,
  getActiveLineupPlayerIds,
  getAssignedPlayerIds,
  getAvailablePlayers,
  getPlayerById,
  hydrateRoster,
  getLukkoPlayers,
  removePlayerFromSpecialTeams,
  summarizeRoster,
} from './lib/data/roster.js'

const players = getLukkoPlayers()
const helpSections = [
  {
    title: 'Käyttö',
    items: [
      'Valitse pelaaja rosterista ja pudota haluamaasi pelipaikkaan.',
      'Vaihtoehtoisesti: klikkaa pelaajaa, sitten kohdepaikkaa.',
    ],
  },
  {
    title: 'Laukaisupuoli (L/R)',
    items: [
      'L = laukoo vasemmalta, R = laukoo oikealta.',
      'Nämä ohjearvot auttavat sijoittelussa, mutta eivät ole pakollisia.',
    ],
  },
  {
    title: 'Yleiset sijoittelusäännöt',
    items: [
      'L-pelaaja: usein vasen laituri tai vasen pakki.',
      'R-pelaaja: usein oikea laituri tai oikea pakki.',
      'Sentteri: laukaisupuolella vähemmän painoarvoa; keskeistä ovat aloitukset, pelinluku ja puolustusvastuu.',
      'Ottelukokoonpanossa voi olla enintään 19 kenttäpelaajaa, joten valitse ensin 13F- tai 7D-lukitus ennen lisäpaikan täyttämistä.',
    ],
  },
  {
    title: 'Strategiset poikkeukset',
    intro: 'Sijoittaminen vastakkaiselle laidalle voi olla hyödyllistä, kun:',
    items: [
      'haet one-timer -laukaisua',
      'haluat mahdollistaa sisäänleikkauksia',
      'rakennat tiettyä ylivoimakokoonpanoa',
    ],
  },
]
const helpNote = 'Huomioithan, että ketjukemia ja erikoistilanneroolit voivat muuttaa optimaalisen sijoituksen.'

let roster = $state(createDefaultRoster(players))
let selectedPlayerId = $state(null)
let helpOpen = $state(false)
let viewMode = $state(localStorage.getItem('lukko-view-mode') || 'evenStrength')
let pickerTarget = $state(null)
let positionFilter = $state('all')

const POSITIONS = [
  { key: 'all', label: 'Kaikki' },
  { key: 'LH', label: 'LH' },
  { key: 'KH', label: 'KH' },
  { key: 'PV', label: 'PV' },
  { key: 'MV', label: 'MV' },
]

function filterPlayers(list) {
  if (positionFilter === 'all') return list
  return list.filter((p) => p.actual_position === positionFilter)
}

let toasts = $state([])
let toastId = 0

function addToast(message, type = 'error') {
  const id = ++toastId
  toasts = [...toasts, { id, message, type, exiting: false }]
  setTimeout(() => dismissToast(id), 3500)
}

function dismissToast(id) {
  const toast = toasts.find((t) => t.id === id)
  if (!toast || toast.exiting) return
  toast.exiting = true
  toasts = [...toasts]
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
  }, 200)
}

const assignedIds = $derived(getAssignedPlayerIds(roster))
const lineupIds = $derived(getActiveLineupPlayerIds(roster))
const summary = $derived(summarizeRoster(players, roster))
const availablePlayers = $derived(getAvailablePlayers(players, roster))
const activeLineupPlayers = $derived(getActiveLineupPlayers(players, roster))
const pickerPlayers = $derived(
  pickerTarget?.kind === 'powerplay' || pickerTarget?.kind === 'shorthanded'
    ? activeLineupPlayers
    : availablePlayers
)

$effect(() => {
  document.body.style.overflow = pickerTarget ? 'hidden' : ''
  return () => { document.body.style.overflow = '' }
})

$effect(() => {
  const shared = new URLSearchParams(window.location.search).get('roster')
  const decoded = shared ? decodeRoster(shared) : null
  const saved = localStorage.getItem('lukko-line-builder')
  roster = decoded || (saved ? hydrateRoster(JSON.parse(saved)) : roster)
  untrack(() => applyDefaultsToEmptySpecialTeams(roster, players))
})

$effect(() => {
  localStorage.setItem('lukko-line-builder', JSON.stringify(roster))
})

$effect(() => {
  localStorage.setItem('lukko-view-mode', viewMode)
})

function isPlayerInMainLineup(roster, playerId) {
  for (const line of roster.forwards) {
    for (const slot of ['lw', 'c', 'rw']) {
      if (line[slot] === playerId) return true
    }
  }
  for (const pair of roster.defense) {
    for (const slot of ['ld', 'rd']) {
      if (pair[slot] === playerId) return true
    }
  }
  if (roster.extras?.forward === playerId || roster.extras?.defense === playerId) return true
  for (const goalieId of roster.goalies) {
    if (goalieId === playerId) return true
  }
  return false
}

function handleAssign(playerId, target) {
  if (target.kind === 'powerplay' || target.kind === 'shorthanded') {
    const existingPlayerId = getPlayerInSlot(roster, target)
    if (existingPlayerId && existingPlayerId !== playerId) {
      if (!isPlayerInMainLineup(roster, playerId)) {
        const player = getPlayerById(players, playerId)
        if (player) addToast(`Sijoita ${player.name} ensin kokoonpanoon ennen erikoistilanneroolia.`, 'error')
        selectedPlayerId = null
        return
      }
      setSlotValue(roster, target, playerId)
    } else if (!existingPlayerId) {
      const result = assignPlayerToSlot(roster, players, playerId, target)
      if (result.reason) addToast(result.reason, result.ok ? 'warning' : 'error')
    }
    selectedPlayerId = null
    return
  }

  const existingPlayerId = getPlayerInSlot(roster, target)
  if (existingPlayerId && existingPlayerId !== playerId) {
    const oldSlot = findPlayerSlot(roster, playerId)
    if (oldSlot) {
      const playerA = getPlayerById(players, playerId)
      const playerB = getPlayerById(players, existingPlayerId)
      const checkA = canAssignPlayerToSlot(playerA, target.slot)
      const checkB = canAssignPlayerToSlot(playerB, oldSlot.slot)
      if (!checkA.ok || !checkB.ok) {
        const reason = !checkA.ok ? checkA.reason : checkB.reason
        addToast(reason, 'error')
        selectedPlayerId = null
        return
      }
      clearSlot(roster, { kind: oldSlot.kind, index: oldSlot.index, slot: oldSlot.slot })
      setSlotValue(roster, target, playerId)
      setSlotValue(roster, oldSlot, existingPlayerId)
    } else {
      const player = getPlayerById(players, playerId)
      const check = canAssignPlayerToSlot(player, target.slot)
      if (!check.ok) {
        addToast(check.reason, 'error')
        selectedPlayerId = null
        return
      }
      setSlotValue(roster, target, playerId)
      removePlayerFromSpecialTeams(roster, existingPlayerId)
    }
  } else {
    const result = assignPlayerToSlot(roster, players, playerId, target)
    if (result.reason) addToast(result.reason, result.ok ? 'warning' : 'error')
  }
  selectedPlayerId = null
}

function getPlayerInSlot(roster, target) {
  if (target.kind === 'forward') return roster.forwards[target.index][target.slot]
  if (target.kind === 'defense') return roster.defense[target.index][target.slot]
  if (target.kind === 'extraForward') return roster.extras.forward
  if (target.kind === 'extraDefense') return roster.extras.defense
  if (target.kind === 'goalie') return roster.goalies[target.index]
  if (target.kind === 'powerplay') return roster.powerplay[target.index][target.slot]
  if (target.kind === 'shorthanded') return roster.shorthanded[target.index][target.slot]
  return null
}

function swapPlayers(roster, players, idA, idB) {
  const slotA = findPlayerSlot(roster, idA)
  const slotB = findPlayerSlot(roster, idB)
  if (!slotA || !slotB) return
  const playerA = getPlayerById(players, idA)
  const playerB = getPlayerById(players, idB)
  const checkA = canAssignPlayerToSlot(playerA, slotB.slot)
  const checkB = canAssignPlayerToSlot(playerB, slotA.slot)
  if (!checkA.ok || !checkB.ok) {
    const reason = !checkA.ok ? checkA.reason : checkB.reason
    addToast(reason, 'error')
    return
  }
  setSlotValue(roster, slotA, idB)
  setSlotValue(roster, slotB, idA)
}

function findPlayerSlot(roster, playerId) {
  for (let i = 0; i < roster.forwards.length; i++) {
    for (const slot of ['lw', 'c', 'rw']) {
      if (roster.forwards[i][slot] === playerId) return { kind: 'forward', index: i, slot }
    }
  }
  for (let i = 0; i < roster.defense.length; i++) {
    for (const slot of ['ld', 'rd']) {
      if (roster.defense[i][slot] === playerId) return { kind: 'defense', index: i, slot }
    }
  }
  if (roster.extras.forward === playerId) return { kind: 'extraForward', slot: 'extraForward' }
  if (roster.extras.defense === playerId) return { kind: 'extraDefense', slot: 'extraDefense' }
  for (let i = 0; i < roster.goalies.length; i++) {
    if (roster.goalies[i] === playerId) return { kind: 'goalie', index: i, slot: 'goalie' }
  }
  for (let i = 0; i < roster.powerplay.length; i++) {
    for (const slot of ['ppLeft', 'ppCenter', 'ppRight', 'ppLd', 'ppRd']) {
      if (roster.powerplay[i][slot] === playerId) return { kind: 'powerplay', index: i, slot }
    }
  }
  for (let i = 0; i < roster.shorthanded.length; i++) {
    for (const slot of ['pkF1', 'pkF2', 'pkD1', 'pkD2']) {
      if (roster.shorthanded[i][slot] === playerId) return { kind: 'shorthanded', index: i, slot }
    }
  }
  return null
}

function setSlotValue(roster, target, playerId) {
  if (target.kind === 'forward') roster.forwards[target.index][target.slot] = playerId
  else if (target.kind === 'defense') roster.defense[target.index][target.slot] = playerId
  else if (target.kind === 'extraForward') {
    roster.extras.mode = 'forward'
    roster.extras.forward = playerId
    roster.extras.defense = null
  }
  else if (target.kind === 'extraDefense') {
    roster.extras.mode = 'defense'
    roster.extras.defense = playerId
    roster.extras.forward = null
  }
  else if (target.kind === 'goalie') roster.goalies[target.index] = playerId
  else if (target.kind === 'powerplay') roster.powerplay[target.index][target.slot] = playerId
  else if (target.kind === 'shorthanded') roster.shorthanded[target.index][target.slot] = playerId
}

function handlePickSlot(target) {
  if (!selectedPlayerId) return
  handleAssign(selectedPlayerId, target)
}

function handleClear(target) {
  if (target.kind === 'powerplay' || target.kind === 'shorthanded') {
    roster[target.kind][target.index][target.slot] = null
    return
  }
  clearSlot(roster, target)
}

function handleClearAll(kind) {
  for (const unit of roster[kind]) {
    for (const slot of Object.keys(unit)) {
      if (typeof unit[slot] === 'string') unit[slot] = null
    }
  }
}

function handleLockedSlot(reason) {
  if (reason) addToast(reason, 'warning')
}

function handleSetExtraMode(mode) {
  if (mode === roster.extras.mode) return

  if (mode === 'forward' && roster.extras.defense) {
    clearSlot(roster, { kind: 'extraDefense', slot: 'extraDefense' })
  }

  if (mode === 'defense' && roster.extras.forward) {
    clearSlot(roster, { kind: 'extraForward', slot: 'extraForward' })
  }

  roster.extras.mode = mode
  selectedPlayerId = null
}

function openPicker(target) {
  pickerTarget = target
  selectedPlayerId = null
}

function closePicker() {
  pickerTarget = null
}

function handlePickerSelect(playerId) {
  if (pickerTarget) {
    handleAssign(playerId, pickerTarget)
    closePicker()
  }
}

function resetRoster() {
  roster = createDefaultRoster(players)
  selectedPlayerId = null
}

function clearRoster() {
  roster = createEmptyRoster()
  selectedPlayerId = null
}

async function copyShareUrl() {
  const url = new URL(window.location.href)
  url.searchParams.set('roster', encodeRoster(roster))
  await navigator.clipboard?.writeText(url.toString())
  addToast('Jakolinkki kopioitu leikepöydälle.', 'success')
}
</script>

<svelte:head>
  <title>Rauman Lukko · Ketjut ja kokoonpanotyökalu</title>
</svelte:head>

<div class="app-shell">
  <header class="hero">
    <img class="hero__mark" src={lukkoLogo} aria-hidden="true" alt="Lukko logo" />
    <div>
      <p class="hero__eyebrow">Rauman Lukko</p>
      <h1>Ketjut ja kokoonpano</h1>
      <p class="hero__copy">Rakenna ketjut, tarkista paikkasopivuus ja jaa kokoonpano.</p>
      <p class="app-kicker">Äijänsuo · Rauma · Kokoonpanotyökalu</p>
    </div>
    <div class="hero__actions" aria-label="Kokoonpanon toiminnot">
      <button type="button" onclick={resetRoster}>Palauta oletukset</button>
      <button type="button" onclick={clearRoster}>Tyhjennä</button>
      <button type="button" class="primary" onclick={copyShareUrl}>Jaa</button>
    </div>
  </header>

  <main class="layout">
    <aside class="roster-pool" aria-label="Rosteripooli">
      <div class="pool-filters" role="group" aria-label="Suodata position mukaan">
        {#each POSITIONS as pos}
          <button
            class:active={positionFilter === pos.key}
            type="button"
            onclick={() => positionFilter = pos.key}
          >{pos.label}</button>
        {/each}
      </div>

      <section class="pool-section">
        <div class="pool-section__header">
          <h2>Kokoonpanossa</h2>
          <span>{filterPlayers(players.filter((player) => lineupIds.has(player.id))).length}</span>
        </div>
        <div class="pool-section__cards">
          {#each filterPlayers(players.filter((player) => lineupIds.has(player.id))) as player}
            <RosterPlayerCard
              {player}
              assigned
              selected={selectedPlayerId === player.id}
              onSelect={(playerId) => {
                selectedPlayerId = selectedPlayerId === playerId ? null : playerId
              }}
            />
          {/each}
        </div>
      </section>

      {#if filterPlayers(players.filter((player) => assignedIds.has(player.id) && !lineupIds.has(player.id))).length > 0}
      <section class="pool-section">
        <div class="pool-section__header">
          <h2>Sivussa</h2>
          <span>{filterPlayers(players.filter((player) => assignedIds.has(player.id) && !lineupIds.has(player.id))).length}</span>
        </div>
        <div class="pool-section__cards">
          {#each filterPlayers(players.filter((player) => assignedIds.has(player.id) && !lineupIds.has(player.id))) as player}
            <RosterPlayerCard
              {player}
              assigned
              selected={selectedPlayerId === player.id}
              onSelect={(playerId) => {
                selectedPlayerId = selectedPlayerId === playerId ? null : playerId
              }}
            />
          {/each}
        </div>
      </section>
      {/if}

      <section class="legend-panel" aria-label="Position värit">
        <div class="legend-panel__item">
          <span class="legend-dot forward"></span>
          <span>Hyökkääjä</span>
        </div>
        <div class="legend-panel__item">
          <span class="legend-dot defender"></span>
          <span>Puolustaja</span>
        </div>
        <div class="legend-panel__item">
          <span class="legend-dot goalie"></span>
          <span>Maalivahti</span>
        </div>
      </section>

      <section class="pool-section help-panel" aria-label="Ohjeet pelaajien sijoitteluun">
        <button class="pool-section__header" type="button" onclick={() => helpOpen = !helpOpen}>
          <h2>Ohjeet: pelaajien sijoittelu</h2>
          <span class="help-panel__toggle">{helpOpen ? '−' : '+'}</span>
        </button>
        {#if helpOpen}
        <div class="help-panel__content">
          {#each helpSections as section}
            <div class="help-panel__group">
              <strong>{section.title}</strong>
              {#if section.intro}
                <p class="help-panel__intro">{section.intro}</p>
              {/if}
              <ul class="help-panel__list">
                {#each section.items as item}
                  <li>{item}</li>
                {/each}
              </ul>
            </div>
          {/each}
          <p class="help-panel__note">{helpNote}</p>
        </div>
        {/if}
      </section>
    </aside>

    <section class="workspace" aria-label="Ketjut">
      <div class="workspace-toolbar">
        <div>
          <h2>Kokoonpano · {summary.skaters} / {summary.skaterLimit} kenttäpelaajaa · {summary.goalies} / {summary.goalieLimit} MV</h2>
        </div>
        <div class="view-toggle" aria-label="Valitse näkymä">
          <button class:active={viewMode === 'evenStrength'} type="button" onclick={() => viewMode = 'evenStrength'}>Tasavoima</button>
          <button class:active={viewMode === 'specialTeams'} type="button" onclick={() => viewMode = 'specialTeams'}>Erikoistilanteet</button>
        </div>
      </div>

      <LineBuilder
        {roster}
        {players}
        {viewMode}
        {selectedPlayerId}
        onDropPlayer={handleAssign}
        onClear={handleClear}
        onPickSlot={handlePickSlot}
        onOpenPicker={openPicker}
        onLocked={handleLockedSlot}
        onSetExtraMode={handleSetExtraMode}
        onClearAll={handleClearAll}
      />
    </section>
  </main>

  <footer class="site-footer" aria-label="Sivuston tiedot">
    <p class="site-footer__credit">
      Sivun tekijä:
      <a
        class="site-footer__link"
        href="https://www.linkedin.com/in/miikkamgr/"
        target="_blank"
        rel="noreferrer"
        aria-label="Sivun tekijä Miikka LinkedInissä"
      >Miikka</a>
    </p>
  </footer>

  {#if pickerTarget}
    <PickerModal
      availablePlayers={pickerPlayers}
      target={pickerTarget}
      onSelect={handlePickerSelect}
      onClose={closePicker}
    />
  {/if}

</div>

<Toast {toasts} onDismiss={dismissToast} />
