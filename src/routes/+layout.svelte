<script lang="ts">
	import '$lib/fonts.css'; // self-hosted @font-face (latin subset), replaces the Google Fonts <link>

	let { children } = $props();
</script>

{@render children()}
