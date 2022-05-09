<script lang="ts">
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import auth from '$lib/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';

	let isLoading = true;

	onMount(async () => {
		isLoading = true;
	});
</script>

<main class="min-h-screen min-w-full flex flex-col items-center">
	{#if !isLoading}
		COINS
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
