<script>
const { summary } = $props()
</script>

<section class="summary" aria-label="Rosterin yhteenveto">
  <div class="summary__panel">
    <div class="summary__column summary__column--accent">
      <strong>{summary.lineupCount}</strong>
      <span>sijoitettuna</span>
    </div>
  </div>
</section>
