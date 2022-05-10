export interface Coin {
	id: string;
	coingeckoId: string;
	symbol: string;
	name: string;
	information?: CoinInformation;
	data?: CoinData[];
	stats?: CoinStatistics;
}

export interface Account {
	id: string;
	name: string;
	description: string;
	coinId: string;
	userId: string;
	currency?: Coin;
	transactions?: Transaction[];
}

export interface CoinInformation {
	homepage: string;
	image: string;
	description: string;
}

export interface CoinData {
	timestamp: string;
	value: number;
}

export interface CoinStatistics {
	last_update: string;
	value: number;
	last_1h: number | 'unavailable';
	last_24h: number | 'unavailable';
	last_7day: number | 'unavailable';
	last_30day: number | 'unavailable';
}

export interface CoinSearchResults {
	name: string;
	gecko_id: string;
	symbol: string;
	is_internal: boolean;
}

export interface Transaction {
	id: string;
	// How many units of the crypto were bought (+) or sold (-)
	amount: number;
	// How much does a unit of the crypto costs
	value: number;
	comment: string;
	timestamp: string;
}
