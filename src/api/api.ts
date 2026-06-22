export interface CryptoCoin {
	id: string;
	name: string;
	symbol: string;
	image: string;
	price: number;
	marketCap: number;
	totalVolume: number;
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
		throw new Error("Error fetching coins");
	}
	
	const data = await r.json();
	return data.map((d: any) => {
		return {
			id: d["id"],
			name: d["name"],
			symbol: d["symbol"],
			image: d["image"],
			price: d["current_price"],
			marketCap: d["market_cap"],
			totalVolume: d["total_volume"],
		}
	});
}

export async function getCoinsByIds(coinsIds: string[]): Promise<CryptoCoin[]> {
	if (coinsIds.length === 0) return [];

	const url = BASE_URL + `/coins/markets?` + new URLSearchParams({
		vs_currency: "usd",
		ids: coinsIds.join(","),
	})

	const r = await fetch(url);
	if (!r.ok) {
		throw new Error("Error fetching coin historical data");
	}

	const data = await r.json();
	return data.map((d: any) => {
		return {
			id: d["id"],
			name: d["name"],
			symbol: d["symbol"],
			image: d["image"],
			price: d["current_price"],
			marketCap: d["market_cap"],
			totalVolume: d["total_volume"],
		}});
}
