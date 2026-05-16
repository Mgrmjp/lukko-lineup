<script>
import { untrack } from 'svelte'
import LineBuilder from './lib/components/LineBuilder.svelte'
import PickerModal from './lib/components/PickerModal.svelte'
import RosterPlayerCard from './lib/components/RosterPlayerCard.svelte'
import lukkoLogo from './assets/lukkoyellow.svg'
import {
  applyDefaultsToEmptySpecialTeams,
  assignPlayerToSlot,
  clearSlot,
  createDefaultRoster,
  createEmptyRoster,
  decodeRoster,
  encodeRoster,
  getAssignedPlayerIds,
  getAvailablePlayers,
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
let notice = $state('')
let helpOpen = $state(false)
let viewMode = $state('evenStrength')
let pickerTarget = $state(null)

const assignedIds = $derived(getAssignedPlayerIds(roster))
const summary = $derived(summarizeRoster(players, roster))
const availablePlayers = $derived(getAvailablePlayers(players, roster))

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

function handleAssign(playerId, target) {
  if (target.kind === 'powerplay' || target.kind === 'shorthanded') {
    const result = assignPlayerToSlot(roster, players, playerId, target)
    notice = result.reason
    selectedPlayerId = null
    return
  }

  const existingPlayerId = getPlayerInSlot(roster, target)
  if (existingPlayerId && existingPlayerId !== playerId) {
    clearSlot(roster, target)
    const oldSlot = findPlayerSlot(roster, playerId)
    if (oldSlot) setSlotValue(roster, oldSlot, existingPlayerId)
    setSlotValue(roster, target, playerId)
    if (!oldSlot) removePlayerFromSpecialTeams(roster, existingPlayerId)
    notice = ''
  } else {
    const result = assignPlayerToSlot(roster, players, playerId, target)
    notice = result.reason
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

function swapPlayers(roster, idA, idB) {
  const slotA = findPlayerSlot(roster, idA)
  const slotB = findPlayerSlot(roster, idB)
  if (!slotA || !slotB) return
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
  return null
}

function setSlotValue(roster, target, playerId) {
  if (target.kind === 'forward') roster.forwards[target.index][target.slot] = playerId
  else if (target.kind === 'defense') roster.defense[target.index][target.slot] = playerId
  else if (target.kind === 'extraForward') roster.extras.forward = playerId
  else if (target.kind === 'extraDefense') roster.extras.defense = playerId
  else if (target.kind === 'goalie') roster.goalies[target.index] = playerId
}

function handlePickSlot(target) {
  if (!selectedPlayerId) return
  handleAssign(selectedPlayerId, target)
}

function handleClear(target) {
  clearSlot(roster, target)
  notice = ''
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
  notice = ''
}

function clearRoster() {
  roster = createEmptyRoster()
  selectedPlayerId = null
  notice = ''
}

async function copyShareUrl() {
  const url = new URL(window.location.href)
  url.searchParams.set('roster', encodeRoster(roster))
  await navigator.clipboard?.writeText(url.toString())
  notice = 'Jakolinkki kopioitu leikepöydälle.'
}
</script>

<svelte:head>
  <title>Rauman Lukko ketjut ja kokoonpanotyökalu</title>
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
      <button type="button" onclick={resetRoster}>Palauta</button>
      <button type="button" onclick={clearRoster}>Tyhjennä</button>
      <button type="button" class="primary" onclick={copyShareUrl}>Jaa</button>
    </div>
  </header>

  <main class="layout">
    <aside class="roster-pool" aria-label="Rosteripooli">
      <section class="pool-section">
        <div class="pool-section__header">
          <h2>Vapaat pelaajat</h2>
          <span>{availablePlayers.length}</span>
        </div>
        <div class="pool-section__cards">
          {#each availablePlayers as player}
            <RosterPlayerCard
              {player}
              selected={selectedPlayerId === player.id}
              onSelect={(playerId) => {
                selectedPlayerId = selectedPlayerId === playerId ? null : playerId
                notice = selectedPlayerId ? 'Valitse paikka kokoonpanosta.' : ''
              }}
            />
          {/each}
        </div>
      </section>

      <section class="pool-section">
        <div class="pool-section__header">
          <h2>Kokoonpanossa</h2>
          <span>{assignedIds.size}</span>
        </div>
        <div class="pool-section__cards">
          {#each players.filter((player) => assignedIds.has(player.id)) as player}
            <RosterPlayerCard
              {player}
              assigned
              selected={selectedPlayerId === player.id}
              onSelect={(playerId) => {
                selectedPlayerId = selectedPlayerId === playerId ? null : playerId
                notice = selectedPlayerId ? 'Valitse uusi paikka kokoonpanosta.' : ''
              }}
            />
          {/each}
        </div>
      </section>

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
          <h2>Kokoonpano · {summary.lineupCount} / {summary.limit} sijoitettuna · {summary.free} vapaata</h2>
          {#if notice}
            <p class:notice-ok={notice.includes('kopioitu')} class:notice-warn={notice.includes('yleensä')} class="workspace-toolbar__notice">{notice}</p>
          {/if}
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
      />
    </section>
  </main>

  {#if pickerTarget}
    <PickerModal
      availablePlayers={availablePlayers}
      target={pickerTarget}
      onSelect={handlePickerSelect}
      onClose={closePicker}
    />
  {/if}
</div>
