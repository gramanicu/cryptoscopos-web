export interface Coin {
	id: string;
	coingeckoId: string;
	symbol: string;
	name: string;
	information?: CoinInformation;
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
