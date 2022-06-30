<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import { callApiAuth } from '$lib/api';
	import type { Account, Coin, CoinStatistics, Transaction } from '$lib/types';
	import { page } from '$app/stores';
	import Loading from '$components/loading.svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { TrendingDown, TrendingUp, ArrowRight } from '@steeze-ui/heroicons';
	import { DateTime } from 'luxon';

	interface ComputedData {
		balance: number;
		value: number;
		// Current profit from the account (does not take into account current value balance)
		profits: number;
	}

	let account: Account;
	let computed: ComputedData = { balance: 0, value: 0, profits: 0 };
	let isLoading = true;

	async function loadData() {
		const id = $page.params.id;
		const rawAccount = await callApiAuth(`/accounts/${id}`, 'GET');

		if (rawAccount) {
			const loadedAccount: Account = JSON.parse(rawAccount);

			const rawCoin = await callApiAuth(`/coins/getbyid/${loadedAccount.coinId}`, 'GET');
			const rawTransactions = await callApiAuth(`/accounts/${id}/transactions`, 'GET');

			if (rawCoin) {
				const coin: Coin = JSON.parse(rawCoin);
				loadedAccount.currency = coin;

				const rawStats = await callApiAuth(`/coins/${coin.coingeckoId}/stats`, 'GET');

				if (rawStats) {
					const stats: CoinStatistics = JSON.parse(rawStats);

					coin.stats = stats;
					loadedAccount.currency = coin;
					coinPrice = coin.stats.value;
				}
			}

			if (rawTransactions) {
				const transactions: Transaction[] = JSON.parse(rawTransactions);

				loadedAccount.transactions = transactions;

				computed = {
					balance: transactions.reduce((sum: number, transaction) => {
						return (sum += transaction.amount);
					}, 0),

					profits: transactions.reduce((sum: number, transaction) => {
						return (sum -= transaction.value * transaction.amount);
					}, 0),

					value: 0
				};

				if (loadedAccount.currency?.stats) {
					computed.value = computed.balance * loadedAccount.currency.stats.value;
					computed.profits += computed.value;
				}
			}

			account = loadedAccount;
		}
	}

	let updateLoopId: NodeJS.Timer;

	onMount(async () => {
		await loadData();

		updateLoopId = setInterval(loadData, 60 * 60 * 1000);
		newValue = coinPrice;
		isLoading = false;
	});

	onDestroy(async () => {
		clearInterval(updateLoopId);
	});

	function stringToDateprint(timestamp: string): string {
		const date = DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_SHORT);
		return date;
	}

	function computeAccountInfo() {
		if (!account || !account.transactions) return;

		computed = {
			balance: account.transactions?.reduce((sum: number, transaction) => {
				return (sum += transaction.amount);
			}, 0),

			profits: account.transactions?.reduce((sum: number, transaction) => {
				return (sum -= transaction.value * transaction.amount);
			}, 0),

			value: 0
		};

		if (account.currency?.stats) {
			computed.value = computed.balance * account.currency.stats.value;
			computed.profits += computed.value;
		}
	}

	let newAmount = 0;
	let operationBuy = true;
	let modalShown = false;
	let newValue = 0;
	let coinPrice = 0;
	let newComment = '';

	async function newTransaction() {
		if (validOperation) {
			const id = $page.params.id;
			const rawAccount = await callApiAuth(
				`/accounts/${id}/transactions/create`,
				'POST',
				JSON.stringify({
					amount: newAmount * (operationBuy ? 1 : -1),
					value: newValue,
					comment: newComment
				})
			);

			if (rawAccount) {
				const transaction: Transaction = JSON.parse(rawAccount);

				account.transactions?.push(transaction);
				account.transactions = account.transactions;
				computeAccountInfo();
			}
		}

		newAmount = 0;
		newValue = coinPrice;
		newComment = '';
		operationBuy = true;
		modalShown = false;
	}

	afterUpdate(() => {
		const transactionContainer = document.getElementById('transactionsContainer');
		if (transactionContainer) {
			scrollToBottomWithSmoothScroll(transactionContainer);
		}
	});

	const scrollToBottomWithSmoothScroll = (elem: HTMLElement) => {
		elem.scrollTo({
			top: elem.scrollHeight,
			behavior: 'smooth'
		});
	};

	$: validOperation = (operationBuy || newAmount < computed.balance) && newValue > 0;
