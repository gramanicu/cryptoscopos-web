<script lang="ts">
	import '$scss/app.scss';
	import { onMount } from 'svelte';
	import auth from '$lib/authService';
	import { isAuthenticated } from '$lib/store';
	import type { Auth0Client } from '@auth0/auth0-spa-js';
	import { goto } from '$app/navigation';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Menu, X, Bell, Logout } from '@steeze-ui/heroicons';
	import Logo from '$components/logo.svelte';
	import { page } from '$app/stores';

	let auth0Client: Auth0Client;

	onMount(async () => {
		auth0Client = await auth.createClient();
		if (!isAuthenticated) {
			goto('/');
		}
	});

	function logout() {
		auth.logout(auth0Client, { returnTo: window.location.origin });
	}

	let menuOpened = false;

	function highlighedLink(url: string, currentUrl: string) {
		menuOpened = false;
		return currentUrl === url;
	}

	let links: { url: string; name: string }[] = [
		{
			url: '/dashboard',
			name: 'Dasboard'
		},
		{
			url: '/dashboard/coins',
			name: 'Coins'
		},
		{
			url: '/dashboard/accounts',
			name: 'Accounts'
		},
		{
			url: '/dashboard/tickets',
			name: 'Tickets'
		}
	];
</script>

<svelte:head>
	<link rel="icon" href="./favicon.png" />
</svelte:head>

{#if isAuthenticated}
	<nav class="bg-black border-b-2 border-primary sticky top-0 md:relative">
		<div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:pb-0 sm:pt-1">
			<div class="relative flex items-center justify-between">
				<div class="flex items-center sm:hidden">
					<!-- Mobile menu button-->
					<button
						on:click={() => {
							menuOpened = !menuOpened;
						}}
						type="button"
						class="inline-flex items-center justify-center rounded-md text-gray-400 hover:text-white focus:outline-none "
						aria-controls="mobile-menu"
						aria-expanded="false"
					>
						<span class="sr-only">Open main menu</span>
						<Icon src={!menuOpened ? Menu : X} theme="solid" class="h-6 w-6 color-gray-50" />
					</button>
				</div>
				<div class="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
					<div class="flex-shrink-0 flex items-center">
						<Logo class="text-2xl self-start sm:text-xl" primary={'primary'} />
					</div>
					<div class="hidden sm:block sm:ml-6">
						<div class="flex space-x-4">
							{#each links as link}
								<a
									href={link.url}
									class="{highlighedLink(link.url, $page.url.pathname)
										? 'bg-primary border-b border-primary'
										: 'bg-transparent border-secondary hover:bg-secondary hover:border-b'}  rounded-t-lg h-full  text-white  px-4 py-2 text-sm font-medium"
									aria-current="page">{link.name}</a
								>
							{/each}
						</div>
					</div>
				</div>
				<div class="flex items-center pr-2 sm:ml-6 sm:pr-0">
					<button
						type="button"
						class="hidden md:inline-block p-1 rounded-full text-gray-400 hover:text-white focus:outline-none"
					>
						<span class="sr-only">View notifications</span>
						<Icon src={Bell} theme="solid" class="h-6 w-6 color-gray-50" />
					</button>
					<div class="inline-flex items-center justify-center ml-1 md:ml-3">
						<button
							on:click={() => logout()}
							class="sm:py-2 sm:px-4 text-sm bg-transparent transition-colors duration-500 border-primary text-gray-400 hover:text-white md:rounded-t-lg md:hover:bg-secondary"
						>
							<Icon src={Logout} theme="solid" class="sm:hidden h-6 w-6 color-gray-50" />
							<span class="hidden sm:inline-block sm:text-white">Sign out</span></button
						>
					</div>
				</div>
			</div>
		</div>
		<div
			class="{menuOpened
				? 'block'
				: 'hidden'} bg-black z-10 absolute w-full border-b-2 border-primary"
			id="mobile-menu"
		>
			<div class="px-2 pt-2 pb-3 space-y-1">
				{#each links as link}
					<a
						href={link.url}
						class="{highlighedLink(link.url, $page.url.pathname)
							? 'bg-primary cursor-default pointer-events-none'
							: 'bg-transparent hover:bg-secondary'} text-white block px-3 py-2 rounded-md text-base font-medium"
						aria-current="page">{link.name}</a
					>
				{/each}
			</div>
		</div>
	</nav>
	<slot />

	<footer class="mt-auto w-full bg-black text-white font-light text-md p-4 text-center">
		&copy; Copyright 2022, Grama Nicolae
	</footer>
{/if}

<style lang="scss" global>
	body {
		@apply flex;
		@apply flex-col;
		@apply min-h-screen;
	}
</style>
