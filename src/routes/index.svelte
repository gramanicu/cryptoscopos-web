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
					coinCount: coins.length
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
	import '$scss/app.scss';
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import { onMount } from 'svelte';
	import auth from '$lib/authService';
	import { auth0Client, isAuthenticated, user } from '$lib/store';
	import { goto } from '$app/navigation';
	import Logo from '$components/logo.svelte';

	export let coinCount: number;
	export let users: number = 100;
	export let dataPoints: number = 100;

	let client: Auth0Client | null;

	async function login() {
		client = $auth0Client;
		if (!client) {
			client = await auth.createClient();
		}

		await auth.loginWithPopup(client, {});

		if ($isAuthenticated) {
			goto('/dashboard');
		}
	}

	let localCoins = 0;
	let localUsers = 0;
	let localPoints = 0;
	let statsAnimated = false;

	async function computeStats(steps: number) {
		localCoins += Math.round(coinCount / steps);
		localUsers += Math.round(users / steps);
		localPoints += Math.round(dataPoints / steps);
		await timer(25);
	}

	function timer(ms: number) {
		return new Promise((res) => setTimeout(res, ms));
	}

	async function animateStats() {
		if (!statsAnimated) {
			statsAnimated = true;
			const steps = 20;
			for (let i = 0; i < steps; i++) {
				await computeStats(steps);
			}

			localCoins = coinCount;
			localUsers = users;
			localPoints = dataPoints;
			statsAnimated = true;
		}
	}

	let intersectionObserver: IntersectionObserver;

	function ensureIntersectionObserver() {
		if (intersectionObserver) return;

		intersectionObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				const eventName = entry.isIntersecting ? 'enterViewport' : 'exitViewport';
				entry.target.dispatchEvent(new CustomEvent(eventName));
			});
		});
	}

	function viewport(element: Element) {
		ensureIntersectionObserver();

		intersectionObserver.observe(element);

		return {
			destroy() {
				intersectionObserver.unobserve(element);
			}
		};
	}

	let subscribeEmail = '';

	const handleSubscribeSubmit = () => {
		fetch('/subscribeEmail', {
			method: 'POST',
			body: JSON.stringify({
				email: subscribeEmail
			})
		});
	};
</script>

<main
	class="scroll-smooth min-h-screen bg-circuit-pattern flex flex-col justify-around items-center snap-y snap-mandatory"
