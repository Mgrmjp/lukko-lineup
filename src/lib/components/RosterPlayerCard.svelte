<script>
import { CURRENT_CONTRACT_YEAR } from '../data/roster.js'

const { player, assigned = false, selected = false, onSelect = () => {} } = $props()

const positionClass = $derived(`position-${player.actual_position?.toLowerCase() || 'unknown'}`)
const isInactive = $derived(player.status === 'loukkaantunut' || player.status === 'lainalla')
const isExpiring = $derived(Number(player.contract_year) <= CURRENT_CONTRACT_YEAR)
const statusLabel = $derived(
  player.status === 'loukkaantunut'
    ? 'Loukkaantunut'
    : player.status === 'lainalla'
      ? player.status_note || 'Lainalla'
      : 'Aktiivinen'
)
const numberLabel = $derived(player.number === null || player.number === undefined ? '' : `${player.number}`)
const positionTone = $derived(getPositionTone(player.actual_position))
const surname = $derived(getSurname(player.name))
const firstname = $derived(getFirstNames(player.name))

function handleDragStart(event) {
  if (isInactive) {
    event.preventDefault()
    return
  }

  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', player.id)
}

function getSurname(name) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.at(-1) || ''
}

function getFirstNames(name) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.slice(0, -1).join(' ')
}

function getPositionTone(position) {
  if (position === 'MV') return 'goalie'
  if (position === 'PV') return 'defender'
  return 'forward'
}
</script>

<article
  class:selected
  class:assigned
  class:inactive={isInactive}
  class={`roster-card ${positionTone}`}
  draggable={!isInactive}
  aria-label={`${player.name}, numero ${player.number}, ${statusLabel}`}
  ondragstart={handleDragStart}
>
  <button class="roster-card__button" type="button" disabled={isInactive} onclick={() => onSelect(player.id)}>
    <span class={`roster-card__position ${positionClass}`} aria-hidden="true"></span>
    <span class="roster-card__main">
      <span class="roster-card__name">
        {#if numberLabel}
          <span class="roster-card__number">{numberLabel}</span>
        {/if}
        <span class="roster-card__surname">{surname}</span>
      </span>
      <span class="roster-card__meta">
        {firstname || player.name}
      </span>
      <span class="roster-card__submeta">
        {player.actual_position} · {player.handedness || '-'} · {statusLabel}
      </span>
    </span>
    <span class:expiring={isExpiring} class="roster-card__contract">{player.contract_year}</span>
  </button>

  {#if player.status === 'loukkaantunut'}
    <span class="roster-card__injury" aria-hidden="true">+</span>
  {/if}
</article>
