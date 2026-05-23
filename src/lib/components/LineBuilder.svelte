<script>
import { getPlayerById, SLOT_LABELS } from '../data/roster.js'
import LineSlot from './LineSlot.svelte'

const {
  roster,
  players,
  viewMode = 'evenStrength',
  selectedPlayerId = null,
  onDropPlayer = () => {},
  onClear = () => {},
  onPickSlot = () => {},
  onOpenPicker = () => {},
  onLocked = () => {},
  onSetExtraMode = () => {},
  onClearAll = () => {},
} = $props()

function player(playerId) {
  return getPlayerById(players, playerId)
}

function isExtraLocked(kind) {
  if (kind === 'forward') return roster.extras.mode !== 'forward'
  if (kind === 'defense') return roster.extras.mode !== 'defense'
  return false
}

function extraLockReason(kind) {
  if (kind === 'forward' && roster.extras.mode === 'defense') {
    return '7D-järjestelmä on lukittu käyttöön. Vaihda 13F-järjestelmään ennen 13. hyökkääjän valintaa.'
  }

  if (kind === 'defense' && roster.extras.mode === 'forward') {
    return '13F-järjestelmä on lukittu käyttöön. Vaihda 7D-järjestelmään ennen 7. puolustajan valintaa.'
  }

  return ''
}
</script>

