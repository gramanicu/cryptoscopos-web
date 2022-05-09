export interface Coin {
	id: string;
	coingeckoId: string;
	symbol: string;
	name: string;
}

export interface Account {
	name: string;
	description: string;
	coinId: string;
	userId: string;
	coin?: Coin;
}
