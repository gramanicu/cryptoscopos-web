<script lang="ts">
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import auth from '$lib/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Loading from '$components/loading.svelte';
	import { callApiAuth } from '$lib/api';
	import type { Account } from '$lib/types';

	let isLoading = true;
	let accounts: Account[];

	onMount(async () => {
		const rawAccounts = await callApiAuth('/accounts', 'GET');
		accounts = JSON.parse(rawAccounts);
		isLoading = false;
	});
</script>

<main class="min-h-screen min-w-full flex flex-col items-center">
	{#if !isLoading}
		{#each accounts as account}
			<div class="prose">
				<h2>{account.name}</h2>
				<h3>{account.description}</h3>
				<p>{account.coinId}</p>
			</div>
		{/each}
	{:else}
		<Loading class="fill-primary bg-transparent text-gray-400" />
	{/if}
</main>
