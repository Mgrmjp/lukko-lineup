<script>
const { message = '', type = 'error', onDismiss = () => {} } = $props()

$effect(() => {
  if (!message) return
  const timer = setTimeout(() => onDismiss(), 4000)
  return () => clearTimeout(timer)
})
</script>

{#if message}
  <div class="toast toast--{type}" role="alert">
    <span class="toast__message">{message}</span>
    <button class="toast__close" type="button" aria-label="Sulje" onclick={onDismiss}>
      <span aria-hidden="true">×</span>
    </button>
  </div>
{/if}

<style>
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .4);
  animation: toast-in 200ms ease-out;
  max-width: min(90vw, 420px);
}

.toast--error {
  background: rgba(199, 84, 101, .95);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .15);
}

.toast--success {
  background: rgba(52, 168, 100, .95);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .15);
}

.toast--warning {
  background: rgba(200, 150, 50, .95);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .15);
}

.toast__message {
  flex: 1;
}

.toast__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, .7);
  font-size: 18px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.toast__close:hover {
  color: #fff;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