</script>

<main class="h-full w-full flex flex-col items-center">
	<div
		class="flex flex-col w-full max-w-2xl justify-center p-4 sm:p-8 xl:mx-4 mt-8 border shadow-xl rounded-lg"
	>
		{#if !isLoading}
			{#if account}
				<div class="flex flex-col min-w-full mx-auto">
					<div class="text-2xl flex flex-row items-baseline justify-between">
						<span class="text-gray-400 font-semibold mr-2">Name</span>
						<hr class="mx-2 grow" />
						<h1 class="font-bold flex flex-col justify-center">{account.name}</h1>
					</div>

					<div
						class="mt-2 text-lg flex {account.description.length > 20
							? 'flex-col'
							: 'flex-row items-baseline justify-between'}"
					>
						<span class="text-gray-400 font-semibold mr-2">Description</span>
						{#if account.description.length <= 20}
							<hr class="mx-2 grow" />
						{/if}
						<h2 class="font-light">{account.description}</h2>
					</div>

					<div class="mt-2 text-lg flex flex-row items-baseline justify-between">
						<span class="text-gray-400 font-semibold mr-2">Balance</span>
						<hr class="mx-2 grow" />
						<h2 class="font-semibold text-xl text-primary">
							{computed.balance.toFixed(2)}
							<span>{account.currency?.symbol.toUpperCase()}</span>
						</h2>
					</div>

					<div class="mt-2 text-lg flex flex-row items-baseline justify-between">
						<span class="text-gray-400 font-semibold mr-2">Value</span>
						<hr class="mx-2 grow" />
						<h2 class="font-semibold text-xl">
							{computed.value.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
							<span>USD</span>
						</h2>
					</div>

					<div class="mt-2 text-lg flex flex-row items-baseline justify-between">
						<span class="text-gray-400 font-semibold mr-2">Profits</span>
						<hr class="mx-2 grow" />
						<h2 class="font-semibold text-xl">
							{computed.profits.toLocaleString(undefined, {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
							<span>USD</span>
						</h2>
					</div>

					<div class="flex flex-col mt-6 p-4 border rounded-lg">
						<div class="text-2xl flex flex-col sm:flex-row justify-between sm:items-center ">
							<a
								sveltekit:prefetch
								href="/dashboard/coins/{account.currency?.coingeckoId}"
								class="flex flex-row items-center hover:underline"
							>
								<img
									class="w-6 h-6 sm:w-8 sm:h-8"
									src={account.currency?.information?.image}
									alt={account.currency?.name}
								/>
								<h3 class="font-bold text-xl sm:text-2xl ml-2 sm:ml-4">{account.currency?.name}</h3>
							</a>
							{#if account.currency?.stats}
								<div class="flex flex-row text-xl items-center mt-2 sm:mt-0">
									<h2 class="mr-2">{account.currency?.stats?.value.toFixed(2)} USD</h2>

									{#if Number(account.currency?.stats?.last_1h) > 0}
										<Icon src={TrendingUp} theme="solid" class="h-5 w-5 text-green-500" />
									{:else if Number(account.currency?.stats?.last_1h) < 0}
										<Icon src={TrendingDown} theme="solid" class="h-5 w-5 text-red-500" />
									{:else}
										<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
									{/if}
									<small class="font-semibold text-sm"
										>{Number(account.currency?.stats?.last_1h).toFixed(2)}%</small
									>
								</div>
							{/if}
						</div>
						{#if account.currency?.stats}
							<div
								class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row md:justify-evenly w-full justify-between"
							>
								{#if account.currency?.stats?.last_1h !== 'unavailable'}
									<div class="flex flex-col w-full items-center">
										<h3 class="text-lg font-light text-gray-700">Last hour</h3>
										<div class="flex flex-row items-center">
											{#if Number(account.currency?.stats?.last_1h) > 0}
												<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
											{:else if Number(account.currency?.stats?.last_1h) < 0}
												<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
											{:else}
												<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
											{/if}
											<span class="ml-1">
												{Number(account.currency?.stats?.last_1h).toFixed(2)}%</span
											>
										</div>
									</div>
								{/if}
								{#if account.currency?.stats?.last_24h !== 'unavailable'}
									<div class="flex flex-col w-full items-center">
										<h3 class="text-lg font-light text-gray-700">Last 24 hours</h3>
										<div class="flex flex-row items-center">
											{#if Number(account.currency?.stats?.last_24h) > 0}
												<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
											{:else if Number(account.currency?.stats?.last_24h) < 0}
												<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
											{:else}
												<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
											{/if}
											<span class="ml-1">
												{Number(account.currency?.stats?.last_24h).toFixed(2)}%</span
											>
										</div>
									</div>
								{/if}
								{#if account.currency?.stats?.last_7day !== 'unavailable'}
									<div class="flex flex-col w-full items-center">
										<h3 class="text-lg font-light text-gray-700">Last 7 days</h3>
										<div class="flex flex-row items-center">
											{#if Number(account.currency?.stats?.last_7day) > 0}
												<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
											{:else if Number(account.currency?.stats?.last_7day) < 0}
												<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
											{:else}
												<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
											{/if}
											<span class="ml-1">
												{Number(account.currency?.stats?.last_7day).toFixed(2)}%</span
											>
										</div>
									</div>
								{/if}
								{#if account.currency?.stats?.last_30day !== 'unavailable'}
									<div class="flex flex-col w-full items-center">
										<h3 class="text-lg font-light text-gray-700">Last 30 days</h3>
										<div class="flex flex-row items-center">
											{#if Number(account.currency?.stats?.last_30day) > 0}
												<Icon src={TrendingUp} theme="solid" class="h-4 w- text-green-500" />
											{:else if Number(account.currency?.stats?.last_30day) < 0}
												<Icon src={TrendingDown} theme="solid" class="h-4 w-4 text-red-500" />
											{:else}
												<Icon src={ArrowRight} theme="solid" class="h-4 w-4 text-gray-500" />
											{/if}
											<span class="ml-1">
												{Number(account.currency?.stats?.last_30day).toFixed(2)}%</span
											>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				{#if modalShown}
					<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
						<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

						<div class="fixed z-10 inset-0 overflow-y-auto">
							<div
								class="flex items-end justify-center min-h-screen py-4 px-4 text-center sm:block sm:p-0"
							>
								<!-- This element is to trick the browser into centering the modal contents. -->
								<span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
									>&#8203;</span
								>
								<div
									class="relative inline-block align-bottom w-screen bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
								>
									<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
										<div class="sm:flex sm:items-start">
											<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
												<h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
													New Transaction
												</h3>
												<form class="mt-2">
													<fieldset
														id="operation"
														class="mb-2 flex flex-row sm:flex-col items-start"
													>
														<legend class="text-left text-md font-medium  text-gray-700"
															>Choose operation</legend
														>
														<span class="inline-block">
															<input
																bind:group={operationBuy}
																class="checked:text-blue-500 focus:ring-0 ring-0 outline-0"
																type="radio"
																id="buy"
																value={true}
																name="operation"
																checked={true}
															/>
															<label for="buy" class="mr-4 text-sm font-medium text-gray-700"
																>Buy</label
															>
															<input
																bind:group={operationBuy}
																class="checked:text-red-500 ring-0 focus:ring-0 outline-0"
																type="radio"
																id="sell"
																value={false}
																name="operation"
															/>
															<label for="sell" class="text-sm font-medium text-gray-700"
																>Sell</label
															>
														</span>
													</fieldset>
													<label
														for="amount"
														class=" text-left block text-sm font-medium text-gray-700">Amount</label
													>
													<div class="mt-1 relative rounded-md shadow-sm">
														<div
															class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
														>
															<span class="text-gray-500 sm:text-sm">
																{account.currency?.symbol.toUpperCase()}
															</span>
														</div>
														<input
															bind:value={newAmount}
															type="number"
															name="amount"
															id="amount"
															class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-14 pr-7 sm:text-sm border-gray-300 rounded-md"
															placeholder="0.00"
															autocomplete="off"
														/>
													</div>

													<div class="flex flex-row items-end">
														<div>
															<label
																for="value"
																class="mt-2 text-left block text-sm font-medium text-gray-700"
																>Price (1 {account.currency?.symbol.toUpperCase()})</label
															>
															<div class="mt-1 relative rounded-md shadow-sm">
																<div
																	class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
																>
																	<span class="text-gray-500 sm:text-sm"> USD </span>
																</div>

																<input
																	bind:value={newValue}
																	type="number"
																	name="value"
																	id="value"
																	step="0.01"
																	class="focus:ring-indigo-500 focus:border-indigo-500 block w-fit pl-14 pr-7 sm:text-sm border-gray-300 rounded-md"
																	placeholder={coinPrice.toLocaleString()}
																	autocomplete="off"
																/>
															</div>
														</div>

														<button
															on:click={() => {
																newValue = coinPrice;
															}}
															type="button"
															class="w-full inline-flex justify-center text-sm rounded-md border border-gray-300 shadow-sm px-2 py-2 ml-2 bg-white font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
															>Auto</button
														>
													</div>

													<label
														for="comment"
														class=" text-left block text-sm font-medium text-gray-700"
														>Comment*</label
													>
													<div class="mt-1 relative rounded-md shadow-sm">
														<input
															bind:value={newComment}
															type="text"
															name="commentt"
															id="comment"
															class="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-2 sm:text-sm border-gray-300 rounded-md"
															autocomplete="off"
														/>
													</div>
												</form>
											</div>
										</div>
									</div>
									<div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row">
										{#if account.currency?.stats?.value}
											{#if validOperation}
												<div
													class="mr-auto mb-2 ml-0 sm:mb-0 sm:ml-4 inline-flex justify-center items-center text-sm font-semibold text-gray-400"
												>
													{operationBuy ? 'Price' : 'Profit'}: {(
														newAmount * newValue
													).toLocaleString()} USD
												</div>
											{:else}
												<div
													class="mr-auto mb-2 ml-0 sm:mb-0 sm:ml-4 inline-flex justify-center items-center text-sm font-semibold text-gray-400"
												>
													Invalid operation
												</div>
											{/if}
										{/if}
										<button
											on:click={() => {
												modalShown = false;
												newAmount = 0;
												operationBuy = true;
											}}
											type="button"
											class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
											>Cancel</button
										>
										<button
											on:click={() => {
												newTransaction();
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

				<div class="mt-6 mb-2 flex flex-row justify-between items-center">
					<h2 class="text-primary text-2xl ">Transactions</h2>
					<button
						on:click={() => {
							modalShown = true;
						}}
						class="rounded-lg bg-tertiary text-white px-4 py-2">New transaction</button
					>
				</div>
				<div
					id="transactionsContainer"
					class="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 mt-2 p-2 box-border min-w-full mx-auto grid grid-cols-4 md:grid-cols-7 max-h-80 overflow-y-auto overscroll-y-contain bg-fine-pattern"
				>
					{#if account.transactions}
						{#each account.transactions as transaction}
							{@const isBuy = transaction.amount >= 0}
							<div
								class="flex flex-col m-2 p-4 bg-white rounded-2xl border col-span-4 items-start {isBuy
									? 'border-green-500 md:col-start-4'
									: 'border-red-500 col-start-1'}"
							>
								<h2>
									{isBuy ? 'Bought ' : 'Sold '}
									<strong class="text-tertiary whitespace-nowrap"
										>{Math.abs(transaction.amount).toFixed(2)}
										{account.currency?.symbol.toUpperCase()}</strong
									>
									for
									<strong class="text-tertiary whitespace-nowrap"
										>{(transaction.value * Math.abs(transaction.amount)).toFixed(2)} USD</strong
									>
								</h2>
								<p class="text-gray-500 font-semibold text-sm self-start">{transaction.comment}</p>
								<small class="text-gray-400 {isBuy ? 'items-end' : ''}  "
									>{stringToDateprint(transaction.timestamp)}</small
								>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		{:else}
			<Loading class="fill-primary bg-transparent text-gray-400" />
		{/if}
	</div>
</main>

<style lang="scss">
	.bg-fine-pattern {
		background-image: url('/images/svg/fine-texture.svg');
		background-repeat: repeat;
	}
</style>
