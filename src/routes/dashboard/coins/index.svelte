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
	let displayedCoins: Coin[];

	onMount(async () => {
		const rawCoins = await callApiAuth('/coins', 'GET');
		coins = JSON.parse(rawCoins);
		displayedCoins = JSON.parse(rawCoins);
		isLoading = false;
	});
</script>

<main class="min-h-screen min-w-full flex flex-col items-center">
	{#if !isLoading}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-3xl">
			{#each displayedCoins as coin}
				<div
					on:click={() => goto(`/dashboard/coins/${coin.coingeckoId}`)}
					class="w-full min-w-full rounded-full flex flex-row items-center shadow-lg p-2 md:p-4 border border-gray-200 outline outline-2 outline-gray-400"
				>
					<img class="h-8 w-8 md:h-12 md:w-12 mx-2" src={coin.information?.image} alt={coin.name} />
					<div class="flex flex-col ml-4">
						<h2 class="text-base md:text-lg font-semibold">
							{coin.name} <strong class="font-bold uppercase text-primary">({coin.symbol})</strong>
						</h2>
						<div class="font-semibold text-sm">
							<small
								class="flex flex-col justify-center rounded-full bg-gray-700 text-white w-fit p-1.5 leading-none"
								>{coin.coingeckoId}</small
							>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
