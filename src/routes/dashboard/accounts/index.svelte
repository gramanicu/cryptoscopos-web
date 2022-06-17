<script lang="ts">
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import auth from '$lib/authService';
	import { goto, prefetch } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';
	import { callApiAuth } from '$lib/api';
	import type { Account } from '$lib/types';
	import { get } from 'svelte/store';
	import CreateAccountModal from '$components/createAccountModal.svelte';

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

	function onSuccess(acc: Account) {
		accounts.push(acc);
		accounts = accounts;
		accountGroups = groupBy(accounts, (account: Account) => account.currency?.name);
	}

	let modalOpen = false;
</script>

<main class=" h-full w-full flex flex-col items-center">
	{#if !isLoading}
		<div
			class="w-full flex flex-row justify-between items-center max-w-2xl p-4 sm:p-8 pb-0 sm:pb-0 xl:mx-4 mt-4"
		>
			<h1 class="text-2xl font-bold">Your accounts</h1>
			<button
				class="text-lg px-4 py-2 bg-primary hover:bg-tertiary text-white rounded-lg"
				on:click={() => {
					modalOpen = true;
				}}>New Account</button
			>
			<CreateAccountModal {onSuccess} bind:modalShown={modalOpen} />
		</div>
		<div class="flex flex-col w-full max-w-2xl justify-center p-4 sm:p-8 pt-0 sm:pt-0 xl:mx-4">
			{#each [...accountGroups.keys()] as key}
				{@const accountGroup = accountGroups.get(key)}

				{#if accountGroup}
					<div class="flex flex-col w-full mt-2">
						<h1 class="text-xl font-semibold text-primary">{key}</h1>
						<div class="w-full border rounded-lg shadow-lg flex flex-col">
							{#each accountGroup as account, index}
								<div
									on:mouseenter={() => prefetch(`/dashboard/accounts/${account.id}`)}
									on:click={() => goto(`/dashboard/accounts/${account.id}`)}
									class="flex flex-row p-4 items-baseline cursor-pointer hover:shadow-md"
								>
									<h2 class="mr-2 text-xl font-semibold">{account.name}</h2>
									<span class="font-thin text-gray-500">{account.description}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