<div class="line-table">
  {#if viewMode === 'evenStrength'}
  <section class="line-section lineup-panel">
    <div class="line-section__header">
      <h2>Hyökkäysketjut</h2>
    </div>
    <div class="position-header">
      <span class="position-label"></span>
      <span class="position-label">VL</span>
      <span class="position-label">KH</span>
      <span class="position-label">OL</span>
    </div>
    {#each roster.forwards as line, index}
      <article class="line-row">
        <div class="line-row__title">
          <strong>{line.line}. ketju</strong>
        </div>
        <LineSlot label={SLOT_LABELS.lw} player={player(line.lw)} target={{ kind: 'forward', index, slot: 'lw' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} />
        <LineSlot label={SLOT_LABELS.c} player={player(line.c)} target={{ kind: 'forward', index, slot: 'c' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} />
        <LineSlot label={SLOT_LABELS.rw} player={player(line.rw)} target={{ kind: 'forward', index, slot: 'rw' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} />
      </article>
    {/each}
  </section>

  <section class="line-section lineup-panel">
    <div class="line-section__header">
      <h2>Puolustajaparit</h2>
    </div>
    <div class="position-header position-header--defense">
      <span class="position-label"></span>
      <span class="position-label">VP</span>
      <span class="position-label">OP</span>
    </div>
    {#each roster.defense as pair, index}
      <article class="line-row defense-row">
        <div class="line-row__title">
          <strong>{pair.pair}. pari</strong>
        </div>
        <LineSlot label={SLOT_LABELS.ld} player={player(pair.ld)} target={{ kind: 'defense', index, slot: 'ld' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} />
        <LineSlot label={SLOT_LABELS.rd} player={player(pair.rd)} target={{ kind: 'defense', index, slot: 'rd' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} />
      </article>
    {/each}
  </section>

  <section class="line-section lineup-panel">
    <div class="line-section__header">
      <h2>19. kenttäpelaaja</h2>
      <div class="extras-mode-toggle" aria-label="Valitse 13F tai 7D">
        <button
          type="button"
          class:active={roster.extras.mode === 'forward'}
          onclick={() => onSetExtraMode('forward')}
        >13F</button>
        <button
          type="button"
          class:active={roster.extras.mode === 'defense'}
          onclick={() => onSetExtraMode('defense')}
        >7D</button>
      </div>
    </div>
    <article class="line-row extras-row">
      <div class="extras-row__title">
        <strong>13. hyökkääjä</strong>
        {#if isExtraLocked('forward')}
          <span class="extras-row__status">Lukittu</span>
        {:else}
          <span class="extras-row__status extras-row__status--active">Aktiivinen</span>
        {/if}
      </div>
      <LineSlot
        label="13. hyökkääjä"
        player={player(roster.extras.forward)}
        target={{ kind: 'extraForward', slot: 'extraForward' }}
        locked={isExtraLocked('forward')}
        lockReason={extraLockReason('forward')}
        {selectedPlayerId}
        {onDropPlayer}
        {onClear}
        {onPickSlot}
        {onOpenPicker}
        {onLocked}
      />
      <div class="extras-row__title">
        <strong>7. puolustaja</strong>
        {#if isExtraLocked('defense')}
          <span class="extras-row__status">Lukittu</span>
        {:else}
          <span class="extras-row__status extras-row__status--active">Aktiivinen</span>
        {/if}
      </div>
      <LineSlot
        label="7. puolustaja"
        player={player(roster.extras.defense)}
        target={{ kind: 'extraDefense', slot: 'extraDefense' }}
        locked={isExtraLocked('defense')}
        lockReason={extraLockReason('defense')}
        {selectedPlayerId}
        {onDropPlayer}
        {onClear}
        {onPickSlot}
        {onOpenPicker}
        {onLocked}
      />
    </article>
  </section>

  <section class="line-section goalie-section lineup-panel">
    <div class="line-section__header">
      <h2>Maalivahdit</h2>
    </div>
    <article class="goalie-row">
      {#each roster.goalies as goalieId, index}
        <LineSlot label={index === 0 ? 'Aloittava MV' : 'Varalla'} player={player(goalieId)} target={{ kind: 'goalie', index, slot: 'goalie' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} />
      {/each}
    </article>
  </section>

  {/if}

  {#if viewMode === 'specialTeams'}
  <section class="line-section lineup-panel special-section">
    <div class="line-section__header">
      <h2>Ylivoima</h2>
      <button type="button" class="line-section__clear-all" onclick={() => onClearAll('powerplay')}>Tyhjennä</button>
    </div>
    <div class="special-units">
      {#each roster.powerplay as unit, index}
        <article class="special-unit" aria-label={`Ylivoimayksikkö ${unit.unit}`}>
          <div class="special-unit__title">
            <strong>YV {unit.unit} · 1-3-1</strong>
          </div>
          <div class="special-ice special-ice--powerplay">
            <svg class="pp-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="50" y1="19" x2="22" y2="47" />
              <line x1="50" y1="19" x2="78" y2="47" />
              <line x1="22" y1="47" x2="50" y2="71" />
              <line x1="78" y1="47" x2="50" y2="71" />
              <line x1="50" y1="71" x2="50" y2="90" />
            </svg>
            <div class="special-slot special-slot--pp-left">
              <LineSlot label={SLOT_LABELS.ppLeft} player={player(unit.ppLeft)} target={{ kind: 'powerplay', index, slot: 'ppLeft' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
            <div class="special-slot special-slot--pp-center">
              <LineSlot label={SLOT_LABELS.ppCenter} player={player(unit.ppCenter)} target={{ kind: 'powerplay', index, slot: 'ppCenter' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact isKey />
            </div>
            <div class="special-slot special-slot--pp-right">
              <LineSlot label={SLOT_LABELS.ppRight} player={player(unit.ppRight)} target={{ kind: 'powerplay', index, slot: 'ppRight' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
            <div class="special-slot special-slot--pp-ld">
              <LineSlot label={SLOT_LABELS.ppLd} player={player(unit.ppLd)} target={{ kind: 'powerplay', index, slot: 'ppLd' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact isKey />
            </div>
            <div class="special-slot special-slot--pp-rd">
              <LineSlot label={SLOT_LABELS.ppRd} player={player(unit.ppRd)} target={{ kind: 'powerplay', index, slot: 'ppRd' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
          </div>
        </article>
      {/each}
    </div>
  </section>

  <section class="line-section lineup-panel special-section">
    <div class="line-section__header">
      <h2>Alivoima</h2>
      <button type="button" class="line-section__clear-all" onclick={() => onClearAll('shorthanded')}>Tyhjennä</button>
    </div>
    <div class="special-units">
      {#each roster.shorthanded as unit, index}
        <article class="special-unit" aria-label={`Alivoimayksikkö ${unit.unit}`}>
          <div class="special-unit__title">
            <strong>AV {unit.unit} · Neliö</strong>
          </div>
          <div class="special-ice special-ice--shorthanded">
            <svg class="pk-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="24" y1="22" x2="76" y2="22" />
              <line x1="24" y1="62" x2="76" y2="62" />
              <line x1="24" y1="22" x2="24" y2="62" />
              <line x1="76" y1="22" x2="76" y2="62" />
            </svg>
            <div class="special-slot special-slot--pk-f1">
              <LineSlot label={SLOT_LABELS.pkF1} player={player(unit.pkF1)} target={{ kind: 'shorthanded', index, slot: 'pkF1' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
            <div class="special-slot special-slot--pk-f2">
              <LineSlot label={SLOT_LABELS.pkF2} player={player(unit.pkF2)} target={{ kind: 'shorthanded', index, slot: 'pkF2' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
            <div class="special-slot special-slot--pk-d1">
              <LineSlot label={SLOT_LABELS.pkD1} player={player(unit.pkD1)} target={{ kind: 'shorthanded', index, slot: 'pkD1' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
            <div class="special-slot special-slot--pk-d2">
              <LineSlot label={SLOT_LABELS.pkD2} player={player(unit.pkD2)} target={{ kind: 'shorthanded', index, slot: 'pkD2' }} {selectedPlayerId} {onDropPlayer} {onClear} {onPickSlot} {onOpenPicker} compact />
            </div>
          </div>
        </article>
      {/each}
    </div>
  </section>
  {/if}
</div>
