export interface CryptoCoin {
	id: String;
	name: String;
	symbol: String;
	image: String;
}

export interface CoinHistory {
	prices: Number[];
	market_caps: Number[];
	total_volumes: Number[];
}

const BASE_URL = "https://api.coingecko.com/api/v3"

export async function getCoins(): Promise<CryptoCoin[]> {
	// Fetches Top 20 coins by marketcap, otherwise you
	// get 10k+ shitcoins
	const url = BASE_URL + "/coins/markets?" + new URLSearchParams({
		vs_currency: "usd",
		order: "market_cap_desc",
		per_page: "20",
	})

	const r = await fetch(url);
	if (!r.ok) {
		console.log(r)
		throw new Error("Error fetching coins");
	}
	
	const data = await r.json();
	return data.map((d: any) => {
		return {
			id: d["id"],
			name: d["name"],
			symbol: d["symbol"],
			image: d["image"],
		}
	});
}

export async function getHistoricalData(coins: string[]): Promise<CoinHistory[]> {
	const url = BASE_URL + "/coins/markets?" + new URLSearchParams({
		vs_currency: "usd",
		ids: coins.join(","),
	})

	const r = await fetch(url);
	if (!r.ok) {
		console.log(r)
		throw new Error("Error fetching coin historical data");
	}
	
	const data = await r.json();
	return data.map((d: any) => {
		return {
			id: d["id"],
			name: d["name"],
			symbol: d["symbol"],
			image: d["image"],
		}
	});
}
