<script>

const {
  player = null,
  label,
  target,
  selectedPlayerId = null,
  onDropPlayer = () => {},
  onClear = () => {},
  onPickSlot = () => {},
  onOpenPicker = () => {},
  onLocked = () => {},
  compact = false,
  isKey = false,
  locked = false,
  lockReason = '',
} = $props()
const numberLabel = $derived(player?.number === null || player?.number === undefined ? '' : `${player.number}`)
const positionTone = $derived(getPositionTone(player?.actual_position, target.slot))
const surname = $derived(player ? getSurname(player.name) : '')
const firstname = $derived(player ? getFirstNames(player.name) : '')
const handedness = $derived(player?.handedness || '')
const contractYear = $derived(player?.contract_year || '')
const age = $derived(player?.birth_year ? new Date().getFullYear() - player.birth_year : null)
const DEFENSE_SLOTS = new Set(['ppLd', 'pkD1', 'pkD2'])
const positionMismatch = $derived(compact && player?.actual_position === 'PV' && !DEFENSE_SLOTS.has(target.slot))

let dragCounter = $state(0)
const isOver = $derived(dragCounter > 0)

function getSurname(name) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.at(-1) || ''
}

function getFirstNames(name) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.slice(0, -1).join(' ')
}

function getPositionTone(position, slot) {
  if (position === 'MV' || slot === 'goalie') return 'goalie'
  if (position === 'PV' || slot === 'ld' || slot === 'rd') return 'defender'
  return 'forward'
}

function handleDragEnter(event) {
  if (locked) return
  event.preventDefault()
  dragCounter++
}

function handleDragLeave(event) {
  dragCounter--
}

function handleDragOver(event) {
  if (locked) {
    event.dataTransfer.dropEffect = 'none'
    return
  }
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
}

function handleDragStart(event) {
  if (!player) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', player.id)
}

function handleDragEnd() {
  dragCounter = 0
}

function handleDrop(event) {
  event.preventDefault()
  dragCounter = 0
  if (locked) {
    onLocked(lockReason || `${label} on lukittu.`)
    return
  }
  const playerId = event.dataTransfer.getData('text/plain')
  if (playerId) onDropPlayer(playerId, target)
}

function handleClick() {
  if (locked) onLocked(lockReason || `${label} on lukittu.`)
  else if (selectedPlayerId) onPickSlot(target)
  else if (!player) onOpenPicker(target)
}
</script>