>
	<div
		class="bg-black text-gray-300 font-normal text-sm w-full text-center border-b-2 border-accent p-2"
	>
		<div class="limited-section">Website in development</div>
	</div>
	<nav class="self-start px-4 w-full bg-slate-100 shadow-lg border-b-2 border-gray-300">
		<div class="limited-section flex flex-row items-center justify-between p-2">
			<a href="/" class="text-2xl select-none prose"><Logo secondary={'gray-500'} /></a>
			<div>
				<button
					on:click={() => login()}
					class="py-2 px-4 border bg-white transition-colors duration-500 border-tertiary text-tertiary rounded-lg hover:bg-tertiary hover:text-white focus:ring-2 ring-primary"
					>Sign In</button
				>
			</div>
		</div>
	</nav>
	<section class="w-full snap-start backdrop-blur-sm">
		<div id="hero" class="limited-section items-center flex flex-col gap-8 p-6 justify-center">
			<div class="text-center prose cursor-default">
				<h1 class="text-black text-4xl font-bold">
					A new way to <strong class="text-accent">track</strong> your investments
				</h1>
				<p class=" text-gray-600 text-2xl col-span-1">
					Our tool is specifically designed to help you track your crypto investments, improving
					your decision making.
				</p>
			</div>
			<button
				on:click={() => login()}
				class="py-2 px-6 align-middle border-2 text-2xl bg-transparent transition-colors duration-500 border-tertiary text-tertiary rounded-lg hover:bg-tertiary hover:text-white focus:ring-2 ring-primary"
				>Join Us</button
			>
			<!-- TODO -->
			<!-- <div class="hidden lg:block">App Image</div> -->
		</div>
	</section>
	<section class="w-full snap-start bg-tertiary py-32 lg:py-16">
		<div
			class="cursor-default limited-section items-center gap-2 flex flex-col p-8 min-h-96 h-96 justify-center"
		>
			<h2 class="text-white font-semibold text-3xl text-center">
				Our database is constantly growing
			</h2>
			<p class="text-gray-100 text-xl font-light text-center">
				You can create an account and request new cryptocurrencies to be tracked
			</p>

			<div
				use:viewport
				on:enterViewport={() => animateStats()}
				id="stats-row"
				class="flex flex-row w-full justify-evenly mt-8"
			>
				<div class="flex flex-col gap-2 items-center">
					<h3 class="text-white text-3xl font-bold">
						{localCoins}
					</h3>
					<p class="text-gray-300 font-sans font-semibold text-lg">Currencies</p>
				</div>
				<div class="hidden md:flex flex-col  gap-2 items-center">
					<h3 class="text-white text-3xl font-bold">{localUsers}</h3>
					<p class="text-gray-300 font-sans font-semibold text-lg">Users</p>
				</div>
				<div class="flex flex-col gap-2 items-center">
					<h3 class="text-white text-3xl font-bold">{localPoints}</h3>
					<p class="text-gray-300 font-sans font-semibold text-lg">Daily datapoints</p>
				</div>
			</div>
		</div>
	</section>
	<section class="w-full snap-start bg-white py-32 lg:py-16">
		<div class="limited-section flex flex-col gap-8 p-8 min-h-96 items-center">
			<div class="cursor-default flex flex-col items-center">
				<h2 class="font-bold text-4xl text-center leading-normal">
					Meet <strong class="text-accent">Cryptoscout</strong><br />Our
					<strong class="text-primary">Discord</strong> bot
				</h2>
				<p class="mt-6 max-w-lg text-lg font-semibold leading-tight text-gray-600 text-center">
					Keep up to date on the cryptomarket right from your discord server and create friendly
					competitions to decide who is the best trader
				</p>
			</div>
			<picture class="hidden lg:flex flex-row justify-center">
				<source srcset="/images/webp/discord.webp" type="image/webp" />
				<source srcset="/images/png/discord.png" type="image/png" />
				<img
					class="rounded-lg w-1/2 h-auto border-2 border-gray-600"
					src="/images/png/discord.png"
					alt="Discord bot"
				/>
			</picture>
			<a
				target="_blank"
				class="bg-primary text-white hover:bg-tertiary transition-colors duration-500 rounded-lg p-2 text-lg w-fit px-6 self-center focus:ring-2 ring-primary"
				href="https://discord.com/api/oauth2/authorize?client_id=967422518258454549&permissions=19456&scope=bot%20applications.commands"
				>Add bot to Discord</a
			>
			<!-- TODO - add documentation page -->
		</div>
	</section>
	<section class="w-full snap-end py-32 lg:py-16 bg-gradient-to-b from-tertiary via-black to-black">
		<div class="limited-section flex flex-col gap-8 p-8 h-96 min-h-96 items-center justify-center">
			<div class="cursor-default flex flex-col items-center">
				<h2 class="font-bold text-4xl text-white text-center leading-normal">
					Get notified when we're launching
				</h2>
				<p class="mt-6 max-w-lg text-lg font-semibold leading-tight text-gray-100 text-center">
					The website and Cryptoscout are still in development. Sign up for our newsletter so that
					you will be notified when we are launching them.
				</p>
			</div>
			<form
				on:submit|preventDefault={handleSubscribeSubmit}
				class="flex flex-col md:flex-row gap-4"
			>
				<div>
					<label for="email-address" class="sr-only">Email address</label>
					<input
						id="email-address"
						name="email"
						type="email"
						autocomplete="email"
						bind:value={subscribeEmail}
						required
						class="w-64 appearance-none relative block px-4 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-md"
						placeholder="Enter your email"
					/>
				</div>
				<button
					type="submit"
					class="py-2 px-4 font-semibold border-2 bg-transparent transition-colors duration-500 border-accent text-accent rounded-lg hover:bg-accent hover:text-white focus:ring-2 ring-accent sm:text-md"
					>Notify me</button
				>
			</form>
		</div>
	</section>
	<footer class="mt-auto w-full bg-black text-white font-light text-md p-4 text-center">
		&copy; Copyright 2022, Grama Nicolae
	</footer>
</main>

<style lang="scss">
	.limited-section {
		max-width: 1050px;
		margin: 0 auto;
	}

	#stats-row {
		max-width: 720px;
	}

	#hero {
		min-height: calc(100vh - 16rem);
	}

	.bg-circuit-pattern {
		background-image: url('/images/svg/circuit-board.svg');
	}
</style>
