<script>
import RosterPlayerCard from './RosterPlayerCard.svelte'

const { availablePlayers = [], target = null, onSelect = () => {}, onClose = () => {} } = $props()

function handlePlayerSelect(playerId) {
  onSelect(playerId)
}
</script>

<div class="picker-overlay" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()} role="button" tabindex="-1">
  <div class="picker-panel" onclick={(e) => e.stopPropagation()} role="presentation">
    <div class="picker-header">
      <h3>Valitse pelaaja</h3>
      <button type="button" class="picker-close" onclick={onClose} aria-label="Sulje">
        <span></span>
      </button>
    </div>
    <div class="picker-content">
      {#each availablePlayers as player}
        <RosterPlayerCard
          {player}
          onSelect={handlePlayerSelect}
        />
      {/each}
    </div>
  </div>
</div>

<style>
.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: pickerFadeIn 150ms ease;
}

@keyframes pickerFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.picker-panel {
  width: min(100%, 420px);
  max-height: 80vh;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  animation: pickerSlideIn 200ms ease;
}

@keyframes pickerSlideIn {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--panel-bg-soft);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.picker-header h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.picker-close {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: #cbd5e1;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 120ms ease;
}

.picker-close span,
.picker-close span::after {
  display: block;
  width: 12px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  content: '';
}

.picker-close span {
  transform: rotate(45deg);
}

.picker-close span::after {
  transform: rotate(90deg);
}

.picker-close:hover {
  color: #fff;
  background: rgba(223, 91, 103, 0.85);
  border-color: var(--red-primary);
}

.picker-content {
  overflow-y: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.picker-content :global(.roster-card__name) {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.picker-content :global(.roster-card__main) {
  min-width: 0;
}
</style>
