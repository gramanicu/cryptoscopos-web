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

<main class="min-h-screen min-w-full flex flex-col justify-center items-center bg-slate-100">
	<div class="mb-auto bg-black text-white font-light text-sm w-full text-center p-1">
		We are still in <b>beta</b> !
	</div>
	<section>Hero section</section>
	<section>Stats section</section>
	<section><a class="underline" href="/discord">Discord </a>section</section>
	<section>Contact section</section>
	<footer class="mt-auto w-full bg-black text-white font-light text-sm p-2 text-center">
		&copy; Copyright 2022, Grama Nicolae
	</footer>
</main>
