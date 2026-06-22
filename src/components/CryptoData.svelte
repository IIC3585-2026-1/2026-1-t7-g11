<script lang="ts">
	import { selectedCoins } from "../stores/coinStore.ts";
	import { getCoinsByIds } from "../api/api.ts";

	let coins = $derived(await getCoinsByIds($selectedCoins));

	$effect(() => {
		return
		coinsHistoricalData = getHistoricalData($selectedCoins)
		const intervalId = setInterval(() => {
			console.log("refresh")
		}, 60000) // API rate-limit
		console.log("test", $selectedCoins)

		return () => clearInterval(intervalId);
	});
</script>

<h1>Precios y Datos</h1>
<ul>
{#each coins as coin}
	<li>{coin.name} ({coin.symbol.toUpperCase()}) ${coin.price} V:{coin.totalVolume}</li>
{/each}
</ul>
