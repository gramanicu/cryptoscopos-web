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
	name: string;
	description: string;
	coinId: string;
	userId: string;
	coin?: Coin;
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
