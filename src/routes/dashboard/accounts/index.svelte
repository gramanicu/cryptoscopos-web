<script lang="ts">
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import auth from '$lib/authService';
	import { goto, prefetch } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';
	import { callApiAuth } from '$lib/api';
	import type { Account } from '$lib/types';
	import { get } from 'svelte/store';

	let isLoading = true;
	let accounts: Account[];
	let accountGroups: Map<string, Account[]>;

	function groupBy(list: any, keyGetter: any) {
		const map = new Map();
		list.forEach((item: any) => {
			const key = keyGetter(item);
			const collection = map.get(key);
			if (!collection) {
				map.set(key, [item]);
			} else {
				collection.push(item);
			}
		});

		return map;
	}

	onMount(async () => {
		const rawAccounts = await callApiAuth('/accounts', 'GET');
		if (rawAccounts) {
			accounts = JSON.parse(rawAccounts);
			accountGroups = groupBy(accounts, (account: Account) => account.currency?.name);
		}

		isLoading = false;
	});
</script>

<main class="min-h-screen min-w-full flex flex-col items-center">
	{#if !isLoading}
		{#each [...accountGroups.keys()] as key}
			{@const accountGroup = accountGroups.get(key)}

			{#if accountGroup}
				<div class="flex flex-col">
					<h1>{key}</h1>
					{#each accountGroup as account}
						<div
							on:mouseenter={() => prefetch(`/dashboard/accounts/${account.id}`)}
							on:click={() => goto(`/dashboard/accounts/${account.id}`)}
							class="flex flex-row p-2 bg-slate-400"
						>
							<h1>{account.name}</h1>
						</div>
					{/each}
				</div>
			{/if}
		{/each}
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
