<script context="module" lang="ts">
	import type { LoadInput } from '@sveltejs/kit';
	import { vars } from '$lib/variables';
	import type { Coin } from '$lib/types';
	export async function load({ fetch }: LoadInput) {
		const res = await fetch(`${vars.api.baseUrl}/coins`);

		if (res.ok) {
			const coins: Coin[] = await res.json();
			return {
				props: {
					coins
				}
			};
		}

		return {
			status: res.status,
			error: new Error("Coulnd't fetch")
			// redirect: '/smth'
		};
	}
</script>

<script lang="ts">
	import { hasContext, onMount } from 'svelte';
	import auth from '$lib/authService';
	import { isAuthenticated, user } from '$lib/store';
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import { scale } from 'svelte/transition';

	export let coins: Coin[];
</script>

<main class="min-h-screen min-w-full flex flex-col justify-center items-center" />
