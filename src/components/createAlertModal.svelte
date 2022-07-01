<script lang="ts">
	import { callApi, callApiAuth } from '$lib/api';
	import type { Alert, Coin, Account } from '$lib/types';
	import { onMount } from 'svelte';
	import Select from 'svelte-select';

	export let modalShown = false;
	export let subjectType:
		| { value: 'account_value'; key: 'Account value' }
		| { value: 'account_profit'; key: 'Account profit' }
		| { value: 'coin_value'; key: 'Coin value' } = {
		key: 'Account value',
		value: 'account_value'
	};

	$: validOperation = alert.name != '' && alert.trigger != '' && alert.description != '';

	let coins: Coin[];
	let accounts: Account[];
	export let coin: Coin | null = null;
	export let account: Account | null = null;
	let alert: Alert = {
		description: '',
		name: '',
		trigger: '',
		id: '',
		isActive: false
	};

	let quantity = 0;
	let period = 0;

	const accountConditions: (
		| { key: '>='; value: 'greater' }
		| { key: '<='; value: 'lower' }
		| { key: '+'; value: 'increases' }
		| { key: '-'; value: 'decreases' }
	)[] = [
		{ key: '>=', value: 'greater' },
		{ key: '<=', value: 'lower' }
	];

	const fullConditions: (
		| { key: '>='; value: 'greater' }
		| { key: '<='; value: 'lower' }
		| { key: '+'; value: 'increases' }
		| { key: '-'; value: 'decreases' }
	)[] = [
		{ key: '>=', value: 'greater' },
		{ key: '<=', value: 'lower' },
		{ key: '+', value: 'increases' },
		{ key: '-', value: 'decreases' }
	];
	let accountCondition:
		| { key: '>='; value: 'greater' }
		| { key: '<='; value: 'lower' }
		| { key: '+'; value: 'increases' }
		| { key: '-'; value: 'decreases' };
	let fullCondition:
		| { key: '>='; value: 'greater' }
		| { key: '<='; value: 'lower' }
		| { key: '+'; value: 'increases' }
		| { key: '-'; value: 'decreases' };

	let subjects: (
		| { value: 'account_value'; key: 'Account value' }
		| { value: 'account_profit'; key: 'Account profit' }
		| { value: 'coin_value'; key: 'Coin value' }
	)[] = [
		{ key: 'Account profit', value: 'account_profit' },
		{ value: 'account_value', key: 'Account value' },
		{ value: 'coin_value', key: 'Coin value' }
	];

	export let onSuccess: (alert: Alert) => void;

	onMount(async () => {
		const rawCoins = await callApi('/coins', 'GET');
		const rawAccounts = await callApiAuth('/accounts', 'GET');

		if (rawCoins && rawAccounts) {
			accounts = JSON.parse(rawAccounts);
			coins = JSON.parse(rawCoins);
		}
	});

	function closeModal() {
		modalShown = false;
		subjectType = {
			key: 'Account value',
			value: 'account_value'
		};
	}

	async function newAlert() {
		if (validOperation) {
			const rawAlert = await callApiAuth(`/alerts/create`, 'POST', JSON.stringify(alert));

			if (rawAlert) {
				const newAlert: Alert = JSON.parse(rawAlert);
				onSuccess(newAlert);
			}
		}

		modalShown = false;
	}

	async function generateTrigger() {
		if (!quantity) return;
		if (subjectType.value == 'coin_value' && coin && fullCondition) {
			if ((fullCondition.key == '+' || fullCondition.key == '-') && period) {
				alert.trigger = `coin_value ${coin.id} ${fullCondition.key} ${quantity} ${
					period * 1000 * 3600
				}`;
			} else {
				alert.trigger = `coin_value ${coin.id} ${fullCondition.key} ${quantity}`;
			}
		} else if (account && accountCondition) {
			alert.trigger = `${subjectType.value} ${account.id} ${accountCondition.key} ${quantity}`;
		}

		alert = alert;
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
					class="relative inline-block align-bottom w-screen bg-white rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
				>
					<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-lg">
						<div class="sm:flex sm:items-start">
							<div class="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
								<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
									New Alert
								</h3>
								<form class="md:p-4">
									<div class="w-full flex flex-col items-start">
										<div class="grid grid-cols-1 md:grid-cols-2 w-full md:mt-4">
											<div class="md:mr-2 flex flex-col items-start">
												<label for="name" class="mr-4 text-sm font-medium text-gray-700">Name</label
												>
												<input
													bind:value={alert.name}
													class="border border-gray-300 rounded-sm focus:ring-0 ring-0 outline-0 w-full"
													type="text"
													id="name"
													name="name"
													autocomplete="off"
												/>
											</div>
											<div class="md:ml-2 flex flex-col items-start">
												<label for="description" class="mr-4 text-sm font-medium text-gray-700"
													>*Description</label
												>
												<input
													bind:value={alert.description}
													class="border border-gray-300 rounded-sm focus:ring-0 ring-0 outline-0 w-full"
													type="text"
													id="description"
													name="description"
													autocomplete="off"
												/>
											</div>
										</div>
										<label for="message" class="mr-4 text-sm font-medium text-gray-700"
											>Notification message</label
										>
										<input
											bind:value={alert.message}
											class="border border-gray-300 rounded-sm focus:ring-0 ring-0 outline-0 w-full"
											type="text"
											id="message"
											name="message"
											autocomplete="off"
										/>
										<div class="grid grid-cols-1 md:grid-cols-2 w-full md:mt-4">
											<div class="md:mr-2 flex flex-col items-start">
												<label for="buy" class="mt-2 text-sm font-medium text-gray-700"
													>What to track</label
												>
												<div class="w-full">
													<Select
														bind:value={subjectType}
														items={subjects}
														optionIdentifier={'value'}
														labelIdentifier={'key'}
													/>
												</div>
											</div>
											<div class="md:ml-2 flex flex-col items-start">
												<label for="buy" class="mt-2 text-sm font-medium text-gray-700"
													>{subjectType.value == 'coin_value' ? 'Coin' : 'Account'}</label
												>
												<div class="w-full">
													{#if subjectType.value == 'coin_value'}
														<Select
															bind:value={coin}
															items={coins}
															optionIdentifier={'id'}
															labelIdentifier={'name'}
														/>
													{:else}
														<Select
															bind:value={account}
															items={accounts}
															optionIdentifier={'id'}
															labelIdentifier={'name'}
														/>
													{/if}
												</div>
											</div>
										</div>

										<label for="buy" class="mt-2 text-sm font-medium text-gray-700 md:mt-4"
											>Alert trigger</label
										>
										<div class="grid grid-cols-1 md:grid-cols-3 gap-2 w-full ">
											{#if subjectType.value == 'coin_value'}
												<Select
													bind:value={fullCondition}
													items={fullConditions}
													isSearchable={false}
													optionIdentifier={'key'}
													labelIdentifier={'value'}
													placeholder="Condition"
												/>
											{:else}
												<Select
													bind:value={accountCondition}
													items={accountConditions}
													isSearchable={false}
													optionIdentifier={'key'}
													labelIdentifier={'value'}
													placeholder="Condition"
												/>
											{/if}
											<input
												bind:value={quantity}
												type="number"
												name="quantity"
												id="quantity"
												class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
												placeholder="Quantity"
												autocomplete="off"
											/>
											{#if subjectType.value == 'coin_value'}
												{#if fullCondition && fullCondition.key}
													{#if fullCondition.key == '+' || fullCondition.key == '-'}
														<input
															bind:value={period}
															type="number"
															name="period"
															id="period"
															class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
															placeholder="Period (in hours)"
															autocomplete="off"
														/>
													{/if}
												{/if}
											{/if}
										</div>
										<small class="mt-2 text-gray-400"
											>*condition + condition + *period (in hours)</small
										>
									</div>
									<div class="flex flex-row mt-2">
										<input
											bind:value={alert.trigger}
											type="text"
											name="trigger"
											id="trigger"
											class="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
											placeholder="Trigger"
											autocomplete="off"
										/>
										<button
											on:click={() => {
												generateTrigger();
											}}
											type="button"
											class="w-auto ml-2 inline-flex justify-center rounded-md border border-primary shadow-sm px-4 py-2 bg-white text-base font-medium text-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
											>Generate</button
										>
									</div>
								</form>
							</div>
						</div>
					</div>
					<div class="bg-gray-50 px-4 py-3 sm:px-10 sm:flex sm:flex-row justify-end rounded-b-lg">
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
								newAlert();
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
