<script>
const { toasts = [], onDismiss = () => {} } = $props()

const ICONS = {
  error: '✕',
  success: '✓',
  warning: '!',
  info: 'i',
}
</script>

{#if toasts.length > 0}
  <div class="toast-stack" role="status" aria-live="polite">
    {#each toasts as toast (toast.id)}
      <div class="toast toast--{toast.type}" class:toast--exit={toast.exiting}>
        <span class="toast__icon" aria-hidden="true">{ICONS[toast.type] || 'i'}</span>
        <span class="toast__message">{toast.message}</span>
        <button class="toast__close" type="button" aria-label="Sulje" onclick={() => onDismiss(toast.id)}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
.toast-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(90vw, 380px);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .5);
  animation: toast-in 250ms ease-out;
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.toast--exit {
  animation: toast-out 200ms ease-in forwards;
}

.toast--error {
  background: rgba(30, 30, 30, .95);
  color: #ffd100;
  border: 1px solid rgba(255, 209, 0, .3);
}

.toast--success {
  background: rgba(30, 30, 30, .95);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, .3);
}

.toast--warning {
  background: rgba(30, 30, 30, .95);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, .3);
}

.toast--info {
  background: rgba(30, 30, 30, .95);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, .15);
}

.toast__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  border-radius: 50%;
  background: rgba(255, 255, 255, .1);
}

.toast__message {
  flex: 1;
}

.toast__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, .4);
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
}

.toast__close:hover {
  color: rgba(255, 255, 255, .8);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(20px) scale(.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(20px) scale(.95);
  }
}
</style>
