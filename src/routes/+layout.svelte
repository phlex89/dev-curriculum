<script lang="ts">
	import '$lib/fonts.css'; // self-hosted @font-face (latin subset), replaces the Google Fonts <link>
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