{#if compact}
  <div class="tactic-card-wrapper" class:mismatch={positionMismatch}>
    <div
      class:is-over={isOver}
      class:filled={player}
      class:clickable={selectedPlayerId && !locked}
      class:locked={locked}
      class:mismatch={positionMismatch}
      class:is-key={isKey && player}
      class="tactic-card"
      role="button"
      tabindex="0"
      draggable={!!player && !locked}
      aria-label={player ? `${label}: ${player.name}` : locked ? `${label}: lukittu paikka` : `${label}: tyhjä paikka`}
      aria-disabled={locked}
      onclick={handleClick}
      onkeydown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && (selectedPlayerId || locked)) {
          event.preventDefault()
          handleClick()
        }
      }}
      ondragstart={handleDragStart}
      ondragend={handleDragEnd}
      ondragenter={handleDragEnter}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
    >
      <div class="tactic-card__position-label">{label}</div>
      {#if player}
        {#if numberLabel}
          <span class="tactic-card__number">{numberLabel}</span>
        {/if}
        <div class="tactic-card__name">{surname}</div>
        <div class="tactic-card__meta">{age !== null ? `${age}v` : ''}{age !== null && handedness ? ' · ' : ''}{handedness || ''}</div>
        <button
          class="line-slot__clear tactic-card__clear"
          type="button"
          aria-label={`Poista ${player.name} paikasta ${label}`}
          onmousedown={(event) => event.stopPropagation()}
          onclick={(event) => {
            event.stopPropagation()
            onClear(target)
          }}
          ondragstart={(event) => event.preventDefault()}
        >
          <span aria-hidden="true"></span>
        </button>
      {:else if locked}
        <div class="tactic-card__empty-graphic">
          <div class="line-slot__lock-icon" aria-hidden="true"></div>
          <div class="tactic-card__label">Lukittu</div>
          <div class="tactic-card__empty-add">{lockReason}</div>
        </div>
      {:else}
        <div class="tactic-card__empty-graphic">
          <svg class="jersey-silhouette jersey-silhouette--sm" viewBox="0 0 36 44" fill="none" aria-hidden="true">
            <path d="M6 6 L12 2 L18 7 L24 2 L30 6 L32 14 L32 42 L4 42 L4 14 Z" stroke="currentColor" stroke-width="1.1"/>
            <path d="M12 2 L18 10 L24 2" stroke="currentColor" stroke-width="1.1"/>
            <path d="M4 14 L2 21" stroke="currentColor" stroke-width="1.1"/>
            <path d="M32 14 L34 21" stroke="currentColor" stroke-width="1.1"/>
            <circle cx="18" cy="26" r="3" stroke="currentColor" stroke-width="1.1"/>
          </svg>
          <div class="tactic-card__empty-add">+ Lisää pelaaja</div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div
    class:is-over={isOver}
    class:filled={player}
    class:clickable={selectedPlayerId && !locked}
    class:locked={locked}
    class={`line-slot ${positionTone}`}
    role="button"
    tabindex="0"
    draggable={!!player && !locked}
    aria-label={player ? `${label}: ${player.name}` : locked ? `${label}: lukittu paikka` : `${label}: tyhjä paikka`}
    aria-disabled={locked}
    onclick={handleClick}
    onkeydown={(event) => {
      if ((event.key === 'Enter' || event.key === ' ') && (selectedPlayerId || locked)) {
        event.preventDefault()
        handleClick()
      }
    }}
    ondragstart={handleDragStart}
    ondragend={handleDragEnd}
    ondragenter={handleDragEnter}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
  >
    {#if player}
      <div class="line-slot__info">
        <div class="line-slot__header">
          <span class="line-slot__number" data-number={numberLabel || '—'}>{numberLabel || '—'}</span>
          <button
            class="line-slot__clear"
            type="button"
            aria-label={`Poista ${player.name} paikasta ${label}`}
            onmousedown={(event) => event.stopPropagation()}
            onclick={(event) => {
              event.stopPropagation()
              onClear(target)
            }}
            ondragstart={(event) => event.preventDefault()}
          >
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div class="line-slot__bio">
          <div class="line-slot__surname">{surname}</div>
          <div class="line-slot__details">
            {#if firstname}
              <span>{firstname}</span>
            {/if}
            {#if age !== null}
              <span>{age}v</span>
            {/if}
            <span>{handedness || '-'}</span>
            <span>{contractYear}</span>
          </div>
        </div>
      </div>
    {:else if locked}
      <div class="line-slot__empty-graphic line-slot__empty-graphic--locked">
        <div class="line-slot__lock-icon" aria-hidden="true"></div>
        <div class="line-slot__empty-label">Lukittu</div>
        <div class="line-slot__lock-copy">{lockReason}</div>
      </div>
    {:else}
      <div class="line-slot__empty-graphic">
        <svg class="jersey-silhouette" viewBox="0 0 36 44" fill="none" aria-hidden="true">
          <path d="M6 6 L12 2 L18 7 L24 2 L30 6 L32 14 L32 42 L4 42 L4 14 Z" stroke="currentColor" stroke-width="1.2"/>
          <path d="M12 2 L18 10 L24 2" stroke="currentColor" stroke-width="1.2"/>
          <path d="M4 14 L2 21" stroke="currentColor" stroke-width="1.2"/>
          <path d="M32 14 L34 21" stroke="currentColor" stroke-width="1.2"/>
          <circle cx="18" cy="26" r="3" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        <div class="line-slot__empty-label">{label}</div>
        <div class="line-slot__empty-add">+ Lisää pelaaja</div>
      </div>
    {/if}
  </div>
{/if}
