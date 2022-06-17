<script lang="ts">
	import Loading from '$components/loading.svelte';
	import { callApiAuth } from '$lib/api';
	import { user } from '$lib/store';
	import type { UserStats } from '$lib/types';
	import { onMount } from 'svelte';

	let isLoading = true;
	let stats: UserStats;

	onMount(async () => {
		const rawStats = await callApiAuth('/user-stats', 'GET');
		if (rawStats) {
			stats = JSON.parse(rawStats);
		}

		isLoading = false;
	});

	onMount(async () => {});
</script>

<main class="min-w-full flex flex-col justify-center items-center">
	{#if !isLoading}
		<div class="flex flex-col justify-center p-4 rounded-lg shadow-lg border mt-6">
			<h1 class="text-2xl font-bold mb-4">Welcome, <em class="text-primary">{$user.name}</em></h1>
			<div class="flex flex-col">
				<h2 class="leading-none text-xl mb-2">
					You have: <a href="/dashboard/accounts"
						><em class="text-tertiary underline">{stats.accountCount} accounts</em></a
					>
				</h2>
				<div class="border rounded-lg shadow-sm py-2 px-2">
					<h3 class="leading-none text-md mb-2">
						Value: <em
							>{stats.totalValue.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})} USD</em
						>
					</h3>
					<h3 class="leading-none text-md">
						Profits: <em
							>{stats.totalProfit.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})} USD</em
						>
					</h3>
				</div>

				<h4 class="leading-none mt-6 text-md font-bold">
					You have <a href="/dashboard/alerts"
						><em class="text-tertiary underline">{stats.alertCount} alerts</em></a
					> set up.
				</h4>
			</div>
		</div>
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
