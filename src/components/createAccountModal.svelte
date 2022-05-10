<script lang="ts">
	import { callApi, callApiAuth } from '$lib/api';
	import type { Coin, Account } from '$lib/types';
	import { onMount } from 'svelte';
	import Select from 'svelte-select';

	let accountName = '';
	let accountDescription = '';
	let coin: Coin | null = null;
	export let modalShown = false;

	$: validOperation = coin != null && accountName != '';

	let coins: Coin[];

	export let onSuccess: (acc: Account) => void;

	onMount(async () => {
		const rawCoins = await callApi('/coins', 'GET');
		if (rawCoins) {
			coins = JSON.parse(rawCoins);
		}
	});

	function closeModal() {
		accountName = '';
		accountDescription = '';
		coin = null;
		modalShown = false;
	}

	const optionIdentifier = 'coingeckoId';
	const labelIdentifier = 'name';

	async function newAccount() {
		if (validOperation) {
			const rawAccount = await callApiAuth(
				`/accounts/create`,
				'POST',
				JSON.stringify({
					gecko_id: (coin as Coin).coingeckoId,
					name: accountName,
					description: accountDescription
				})
			);

			if (rawAccount) {
				const account: Account = JSON.parse(rawAccount);
				account.currency = coin as Coin;
				onSuccess(account);
			}
		}

		modalShown = false;
	}
</script>

{#if modalShown}
	<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

		<div class="fixed z-10 inset-0 overflow-y-auto">
			<div class="flex items-end justify-center min-h-screen py-4 px-4 text-center sm:block sm:p-0">
				<!-- This element is to trick the browser into centering the modal contents. -->
				<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
					>&#8203;</span
				>
				<div
					class="relative inline-block align-bottom w-screen bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
				>
					<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div class="sm:flex sm:items-start">
							<div class="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
								<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
									New Account
								</h3>
								<form class="p-4">
									<div class="w-full flex flex-col items-start">
										<label for="name" class="mr-4 text-sm font-medium text-gray-700">Name*</label>
										<input
											bind:value={accountName}
											class="border border-gray-300 rounded-sm focus:ring-0 ring-0 outline-0 w-full"
											type="text"
											id="name"
											name="operation"
											autocomplete="off"
										/>
										<label for="description" class="mr-4 mt-2 text-sm font-medium text-gray-700"
											>Description</label
										>
										<input
											bind:value={accountDescription}
											class="border border-gray-300 rounded-sm focus:ring-0 ring-0 outline-0 w-full"
											type="text"
											id="description"
											name="operation"
											autocomplete="off"
										/>
										<label for="buy" class="mt-2 text-sm font-medium text-gray-700">Coin*</label>
										<div class="w-full">
											<Select
												bind:value={coin}
												items={coins}
												{optionIdentifier}
												{labelIdentifier}
											/>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:px-10 sm:flex sm:flex-row justify-end">
						<button
							on:click={() => {
								closeModal();
							}}
							type="button"
							class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
							>Cancel</button
						>
						<button
							on:click={() => {
								newAccount();
							}}
							type="button"
							class="{!validOperation
								? 'pointer-events-none'
								: 'pointer-events-auto'} mt-2 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 disabled:text-gray-700 disabled:bg-white disabled:border-gray-300 bg-primary text-base font-medium text-white hover:bg-tertiary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
							disabled={!validOperation}>Confirm</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
