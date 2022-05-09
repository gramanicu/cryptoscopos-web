<script lang="ts">
	import auth from '$lib/authService';
	import { isAuthenticated, user } from '$lib/store';
	import { scale } from 'svelte/transition';
	import { vars } from '$lib/variables';
	import type { Coin } from '$lib/types';
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import { onMount } from 'svelte';

	let isLoading = true;
	let auth0Client: Auth0Client;

	onMount(async () => {
		auth0Client = await auth.createClient();
		isLoading = false;
	});

	const callApi = async () => {
		try {
			const token = await auth0Client.getTokenSilently();
			const bearer = 'Bearer ' + token;

			const res = await fetch(`${vars.api.baseUrl}/accounts`, {
				headers: { Authorization: bearer }
			});

			if (res.ok) {
				const coins: Coin[] = await res.json();
				console.log(coins);
			}
		} catch (e) {
			console.error(e);
		}
	};
</script>

<main class="min-h-screen min-w-full flex flex-col justify-center items-center">
	{#if !isLoading}
		<div
			transition:scale
			class="border rounded-lg shadow-md bg-purple-100 text-purple-700 p-4 flex flex-col gap-2"
		>
			<h1 class="text-3xl font-sans mb-2 text-purple-900  justify-center">
				Welcome to Cryptoscopos
			</h1>
			{#if $isAuthenticated}
				<img
					class="h-16 w-16 m-2 ring-2 ring-white rounded-full self-center"
					alt="Profile pic"
					src={$user.picture}
				/>
				<p class="self-center mb-4">{$user.name}</p>
				<div class="flex flex-row gap-4 justify-center">
					<button
						class="bg-purple-100 text-purple-900 hover:bg-purple-500 rounded-lg p-2 text-sm w-fit px-6 "
						on:click={callApi}>Call API</button
					>
				</div>
			{/if}
		</div>
	{:else}
		<svg
			role="status"
			class="w-32 h-32 text-gray-200 animate-spin dark:text-gray-100 fill-purple-500"
			viewBox="0 0 100 101"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
				fill="currentColor"
			/>
			<path
				d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
				fill="currentFill"
			/>
		</svg>
	{/if}
</main>
