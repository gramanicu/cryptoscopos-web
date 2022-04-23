<script type="ts">
	import { onMount } from 'svelte';
	import auth from '$lib/authService';
	import { isAuthenticated, user } from '$lib/store';
	import type { Auth0Client } from '@auth0/auth0-spa-js';

	let auth0Client: Auth0Client;

	onMount(async () => {
		auth0Client = await auth.createClient();

		isAuthenticated.set(await auth0Client.isAuthenticated());

		const usr = await auth0Client.getUser();
		if (usr) {
			console.log(usr);
			user.set(usr);
		}
	});

	function login() {
		auth.loginWithPopup(auth0Client, {});
	}

	function logout() {
		auth.logout(auth0Client);
	}
</script>

<main class="min-h-screen min-w-full flex flex-col justify-center items-center">
	<div class="border rounded-lg shadow-md bg-purple-100 text-purple-700  p-4 flex flex-col gap-2">
		<h1 class="text-3xl font-sans mb-2 text-purple-900  justify-center">Welcome to Cryptoscopos</h1>
		{#if $isAuthenticated}
			<p>Your name: {$user.name}</p>
			<p>Your email: {$user.email}</p>
			<button
				class="bg-purple-800 text-purple-100 hover:bg-purple-500 rounded-lg p-2 text-sm w-fit px-6 self-end"
				on:click={logout}>Log Out</button
			>
		{:else}
			<button
				class="bg-purple-800 text-purple-100 hover:bg-purple-500 rounded-lg p-2 text-lg w-fit px-6 self-center"
				on:click={login}>Log In</button
			>
		{/if}
	</div>
</main>
