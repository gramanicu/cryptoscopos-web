<script context="module" lang="ts">
	import { callApi } from '$lib/api';
	import type { Coin, CoinData, CoinStatistics } from '$lib/types';

	import type { LoadInput } from '@sveltejs/kit';
	export async function load({ fetch, params, session, props }: LoadInput) {
		const id = params.cgid;
		const rawCoin = await callApi(`/coins/${id}`, 'GET');
		if (rawCoin) {
			const coin: Coin = JSON.parse(rawCoin);

			const rawData = await callApi(`/coins/${id}/data`, 'GET');

			if (rawData) {
				const data: CoinData[] = JSON.parse(rawData);

				coin.data = data.sort((a, b) => {
					return (
						DateTime.fromISO(a.timestamp).toMillis() - DateTime.fromISO(b.timestamp).toMillis()
					);
				});

				const rawStats = await callApi(`/coins/${id}/stats`, 'GET');

				if (rawStats) {
					const stats: CoinStatistics = JSON.parse(rawStats);

					coin.stats = stats;
				}
			}

			return {
				props: {
					coin
				}
			};
		}

		return {
			status: 404
		};
	}
</script>

<script lang="ts">
	import Chart from 'chart.js/auto';
	import { DateTime } from 'luxon';
	import { onMount } from 'svelte';
	import * as LuxonAdapter from 'chartjs-adapter-luxon';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { TrendingDown, TrendingUp, ArrowRight } from '@steeze-ui/heroicons';

	export let coin: Coin;

	$: data = coin.data?.map((dp) => {
		const time: DateTime = DateTime.fromISO(dp.timestamp);

		return {
			x: time.toMillis(),
			y: dp.value
		};
	});

	onMount(async () => {
		if (coin.data) {
			renderChart();
		}
		clampText = shouldClamp();
	});

	function renderChart() {
		let chart = new Chart('myChart', {
			type: 'line',
			data: {
				datasets: [
					{
						data: data,
						borderColor: 'rgb(128,83,201)',
						backgroundColor: 'rgb(128,83,201,0.25)',
						fill: true
					}
				]
			},
			options: {
				indexAxis: 'x',
				animation: false,
				parsing: false,
				responsive: true,
				plugins: {
					title: {
						display: true
						// text: `${coin.symbol.toUpperCase()} price over time`
					},
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								var label = context.dataset.label || '';

								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									label += new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD'
									}).format(context.parsed.y);
								}
								return label;
							}
						}
					},
					decimation: {
						algorithm: 'lttb',
						enabled: true,
						samples: 20
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x',
					intersect: false
				},
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day'
						},
						title: {
							display: false,
							text: 'Date & Time (UTC)'
						},
						grid: {
							display: false
						},
						ticks: {
							source: 'auto',
							maxRotation: 0,
							autoSkip: true
						}
					},
					y: {
						title: {
							display: false,
							text: 'Price (in USD)'
						},
						ticks: {
							callback: function (value, index, ticks) {
								return value + 'USD';
							},
							precision: 2
						},
						grid: {
							display: false
						}
					}
				}
			}
		});
	}

	const priceStatus = (): number => {
		if (coin.stats?.last_1h === 'unavailable') return 0;
		const val = coin.stats?.last_1h as number;

		if (val > 0) {
			return 1;
		} else if (val === 0) {
			return 0;
		}

		return -1;
	};

	const priceDiff = (): string => {
		if (coin.stats?.last_1h === 'unavailable') return 'NaN';
		const val = coin.stats?.last_1h as number;

		const sign = priceStatus() < 0 ? '-' : '+';

		return `${sign}${Math.abs(val).toFixed(2)}`;
	};

	const getDomain = (): string => {
		return new URL(coin.information?.homepage as string).hostname;
	};

	let showAll = false;
	const shouldClamp = (): boolean => {
		if (coin.information?.description == undefined) {
			return false;
		}

		return coin.information?.description.length > 200 && !showAll;
	};

	let clampText = false;

	const toggleShow = () => {
		showAll = !showAll;
		clampText = shouldClamp();
	};
</script>

