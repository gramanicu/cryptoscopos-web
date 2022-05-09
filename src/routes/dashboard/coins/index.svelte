<script lang="ts">
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import auth from '$lib/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';
	import type { Coin } from '$lib/types';
	import { callApiAuth } from '$lib/api';

	let isLoading = true;
	let coins: Coin[];

	onMount(async () => {
		const rawCoins = await callApiAuth('/coins', 'GET');
		coins = JSON.parse(rawCoins);
		isLoading = false;
	});
</script>

<main class="min-h-screen min-w-full flex flex-col items-center">
	{#if !isLoading}
		{#each coins as coin}
			<div class="prose">
				<h2>{coin.name}</h2>
				<h5>{coin.coingeckoId}</h5>
				<p>{coin.id}</p>
				<p>{coin.symbol}</p>
				<img src={coin.information?.image} alt={coin.name} />
				<div class="prose">{@html coin.information?.description}</div>
			</div>
		{/each}
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
