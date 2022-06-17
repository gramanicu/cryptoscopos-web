<script lang="ts">
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import auth from '$lib/authService';
	import { goto, prefetch } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';
	import type { Coin, CoinSearchResults } from '$lib/types';
	import { callApiAuth } from '$lib/api';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { X, PlusCircle, Database } from '@steeze-ui/heroicons';
	import { Result } from 'postcss';

	let isLoading = true;
	let coins: Coin[] = [];
	let fullSearchResults: CoinSearchResults[] = [];
	let searchText: string = '';
	$: displayedCoins = coins?.filter((coin) => {
		if (searchText == '') return true;
		return (
			coin.name.toLowerCase().includes(searchText.toLowerCase()) ||
			coin.coingeckoId.toLowerCase().includes(searchText.toLowerCase()) ||
			coin.symbol.toLowerCase().includes(searchText.toLowerCase())
		);
	});

	let fullSearchEnabled = false;

	onMount(async () => {
		const rawCoins = await callApiAuth('/coins', 'GET');
		coins = JSON.parse(rawCoins);
		displayedCoins = JSON.parse(rawCoins);
		isLoading = false;
	});

	async function fullSearch() {
		fullSearchEnabled = true;
		isLoading = true;
		const rawResults = await callApiAuth(`/coins/full-search/${searchText}`, 'GET');

		if (rawResults) {
			fullSearchResults = JSON.parse(rawResults);
		}
		isLoading = false;
	}

	async function addCoin(coingeckoId: string): Promise<boolean> {
		const rawResult = await callApiAuth(`/coins/${coingeckoId}`, 'POST');

		if (rawResult) {
			const newCoin = JSON.parse(rawResult) as Coin;
			coins.push(newCoin);
			return true;
		}
		return false;
	}
</script>

<main class="min-w-full flex flex-col items-center">
	<div class="my-4 w-full max-w-3xl flex flex-col px-0 sm:px-4 xl:mx-4 mt-8">
		<div class="w-full overflow-hidden rounded-lg shadow-sm flex flex-row border-gray-300 border">
			<input
				on:keyup|preventDefault={(event) => {
					if (event.code == 'Enter') {
						event.preventDefault();
						fullSearch();
					}
				}}
				bind:value={searchText}
				type="text"
				name="search_term"
				id="search_term"
				class="block focus:ring-0 focus:outline-0 focus:outline-offset-0 w-full px-4 sm:text-sm border-0"
				placeholder={fullSearchEnabled ? 'Full search term' : 'Search term'}
			/>
			<div class="px-2 flex items-center">
				<span
					on:click={() => {
						searchText = '';
						fullSearchEnabled = false;
					}}
					class=" sm:text-sm {searchText != '' || fullSearchEnabled
						? 'cursor-pointer text-gray-500 hover:text-black'
						: 'text-transparent cursor-default pointer-events-none'}"
				>
					<Icon src={X} theme="solid" class="w-4 h-4 transition-colors duration-300 " /></span
				>
			</div>
			<div class="flex items-center">
				<label for="currency" class="sr-only">Currency</label>
				<button
					on:click={() => fullSearch()}
					id="full-search"
					name="full-search"
					class=" whitespace-nowrap h-full px-4 border-transparent bg-primary text-white sm:text-sm"
				>
					Full Search
				</button>
			</div>
		</div>
		<small class="text-sm p-2 font-medium text-gray-500"
			>*full search will include our external sources. Press the button or submit key to intialise
			it</small
		>
	</div>

	{#if !isLoading}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 max-w-4xl mb-6">
			{#if !fullSearchEnabled}
				{#if displayedCoins.length > 0}
					{#each displayedCoins as coin}
						<div
							on:click={() => goto(`/dashboard/coins/${coin.coingeckoId}`)}
							class="w-full min-w-full rounded-full cursor-pointer flex flex-row items-center shadow-lg p-2 md:p-4 hover:outline-tertiary border border-gray-200 outline outline-2 outline-gray-400"
						>
							<img
								class="h-8 w-8 md:h-12 md:w-12 mx-2"
								src={coin.information?.image}
								alt={coin.name}
							/>
							<div class="flex flex-col ml-4">
								<h2 class="text-base md:text-lg font-semibold">
									{coin.name}
									<strong class="font-bold uppercase text-primary">({coin.symbol})</strong>
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
				{:else}
					<h3>No results</h3>
				{/if}
			{:else if fullSearchResults.length > 0}
				<div
					class="p-4 flex flex-col justify-center w-full border shadow-md rounded-lg col-span-1 sm:col-span-2"
				>
					{#each fullSearchResults as result}
						<div class="text-xl flex flex-row w-full justify-start items-center p-2">
							<h3>{result.name} <strong>({result.symbol})</strong></h3>
							<div class="font-semibold text-lg mx-4">
								<small
									class="flex flex-col justify-center select-all rounded-full bg-gray-700 text-white w-fit p-1.5 leading-none"
									>{result.gecko_id}</small
								>
							</div>
							<div
								class="ml-auto {!result.is_internal ? 'cursor-pointer' : ''}"
								on:click={async () => {
									if (!result.is_internal) {
										const added = await addCoin(result.gecko_id);

										result.is_internal = added;
									}
								}}
							>
								<Icon
									src={!result.is_internal ? PlusCircle : Database}
									theme="solid"
									class="w-8 h-8 {!result.is_internal
										? 'text-primary hover:text-tertiary'
										: 'text-accent'}  transition-colors duration-300 "
								/>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<h3>No results</h3>
			{/if}
		</div>
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