<main class="min-h-screen h-full w-full flex flex-col items-center">
	<div class="flex flex-col w-full max-w-3xl justify-center px-0 sm:px-4 xl:mx-4 mt-8">
		<div class="flex flex-col sm:flex-row items-center justify-evenly">
			<div class="flex flex-row items-center">
				<img class="w-6 h-6 sm:w-8 sm:h-8" src={coin.information?.image} alt={coin.name} />
				<h1 class="font-bold text-xl sm:text-2xl ml-2 sm:ml-4">{coin.name}</h1>
			</div>

			{#if coin.stats}
				<div class="inline-flex flex-row text-xl items-center">
					<h2 class="mr-2">{coin.stats?.value.toFixed(2)} USD</h2>

					{#if priceStatus() === 1}
						<Icon src={TrendingUp} theme="solid" class="h-5 w-5 text-green-500" />
					{:else if priceStatus() === -1}
						<Icon src={TrendingDown} theme="solid" class="h-5 w-5 text-red-500" />
					{:else}
						<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
					{/if}
					<small class="font-semibold text-sm">{priceDiff()}%</small>
				</div>
			{/if}
		</div>

		<div
			class="sm:rounded-lg border-t border-b sm:border my-6 border-gray-300 shadow-md p-4 sm:p-8 grid grid-cols-2 items-baseline sm:grid-cols-6"
		>
			<div class="col-span-1 place-self-end mr-4 sm:mr-0 sm:place-self-auto text-lg font-semibold">
				Website
			</div>
			<div class="col-span-1 sm:col-span-2 self-center sm:self-auto text-tertiary font-semibold">
				<a target="#" href={coin.information?.homepage}>{getDomain()}</a>
			</div>
			<div
				class="mt-2 sm:mt-0 col-span-1 place-self-end mr-4 sm:mr-0 sm:place-self-auto text-lg font-semibold"
			>
				API id
			</div>
			<span class="mt-2 sm:mt-0 col-span-1 sm:col-span-2"
				><small
					class="flex flex-col cursor-pointer select-all justify-center rounded-full bg-gray-700 text-white w-fit p-1.5 leading-none"
					>{coin.coingeckoId}</small
				></span
			>
			{#if coin.information?.description}
				<div
					class="mb-2 mt-6 place-self-center sm:place-self-auto sm:mt-4 col-span-2 sm:col-span-6 text-lg font-semibold"
				>
					Description
				</div>
				<div
					class="col-span-2 sm:col-span-6 prose transition-transform {clampText
						? 'line-clamp-3'
						: ''}"
				>
					{@html coin.information?.description}
				</div>
				{#if clampText || showAll}
					<div class="col-span-2 mt-2 sm:col-span-6 flex flex-col items-center sm:items-end">
						<button on:click={() => toggleShow()} class="text-sm font-semibold text-accent"
							>{!showAll ? 'Show more' : 'Show less'}</button
						>
					</div>
				{/if}
			{/if}
		</div>

		{#if coin.stats}
			<div
				class="flex flex-col sm:flex-row w-full justify-between p-4 border rounded-lg sm:divide-x shadow-md"
			>
				{#if coin.stats?.last_1h !== 'unavailable'}
					<div class="flex flex-col w-full items-center">
						<h3 class="text-lg font-light text-gray-700">Last hour</h3>
						<div class="flex flex-row items-center">
							{#if Number(coin.stats?.last_1h) > 0}
								<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
							{:else if Number(coin.stats?.last_1h) < 0}
								<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
							{:else}
								<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
							{/if}
							<span class="ml-1"> {Number(coin.stats?.last_1h).toFixed(2)}%</span>
						</div>
					</div>
				{/if}
				{#if coin.stats?.last_24h !== 'unavailable'}
					<div class="flex flex-col w-full items-center">
						<h3 class="text-lg font-light text-gray-700">Last 24 hours</h3>
						<div class="flex flex-row items-center">
							{#if Number(coin.stats?.last_24h) > 0}
								<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
							{:else if Number(coin.stats?.last_24h) < 0}
								<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
							{:else}
								<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
							{/if}
							<span class="ml-1"> {Number(coin.stats?.last_24h).toFixed(2)}%</span>
						</div>
					</div>
				{/if}
				{#if coin.stats?.last_7day !== 'unavailable'}
					<div class="flex flex-col w-full items-center">
						<h3 class="text-lg font-light text-gray-700">Last 7 days</h3>
						<div class="flex flex-row items-center">
							{#if Number(coin.stats?.last_7day) > 0}
								<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
							{:else if Number(coin.stats?.last_7day) < 0}
								<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
							{:else}
								<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
							{/if}
							<span class="ml-1"> {Number(coin.stats?.last_7day).toFixed(2)}%</span>
						</div>
					</div>
				{/if}
				{#if coin.stats?.last_30day !== 'unavailable'}
					<div class="flex flex-col w-full items-center">
						<h3 class="text-lg font-light text-gray-700">Last 30 days</h3>
						<div class="flex flex-row items-center">
							{#if Number(coin.stats?.last_30day) > 0}
								<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
							{:else if Number(coin.stats?.last_30day) < 0}
								<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
							{:else}
								<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
							{/if}
							<span class="ml-1"> {Number(coin.stats?.last_30day).toFixed(2)}%</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if coin.data && coin.data?.length > 0}
			<div class="hidden sm:block w-full max-w-3xl mt-8">
				<canvas id="myChart" />
			</div>
		{/if}
	</div>
</main>

<style lang="scss">
	.prose {
		max-width: none;
	}
</style>
