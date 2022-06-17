<script lang="ts">
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';
	import { callApiAuth } from '$lib/api';
	import type { Alert } from '$lib/types';

	let isLoading = true;
	let alerts: Alert[];

	onMount(async () => {
		const rawAlerts = await callApiAuth('/alerts', 'GET');
		if (rawAlerts) {
			alerts = JSON.parse(rawAlerts);
		}

		isLoading = false;
	});

	const resetAlert = async (id: string) => {
		const rawRes = await callApiAuth(`/alerts/${id}/reset`, 'PUT');
		if (rawRes) {
			const alert: Alert = JSON.parse(rawRes);

			for (let i = 0; i < alerts.length; i++) {
				if (alerts[i].id === alert.id) {
					alerts[i].isActive = alert.isActive;
				}
			}
		}

		alerts = alerts;
	};
</script>

<main class=" h-full w-full flex flex-col items-center">
	{#if !isLoading}
		<div
			class="w-full flex flex-row justify-between items-center max-w-2xl p-4 sm:p-8 pb-0 sm:pb-0 xl:mx-4 mt-4"
		>
			<h1 class="text-2xl font-bold">Your alerts</h1>
		</div>
		<div class="flex flex-col w-full max-w-2xl justify-center p-4 sm:p-8 pt-0 sm:pt-0 xl:mx-4">
			{#each alerts as alert}
				<div class="flex flex-col w-full border p-2 rounded-lg">
					<span class="text-lg"><b>{alert.name}</b></span>
					{#if alert.description}
						<span class="text-md font-semibold text-gray-500">{alert.description}</span>{/if}

					<span
						>Condition: <code class="text-white bg-gray-700 rounded-lg px-1">{alert.trigger}</code
						></span
					>
					<div class="flex flex-row items-center justify-end">
						<span>{alert.isActive ? 'Not triggered 🟢' : 'Triggered 🔴'}</span>
						<button
							class="ml-2 px-2 py-1 text-white bg-primary rounded-md"
							on:click={() => {
								resetAlert(alert.id);
							}}>Reset</button
						>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
