<script lang="ts">
	import '$lib/fonts.css'; // self-hosted @font-face (latin subset), replaces the Google Fonts <link>
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();

	let { children } = $props();
</script>

{@render children()}
