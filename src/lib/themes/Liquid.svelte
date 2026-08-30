<script lang="ts">
  import { getCvData, getUi } from '$lib/i18n';

  const cvData = getCvData();
  const t = getUi().liquid;
</script>

<div class="liquid-wrapper">
  <h1>{cvData.name}</h1>
  <p>{t.tabs.profile}</p>
</div>

<style>
  .liquid-wrapper {
    width: 100vw;
    height: 100dvh;
    display: grid;
    place-items: center;
    background: #101018;
    color: #fff;
    font-family: -apple-system, 'SF Pro Display', system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif;
  }
</style>
